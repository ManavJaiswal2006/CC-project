# Production Deployment Checklist

## 🔴 CRITICAL - Must Complete Before Launch

### Environment Variables
- [ ] Set all required environment variables in your hosting platform
- [ ] Verify `.env.local` is NOT committed to git (it's in `.gitignore` ✅)
- [ ] Test that all env vars are accessible
- [ ] Set `ADMIN_EMAILS` environment variable (see SECURITY_REVIEW.md)

### Security
- [ ] Fix admin email hardcoded issue (moved to env var ✅)
- [ ] Add file upload validation (added ✅)
- [ ] Verify all API routes are protected
- [ ] Test authentication/authorization flows
- [ ] Verify payment signature validation works
- [ ] Test rate limiting is working

### Payment Gateway
- [ ] Razorpay keys set in production environment
- [ ] Test payment flow end-to-end in production mode
- [ ] Verify payment webhook/verification works
- [ ] Test COD order flow
- [ ] Test failed payment scenarios

### Email Configuration
- [ ] Gmail app password set (not regular password)
- [ ] Test order confirmation emails
- [ ] Test order status update emails
- [ ] Test contact form emails
- [ ] Verify email delivery works

---

## 🟡 IMPORTANT - Should Complete

### Testing
- [ ] Test complete user flow: Signup → Browse → Add to Cart → Checkout → Payment → Order
- [ ] Test admin panel: Login → Manage Products → Manage Orders → Update Order Status
- [ ] Test promo code application
- [ ] Test wishlist functionality
- [ ] Test account/profile management
- [ ] Test error scenarios (invalid inputs, network failures, etc.)
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, or similar)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure Google Analytics (if using)
- [ ] Set up alerts for critical failures
- [ ] Monitor payment success/failure rates
- [ ] Monitor order creation rates

### Performance
- [ ] Run Lighthouse audit (aim for 90+ on all metrics)
- [ ] Test page load speeds
- [ ] Verify images are optimized
- [ ] Check bundle sizes
- [ ] Test with slow network connections

### Content
- [ ] Verify all product information is accurate
- [ ] Check all prices are correct
- [ ] Verify product images load correctly
- [ ] Test product descriptions display properly
- [ ] Check all links work correctly
- [ ] Verify contact information is correct

---

## 🟢 RECOMMENDED - Nice to Have

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify meta tags are set correctly
- [ ] Check robots.txt is correct
- [ ] Test Open Graph tags

### Legal/Compliance
- [ ] Privacy Policy page is complete
- [ ] Terms & Conditions page is complete
- [ ] Return/Refund policy is clear
- [ ] Shipping policy is documented
- [ ] GDPR compliance (if serving EU customers)

### Documentation
- [ ] Admin panel usage documented
- [ ] Order management process documented
- [ ] Troubleshooting guide created
- [ ] Contact information for support

### Backup & Recovery
- [ ] Document backup strategy
- [ ] Test recovery procedures
- [ ] Document rollback procedures
- [ ] Set up automated backups (if needed)

---

## 🚀 Deployment Steps

1. **Build & Test Locally**
   ```bash
   npm run build
   npm start
   # Test the production build locally
   ```

2. **Deploy to Production**
   - Push to production branch
   - Deploy to hosting platform (Vercel, Netlify, etc.)
   - Verify deployment succeeded

3. **Post-Deployment Verification**
   - [ ] Homepage loads correctly
   - [ ] All pages accessible
   - [ ] Authentication works
   - [ ] Payment integration works
   - [ ] Admin panel accessible
   - [ ] Emails are sending

4. **Monitor for 24-48 Hours**
   - Watch error logs
   - Monitor payment success rates
   - Check order creation
   - Verify email delivery

---

## 📊 Success Metrics to Track

- Order completion rate
- Payment success rate
- Page load times
- Error rates
- User signups
- Cart abandonment rate
- Admin actions (orders processed, products added)

---

## 🔧 Post-Launch Maintenance

### Daily
- Check error logs
- Monitor order queue
- Check email delivery

### Weekly
- Review analytics
- Check payment reports
- Review user feedback

### Monthly
- Update dependencies
- Review security patches
- Performance audit
- Backup verification

---

## ⚠️ Rollback Plan

If critical issues are found after launch:

1. **Immediate Actions:**
   - Disable new orders (if payment issues)
   - Revert to previous deployment
   - Notify users if needed

2. **Communication:**
   - Update status page
   - Notify affected users
   - Document issue and resolution

3. **Fix & Redeploy:**
   - Fix issues in development
   - Test thoroughly
   - Deploy fix
   - Monitor closely

---

## 📞 Support Contacts

Make sure you have:
- Hosting platform support contact
- Payment gateway support contact
- Email service support contact
- Developer contact (you!)

---

**Last Updated:** [Current Date]
**Status:** Pre-Launch Review

