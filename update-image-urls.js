#!/usr/bin/env node

/**
 * Update Image URLs in HTML files
 *
 * This script replaces local image paths with Vercel Blob Storage URLs
 * across all HTML files in the project.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const MAPPING_FILE = './blob-url-mapping.json';

function getAllHtmlFiles(directory, fileList = []) {
  const files = readdirSync(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stat = statSync(filePath);

    // Skip node_modules, .git, etc.
    if (file.startsWith('.') || file === 'node_modules') {
      continue;
    }

    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (extname(file) === '.html') {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function updateHtmlFile(filePath, urlMapping) {
  console.log(`📝 Processing ${filePath}...`);

  let content = readFileSync(filePath, 'utf-8');
  let changesCount = 0;

  // Replace each image path with Blob URL
  for (const [oldPath, newUrl] of Object.entries(urlMapping)) {
    const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, newUrl);
      changesCount += matches.length;
    }
  }

  if (changesCount > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`   ✅ Updated ${changesCount} image references`);
  } else {
    console.log(`   ⏭️  No changes needed`);
  }

  return changesCount;
}

async function main() {
  console.log('🔄 Starting Image URL Update...\n');

  // Load URL mapping
  if (!readFileSync(MAPPING_FILE, 'utf-8')) {
    console.error('❌ Error: blob-url-mapping.json not found');
    console.error('Please run upload-images-to-blob.js first');
    process.exit(1);
  }

  const urlMapping = JSON.parse(readFileSync(MAPPING_FILE, 'utf-8'));
  console.log(`📋 Loaded ${Object.keys(urlMapping).length / 3} image mappings\n`);

  // Get all HTML files
  const htmlFiles = getAllHtmlFiles('.');
  console.log(`📁 Found ${htmlFiles.length} HTML files\n`);

  // Update each HTML file
  let totalChanges = 0;
  for (const filePath of htmlFiles) {
    const changes = updateHtmlFile(filePath, urlMapping);
    totalChanges += changes;
  }

  console.log('\n✅ Update Complete!');
  console.log(`📊 Updated ${totalChanges} image references across ${htmlFiles.length} files`);
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes with: git diff');
  console.log('2. Test your site locally');
  console.log('3. Commit and push: git add . && git commit -m "Migrate images to Vercel Blob Storage"');
  console.log('4. Optional: Delete /images directory to save space');
}

main().catch(console.error);
