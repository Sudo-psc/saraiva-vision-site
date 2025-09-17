#!/usr/bin/env node

/**
 * Documentation Link Validator
 * Checks all markdown files for broken internal links
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const ignoreDirs = ['node_modules', 'dist', '.git', '.vite'];

// Find all markdown files
function findMarkdownFiles(dir = projectRoot) {
  const files = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !ignoreDirs.includes(entry)) {
        scan(fullPath);
      } else if (stat.isFile() && entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Extract relative markdown links from content
function extractMarkdownLinks(content) {
  const linkRegex = /\[([^\]]+)\]\((\.[^\)]+\.md[^\)]*)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      raw: match[0]
    });
  }
  
  return links;
}

// Validate links
function validateLinks() {
  const markdownFiles = findMarkdownFiles();
  const errors = [];
  let totalLinks = 0;
  let validLinks = 0;
  
  console.log('🔍 Validating documentation links...\n');
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const links = extractMarkdownLinks(content);
    
    if (links.length === 0) continue;
    
    console.log(`📄 ${relativePath} (${links.length} links)`);
    
    for (const link of links) {
      totalLinks++;
      
      // Resolve relative path
      const fileDir = path.dirname(filePath);
      const targetPath = path.resolve(fileDir, link.url);
      
      if (fs.existsSync(targetPath)) {
        validLinks++;
        console.log(`  ✅ ${link.text} → ${link.url}`);
      } else {
        errors.push({
          file: relativePath,
          link: link.raw,
          target: link.url,
          resolved: path.relative(projectRoot, targetPath)
        });
        console.log(`  ❌ ${link.text} → ${link.url} (NOT FOUND)`);
      }
    }
    console.log();
  }
  
  // Summary
  console.log('📊 SUMMARY');
  console.log('===========');
  console.log(`Total markdown files: ${markdownFiles.length}`);
  console.log(`Total internal links: ${totalLinks}`);
  console.log(`Valid links: ${validLinks}`);
  console.log(`Broken links: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ BROKEN LINKS:');
    console.log('=================');
    for (const error of errors) {
      console.log(`${error.file}: ${error.link}`);
      console.log(`  Expected: ${error.resolved}`);
    }
    process.exit(1);
  } else {
    console.log('\n✅ All documentation links are valid!');
    process.exit(0);
  }
}

// Run validation
validateLinks();