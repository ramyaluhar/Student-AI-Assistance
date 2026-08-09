# 🛠️ Installation Guide

Step-by-step setup for running the project locally.

## 1. Prerequisites
- **Node.js** v18 or higher — https://nodejs.org
- **MongoDB** — either:
  - Local install: https://www.mongodb.com/try/download/community, or
  - Free cloud cluster: https://www.mongodb.com/cloud/atlas
- **Google Gemini API key** (free tier available) — https://aistudio.google.com/app/apikey
- **Git** (optional, for cloning)

Verify Node & npm:
```bash
node -v
npm -v
```

## 2. Get the code
Extract the project zip (or clone the repo), then you should see:
```
ai-student-assistant/
├── backend/
├── frontend/
└── docs/
```

## 3. Backend setup
```bash
cd ai-student-assistant/backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
MONGO_URI=mongodb://127.0.0.1:27017/ai_student_assistant
JWT_SECRET=<any long random string>
GEMINI_API_KEY=<your Gemini API key>
CLIENT_URL=http://localhost:5173
```

Start MongoDB locally (if using local install):
```bash
mongod
```

(Optional) Seed a default admin account:
```bash
npm run seed:admin
# Creates: admin@studentassistant.com / Admin@123
```

Start the backend:
```bash
npm run dev
```
You should see: `🚀 Server running ... on port 5000` and `✅ MongoDB Connected`.

## 4. Frontend setup
Open a **new terminal**:
```bash
cd ai-student-assistant/frontend
npm install
cp .env.example .env
```

`.env` should contain:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
Visit **http://localhost:5173** in your browser.

## 5. First run
1. Click **Get Started** → register a new student account.
2. Try the **AI Chat Assistant** to confirm your Gemini API key works.
3. Upload a PDF in **Notes** and click **Summarize with AI**.
4. Explore Quiz Generator, Flashcards, Planner, Attendance, and Assignments.
5. Log in with the seeded admin account to view the **Admin Panel**.

## 6. Troubleshooting

| Problem                                | Fix                                                          |
|------------------------------------------|-----------------------------------------------------------------|
| `MongoDB Connection Error`               | Ensure `mongod` is running or your Atlas connection string/IP allowlist is correct |
| AI features return an error              | Double-check `GEMINI_API_KEY` in `backend/.env`                 |
| CORS error in browser console            | Make sure `CLIENT_URL` in backend `.env` matches your frontend URL |
| `413 Payload Too Large` on PDF upload    | Increase `MAX_FILE_SIZE_MB` in backend `.env`                   |
| Blank page on frontend                   | Check the browser console; confirm `VITE_API_URL` is correct    |
