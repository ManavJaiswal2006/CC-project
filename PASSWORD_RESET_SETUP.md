# Custom Password Reset Setup Guide

## Overview

This project now includes a custom password reset system that doesn't require a custom domain in Firebase. The system uses:

- **Convex** for storing password reset tokens
- **Nodemailer** for sending password reset emails
- **Firebase Admin SDK** for updating user passwords

## What Was Implemented

1. **Database Schema** (`convex/schema.ts`)
   - Added `passwordResetTokens` table to store reset tokens

2. **Convex Functions** (`convex/passwordReset.ts`)
   - `createPasswordResetToken` - Generates secure reset tokens
   - `verifyPasswordResetToken` - Verifies and marks tokens as used
   - `getTokenStatus` - Checks token status

3. **API Routes**
   - `/api/password-reset/request` - Request password reset (sends email)
   - `/api/password-reset/reset` - Verify token and reset password

4. **Frontend Components**
   - Updated `ForgotPassword.tsx` - Uses custom API instead of Firebase
   - New `ResetPassword.tsx` - Page for entering new password
   - New `/reset-password` route

5. **Email Template**
   - Added `sendPasswordResetEmail` function in `lib/emailNotifications.ts`

## Firebase Admin SDK Setup

To enable password reset functionality, you need to configure Firebase Admin SDK:

### Option 1: Service Account JSON (Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Add to your `.env.local`:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id",...}'
```

**Note:** Paste the entire JSON as a single-line string (remove newlines).

### Option 2: Application Default Credentials (Production)

For production environments (like Google Cloud Platform), you can use Application Default Credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
```

The system will automatically use Application Default Credentials if available.

### Option 3: Environment Variables (Alternative)

You can also set individual service account fields:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## How It Works

1. **User Requests Reset**
   - User enters email on `/forgot-password` page
   - System checks if user exists (if Admin SDK configured)
   - Generates secure token and stores in Convex
   - Sends email with reset link

2. **User Clicks Reset Link**
   - Link contains token: `/reset-password?token=...`
   - User enters new password
   - System verifies token
   - Updates password using Firebase Admin SDK

3. **Security Features**
   - Tokens expire after 1 hour
   - Tokens can only be used once
   - Rate limiting on API routes
   - Email enumeration prevention (always returns success message)

## Testing

1. **Request Password Reset**
   - Navigate to `/forgot-password`
   - Enter a registered email
   - Check email for reset link

2. **Reset Password**
   - Click link in email (or navigate to `/reset-password?token=YOUR_TOKEN`)
   - Enter new password
   - Confirm password
   - Submit

3. **Verify**
   - Try logging in with old password (should fail)
   - Try logging in with new password (should succeed)

## Troubleshooting

### "Server configuration error" when resetting password

- **Cause:** Firebase Admin SDK not configured
- **Solution:** Set up Firebase Admin SDK using one of the options above

### Email not received

- Check spam folder
- Verify email configuration in `.env.local`:
  - `EMAIL_SECURITY_USER` or `EMAIL_USER`
  - `EMAIL_SECURITY_PASS` or `EMAIL_PASS`
- Check server logs for email errors

### "Invalid or expired reset token"

- Tokens expire after 1 hour
- Tokens can only be used once
- Request a new password reset

## Environment Variables Required

```env
# Firebase Admin SDK (choose one option)
FIREBASE_SERVICE_ACCOUNT='{...}'  # Option 1: Full JSON
# OR
FIREBASE_PROJECT_ID=your-project-id  # Option 2: For Application Default Credentials

# Email Configuration
EMAIL_SECURITY_USER=your-email@gmail.com
EMAIL_SECURITY_PASS=your-app-password
# OR use base email config
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://bourgon.in
```

## Notes

- The system prevents email enumeration by always returning success messages
- Tokens are stored securely in Convex database
- Password updates require Firebase Admin SDK (server-side only)
- The reset link is valid for 1 hour
- Each token can only be used once

