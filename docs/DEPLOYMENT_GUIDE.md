# ☁️ Deployment Guide

Recommended free/low-cost stack: **MongoDB Atlas** (database) + **Render or
Railway** (backend) + **Vercel or Netlify** (frontend).

---

## 1. Database — MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Add a database user (username/password)
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) for simplicity, or your host's static IPs
4. Copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ai_student_assistant`

## 2. Backend — Render (or Railway)
1. Push your `backend/` folder to a GitHub repository
2. On Render: **New → Web Service** → connect the repo
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend` (if monorepo)
4. Add environment variables (same as `.env.example`):
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `GEMINI_API_KEY`, `GEMINI_MODEL`,
     `CLIENT_URL` (set this to your deployed frontend URL), `NODE_ENV=production`
5. Deploy. Note the resulting backend URL, e.g. `https://ai-student-api.onrender.com`

## 3. Frontend — Vercel (or Netlify)
1. Push your `frontend/` folder to GitHub (same or separate repo)
2. On Vercel: **New Project** → import the repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (if monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL=https://ai-student-api.onrender.com/api`
5. Deploy. Note the resulting frontend URL, e.g. `https://ai-student-assistant.vercel.app`

## 4. Final wiring
Go back to your backend host's environment variables and set:
```
CLIENT_URL=https://ai-student-assistant.vercel.app
```
Redeploy the backend so CORS accepts requests from the live frontend.

## 5. Post-deployment checklist
- [ ] Register a test account on the live URL
- [ ] Confirm AI Chat, Summarizer, Quiz, and Flashcards all respond (Gemini key working in production)
- [ ] Confirm PDF upload + export works (check the host's persistent/ephemeral storage — see note below)
- [ ] Run `npm run seed:admin` against the production `MONGO_URI` (locally, pointing at Atlas) to create an admin account
- [ ] Set a strong, unique `JWT_SECRET` in production (never reuse the example)

### ⚠️ Note on file storage
Render/Railway free tiers use **ephemeral disks** — uploaded PDFs may be wiped
on redeploy/restart. For a production-grade deployment, swap
`middleware/uploadMiddleware.js` to store files in a persistent object store
such as **Cloudinary**, **AWS S3**, or **Firebase Storage**, and save the
returned URL in `Note.filePath` instead of a local path.

## 6. Docker (optional, self-hosting)
A minimal `Dockerfile` for the backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```
Build & run:
```bash
docker build -t ai-student-backend .
docker run -p 5000:5000 --env-file .env ai-student-backend
```
