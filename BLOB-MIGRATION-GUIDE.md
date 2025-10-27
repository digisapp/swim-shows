# Vercel Blob Storage Migration Guide

This guide will help you migrate your images from the local `/images` directory to Vercel Blob Storage.

## Step 1: Get Your Vercel Blob Token

1. Go to https://vercel.com/dashboard
2. Select your **swim-shows** project
3. Click **Settings** in the top navigation
4. Click **Blob** in the left sidebar
5. Under "Read-Write Token", click **Create Token**
6. Copy the token (starts with `vercel_blob_rw_...`)

## Step 2: Set Environment Variable

In your terminal, run:

```bash
export BLOB_READ_WRITE_TOKEN="vercel_blob_rw_YOUR_TOKEN_HERE"
```

Replace `vercel_blob_rw_YOUR_TOKEN_HERE` with the token you copied.

## Step 3: Upload Images to Blob Storage

Run the upload script:

```bash
npm run upload-images
```

This will:
- Upload all images from `/images` to Vercel Blob Storage
- Create a `blob-url-mapping.json` file with old → new URL mappings
- Show progress for each image uploaded

**Expected output:**
```
🚀 Starting Vercel Blob Storage Upload...

📁 Found 35 images to upload

📤 Uploading swim-shows-logo.png...
✅ Uploaded: swim-shows-logo.png -> https://abcdef123.public.blob.vercel-storage.com/swim-shows-logo.png
...

✅ Upload Complete!
📊 Successfully uploaded 35 out of 35 images
💾 URL mapping saved to blob-url-mapping.json
```

## Step 4: Update HTML Files

Run the URL update script:

```bash
npm run update-urls
```

This will:
- Read the `blob-url-mapping.json` file
- Find all HTML files in your project
- Replace local image paths with Blob Storage URLs
- Show how many changes were made per file

**Expected output:**
```
🔄 Starting Image URL Update...

📋 Loaded 35 image mappings

📁 Found 12 HTML files

📝 Processing ./index.html...
   ✅ Updated 8 image references
...

✅ Update Complete!
📊 Updated 127 image references across 12 files
```

## Step 5: Review Changes

Check what changed:

```bash
git diff
```

You should see image paths changed from:
```html
<!-- Before -->
<img src="../images/swim-shows-logo.png" alt="Logo">

<!-- After -->
<img src="https://abcdef123.public.blob.vercel-storage.com/swim-shows-logo.png" alt="Logo">
```

## Step 6: Test Locally

Open your HTML files in a browser and verify all images load correctly.

## Step 7: Commit and Deploy

```bash
git add .
git commit -m "Migrate images to Vercel Blob Storage"
git push
```

Vercel will automatically deploy your changes.

## Step 8: Clean Up (Optional)

After confirming everything works, you can delete the local images directory to save space:

```bash
# Backup first (just in case)
mv images images-backup

# Or delete permanently
# rm -rf images

# Remove from git
git rm -r images
git commit -m "Remove local images directory"
git push
```

## Benefits

✅ **Faster Loading** - Images served from Vercel's global CDN
✅ **Smaller Repo** - No large images in git history
✅ **Better Performance** - Automatic optimization available
✅ **Scalable** - No repo size limits

## Pricing

Vercel Blob Storage pricing:
- **Storage:** $0.15/GB per month
- **Bandwidth:** $0.30/GB transferred
- Typical usage for your site: ~$5-10/month

## Troubleshooting

### Error: BLOB_READ_WRITE_TOKEN not set
Make sure you ran the export command in the same terminal session:
```bash
export BLOB_READ_WRITE_TOKEN="your-token-here"
```

### Images not uploading
- Check your internet connection
- Verify the token is correct
- Check Vercel dashboard for any account issues

### URLs not updating
- Make sure `blob-url-mapping.json` was created
- Check file permissions
- Run with `node update-image-urls.js` directly to see errors

## Support

If you encounter issues:
1. Check the Vercel Blob documentation: https://vercel.com/docs/storage/vercel-blob
2. Contact Vercel support
3. Review the script output for specific error messages
