// Builds the static site into ./_site:
//  - copies the landing page + assets
//  - serves each canonical JSON Schema at the exact path of its $id
//  - renders README.md and SPEC.md into themed HTML pages
//  - renders blog posts from docs/blog/ and emits /feed.xml
//  - writes the CNAME for the custom domain
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const out = path.join(__dirname, "_site");
const SCHEMA_DIR = path.join(root, "packages/schemas/src/schemas");
const BLOG_DIR = path.join(root, "docs/blog");
const DOMAIN = "agent-resume.dev";
const SITE_TITLE = "agent-resume";
const SITE_DESCRIPTION = "The open schema standard for AI-native hiring.";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true }).use(anchor, {
  permalink: anchor.permalink.linkInsideHeader({ symbol: "#", placement: "after" }),
  slugify: (s) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-"),
});

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function writeFile(rel, content) {
  const dest = path.join(out, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, content);
}

// Rewrite repo-relative markdown links to their on-site / GitHub equivalents.
function rewriteLinks(markdown) {
  const repo = "https://github.com/rahhbster/agent-resume/blob/main";
  return markdown
    .replace(/\]\(\.\.\/SPEC\.md([^)]*)\)/g, "](/spec/$1)")
    .replace(/\]\(\.\/SPEC\.md([^)]*)\)/g, "](/spec/$1)")
    .replace(/\]\(SPEC\.md([^)]*)\)/g, "](/spec/$1)")
    .replace(/\]\(\.\/README\.md([^)]*)\)/g, "](/docs/$1)")
    .replace(/\]\(\.\/CONTRIBUTORS\.md([^)]*)\)/g, "](/contributors/$1)")
    .replace(/\]\(\.\/CONTRIBUTING\.md\)/g, `](${repo}/CONTRIBUTING.md)`)
    .replace(/\]\(\.\/LICENSE\)/g, `](${repo}/LICENSE)`)
    .replace(/\]\(\.\/examples([^)]*)\)/g, `](${repo}/examples$1)`)
    .replace(/\]\(\.\.\/packages([^)]*)\)/g, `](${repo}/packages$1)`)
    .replace(/\]\(\.\/packages([^)]*)\)/g, `](${repo}/packages$1)`)
    .replace(/\]\(packages([^)]*)\)/g, `](${repo}/packages$1)`);
}

function page(title, bodyHtml, { back } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · agent-resume</title>
  <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
  <link rel="stylesheet" href="/assets/site.css" />
  <link rel="stylesheet" href="/assets/docs.css" />
  <link rel="alternate" type="application/rss+xml" title="agent-resume" href="https://${DOMAIN}/feed.xml" />
</head>
<body>
  <header class="nav"><div class="nav-inner">
    <a class="brand" href="/"><span class="brand-mark">{ }</span><span class="brand-name">agent-resume</span></a>
    <nav class="nav-links">
      <a href="/#schemas">Schemas</a><a href="/spec/">Spec</a><a href="/docs/">Docs</a><a href="/blog/">Blog</a>
      <a class="nav-cta" href="https://github.com/rahhbster/agent-resume">GitHub ↗</a>
    </nav>
  </div></header>
  <main class="doc-shell">
    ${back ? `<a class="doc-back" href="${back}">← Back</a>` : ""}
    <article class="doc-content">${bodyHtml}</article>
  </main>
  <footer class="footer"><div class="wrap footer-inner">
    <span>MIT © agent-resume contributors</span>
    <nav><a href="/spec/">Spec</a><a href="/docs/">Docs</a><a href="/migration/">Migration</a><a href="/faq/">FAQ</a><a href="/blog/">Blog</a><a href="/contributors/">Contributors</a><a href="/feed.xml">RSS</a><a href="https://github.com/rahhbster/agent-resume">GitHub</a></nav>
  </div></footer>
</body>
</html>`;
}

// Parse YAML-ish front-matter from a markdown file.
// Supports only simple string values (title, date, slug, description).
function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*"(.*)"\s*$/);
    if (kv) meta[kv[1]] = kv[2];
  }
  return { meta, body: match[2] };
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rssItem({ title, slug, description, date, htmlUrl }) {
  return `  <item>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(htmlUrl)}</link>
    <guid isPermaLink="true">${escapeXml(htmlUrl)}</guid>
    <pubDate>${new Date(date + "T12:00:00Z").toUTCString()}</pubDate>
    <description>${escapeXml(description)}</description>
  </item>`;
}

function rssFeed(items) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>https://${DOMAIN}/blog/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="https://${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>
`;
}

async function main() {
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  // 1. Landing page + assets
  await fs.copyFile(path.join(__dirname, "index.html"), path.join(out, "index.html"));
  await copyDir(path.join(__dirname, "assets"), path.join(out, "assets"));

  // 2. Schemas — served at the path of each schema's own $id
  const schemaFiles = (await fs.readdir(SCHEMA_DIR)).filter((f) => f.endsWith(".json"));
  const served = [];
  for (const file of schemaFiles) {
    const raw = await fs.readFile(path.join(SCHEMA_DIR, file), "utf8");
    const json = JSON.parse(raw);
    const url = new URL(json.$id);
    const rel = url.pathname.replace(/^\//, "");
    await writeFile(rel, raw);
    served.push({ id: json.$id, title: json.title || file, rel });
  }
  // Schema index
  const list = served
    .map((s) => `<li><a href="/${s.rel}"><code>/${s.rel}</code></a> — ${s.title}</li>`)
    .join("\n");
  await writeFile(
    "schemas/index.html",
    page("Schemas", `<h1>Canonical schemas</h1><p>Each schema resolves at the URL of its <code>$id</code>.</p><ul>${list}</ul>`, { back: "/" }),
  );

  // 3. Rendered docs
  // Strip the GitHub-only header block (<div align="center">…</div> + hr) before rendering —
  // markdown-it treats HTML blocks as opaque, so the badges and nav links inside the div would
  // appear as raw text in the browser.
  const stripCenterHeader = (s) =>
    s.replace(/^<div align="center">[\s\S]*?<\/div>\s*\n---\n/m, "").trimStart();
  const readFile = (rel) => fs.readFile(path.join(root, rel), "utf8");

  const readme = rewriteLinks(stripCenterHeader(await readFile("README.md")));
  const spec = rewriteLinks(await readFile("SPEC.md"));
  const contributors = rewriteLinks(stripCenterHeader(await readFile("CONTRIBUTORS.md")));
  const migration = rewriteLinks(await readFile("docs/migrating-to-2020-12.md"));
  const faq = rewriteLinks(await readFile("docs/faq.md"));
  await writeFile("docs/index.html", page("Docs", md.render(readme), { back: "/" }));
  await writeFile("spec/index.html", page("Specification", md.render(spec), { back: "/" }));
  await writeFile("contributors/index.html", page("Contributors", md.render(contributors), { back: "/" }));
  await writeFile("migration/index.html", page("draft-07 → 2020-12 migration", md.render(migration), { back: "/spec/" }));
  await writeFile("faq/index.html", page("FAQ", md.render(faq), { back: "/" }));

  // 4. Blog posts + RSS feed
  const blogFiles = (await fs.readdir(BLOG_DIR).catch(() => [])).filter((f) => f.endsWith(".md")).sort().reverse();
  const posts = [];
  for (const file of blogFiles) {
    const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf8");
    const { meta, body } = parseFrontMatter(raw);
    const slug = meta.slug || file.replace(/\.md$/, "");
    const title = meta.title || slug;
    const date = meta.date || "2026-01-01";
    const description = meta.description || "";
    const htmlUrl = `https://${DOMAIN}/blog/${slug}/`;
    const postHtml = md.render(body);
    const postPage = page(
      title,
      `<time class="post-date" datetime="${date}">${new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>\n${postHtml}`,
      { back: "/blog/" },
    );
    await writeFile(`blog/${slug}/index.html`, postPage);
    posts.push({ title, slug, description, date, htmlUrl });
  }

  // Blog index
  const blogIndexHtml =
    posts.length === 0
      ? "<h1>Blog</h1><p>No posts yet.</p>"
      : `<h1>Blog</h1><ul class="post-list">${posts
          .map(
            (p) =>
              `<li><time datetime="${p.date}">${p.date}</time> — <a href="/blog/${p.slug}/">${p.title}</a><p>${p.description}</p></li>`,
          )
          .join("\n")}</ul>`;
  await writeFile("blog/index.html", page("Blog", blogIndexHtml, { back: "/" }));

  // RSS feed
  await writeFile("feed.xml", rssFeed(posts.map(rssItem)));

  // 5. Custom domain + crawler niceties
  await writeFile("CNAME", `${DOMAIN}\n`);
  await writeFile("robots.txt", `User-agent: *\nAllow: /\nSitemap: https://${DOMAIN}/sitemap.xml\n`);
  const blogUrls = posts.map((p) => `blog/${p.slug}/`);
  const urls = ["", "spec/", "docs/", "migration/", "faq/", "blog/", "contributors/", "schemas/", ...blogUrls, ...served.map((s) => s.rel)];
  await writeFile(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>https://${DOMAIN}/${u}</loc></url>`)
      .join("\n")}\n</urlset>\n`,
  );

  console.log(`Built site → ${out}`);
  console.log(`Served ${served.length} schemas, 5 doc pages, ${posts.length} blog post(s), landing + schema index + RSS feed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
