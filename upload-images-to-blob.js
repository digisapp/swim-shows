#!/usr/bin/env node

/**
 * Upload Images to Vercel Blob Storage
 *
 * This script uploads all images from the /images directory to Vercel Blob Storage
 * and generates a mapping of old paths to new Blob URLs.
 */

import { put, list } from '@vercel/blob';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

const IMAGES_DIR = './images';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable not set');
  console.error('\nPlease follow these steps:');
  console.error('1. Go to https://vercel.com/dashboard');
  console.error('2. Select your swim-shows project');
  console.error('3. Go to Settings > Blob');
  console.error('4. Copy your Blob Read-Write Token');
  console.error('5. Run: export BLOB_READ_WRITE_TOKEN="your-token-here"');
  console.error('6. Then run this script again');
  process.exit(1);
}

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.heic'];

async function uploadImage(filePath, fileName) {
  try {
    const fileBuffer = readFileSync(filePath);
    const ext = extname(fileName).toLowerCase();

    // Determine content type
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.heic': 'image/heic'
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    console.log(`📤 Uploading ${fileName}...`);

    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: contentType,
      addRandomSuffix: false, // Keep original filename
    });

    console.log(`✅ Uploaded: ${fileName} -> ${blob.url}`);
    return { fileName, url: blob.url };
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, error.message);
    return null;
  }
}

async function getAllImages(directory) {
  const images = [];
  const files = readdirSync(directory);

  for (const file of files) {
    const filePath = join(directory, file);
    const stat = statSync(filePath);

    if (stat.isFile()) {
      const ext = extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push({ filePath, fileName: file });
      }
    }
  }

  return images;
}

async function main() {
  console.log('🚀 Starting Vercel Blob Storage Upload...\n');

  // Get all images
  const images = await getAllImages(IMAGES_DIR);
  console.log(`📁 Found ${images.length} images to upload\n`);

  if (images.length === 0) {
    console.log('No images found to upload.');
    return;
  }

  // Upload all images
  const results = [];
  for (const { filePath, fileName } of images) {
    const result = await uploadImage(filePath, fileName);
    if (result) {
      results.push(result);
    }
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save URL mapping
  const urlMapping = {};
  results.forEach(({ fileName, url }) => {
    urlMapping[`../images/${fileName}`] = url;
    urlMapping[`/images/${fileName}`] = url;
    urlMapping[`images/${fileName}`] = url;
  });

  writeFileSync(
    './blob-url-mapping.json',
    JSON.stringify(urlMapping, null, 2)
  );

  console.log('\n✅ Upload Complete!');
  console.log(`📊 Successfully uploaded ${results.length} out of ${images.length} images`);
  console.log('💾 URL mapping saved to blob-url-mapping.json');
  console.log('\n📝 Next steps:');
  console.log('1. Review blob-url-mapping.json');
  console.log('2. Run the update script to replace image URLs in HTML files');
}

main().catch(console.error);
