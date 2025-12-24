# Environment Variables Example

## Important: 
**You need to create a `.env.local` file** in the root directory (same level as `package.json`) with the following variables.

**If you already have a `.env` or `.env.local` file**, add any missing variables from below.

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Convex Configuration (REQUIRED)
NEXT_PUBLIC_CONVEX_URL=https://your_deployment.convex.cloud

# Email Configuration (REQUIRED for emails to work)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin@yourdomain.com

# Razorpay Configuration (REQUIRED for Card/UPI payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here

# Admin API Security (OPTIONAL - only if using admin order confirmation API)
ADMIN_API_KEY=your_secure_random_string_here
NEXT_PUBLIC_ADMIN_API_KEY=your_secure_random_string_here

# Admin Emails (REQUIRED for admin panel access)
# Comma-separated list of admin email addresses
# Example: ADMIN_EMAILS=admin1@example.com,admin2@example.com
ADMIN_EMAILS=your_admin_email@example.com

# Google Analytics (OPTIONAL)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Required vs Optional:

### REQUIRED (App won't work without these):
- All Firebase variables (`NEXT_PUBLIC_FIREBASE_*`)
- `NEXT_PUBLIC_CONVEX_URL`
- Email variables (`EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAIL`) - Required if you want email notifications
- Razorpay variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) - Required for Card/UPI payments

### OPTIONAL:
- `NEXT_PUBLIC_SITE_URL` - Defaults to "https://bourgon.com" if not set
- `NEXT_PUBLIC_GA_ID` - Only needed if using Google Analytics

### REQUIRED FOR ADMIN PANEL:
- `ADMIN_EMAILS` - Comma-separated list of admin email addresses
- `ADMIN_API_KEY` / `NEXT_PUBLIC_ADMIN_API_KEY` - For admin order confirmation API

## Setup Instructions:

1. **Create `.env.local` file** in your project root:
   ```
   C:\Users\Rajeev Ranjan\Desktop\manav\coding\projects\bourgon\.env.local
   ```

2. **Copy your existing Firebase and Convex values** from your current `.env` file (if you have one)

3. **Add the new variables** that were added:
   - `NEXT_PUBLIC_SITE_URL` (your actual domain)
   - `ADMIN_EMAIL` (if not already set)
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (get from Razorpay Dashboard)
   - `NEXT_PUBLIC_GA_ID` (optional, only if using Google Analytics)

4. **For Gmail email**: 
   - Use an "App Password" (not your regular password)
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate an app password and use that for `EMAIL_PASS`

## Notes:

- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- For production deployment, set these in your hosting platform's environment variables (Vercel, Netlify, etc.)
- After adding new variables, restart your dev server (`npm run dev`)

