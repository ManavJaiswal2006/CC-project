# Debug: Password Reset Email Not Receiving

## 🔍 Quick Checks

### 1. Check Email Configuration

Make sure these are set in your `.env.local`:

```env
EMAIL_SECURITY_USER=your-email@gmail.com
EMAIL_SECURITY_PASS=your-app-password
# OR
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important:** For Gmail, you need an **App Password**, not your regular password.

### 2. Check Server Logs

When you request a password reset, check your terminal/console for:

**Success:**
```
Password reset email sent successfully
```

**Error:**
```
Failed to send password reset email
CRITICAL: Email service not configured
```

### 3. Test Email Configuration

The code now throws errors if email is not configured. Check your server logs when requesting a reset.

## 🐛 Common Issues

### Issue: "Email service is not configured"

**Cause:** `EMAIL_SECURITY_USER` or `EMAIL_SECURITY_PASS` not set

**Fix:**
1. Add to `.env.local`:
   ```env
   EMAIL_SECURITY_USER=your-email@gmail.com
   EMAIL_SECURITY_PASS=your-16-char-app-password
   ```
2. Restart your dev server
3. Try again

### Issue: Gmail Authentication Error

**Cause:** Using regular password instead of App Password

**Fix:**
1. Go to Google Account → Security → 2-Step Verification
2. Generate App Password for "Mail"
3. Use the 16-character password (not your regular password)

### Issue: Email Sent But Not Received

**Check:**
1. **Spam folder** - Check spam/junk folder
2. **Email address** - Make sure you're checking the correct email
3. **Wait a few minutes** - Sometimes there's a delay
4. **Check server logs** - Verify email was actually sent

### Issue: No Error But No Email

**Possible causes:**
1. Email configuration missing (check logs)
2. Email sent but filtered by spam
3. Wrong email address entered

## 🔧 Debug Steps

1. **Check Environment Variables:**
   ```bash
   # In your terminal
   echo $EMAIL_SECURITY_USER
   echo $EMAIL_SECURITY_PASS
   ```

2. **Check Server Logs:**
   - Look for "Password reset email sent successfully"
   - Look for any error messages
   - Check for "CRITICAL: Email service not configured"

3. **Test Email Manually:**
   - Try sending a test email from your code
   - Or use the contact form to test if emails work

4. **Verify Email Address:**
   - Make sure the email exists in Firebase
   - Check you're using the correct email address

## 📝 What Was Fixed

1. **Better Error Handling** - Email function now throws errors instead of silently failing
2. **Detailed Logging** - More information in server logs
3. **Always Attempt Send** - Email is always attempted (even if user check fails)
4. **Configuration Check** - Clear error if email not configured

## ✅ Testing

1. Request password reset
2. Check server terminal for logs
3. Check email inbox (and spam)
4. If no email, check logs for error messages

The logs will now tell you exactly what's wrong!

