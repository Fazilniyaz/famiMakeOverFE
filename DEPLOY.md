# Deploy FamiMakeOver Frontend on Vercel

Next.js app — deploy as a **separate** Vercel project from the API.

## 1. Create the project

From `FamiMakeOverFE`:

```bash
cd FamiMakeOverFE
vercel
```

Or: Dashboard → Add New Project → Root Directory = `FamiMakeOverFE`.  
Framework Preset: **Next.js** (auto-detected).

## 2. Environment variables

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.vercel.app/api` |

Set for **Production**, **Preview**, and **Development** as needed.  
Redeploy after any change to `NEXT_PUBLIC_*` vars.

## 3. Deploy

```bash
vercel --prod
```

## 4. Wire CORS on the API

In the **backend** Vercel project, set:

```env
CLIENT_ORIGINS=https://YOUR-FRONTEND.vercel.app
ALLOW_VERCEL_PREVIEWS=1
```

Redeploy the API after updating CORS.

## 5. Checklist

- [ ] Backend `/api/health` works
- [ ] Frontend loads products/services from API
- [ ] Email OTP login works
- [ ] Admin login + ImageKit upload works
- [ ] Custom domain (optional) added on both projects

## Local vs production

| | Local | Production |
|--|--------|------------|
| FE | `npm run dev` → `:3000` | Vercel Next.js |
| BE | `npm run dev` → `:5000` | Vercel serverless `api/index.js` |
| API URL | `http://localhost:5000/api` | `https://….vercel.app/api` |
