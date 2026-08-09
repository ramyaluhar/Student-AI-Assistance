# 🎓 AI Powered Student Assistant using Generative AI

A full-stack MERN application that gives college students a single AI-powered
workspace for chatting with an assistant, summarizing notes, generating
quizzes and flashcards, planning study time, and tracking attendance and
assignments.

Built as a **GTU BE Semester 7 Mini Project**.

---

## 🧩 Tech Stack

| Layer          | Technology                                   |
|-----------------|-----------------------------------------------|
| Frontend        | React 18, Vite, Tailwind CSS, React Router    |
| Backend         | Node.js, Express.js                           |
| Database        | MongoDB + Mongoose                            |
| AI              | Google Gemini API (`@google/generative-ai`)   |
| Auth            | JWT (JSON Web Tokens) + bcrypt                |
| Charts          | Chart.js (via react-chartjs-2)                |
| File Upload     | Multer + pdf-parse                            |
| PDF Export      | PDFKit                                        |
| Notifications   | react-hot-toast                               |

---

## ✨ Features

1. **Student Login & Registration** — JWT-secured auth, bcrypt-hashed passwords
2. **AI Chat Assistant** — Gemini-powered conversational tutor with memory
3. **PDF Notes Upload** — drag-and-drop PDF upload with text extraction
4. **AI Notes Summarizer** — auto-generated summary + key points per note
5. **Quiz Generator** — MCQ quizzes generated from notes or any topic
6. **Flashcard Generator** — AI-built flip-card decks for quick revision
7. **Study Planner** — manual tasks + one-click AI weekly study plan
8. **Daily Progress Dashboard** — Chart.js visual summary of all activity
9. **Attendance Tracker** — subject-wise attendance % with low-attendance alerts
10. **Assignment Reminder** — deadline tracking with status workflow
11. **Dark / Light Mode** — persisted theme toggle across the app
12. **Responsive UI** — mobile-first layout, works on phones/tablets/desktop
13. **Admin Panel** — manage students, view platform-wide stats
14. **Student Profile** — edit personal & academic details
15. **Chat History** — every AI conversation is saved and revisitable
16. **Export Notes as PDF** — download summarized notes as a clean PDF
17. **Mobile Friendly** — off-canvas navigation, touch-friendly controls

---

## 📁 Project Structure

```
ai-student-assistant/
├── backend/
│   ├── config/          # DB connection, Gemini AI client
│   ├── controllers/     # Business logic for every feature
│   ├── middleware/      # auth, error handling, upload, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # token, PDF parsing/export, admin seeder
│   ├── uploads/          # uploaded PDF notes (gitignored)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/          # axios instance + one module per feature
│   │   ├── components/   # reusable UI building blocks
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/         # one file per route/screen
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    ├── ER_DIAGRAM.md
    ├── DEPLOYMENT_GUIDE.md
    ├── INSTALLATION_GUIDE.md
    ├── VIVA_QUESTIONS.md
    ├── PROJECT_ABSTRACT.md
    ├── PROJECT_REPORT_IEEE.md
    ├── FUTURE_SCOPE.md
    └── SCREENSHOTS.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js ≥ 18
- MongoDB (local install or MongoDB Atlas)
- A free Google Gemini API key from https://aistudio.google.com/app/apikey

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed:admin        # optional: creates a default admin account
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev                # starts on http://localhost:5173
```

### 4. Open the app
Visit **http://localhost:5173**, register a new student account, and start
exploring. See `docs/INSTALLATION_GUIDE.md` for full step-by-step setup and
`docs/DEPLOYMENT_GUIDE.md` for deploying to production.

---

## 🔐 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Never commit real `.env` files — they're already in `.gitignore`.

## ✅ Verified

This project has been runtime-tested end-to-end, not just structurally
reviewed:
- Backend booted as a real Express process and exercised via live HTTP
  requests (auth middleware, validation, error handling, all 10 route
  groups, CORS/security headers).
- Frontend built with `vite build` (0 errors) and every page verified to
  transform and serve correctly via a live Vite dev server.
- `npm audit`: **0 vulnerabilities** in the backend. The frontend has a
  handful of dependency-advisory findings in `react-router` and `vite`
  that are dev-server-only or apply to features this app doesn't use
  (SSR, React Server Components) — see `docs/VIVA_QUESTIONS.md` for the
  full explanation and reasoning behind not force-upgrading past tested
  versions.

## 📄 License
MIT — free to use for academic and learning purposes.
