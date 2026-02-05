# Email Service Testing Guide - Bloomtech ERP

This guide provides comprehensive testing procedures for the email service functionality in Bloomtech ERP, specifically focusing on the Zoho SMTP integration for Railway deployment.

## 📋 Table of Contents
- [Overview](#overview)
- [Email Service Architecture](#email-service-architecture)
- [Pre-Testing Checklist](#pre-testing-checklist)
- [Testing Procedures](#testing-procedures)
- [Troubleshooting](#troubleshooting)
- [Email Templates](#email-templates)

---

## Overview

Bloomtech ERP uses **Nodemailer** with **Zoho SMTP** to send transactional emails including:
- Welcome emails with temporary passwords
- Password reset notifications
- System notifications (future)

### Key Configuration Details

**SMTP Provider**: Zoho Mail
**Email Account**: info@bloomaudit.com
**Port**: 587 (STARTTLS)
**Security**: TLS (not SSL)

---

## Email Service Architecture

```
┌─────────────────┐
│   Backend API   │
│  (Railway)      │
└────────┬────────┘
         │ Nodemailer
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Zoho SMTP      │────→│  Recipient       │
│  smtp.zoho.com  │     │  User's Inbox    │
│  Port 587       │     └──────────────────┘
└─────────────────┘
         │
         └──── Email contains link to:
               https://erpbloom.com/login
```

### Email Service Functions

Located in: `backend/src/utils/emailService.ts`

1. **sendWelcomeEmail()** - Sent when new user is created
2. **sendPasswordResetEmail()** - Sent when admin resets user password
3. **sendTestEmail()** - For SMTP configuration testing

---

## Pre-Testing Checklist

Before testing email functionality, verify all prerequisites are met:

### ✅ Environment Variables (Railway Backend)

Verify these are set in Railway Dashboard → ERP_Backend → Variables:

```bash
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@bloomaudit.com
SMTP_PASS=[Y5Qhci9}JDtg
SMTP_FROM=Bloomtech ERP <info@bloomaudit.com>
FRONTEND_URL=https://erpbloom.com
```

### ✅ Zoho Account Verification

1. **Login to Zoho Mail**: https://mail.zoho.com
2. **Verify account**: info@bloomaudit.com is active
3. **Check SMTP settings**: Enabled for the account
4. **Two-Factor Authentication**: If enabled, use app-specific password

### ✅ Backend Deployment

1. Backend is deployed and running on Railway
2. Health check passes: `https://bloomtecherp-production.up.railway.app/health`
3. No errors in Railway logs related to SMTP

### ✅ Network & Firewall

1. Railway can reach smtp.zoho.com on port 587
2. No firewall blocking outbound SMTP connections
3. Zoho hasn't blocked Railway's IP addresses

---

## Testing Procedures

### Test 1: SMTP Connection Test

**Purpose**: Verify basic SMTP connectivity

#### Method 1: Using Backend Endpoint (if implemented)

```bash
# If test endpoint exists
curl -X POST https://bloomtecherp-production.up.railway.app/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

#### Method 2: Check Backend Logs

1. Go to Railway Dashboard → ERP_Backend → Deployments → Logs
2. Look for SMTP connection messages during startup
3. Should NOT see: `⚠️ SMTP credentials not configured`

#### Expected Result:
- ✅ No SMTP warnings in logs
- ✅ Nodemailer transporter created successfully

---

### Test 2: Welcome Email Test

**Purpose**: Test welcome email sent when creating new user

#### Steps:

1. **Log in as Admin**:
   - Go to https://erpbloom.com
   - Login with admin credentials

2. **Create a Test User**:
   - Navigate to User Management / Settings
   - Click "Add New User"
   - Fill in details:
     ```
     Name: Test User
     Email: your-test-email@example.com  (use your real email)
     Role: User (or any role)
     ```
   - Click "Create User"

3. **Check Backend Logs**:
   - Go to Railway → ERP_Backend → Logs
   - Look for: `✅ Welcome email sent successfully to your-test-email@example.com`
   - Or: `❌ Error sending welcome email: [error details]`

4. **Check Email Inbox**:
   - Check inbox of `your-test-email@example.com`
   - Check spam/junk folder if not in inbox
   - Email should arrive within 1-2 minutes

#### Expected Email Content:

**Subject**: "Welcome to Bloomtech ERP - Your Account Details"

**From**: Bloomtech ERP <info@bloomaudit.com>

**Body Contains**:
- Welcome message
- User's email address
- Temporary password (displayed in monospace font)
- Security warning to change password
- Login button linking to: `https://erpbloom.com/login`

#### Success Criteria:
- ✅ Email received in inbox
- ✅ Email is properly formatted (HTML template)
- ✅ Login link points to correct URL (https://erpbloom.com/login)
- ✅ Temporary password is visible and correct
- ✅ No broken images or formatting issues

#### Common Issues:

**❌ Email not received**:
- Check spam/junk folder
- Verify email address was entered correctly
- Check backend logs for SMTP errors
- Verify Zoho account is not locked or suspended

**❌ Wrong login URL**:
- Check `FRONTEND_URL` environment variable
- Should be: `https://erpbloom.com` (not localhost)

**❌ Email looks broken**:
- HTML rendering issue - check email client
- Try viewing in different email client (Gmail, Outlook, etc.)

---

### Test 3: Password Reset Email Test

**Purpose**: Test password reset email functionality

#### Steps:

1. **Log in as Admin**:
   - Go to https://erpbloom.com
   - Login with admin credentials

2. **Reset a User's Password**:
   - Navigate to User Management
   - Find the test user created earlier
   - Click "Reset Password" or similar option
   - Confirm the action

3. **Check Backend Logs**:
   - Look for: `✅ Password reset email sent successfully to [email]`

4. **Check Email Inbox**:
   - Should receive password reset email
   - Check spam folder if needed

#### Expected Email Content:

**Subject**: "Reset your BloomAudit password"

**From**: Bloomtech ERP <info@bloomaudit.com>

**Body Contains**:
- User's name
- New temporary password
- Warning to change password immediately
- Login link to: `https://erpbloom.com/login`

#### Success Criteria:
- ✅ Email received
- ✅ New password works for login
- ✅ Links point to correct domain
- ✅ Professional formatting

---

### Test 4: Email Link Functionality

**Purpose**: Verify all links in emails work correctly

#### Steps:

1. **Receive a welcome or reset email**
2. **Click the "Log In" button/link**
3. **Verify**:
   - Opens to: `https://erpbloom.com/login`
   - NOT localhost or incorrect domain
   - Page loads correctly
   - Can enter credentials

#### Success Criteria:
- ✅ Link opens correct URL
- ✅ HTTPS (secure connection)
- ✅ Login page loads properly
- ✅ Can successfully log in with provided credentials

---

### Test 5: Multiple Recipients Test

**Purpose**: Verify email service handles multiple sends

#### Steps:

1. **Create 3-5 test users in sequence**
2. **Monitor backend logs** for all email sends
3. **Verify all emails are delivered**

#### Success Criteria:
- ✅ All emails sent successfully
- ✅ No rate limiting issues
- ✅ No SMTP connection errors
- ✅ All delivered within reasonable time (< 5 minutes)

---

### Test 6: Error Handling Test

**Purpose**: Verify graceful error handling

#### Test Invalid Email Address:

1. **Try creating user with invalid email**: `invalid.email@`
2. **Expected**: Validation error before email send attempt

#### Test SMTP Failure Simulation:

To test error handling, temporarily change SMTP password in Railway:

1. **Change `SMTP_PASS` to wrong value**
2. **Try creating a user**
3. **Check logs for proper error handling**
4. **Expected**: 
   - ❌ Error logged with details
   - User creation may fail or succeed with warning
   - No app crash
5. **Restore correct SMTP_PASS**

#### Success Criteria:
- ✅ Errors logged clearly
- ✅ Application doesn't crash
- ✅ User-friendly error message shown
- ✅ Can recover after fixing issue

---

## Troubleshooting

### Problem: No Email Received

#### Diagnosis Steps:

1. **Check Backend Logs**:
```bash
# Look for these patterns:
✅ Welcome email sent successfully to [email]
❌ Error sending welcome email: [error]
⚠️ SMTP credentials not configured
```

2. **Verify Environment Variables**:
   - Railway Dashboard → ERP_Backend → Variables
   - Confirm all SMTP_* variables are set
   - Check for typos in variable names

3. **Test SMTP Connection Manually**:
```bash
# Use telnet or openssl to test
openssl s_client -starttls smtp -connect smtp.zoho.com:587
```

4. **Check Zoho Account**:
   - Login to mail.zoho.com
   - Verify account is active
   - Check sent folder for emails
   - Review any security alerts

5. **Check Email Deliverability**:
   - Spam folder
   - Email quarantine (corporate email systems)
   - Bounce messages in Zoho sent folder

#### Common Solutions:

**Issue**: `❌ Error: Invalid login`
- **Solution**: Verify SMTP_USER and SMTP_PASS are correct
- **Solution**: If 2FA enabled, use app-specific password

**Issue**: `❌ Connection timeout`
- **Solution**: Check Railway can reach smtp.zoho.com:587
- **Solution**: Verify SMTP_PORT=587 (not 465 or 25)

**Issue**: `⚠️ SMTP credentials not configured`
- **Solution**: Environment variables not set in Railway
- **Solution**: Restart backend service after setting variables

**Issue**: Email in spam folder
- **Solution**: Normal for first few emails
- **Solution**: Mark as "Not Spam" to train filter
- **Solution**: Consider SPF/DKIM records (advanced)

---

### Problem: Wrong Links in Email

#### Symptoms:
- Links point to localhost
- Links point to Railway URL instead of erpbloom.com
- 404 errors when clicking links

#### Solution:

1. **Check `FRONTEND_URL` environment variable**:
```bash
# Should be set to:
FRONTEND_URL=https://erpbloom.com
```

2. **Verify in Railway**:
   - Railway Dashboard → ERP_Backend → Variables
   - Look for FRONTEND_URL
   - Value should be exactly: `https://erpbloom.com`
   - No trailing slash

3. **Restart Backend**:
   - After changing FRONTEND_URL
   - Railway Dashboard → ERP_Backend → Redeploy

4. **Test Again**:
   - Create new test user
   - Check email links

---

### Problem: Email Formatting Broken

#### Symptoms:
- HTML not rendering
- Plain text only
- Missing styles

#### Possible Causes:

1. **Email Client Issues**:
   - Some clients strip HTML
   - Test in Gmail, Outlook, etc.

2. **Content Issues**:
   - Check `backend/src/utils/emailService.ts`
   - Verify HTML template is valid

3. **Email Size**:
   - Very rare, but some providers limit HTML email size

#### Solution:
- Email service provides both HTML and plain text versions
- Plain text should always work even if HTML fails
- Test in multiple email clients

---

### Problem: Rate Limiting

#### Symptoms:
- First few emails work, then fail
- Error: "Too many requests" or similar

#### Solution:

1. **Zoho Free Account Limits**:
   - Check if hitting Zoho sending limits
   - Free accounts may have daily limits

2. **Upgrade Zoho Plan**:
   - If sending many emails
   - Consider professional plan

3. **Implement Queuing**:
   - For bulk email sending
   - Add delay between sends (future enhancement)

---

## Email Templates

### Welcome Email Template

The welcome email includes:

**Features**:
- Professional header with gradient background
- Credential box with monospace password display
- Security warning section
- Call-to-action button
- Responsive design
- Plain text fallback

**Customization**:
Located in: `backend/src/utils/emailService.ts` → `sendWelcomeEmail()`

### Password Reset Email Template

**Features**:
- Similar professional design
- Password prominently displayed
- Security notice
- Links to login page

**Customization**:
Located in: `backend/src/utils/emailService.ts` → `sendPasswordResetEmail()`

---

## Best Practices

### For Production:

1. **Monitor Email Delivery**:
   - Check backend logs regularly
   - Set up alerts for email failures
   - Track delivery rates

2. **SPF/DKIM/DMARC** (Advanced):
   - Configure for erpbloom.com domain
   - Improves deliverability
   - Reduces spam classification

3. **Email Bounce Handling**:
   - Monitor bounced emails
   - Handle invalid email addresses
   - Consider bounce notification webhook

4. **Rate Limiting**:
   - Implement application-level rate limiting
   - Prevent abuse
   - Stay within Zoho limits

5. **Template Management**:
   - Keep templates updated
   - Test on multiple email clients
   - Maintain branding consistency

### Security Considerations:

1. **Never log passwords**: Current implementation is secure
2. **Use HTTPS links only**: ✅ Already configured
3. **Temporary passwords**: Expire after first use
4. **SMTP credentials**: Stored securely in Railway environment variables

---

## Testing Checklist

Use this checklist for comprehensive email testing:

### Initial Setup:
- [ ] All SMTP environment variables set in Railway
- [ ] Backend deployed and running
- [ ] No SMTP warnings in backend logs
- [ ] Zoho account accessible and active

### Welcome Email:
- [ ] Email received within 2 minutes
- [ ] Subject line correct
- [ ] From address: info@bloomaudit.com
- [ ] HTML formatting renders properly
- [ ] Temporary password visible
- [ ] Login link points to https://erpbloom.com/login
- [ ] Link works and opens login page
- [ ] Can login with provided credentials

### Password Reset Email:
- [ ] Email received within 2 minutes
- [ ] Subject line correct
- [ ] New password visible
- [ ] Security warning present
- [ ] Login link correct
- [ ] Can login with new password

### Error Handling:
- [ ] Invalid email addresses handled gracefully
- [ ] SMTP errors logged properly
- [ ] Application doesn't crash on email failure
- [ ] User receives appropriate feedback

### Performance:
- [ ] Multiple emails send successfully
- [ ] No rate limiting issues
- [ ] Delivery time < 5 minutes
- [ ] No connection timeouts

---

## Support Commands

### Check Backend Logs:
```bash
# Via Railway CLI
railway logs -s ERP_Backend --tail

# Or in Railway Dashboard
Dashboard → ERP_Backend → Deployments → View Logs
```

### Test SMTP Connection:
```bash
# Using openssl
openssl s_client -starttls smtp -connect smtp.zoho.com:587

# Expected: Connection successful, can send EHLO command
```

### Monitor Email Queue:
```bash
# Check backend for email-related logs
railway logs -s ERP_Backend | grep -i "email"
```

---

## Appendix

### Environment Variables Reference

```bash
# Required for email functionality
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@bloomaudit.com
SMTP_PASS=[Y5Qhci9}JDtg
SMTP_FROM=Bloomtech ERP <info@bloomaudit.com>
FRONTEND_URL=https://erpbloom.com
```

### Zoho SMTP Details

- **Host**: smtp.zoho.com
- **Port**: 587 (STARTTLS) or 465 (SSL)
- **Authentication**: Required
- **Encryption**: STARTTLS (TLS)
- **Daily Limit**: Varies by Zoho plan
- **Documentation**: https://www.zoho.com/mail/help/zoho-smtp.html

### Useful Links

- **Zoho Mail**: https://mail.zoho.com
- **Zoho SMTP Setup**: https://www.zoho.com/mail/help/zoho-smtp.html
- **Nodemailer Docs**: https://nodemailer.com
- **Email Testing Tools**: https://mailtrap.io, https://www.mail-tester.com

---

**Last Updated**: February 4, 2026
**Version**: 1.0.0
