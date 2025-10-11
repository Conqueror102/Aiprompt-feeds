# Environment Variables Template

Create a `.env.local` file in the root directory with these variables:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Base URL (for production, use your actual domain)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Google Search Console Verification
# Get this from Google Search Console after adding your property
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code
```

## How to Get Google Search Console Verification Code

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter your domain URL
4. Choose "HTML tag" verification method
5. Copy the content value from the meta tag
6. Paste it in the `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` variable

Example meta tag from Google:
```html
<meta name="google-site-verification" content="abc123xyz..." />
```

Use only the content value: `abc123xyz...`
