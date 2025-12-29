# Quick Fix: Password Reset "Page Not Found" Issue

## The Problem

When you click the password reset link in the email, you get "Page Not Found" because:

1. **The email link points to production URL** (`https://bourgon.in`) but you're testing locally
2. **OR** the route isn't being recognized by Next.js

## Solution 1: Set Local URL for Development

Add this to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:
1. **Restart your Next.js dev server** (important!)
2. Request a new password reset
3. The email will now contain a link to `http://localhost:3000/reset-password?token=...`

## Solution 2: Test the Route Directly

1. Start your dev server: `npm run dev`
2. Open browser and go to: `http://localhost:3000/reset-password?token=test123`
3. You should see the reset password form (it will show an error about invalid token, but the page should load)

If the page loads, the route is working! The issue is just the URL in the email.

## Solution 3: Manual Testing

If you want to test without email:

1. Request password reset (this creates a token in database)
2. Check your Convex dashboard or logs to get the token
3. Manually navigate to: `http://localhost:3000/reset-password?token=YOUR_TOKEN_HERE`

## Verify Route is Working

Run this command to check if Next.js recognizes the route:

```bash
# In your project directory
npm run dev
```

Then visit: `http://localhost:3000/reset-password`

You should see the reset password page (even without a token, it will show an error but the page should load).

## Still Not Working?

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check if the file exists:**
   - File should be at: `app/reset-password/page.tsx`
   - Make sure it's named exactly `page.tsx` (lowercase)

3. **Restart dev server** after any changes

4. **Check browser console** for any JavaScript errors

## For Production

When deploying to production:
- Set `NEXT_PUBLIC_SITE_URL=https://bourgon.in` (or your actual domain)
- Make sure the route is deployed
- The email links will work correctly

