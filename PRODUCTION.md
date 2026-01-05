# DevgadHapus - Production Deployment Guide

## Security Checklist ✅

### Environment & Secrets
- [x] Firebase credentials in `.env.local` (gitignored)
- [x] Admin emails in `VITE_ADMIN_EMAILS` env var
- [x] No hardcoded secrets in codebase
- [x] `.env.example` as template only

### Firebase Configuration

#### Authentication
1. **Email/Password**: Already enabled
2. **Authorized Domains**: Add these in Firebase Console → Auth → Settings:
   - `localhost` (dev)
   - `127.0.0.1` (dev)
   - Your production domain (e.g., `mangodelivery.com`)

#### Realtime Database Rules
Deploy this in Firebase Console → Realtime Database → Rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "orders": {
      ".indexOn": ["createdAt", "status", "userId"],
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "users": {
      "$id": {
        ".read": "auth != null && auth.uid == root.child('users').child($id).child('uid').val()",
        ".write": "auth != null && auth.uid == root.child('users').child($id).child('uid').val()"
      }
    },
    
    "userRoles": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && (auth.uid == $uid || root.child('userRoles').child(auth.uid).child('admin').val() === true)"
      }
    }
  }
}
```

### Admin Setup
1. Create initial admin user in Firebase Auth (email/password)
2. Set `VITE_ADMIN_EMAILS` to that email in production env
3. Set their role in Firebase Console → Realtime Database:
   - Path: `userRoles/{userId}/admin` = `true`
4. Other admins can be promoted via Admin Panel (`/admin` → Users tab)

### Code Quality
- [x] Console logs minimized (dev-only with `import.meta.env.DEV`)
- [x] Error handling on all async operations
- [x] Input validation (phone, pincode, password)
- [x] Role-based access control (RequireAuth, RequireAdmin)
- [x] Suspended user blocking
- [x] Messages/communication system

## Deployment Steps

### Option 1: Vercel (Recommended for Next.js-like projects)
```bash
npm install -g vercel
vercel login
vercel
```
- Select project directory
- Vercel auto-detects Vite config
- Set env vars in Vercel dashboard: `VITE_FIREBASE_*` + `VITE_ADMIN_EMAILS`

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```
- Build: `npm run build`
- Publish: `dist`
- Add env vars in Netlify → Site Settings → Build & Deploy → Environment

### Option 3: Docker (Self-hosted)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Security Headers (for your hosting provider)

### Vercel `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    }
  ]
}
```

### Netlify `netlify.toml`:
```toml
[[headers]]
for = "/*"
[headers.values]
Strict-Transport-Security = "max-age=31536000; includeSubDomains"
X-Content-Type-Options = "nosniff"
X-Frame-Options = "DENY"
Referrer-Policy = "strict-origin-when-cross-origin"
Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

## Before Going Live

1. **Rotate Firebase Keys**:
   - If old keys were ever committed, regenerate in Firebase Console
   - Update `.env.local`

2. **Test Login/Register**:
   - Create test user with valid phone/pincode
   - Place test order
   - Verify order shows in Admin Panel
   - Send message as admin; verify user sees it

3. **Check Database Rules**:
   - Non-admins can't read other users' data
   - Users can only create their own orders
   - Only admins can approve/reject orders

4. **Verify Admin Access**:
   - Only `VITE_ADMIN_EMAILS` can access `/admin`
   - Suspended users blocked from all protected routes

5. **Test Responsiveness**:
   - Mobile, tablet, desktop layouts
   - Cart, checkout, orders flows

6. **Performance**:
   - Run: `npm run build` → check bundle size
   - Ensure images are optimized (WebP, lazy-loaded)

7. **Monitoring**:
   - Set up Firebase Console alerts
   - Monitor error logs
   - Track auth failures

## Maintenance

- **Weekly**: Check Firebase auth logs for suspicious activity
- **Monthly**: Review user feedback, update dependencies (`npm update`)
- **Quarterly**: Audit Firebase rules, rotate admin emails if needed

## Emergency

If Firebase keys are compromised:
1. Regenerate in Firebase Console immediately
2. Update env vars on all deployed environments
3. Monitor for unauthorized access in Firebase Console

---

**Production Status**: ✅ Ready to deploy
