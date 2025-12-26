# Firebase Email Template Customization Guide

## Overview
Firebase sends verification emails using default templates. **However, Firebase has restrictions on editing certain templates** (like email verification) to prevent spam.

## ✅ Custom Domain Verification Complete

**You have set up custom domain verification!** This means you should now be able to:
- ✅ Edit email templates
- ✅ Customize email content
- ✅ Remove the project name from emails
- ✅ Use your custom domain in sender address

## ⚠️ Template Editing Restriction (If You Still See It)

**If you still see this error:** *"To help prevent spam, the message can't be edited on this email template"*

This usually means:
- Custom domain verification may not be fully complete
- Check Firebase Console → Authentication → Settings → Authorized domains
- Ensure your domain shows as "Verified"
- Some templates may still have restrictions even with custom domain

## Why is the Project Name Showing?

By default, Firebase emails include:
- Sender address: `noreply@your-project-id.firebaseapp.com`
- Footer text: "Your [project-name] team" or "Your project-[number] team"

This happens because the email templates use default Firebase branding.

## Solutions & Workarounds

### ✅ Option 1: Use Custom Domain (COMPLETED!)

**You've already set up custom domain verification!** Now you can:

1. **Go to Firebase Console** → **Authentication** → **Templates**
2. **Edit the "Email address verification" template** - it should now be editable
3. **Customize the email content** using the template below
4. **Save your changes**

**Benefits you now have:**
- ✅ Custom sender address (e.g., `noreply@bourgon.in` instead of `noreply@bourgon-8ce17.firebaseapp.com`)
- ✅ Can customize email content freely
- ✅ Better branding - no project name/ID in footer
- ✅ Professional email appearance

### Option 2: Custom Email Action Handler (Advanced)

Create a custom handler page that processes the verification link and redirects to your beautiful verification page. This works with the default Firebase email.

1. The email still uses Firebase's default template, but the link can point to your custom handler
2. Your handler processes the verification and shows your branded page

**Note:** This is already partially implemented - the `continueUrl` in your code points to `/verify-email`, which is your custom page.

### Option 3: Accept Default Template (Current Situation)

Since direct template editing is restricted:
- The email will use Firebase's default template with the project name
- **However**, you've already created a beautiful verification page (`/verify-email`) that users land on after clicking the link
- Users will see your branded page immediately after clicking the verification link in the email

## Current Implementation

Your code already sets up a custom redirect:
```typescript
await sendEmailVerification(user, {
  url: `${siteUrl}/verify-email`,
  handleCodeInApp: false,
});
```

This means:
- ✅ Users get redirected to your beautiful `/verify-email` page after clicking the link
- ❌ The email itself still uses Firebase's default template (with project name)
- ✅ Your verification landing page is fully branded and beautiful

## How to Try Customizing (If Available)

**Note:** This may not work due to Firebase restrictions, but try:

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`bourgon-8ce17`)
3. Navigate to **Authentication** → **Templates**

### Step 2: Check if Email Verification Template is Editable

1. Click on **"Email address verification"** template
2. If editable, you can customize:
   - **Email Subject**: Change the default subject line
   - **Email Body**: Customize the email content (if allowed)
   - **Action URL**: This is already set via code to `/verify-email`

### Step 3: Customize the Email Content

✅ **With your custom domain verified, you should now be able to edit the template!**

Replace the default template with this beautiful, branded version:

#### Subject Line:
```
Verify your Bourgon Industries email address
```

#### Email Body Template:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Logo/Branding -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-family: serif; font-style: italic; font-size: 32px; color: #000; margin: 0;">Bourgon</h1>
      <div style="width: 60px; height: 2px; background-color: #dc2626; margin: 10px auto;"></div>
    </div>

    <!-- Main Content -->
    <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Welcome to Bourgon Industries</h2>
    
    <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
      Thank you for registering with Bourgon Industries. To complete your registration and verify your email address, please click the button below.
    </p>

    <!-- Verification Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="%LINK%" style="background-color: #dc2626; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;">
        Verify Email Address
      </a>
    </div>

    <!-- Alternative Link (for email clients that don't support buttons) -->
    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #2563eb; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 4px; margin-bottom: 30px;">
      %LINK%
    </p>

    <!-- Security Notice -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0; border-radius: 4px;">
      <p style="color: #92400e; font-size: 14px; margin: 0;">
        <strong>Security Notice:</strong> If you didn't request this email, you can safely ignore it. Your account will not be activated until you verify your email address.
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        Bourgon Industries
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
        Beyond Quality. Beyond Design.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin-top: 15px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>

  </div>
</body>
</html>
```

### Step 4: Template Variables

Firebase provides these variables you can use:
- `%LINK%` - The verification link (automatically replaced)
- `%EMAIL%` - User's email address
- `%DISPLAY_NAME%` - User's display name (if available)

### Step 5: Plain Text Version

Firebase also allows you to set a plain text version. Use:

```
Welcome to Bourgon Industries

Thank you for registering with Bourgon Industries. To complete your registration and verify your email address, please click the link below:

%LINK%

If the link doesn't work, copy and paste it into your browser.

Security Notice: If you didn't request this email, you can safely ignore it. Your account will not be activated until you verify your email address.

---
Bourgon Industries
Beyond Quality. Beyond Design.

This is an automated email. Please do not reply to this message.
```

## Removing Project Name from Footer

The "Your project-[number] team" text comes from Firebase's default template. When you customize the email body, replace the entire footer section with your own branding as shown in the template above.

## Sender Email Address

✅ **With custom domain verification, your sender address should now be from your custom domain!**

- **Before:** `noreply@bourgon-8ce17.firebaseapp.com` (project ID visible)
- **After:** `noreply@bourgon.in` or your custom domain (professional branding)

This happens automatically once custom domain verification is complete. Check your Firebase Console → Authentication → Settings to confirm your custom domain is being used.

## Additional Templates to Customize

While you're in the Templates section, consider customizing:

1. **Password reset** - For forgot password emails
2. **Email address change** - For email update confirmations
3. **Email change revocation** - For canceling email changes

## Testing

After customizing:
1. Save the template in Firebase Console
2. Trigger a test verification email from your app
3. Check that the email appears correctly in various email clients (Gmail, Outlook, Apple Mail, etc.)

## Important Notes

- ✅ **With custom domain verified, you can now edit email templates**
- Changes take effect immediately after saving
- The `%LINK%` variable must remain in the template (Firebase replaces it)
- HTML emails should be well-formed HTML
- Test your email template to ensure it displays correctly across email clients
- Your sender address will now use your custom domain instead of the project ID

## Quick Start Steps (With Custom Domain Verified)

1. ✅ **Go to Firebase Console** → Authentication → Templates
2. ✅ **Click "Email address verification"** template
3. ✅ **Edit the Subject Line**: "Verify your Bourgon Industries email address"
4. ✅ **Copy the HTML template** from Step 3 above and paste it in the email body
5. ✅ **Copy the plain text version** from Step 5 and paste it in the plain text field
6. ✅ **Save your changes**
7. ✅ **Test** by signing up a new user and checking the email

Your emails will now be fully branded with Bourgon Industries styling and your custom domain!

