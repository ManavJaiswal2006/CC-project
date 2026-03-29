# Production Deployment Checklist - Password Reset

## ✅ Code is Ready

The code is ready to push! The route `/reset-password` will work once deployed.

## 🔧 Required Environment Variables in Production

You **MUST** set these environment variables in your production hosting (Vercel, Netlify, etc.):

### 1. Site URL (Required)
```env
NEXT_PUBLIC_SITE_URL=https://cc-project-phi.vercel.app
```
**Why:** This ensures password reset emails contain the correct production URL.

### 2. Firebase Admin SDK (Required for Password Reset)
Choose **ONE** of these options:

**Option A: Service Account JSON (Recommended)**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"cc-project-8ce17",...}'
```
- Get this from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Copy the entire JSON and paste as a single line (remove all newlines)
- In Vercel/Netlify, you can paste it directly

**Option B: Individual Fields**
```env
FIREBASE_PROJECT_ID=cc-project-8ce17
FIREBASE_CLIENT_EMAIL=your-service-account@cc-project-8ce17.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Email Configuration (Required for Sending Emails)
```env
EMAIL_SECURITY_USER=your-email@gmail.com
EMAIL_SECURITY_PASS=your-app-password
# OR use base config
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```
**Note:** For Gmail, use an App Password, not your regular password.

### 4. Convex (Already Configured)
```env
NEXT_PUBLIC_CONVEX_URL=your-convex-url
```
This should already be set.

## 📋 Pre-Deployment Steps

1. **Deploy Convex Schema**
   ```bash
   npx convex deploy
   ```
   This creates the `passwordResetTokens` table in production.

2. **Test Locally First** (Optional but recommended)
   - Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`
   - Test the full flow: request reset → check email → click link → reset password
   - If it works locally, it will work in production

## 🚀 Deployment Steps

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Add custom password reset functionality"
   git push
   ```

2. **Set Environment Variables in Production:**
   - Go to your hosting platform (Vercel/Netlify/etc.)
   - Navigate to Project Settings → Environment Variables
   - Add all the variables listed above
   - **Important:** Make sure `NEXT_PUBLIC_SITE_URL` is set to your production domain

3. **Redeploy** (if needed):
   - Most platforms auto-deploy on push
   - If not, trigger a manual redeploy after adding env variables

## ✅ Post-Deployment Verification

1. **Test the route exists:**
   - Visit: `https://cc-project-phi.vercel.app/reset-password`
   - Should show the reset password form (will show error about missing token, but page should load)

2. **Test full flow:**
   - Go to: `https://cc-project-phi.vercel.app/forgot-password`
   - Enter a registered email
   - Check email for reset link
   - Click the link
   - Should open: `https://cc-project-phi.vercel.app/reset-password?token=...`
   - Enter new password
   - Should successfully reset

## ⚠️ Common Issues After Deployment

### Issue: "Page Not Found" on reset link
**Cause:** `NEXT_PUBLIC_SITE_URL` not set or wrong
**Fix:** Set `NEXT_PUBLIC_SITE_URL=https://cc-project-phi.vercel.app` in production env vars

### Issue: "Server configuration error" when resetting
**Cause:** Firebase Admin SDK not configured
**Fix:** Add `FIREBASE_SERVICE_ACCOUNT` or individual Firebase Admin credentials

### Issue: Email not received
**Cause:** Email credentials not configured
**Fix:** Add `EMAIL_SECURITY_USER` and `EMAIL_SECURITY_PASS` in production

### Issue: "Invalid or expired reset token"
**Cause:** Token expired (1 hour limit) or already used
**Fix:** Request a new password reset

## 📝 Summary

**Yes, it will work in production IF:**
- ✅ You set `NEXT_PUBLIC_SITE_URL=https://cc-project-phi.vercel.app`
- ✅ You configure Firebase Admin SDK credentials
- ✅ You configure email credentials
- ✅ You deploy the Convex schema (`npx convex deploy`)

The code itself is ready - you just need to configure the environment variables in your production hosting platform!

