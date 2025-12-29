# Password Reset Troubleshooting Guide

## Quick Checks

### 1. Is Firebase Admin SDK Configured?

Check your `.env.local` file. You need ONE of these:

**Option A: Service Account JSON (Recommended)**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project",...}'
```

**Option B: Individual Fields**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**To get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Either:
   - Copy the entire JSON and paste as `FIREBASE_SERVICE_ACCOUNT` (remove all newlines)
   - OR extract `project_id`, `client_email`, and `private_key` separately

### 2. Is Convex Schema Deployed?

Run this command to deploy your Convex schema:
```bash
npx convex deploy
```

Or if running in dev mode:
```bash
npx convex dev
```

The schema should include the `passwordResetTokens` table.

### 3. Is Email Configured?

Check your `.env.local` for email settings:
```env
EMAIL_SECURITY_USER=your-email@gmail.com
EMAIL_SECURITY_PASS=your-app-password
# OR
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note:** For Gmail, you need an "App Password", not your regular password.
- Go to Google Account → Security → 2-Step Verification → App Passwords
- Generate an app password for "Mail"

### 4. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab** for JavaScript errors
- **Network tab** for API request failures

### 5. Check Server Logs

Look at your terminal/console where the Next.js server is running for:
- Firebase Admin initialization errors
- API route errors
- Email sending errors

## Common Errors

### "Server configuration error. Please configure Firebase Admin SDK"

**Cause:** Firebase Admin SDK is not initialized

**Solution:**
1. Check `.env.local` has Firebase Admin credentials
2. Restart your Next.js dev server after adding env variables
3. Verify the JSON is valid (if using FIREBASE_SERVICE_ACCOUNT)

### "Invalid or expired reset token"

**Cause:** 
- Token has expired (1 hour limit)
- Token was already used
- Token doesn't exist

**Solution:**
- Request a new password reset
- Make sure you're using the latest link from your email

### "Failed to send reset link"

**Cause:** Email service not configured or email sending failed

**Solution:**
1. Check email credentials in `.env.local`
2. Verify email service is working (test with other emails)
3. Check spam folder - email might have been sent but filtered

### "User account not found"

**Cause:** Email doesn't exist in Firebase Auth

**Solution:**
- Make sure the email is registered in your Firebase project
- Check Firebase Console → Authentication → Users

### API Returns 500 Error

**Check server logs for:**
- Firebase Admin initialization errors
- Convex connection errors
- Email sending errors

## Testing Steps

### Step 1: Test Firebase Admin

Create a test file `test-admin.js`:
```javascript
const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.auth().listUsers(1)
  .then(() => console.log('✅ Firebase Admin works!'))
  .catch(err => console.error('❌ Error:', err));
```

Run: `FIREBASE_SERVICE_ACCOUNT='...' node test-admin.js`

### Step 2: Test API Route

Test the request endpoint:
```bash
curl -X POST http://localhost:3000/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Should return: `{"success":true,"message":"..."}`

### Step 3: Test Email

Check if emails are being sent:
1. Request password reset
2. Check email inbox (and spam)
3. Check server logs for email errors

## Still Not Working?

1. **Check all environment variables are set:**
   ```bash
   # In your project root
   cat .env.local | grep FIREBASE
   cat .env.local | grep EMAIL
   ```

2. **Verify Convex is connected:**
   - Check `NEXT_PUBLIC_CONVEX_URL` is set
   - Run `npx convex dev` to see if it connects

3. **Check Next.js is reading env variables:**
   - Restart dev server after changing `.env.local`
   - Make sure `.env.local` is in project root (not in `app/` or `lib/`)

4. **Verify Firebase project:**
   - Make sure you're using the correct Firebase project
   - Check `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches your project

5. **Check file permissions:**
   - Make sure `.env.local` is readable
   - Check file isn't corrupted

## Getting Help

If still having issues, provide:
1. Error message from browser console
2. Error message from server logs
3. Your `.env.local` structure (without actual secrets)
4. Steps you took to reproduce the issue

