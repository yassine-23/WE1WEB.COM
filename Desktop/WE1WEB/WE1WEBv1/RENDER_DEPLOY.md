# 🚀 Deploy to Render - Manual Setup

Since the Blueprint detection isn't working, let's deploy manually (it's actually easier!):

## Option 1: Deploy as Web Service (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Web Service"**

3. **Connect your repository**:
   - Select: `yassine-23/WE1WEB.COM`
   - Branch: `main`

4. **Configure Build Settings**:
   - **Name**: `we1web` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (it's at root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:all`

5. **Choose Instance Type**:
   - Start with **Free** tier for testing
   - Upgrade later if needed

6. **Add Environment Variables** (click "Advanced"):
   ```
   NODE_ENV = production
   PORT = 10000
   VITE_SUPABASE_URL = https://stbuutuqlnauqwqovvgf.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnV1dHVxbG5hdXF3cW92dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNjg1ODAsImV4cCI6MjA3MDg0NDU4MH0.ENyGVOw9tT_Z56YTXZo_ANeZZL0FH2paFbnXwnUnQDc
   SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YnV1dHVxbG5hdXF3cW92dmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTI2ODU4MCwiZXhwIjoyMDcwODQ0NTgwfQ.FCnd5OwoWPTt0sCDJ0qIh5-HufsCG90gLjxWu_8c_6I
   FRONTEND_URL = https://your-app-name.onrender.com
   SIGNALING_PORT = 3001
   ```

7. **Click "Create Web Service"**

8. **Wait for Deployment** (5-10 minutes)

## Option 2: Use Static Site + Separate API

If the above doesn't work, deploy frontend and backend separately:

### Frontend (Static Site):
1. New → Static Site
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`

### Backend (Web Service):
1. New → Web Service
2. Start Command: `node server/index.js`
3. Add all environment variables

## 🔍 Troubleshooting

**Build fails with "npm not found":**
- Change Runtime to `Node` (not Docker)

**"Cannot find module" errors:**
- Make sure `package.json` is at root
- Check Build Command includes `npm install`

**Port errors:**
- Render uses port 10000 by default
- Make sure PORT env var is set to 10000

**WebSocket not connecting:**
- Free tier doesn't support WebSocket well
- Consider upgrading or using a separate service

## 🎯 After Deployment

Your app will be available at:
```
https://[your-service-name].onrender.com
```

Note: Free tier spins down after 15 minutes of inactivity and takes ~30 seconds to spin back up.

## 🚀 Alternative: Quick Deploy with Railway

If Render is giving issues, try Railway (often easier):

1. Go to: https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Deploy!

Railway gives you $5 free credit monthly and doesn't spin down like Render's free tier.

---

Your code is ready and on GitHub! The deployment is just a few clicks away! 🎉