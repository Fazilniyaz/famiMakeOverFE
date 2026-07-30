# FamiMakeOver Frontend

Next.js storefront + admin UI for FamiMakeOver.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (default in `.env.example`).

## Deploy on Vercel

This app is deployed as its **own** Vercel project (separate from the API).  
See [DEPLOY.md](./DEPLOY.md).
