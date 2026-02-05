# Post-Deployment Verification Checklist

Quick reference guide for verifying Railway deployment after pushing to GitHub.

## 🚀 Deployment Status

### 1. Monitor Railway Deployments

#### Backend Service (ERP_Backend)
```
Railway Dashboard → ERP_Backend → Deployments
```

**Watch for**:
- ✅ Build completes successfully
- ✅ `npm install` runs without errors
- ✅ TypeScript compilation succeeds
- ✅ Service starts and shows: `✅ Server is ready and accepting connections`

**Expected Logs**:
```
🔄 Testing database connection...
✅ Database connected successfully
🔄 Starting HTTP server on port 3000...
✅ Server is ready and accepting connections
🌐 API available at http://localhost:3000
🎯 Health check endpoint: http://localhost:3000/
🔐 CORS Configuration: { env: 'production', origin: [...] }
```

#### Frontend Service (ERP_Frontend)
```
Railway Dashboard → ERP_Frontend → Deployments
```

**Watch for**:
- ✅ Build completes successfully
- ✅ `npm run build` creates dist folder
- ✅ Service starts with `npx serve`

---

## 🔍 Quick Verification Tests

### Test 1: Backend Health Check (30 seconds)

```bash
curl https://bloomtecherp-production.up.railway.app/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-04T...",
  "environment": "production"
}
```

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 2: Frontend Access (1 minute)

1. Open browser to: https://erpbloom.com
2. Verify login page loads
3. Check browser console (F12) for errors
4. Verify no CORS errors in Network tab

**Expected**:
- ✅ Page loads without errors
- ✅ BloomTech ERP login form visible
- ✅ No console errors
- ✅ CSS/styling loads correctly

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 3: Database Connection (2 minutes)

#### Check Backend Logs:
```
Railway Dashboard → ERP_Backend → Deployments → View Logs
```

**Look for**:
```
✅ Database connected successfully
```

**Must NOT see**:
```
❌ Startup error: connection refused
❌ Missing required environment variables: DATABASE_URL
```

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 4: CORS & API Communication (3 minutes)

1. Go to https://erpbloom.com
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to log in (even with wrong credentials)
5. Check if API request to backend is made

**Expected**:
- ✅ Request to `https://bloomtecherp-production.up.railway.app/auth/login`
- ✅ No CORS errors
- ✅ Response received (even if error response)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test 5: SMTP Email Service (5 minutes)

⚠️ **Important**: This is the critical test for email functionality

#### Step-by-step:

1. **Log in to application**:
   - Go to https://erpbloom.com
   - Login as admin: admin@bloomtech.lk

2. **Create a test user**:
   - Navigate to Settings or User Management
   - Click "Add New User"
   - Enter:
     - Name: Test User
     - Email: your-working-email@gmail.com (use a real email you can check)
     - Role: Any role
   - Click "Create" or "Save"

3. **Check Backend Logs**:
   ```
   Railway → ERP_Backend → Logs
   ```
   
   **Look for**:
   ```
   ✅ Welcome email sent successfully to your-working-email@gmail.com
   ```
   
   **If you see this instead, email failed**:
   ```
   ❌ Error sending welcome email: [error details]
   ⚠️  SMTP credentials not configured
   ```

4. **Check Your Email**:
   - Check inbox of the email address you used
   - Check spam/junk folder (first email might go there)
   - Wait up to 2 minutes for delivery

5. **Verify Email Content**:
   - ✅ Subject: "Welcome to Bloomtech ERP - Your Account Details"
   - ✅ From: Bloomtech ERP <info@bloomaudit.com>
   - ✅ Contains temporary password
   - ✅ Login link points to: https://erpbloom.com/login
   - ✅ Link is clickable and works

6. **Test Login Link**:
   - Click the login button in the email
   - Should open: https://erpbloom.com/login
   - Try logging in with the credentials from the email
   - ✅ Should successfully log in

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

**Notes**:
_______________________________________
_______________________________________

---

## 🐛 Troubleshooting Quick Fixes

### Backend Won't Start

**Check**:
1. Railway → ERP_Backend → Variables
2. Verify all environment variables are set (especially DATABASE_URL)
3. Check logs for specific error message

**Quick Fix**:
- Redeploy: Railway Dashboard → ERP_Backend → Redeploy

---

### Frontend Shows Blank Page

**Check**:
1. Browser console (F12) for JavaScript errors
2. Network tab for failed API calls

**Quick Fix**:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify VITE_API_URL in Railway → ERP_Frontend → Variables

---

### CORS Errors

**Symptoms**: 
```
Access to XMLHttpRequest at 'https://bloomtecherp-production.up.railway.app'
from origin 'https://erpbloom.com' has been blocked by CORS policy
```

**Check**:
- Railway → ERP_Backend → Variables
- Verify: `FRONTEND_URL=https://erpbloom.com` (no trailing slash)

**Fix**:
1. Set FRONTEND_URL correctly
2. Redeploy backend service

---

### Email Not Sending

**Most Common Issues**:

1. **SMTP Credentials Not Set**:
   - Railway → ERP_Backend → Variables
   - Verify all SMTP_* variables are present
   - Verify SMTP_PASS is correct: `[Y5Qhci9}JDtg`

2. **Wrong SMTP_SECURE Setting**:
   - Must be: `SMTP_SECURE=false` (not true)
   - Port 587 requires STARTTLS, not SSL

3. **Wrong FRONTEND_URL**:
   - Verify: `FRONTEND_URL=https://erpbloom.com`
   - Email links will be wrong if this is incorrect

4. **Zoho Account Issue**:
   - Login to https://mail.zoho.com
   - Verify account is active
   - Check for security alerts

**Fix**:
1. Set all SMTP variables correctly
2. Redeploy backend
3. Test again

---

## 📊 Environment Variables Verification

### Backend (ERP_Backend)

Run through this checklist in Railway → ERP_Backend → Variables:

```
✅ DATABASE_URL = postgresql://postgres:woWbJYvBXhWwvcdtzIhvHgLVcqGmpeWO@trolley.proxy.rlwy.net:18297/railway
✅ NODE_ENV = production
✅ PORT = 3000
✅ FRONTEND_URL = https://erpbloom.com
✅ SMTP_HOST = smtp.zoho.com
✅ SMTP_PORT = 587
✅ SMTP_SECURE = false
✅ SMTP_USER = info@bloomaudit.com
✅ SMTP_PASS = [Y5Qhci9}JDtg
✅ SMTP_FROM = Bloomtech ERP <info@bloomaudit.com>
✅ JWT_SECRET = I]RAJQUX8a"#{^uH-iTrKi6RF<VLb>;
✅ JWT_REFRESH_SECRET = kExB4qBNrU!D/9Ar<qB(S)e.[KnJ&+N
```

### Frontend (ERP_Frontend)

```
✅ VITE_API_URL = https://bloomtecherp-production.up.railway.app
```

---

## 🎯 Success Criteria Summary

Your deployment is successful when ALL of these pass:

- [x] Backend builds and deploys without errors
- [x] Frontend builds and deploys without errors
- [x] Backend health endpoint responds with status 200
- [x] Frontend loads at https://erpbloom.com
- [x] Database connection successful (check logs)
- [x] Login page loads properly
- [x] No CORS errors in browser console
- [x] Can log in with admin credentials
- [x] Creating user sends welcome email
- [x] Email received with correct links
- [x] Email links work and point to https://erpbloom.com/login

---

## 📞 Support Resources

### Documentation
- [Railway Deployment Guide](./RAILWAY_DEPLOYMENT_GUIDE.md)
- [Email Testing Guide](./EMAIL_TESTING_GUIDE.md)

### Useful Commands

```bash
# View backend logs
railway logs -s ERP_Backend --tail

# View frontend logs  
railway logs -s ERP_Frontend --tail

# Test backend health
curl https://bloomtecherp-production.up.railway.app/health

# Connect to database
PGPASSWORD=woWbJYvBXhWwvcdtzIhvHgLVcqGmpeWO psql -h trolley.proxy.rlwy.net -U postgres -p 18297 -d railway
```

### Railway Dashboard URLs
- Backend: https://railway.app → ERP_Backend
- Frontend: https://railway.app → ERP_Frontend
- Database: https://railway.app → Postgres

---

## ✅ Verification Complete

Once all tests pass, your Bloomtech ERP is successfully deployed and ready for use!

**Deployment Date**: _______________________
**Verified By**: ___________________________
**All Tests Passed**: ⬜ Yes | ⬜ No
**Notes**: 
_________________________________________
_________________________________________

---

**Last Updated**: February 4, 2026
**Version**: 1.0.0
