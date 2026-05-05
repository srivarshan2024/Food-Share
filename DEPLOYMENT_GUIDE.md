# FoodShare - Deployment Guide

## Backend Deployment (Render)

Your backend is already deployed at: **https://smartfood-backend-q8ou.onrender.com**

### Current Render Configuration

**Important:** To fix CORS issues, you need to update the `CORS_ORIGIN` environment variable on Render.

#### Steps to Update CORS on Render:

1. Go to [Render Dashboard](https://render.com)
2. Click on your service: **smartfood-backend**
3. Go to **Environment** tab
4. Find or add the `CORS_ORIGIN` variable
5. Update it with your frontend URL:

```
http://localhost:5173,http://localhost:3000,http://localhost:5174,<YOUR_FRONTEND_URL>
```

Replace `<YOUR_FRONTEND_URL>` with your actual frontend deployment URL (e.g., from Vercel, Netlify, etc.)

**Example for Vercel deployment:**
```
http://localhost:5173,http://localhost:3000,http://localhost:5174,https://foodshare.vercel.app
```

6. Click **Save Changes** and Render will redeploy automatically

---

## Frontend Deployment (Vercel / Netlify)

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

4. **Add Environment Variable:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://smartfood-backend-q8ou.onrender.com/api
     ```

---

## Important Notes

✅ **Backend is running:** https://smartfood-backend-q8ou.onrender.com
- Database: PostgreSQL on Render
- API: Working and ready

⚠️ **CORS Configuration needed:**
- Add your frontend URL to Render's CORS_ORIGIN environment variable
- Current value: `http://localhost:5173,http://localhost:3000,http://localhost:5174`
- Add your production frontend URL

### Testing Locally

While working locally, use:
- Frontend: `http://localhost:5174` (or your dev port)
- Backend: `https://smartfood-backend-q8ou.onrender.com/api`

### Production Checklist

- [ ] Update `CORS_ORIGIN` on Render with your frontend URL
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update frontend `.env` with production backend URL
- [ ] Test login/registration
- [ ] Test food posting and claiming
- [ ] Verify email notifications (if configured)
- [ ] Monitor Render logs for any errors

---

## Troubleshooting

### CORS Error
**Error:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution:** Add your frontend URL to `CORS_ORIGIN` on Render environment variables

### Backend Connection Failed
**Error:** "net::ERR_FAILED" when calling API

**Solution:** 
1. Check Render service status
2. Verify `CORS_ORIGIN` includes your frontend URL
3. Check network connectivity

### Database Connection Error
**Error:** "Connection failed against database server"

**Solution:**
1. Verify PostgreSQL is running on Render
2. Check `DATABASE_URL` environment variable
3. Check database credentials

---

## Environment Variables Reference

### Backend (Render)

```
DATABASE_URL=postgresql://...
DATABASE_DIRECT_URL=postgresql://...
PORT=5000
NODE_ENV=production
JWT_SECRET=<strong-random-key>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,<your-frontend-url>
```

### Frontend (Vercel/Netlify)

```
VITE_API_URL=https://smartfood-backend-q8ou.onrender.com/api
```

---

## Quick Links

- 🔗 Backend: https://smartfood-backend-q8ou.onrender.com
- 📊 Render Dashboard: https://render.com/dashboard
- 🚀 Vercel Dashboard: https://vercel.com/dashboard
- 📝 GitHub: https://github.com/srivarshan2024/Food-Share
