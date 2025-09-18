#!/usr/bin/env node
/*
 Audits anchors, router Links and buttons for common issues:
  - target="_blank" without rel="noopener noreferrer"
  - http:// (non-https) external links
  - internal links not starting with '/'
  - React Router <Link to> with uppercase or missing leading '/'
  - <button> without explicit type
  - anchors that likely have no accessible text (icon-only without aria-label)
*/
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'src');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);

/** Read all files under dir */
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(p));
    else if (exts.has(path.extname(e.name))) files.push(p);
  }
  return files;
}

const files = walk(root);

const issues = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    // target _blank without rel
    if (/<a[^>]*target=\"_blank\"/i.test(line) && !/rel=\"[^\"]*noopener[^\"]*noreferrer[^\"]*\"/i.test(line)) {
      issues.push({ type: 'anchor-rel', file, ln, line: line.trim() });
    }

    // http links
    const httpMatch = line.match(/<a[^>]*href=\"(http:\/\/[^\"]+)\"/i);
    if (httpMatch) {
      issues.push({ type: 'insecure-http', file, ln, url: httpMatch[1], line: line.trim() });
    }

    // internal links not starting '/' (skip mailto, tel, hash, js)
    const hrefMatch = line.match(/<a[^>]*href=\"([^\"]+)\"/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      const isExternal = /^https?:\/\//i.test(href);
      const isSpecial = /^(mailto:|tel:|#|javascript:)/i.test(href);
      if (!isExternal && !isSpecial && !href.startsWith('/')) {
        issues.push({ type: 'internal-relative-href', file, ln, href, line: line.trim() });
      }
    }

    // React Router Link checks
    const linkTo = line.match(/<Link[^>]*to=\"([^\"]+)\"/);
    if (linkTo) {
      const to = linkTo[1];
      if (!to.startsWith('/')) {
        issues.push({ type: 'router-to-leading-slash', file, ln, to, line: line.trim() });
      }
      if (/[A-Z]/.test(to)) {
        issues.push({ type: 'router-to-uppercase', file, ln, to, line: line.trim() });
      }
    }

    // button without explicit type
    // Only match native lowercase <button>, not custom <Button>
    if (/<button(\s|>)/.test(line) && !/type=\"(button|submit|reset)\"/i.test(line)) {
      issues.push({ type: 'button-missing-type', file, ln, line: line.trim() });
    }

    // icon-only anchor heuristic: anchor with svg/img and no text, lacking aria-label
    if (/<a[^>]*>(\s*<svg|\s*<img)/i.test(line) && !/aria-label=\"/i.test(line)) {
      issues.push({ type: 'anchor-icon-no-aria', file, ln, line: line.trim() });
    }
  });
}

const grouped = issues.reduce((acc, it) => {
  (acc[it.type] ||= []).push(it);
  return acc;
}, {});

const order = [
  'anchor-rel',
  'insecure-http',
  'internal-relative-href',
  'router-to-leading-slash',
  'router-to-uppercase',
  'button-missing-type',
  'anchor-icon-no-aria'
];

for (const t of order) {
  const arr = grouped[t] || [];
  if (!arr.length) continue;
  console.log(`\n== ${t} (${arr.length}) ==`);
  for (const it of arr) {
    console.log(`- ${path.relative(process.cwd(), it.file)}:${it.ln} -> ${it.line}`);
    if (it.url) console.log(`  url: ${it.url}`);
    if (it.href) console.log(`  href: ${it.href}`);
    if (it.to) console.log(`  to: ${it.to}`);
  }
}

if (!issues.length) {
  console.log('No issues found.');
}
