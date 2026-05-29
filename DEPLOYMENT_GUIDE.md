t nee Chatbot - Deployment Guide

This guide will walk you through deploying your RAG Chatbot to production using Render.com (backend) and Vercel (frontend).

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub repository with your code pushed
- ✅ Pinecone account with an index created
- ✅ Groq API key
- ✅ All environment variables documented

---

## 🚀 Part 1: Deploy Backend to Render.com

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (free tier)
3. Verify your email

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Ashlikiyer/rag_chatbot`
3. Configure the service:

   **Basic Settings:**
   - **Name:** `rag-chatbot-backend` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`

   **Instance Type:**
   - Select **Free** tier (512 MB RAM, shared CPU)

### Step 3: Add Environment Variables
In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
VECTOR_STORE=pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=rag-docs
```

**Important Notes:**
- Replace `your_groq_api_key_here` with your actual Groq API key
- Replace `your_pinecone_api_key_here` with your actual Pinecone API key
- Make sure `PINECONE_INDEX` matches your Pinecone index name

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://rag-chatbot-backend.onrender.com`
4. **Save this URL** - you'll need it for the frontend!

### Step 5: Test Backend
Test your backend endpoints:

```bash
# Test health check
curl https://your-backend-url.onrender.com/

# Test status
curl https://your-backend-url.onrender.com/status
```

**Note:** Free tier has cold starts (~30 seconds after 15 minutes of inactivity)

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account (free tier)

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `Ashlikiyer/rag_chatbot`
3. Configure the project:

   **Framework Preset:** Next.js (auto-detected)
   
   **Root Directory:** `frontend`
   
   **Build Settings:**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

### Step 3: Add Environment Variable
Add this environment variable:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**Replace** `your-backend-url.onrender.com` with your actual Render backend URL from Part 1, Step 4.

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (usually 1-3 minutes)
3. Once deployed, you'll get a URL like: `https://rag-chatbot.vercel.app`

### Step 5: Test Frontend
1. Visit your Vercel URL
2. Upload a PDF document
3. Ask questions about the document
4. Verify the full RAG pipeline works!

---

## 🔧 Part 3: Post-Deployment Configuration

### Update CORS (if needed)
If you encounter CORS errors, update `backend/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Then redeploy the backend on Render.

### Custom Domain (Optional)
**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Settings → Custom Domain
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 📊 Monitoring & Maintenance

### Render Dashboard
- View logs: Dashboard → Logs
- Monitor usage: Dashboard → Metrics
- Restart service: Dashboard → Manual Deploy → Clear build cache & deploy

### Vercel Dashboard
- View deployments: Project → Deployments
- Check analytics: Project → Analytics
- View logs: Deployment → Function Logs

### Cold Start Mitigation (Render Free Tier)
The free tier sleeps after 15 minutes of inactivity. Options:
1. **Accept it:** First request takes ~30 seconds
2. **Upgrade:** Paid tier ($7/month) has no cold starts
3. **Keep-alive service:** Use a cron job to ping every 10 minutes (not recommended for free tier)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `node index.js` works locally

**Problem:** 500 errors on upload
- Check Pinecone API key is valid
- Verify Pinecone index exists
- Check Render logs for specific error

**Problem:** CORS errors
- Add your Vercel URL to CORS whitelist
- Redeploy backend after changes

### Frontend Issues

**Problem:** Can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running (visit backend URL)
- Check browser console for errors

**Problem:** Build fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Test `npm run build` locally

### Pinecone Issues

**Problem:** "Index not found"
- Verify index name matches `PINECONE_INDEX` env var
- Check Pinecone dashboard that index exists
- Ensure API key has access to the index

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier Limits | Cost if Exceeded |
|---------|------------------|------------------|
| **Render** | 750 hours/month, 512MB RAM | $7/month for 512MB |
| **Vercel** | 100GB bandwidth, unlimited deployments | $20/month Pro |
| **Pinecone** | 100K vectors, 1 index | $70/month Starter |
| **Groq** | 14,400 requests/day | Free (no paid tier yet) |

**Total Free Tier:** $0/month for moderate usage

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test the full application end-to-end
2. ✅ Update your README.md with live demo links
3. ✅ Add screenshots to your repository
4. ✅ Share on LinkedIn/portfolio
5. ✅ Consider adding features from Phase 6 (optional)

---

## 📝 Environment Variables Checklist

### Backend (.env on Render)
```
✅ NODE_ENV=production
✅ PORT=3001
✅ GROQ_API_KEY=gsk_...
✅ VECTOR_STORE=pinecone
✅ PINECONE_API_KEY=pcsk_...
✅ PINECONE_INDEX=rag-docs
```

### Frontend (.env on Vercel)
```
✅ NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 🔗 Useful Links

- **Render Documentation:** https://render.com/docs
- **Vercel Documentation:** https://vercel.com/docs
- **Pinecone Documentation:** https://docs.pinecone.io
- **Groq Documentation:** https://console.groq.com/docs

---

**Last Updated:** May 29, 2026  
**Status:** Ready for Deployment