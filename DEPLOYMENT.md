# Frontend Deployment Guide

## Option 1: Vercel (Recommended for React)

### 1. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub/GitLab/Bitbucket

### 2. Deploy from GitHub
```bash
# Push your code to GitHub first
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 3. Connect Repository
- Click "New Project" in Vercel dashboard
- Import your GitHub repository
- Select the `frontend` folder as root directory

### 4. Configure Environment Variables
In Vercel project settings, add:
```
VITE_API_BASE=https://your-backend-api.vercel.app
```

### 5. Deploy
- Vercel will auto-deploy on every push
- Your frontend will be available at: `https://your-project.vercel.app`

## Option 2: Netlify

### 1. Create Netlify Account
- Go to https://netlify.com
- Sign up with GitHub

### 2. Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=frontend/dist
```

### 3. Set Environment Variables
In Netlify dashboard > Site settings > Environment variables:
```
VITE_API_BASE=https://your-backend-api.netlify.app
```

## Option 3: Manual Build & Deploy

### Build for Production
```bash
cd frontend
# Set API base for production
echo "VITE_API_BASE=https://your-backend-api.com" > .env.production
npm run build
```

### Deploy the `dist` folder to:
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Any static hosting service

## Testing Deployment

After deployment, test that:
1. Frontend loads correctly
2. API calls work (check browser network tab)
3. CORS is properly configured
4. Authentication flow works