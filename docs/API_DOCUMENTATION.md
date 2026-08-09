# 📡 API Documentation

Base URL (local): `http://localhost:5000/api`

All protected routes require a header:
```
Authorization: Bearer <JWT_TOKEN>
```

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
```
or on error:
```json
{ "success": false, "message": "Human readable error" }
```

---

## 🔑 Auth Routes — `/api/auth`

| Method | Endpoint       | Access  | Description                    |
|--------|----------------|---------|---------------------------------|
| POST   | `/register`   | Public  | Register a new student          |
| POST   | `/login`      | Public  | Login, returns JWT              |
| GET    | `/profile`    | Private | Get logged-in user's profile    |
| PUT    | `/profile`    | Private | Update profile / change password|

**Register body:** `{ name, email, password, college?, branch?, semester? }`
**Login body:** `{ email, password }`

---

## 💬 Chat Routes — `/api/chat`

| Method | Endpoint         | Description                              |
|--------|------------------|--------------------------------------------|
| GET    | `/`              | List all chat threads (history)            |
| GET    | `/:id`           | Get a single thread with full messages     |
| POST   | `/message`       | Send message `{ message, chatId? }`        |
| DELETE | `/:id`           | Delete a chat thread                       |

---

## 📄 Notes Routes — `/api/notes`

| Method | Endpoint            | Description                              |
|--------|---------------------|--------------------------------------------|
| POST   | `/upload`           | Upload PDF (`multipart/form-data`: file, title, subject) |
| GET    | `/`                 | List user's notes                          |
| GET    | `/:id`              | Get note detail (incl. summary)            |
| POST   | `/:id/summarize`    | Generate AI summary + key points           |
| GET    | `/:id/export`       | Download note/summary as PDF               |
| DELETE | `/:id`              | Delete a note                              |

---

## ❓ Quiz Routes — `/api/quiz`

| Method | Endpoint         | Description                                   |
|--------|------------------|-------------------------------------------------|
| POST   | `/generate`      | `{ noteId? , topic?, difficulty, count }`        |
| GET    | `/`              | List quizzes                                     |
| GET    | `/:id`           | Get quiz with questions                          |
| POST   | `/:id/submit`    | `{ answers: [...] }` → returns score + breakdown |
| DELETE | `/:id`           | Delete a quiz                                    |

---

## 🗂️ Flashcard Routes — `/api/flashcards`

| Method | Endpoint       | Description                                |
|--------|----------------|----------------------------------------------|
| POST   | `/generate`    | `{ noteId?, topic?, count }`                  |
| GET    | `/`            | List flashcard decks                          |
| GET    | `/:id`         | Get a deck's cards                            |
| DELETE | `/:id`         | Delete a deck                                 |

---

## 🗓️ Study Planner Routes — `/api/planner`

| Method | Endpoint         | Description                                       |
|--------|------------------|-----------------------------------------------------|
| POST   | `/`              | Create manual task                                  |
| GET    | `/?from&to`      | List tasks (optional date range filter)             |
| PUT    | `/:id`           | Update a task (e.g. mark completed)                 |
| DELETE | `/:id`           | Delete a task                                        |
| POST   | `/ai-generate`   | `{ subjects[], hoursPerDay, examDate? }` AI 7-day plan |

---

## ✅ Attendance Routes — `/api/attendance`

| Method | Endpoint       | Description                                 |
|--------|----------------|------------------------------------------------|
| POST   | `/`            | `{ subject, date, status }` mark attendance     |
| GET    | `/?subject`    | List records (optional subject filter)          |
| GET    | `/summary`     | Attendance % grouped by subject                 |
| DELETE | `/:id`         | Delete a record                                  |

---

## 📝 Assignment Routes — `/api/assignments`

| Method | Endpoint  | Description                                       |
|--------|-----------|------------------------------------------------------|
| POST   | `/`       | `{ title, subject, description, dueDate }`            |
| GET    | `/`       | List assignments (auto-flags overdue)                 |
| PUT    | `/:id`    | Update status/details                                  |
| DELETE | `/:id`    | Delete assignment                                       |

---

## 📊 Dashboard Route — `/api/dashboard`

| Method | Endpoint | Description                                          |
|--------|----------|---------------------------------------------------------|
| GET    | `/`      | Aggregated stats: counts, quiz avg, attendance, assignments, quiz trend |

---

## 🛡️ Admin Routes — `/api/admin` (role: admin only)

| Method | Endpoint              | Description                     |
|--------|-----------------------|-----------------------------------|
| GET    | `/users`              | List all students                 |
| PUT    | `/users/:id/status`   | Toggle active/disabled             |
| DELETE | `/users/:id`          | Delete a student account           |
| GET    | `/stats`              | Platform-wide statistics           |

---

## ⚠️ Error Codes

| Status | Meaning                                    |
|--------|----------------------------------------------|
| 400    | Validation error / bad request                |
| 401    | Not authenticated / invalid or expired token  |
| 403    | Forbidden (wrong role, deactivated account)   |
| 404    | Resource not found                             |
| 429    | Rate limit exceeded                            |
| 500    | Internal server error                          |
| 502    | AI provider returned an invalid response       |

## 🩺 Health Check
`GET /api/health` → `{ success: true, message: "...", time }`
