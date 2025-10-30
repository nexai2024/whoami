# Cloudflare R2 Storage Setup

This document explains how to configure Cloudflare R2 for file uploads (lead magnets, course content, etc.).

## Why R2?

The application uses Cloudflare R2 for object storage. R2 is S3-compatible, cost-effective, and has zero egress fees.

## Setup Instructions

### 1. Create an R2 Bucket

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `whoami-uploads`)
5. Select a location hint (optional)
6. Click **Create bucket**

### 2. Create API Tokens

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Give it a name (e.g., "Whoami Application")
4. Set permissions:
   - **Object Read & Write** for your bucket
5. Click **Create API Token**
6. **Important:** Copy and save both:
   - Access Key ID
   - Secret Access Key
   - (You won't be able to see the secret again!)

### 3. Get Your Account ID

Your Cloudflare account ID is visible in the R2 dashboard URL:
- URL format: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2/overview`
- The account ID is the alphanumeric string in the URL

### 4. Configure Environment Variables

Create a `.env` or `.env.local` file in the `whoami` directory with:

```env
# Cloudflare R2 Storage
AWS_ACCESS_KEY_ID="your_r2_access_key_id_here"
AWS_SECRET_ACCESS_KEY="your_r2_secret_access_key_here"
S3_BUCKET_NAME="whoami-uploads"
S3_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
```

**Replace:**
- `your_r2_access_key_id_here` → Your Access Key ID from step 2
- `your_r2_secret_access_key_here` → Your Secret Access Key from step 2
- `YOUR_ACCOUNT_ID` → Your Cloudflare account ID from step 3
- `whoami-uploads` → Your bucket name from step 1 (if different)

### 5. Verify Configuration

The storage service will automatically detect if R2 is configured. You can verify by:

1. Starting the application
2. Going to the lead magnet dashboard
3. Attempting to upload a file
4. If configured correctly, uploads will succeed

## How It Works

The application uses the AWS S3 SDK for compatibility with R2:

- **Storage Service:** `lib/services/storageService.ts`
  - Handles file uploads, downloads, and deletions
  - Uses S3-compatible API calls
  - Automatically detects if credentials are configured

- **Upload API:** `app/api/upload/route.ts`
  - Accepts multipart file uploads
  - Validates file types and sizes
  - Returns public URL for uploaded files

## Troubleshooting

### "Storage not configured" error

**Cause:** Environment variables are missing or incorrect

**Solution:**
- Verify all 4 required env vars are set
- Restart your development server after adding env vars
- Check `.env` file is in the correct directory

### "Access Denied" error

**Cause:** API token doesn't have proper permissions

**Solution:**
- Verify your API token has **Object Read & Write** permissions
- Ensure the token applies to the correct bucket
- Create a new API token if needed

### "Bucket not found" error

**Cause:** Bucket name or endpoint is incorrect

**Solution:**
- Verify `S3_BUCKET_NAME` matches your R2 bucket exactly
- Verify `S3_ENDPOINT` includes your correct account ID
- Check for typos in environment variables

### Files upload but can't be accessed

**Cause:** Bucket is not configured for public access

**Solution:**
- In R2 dashboard, go to your bucket settings
- Configure public access or custom domain if needed
- Update `PUBLIC_URL` if using a custom domain

## Cost Information

Cloudflare R2 pricing (as of 2024):
- Storage: $0.015 per GB/month
- Class A operations (writes): $4.50 per million requests
- Class B operations (reads): $0.36 per million requests
- **Egress: $0** (no bandwidth charges!)

For most applications, R2 is significantly cheaper than S3.

## Alternative: AWS S3

The storage service also works with AWS S3. To use S3 instead:

1. Create an S3 bucket
2. Create IAM user with S3 access
3. Set environment variables:
   ```env
   AWS_ACCESS_KEY_ID="your_aws_access_key"
   AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
   S3_BUCKET_NAME="your-s3-bucket"
   # Optionally set S3_REGION if not us-east-1
   ```

**Note:** AWS S3 charges for egress bandwidth, which can get expensive.

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Rotate API tokens** periodically
3. **Use least privilege** - only grant necessary permissions
4. **Monitor usage** in Cloudflare dashboard
5. **Enable bucket versioning** for important data
6. **Set up CORS** rules if needed for browser uploads

## Support

For R2-specific issues, refer to:
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
