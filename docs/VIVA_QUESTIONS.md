# 🎤 Viva Questions & Answers

## General / Project Overview

**Q1. What problem does this project solve?**
A: It consolidates scattered student workflows — note-taking, doubt-solving,
revision, planning, attendance, and deadlines — into a single AI-assisted
platform, reducing the time students spend switching between disconnected
tools and manually creating study material like quizzes or summaries.

**Q2. Why did you choose the MERN stack?**
A: MERN uses a single language (JavaScript/JSX) across the entire stack,
which speeds up development and reduces context-switching. MongoDB's
flexible document model suits our varied, nested data (e.g. quiz questions,
chat messages) better than a rigid relational schema. React's component
model is ideal for a highly interactive dashboard UI, and Express/Node
provide a lightweight, fast REST API layer.

**Q3. Why Gemini instead of OpenAI?**
A: Gemini offers a generous free tier suitable for an academic project,
strong JSON-following behavior needed for structured outputs (quizzes,
flashcards), and a straightforward Node.js SDK (`@google/generative-ai`).
The AI layer (`config/gemini.js`) is abstracted, so swapping to an
OpenAI-compatible API only requires changing that one file.

## Authentication & Security

**Q4. How is authentication implemented?**
A: JWT-based. On login/register, the server signs a token containing the
user's ID using `JWT_SECRET`. The frontend stores it in `localStorage` and
sends it as a `Bearer` token on every request. The `protect` middleware
verifies the token and attaches the user to `req.user` before allowing
access to protected routes.

**Q5. How are passwords secured?**
A: Passwords are hashed with `bcryptjs` (salt rounds = 10) in a Mongoose
`pre('save')` hook before being stored. The raw password is never persisted,
and the `password` field has `select: false` so it's excluded from queries
by default.

**Q6. How do you prevent unauthorized access to another student's data?**
A: Every query in the controllers is scoped with `{ user: req.user._id }`,
so a user can only ever read/update/delete documents they own. Admin-only
routes are additionally gated by the `adminOnly` middleware, which checks
`req.user.role === 'admin'`.

**Q7. What other security measures are in place?**
A: `helmet` for secure HTTP headers, `express-rate-limit` to throttle abuse
(300 requests / 15 min per client), `express-validator` for input
validation, CORS restricted to the configured `CLIENT_URL`, and Multer's
file-type filter restricting uploads to PDFs only.

## AI Integration

**Q8. How does the Notes Summarizer work end-to-end?**
A: 1) User uploads a PDF via Multer. 2) `pdf-parse` extracts raw text on the
server and stores it in the `Note` document. 3) On "Summarize", the backend
sends that text (truncated to ~15,000 chars) to Gemini with a prompt asking
for strict JSON output (`summary`, `keyPoints`). 4) The response is parsed
and saved back to the note; the frontend then renders it.

**Q9. How do you handle unpredictable AI output (e.g. invalid JSON)?**
A: Every AI-JSON call strips markdown code fences and attempts
`JSON.parse`. If parsing fails, the summarizer falls back to storing the
raw text as the summary, while quiz/flashcard generation returns a clear
502 error asking the user to retry, rather than crashing or saving corrupt
data.

**Q10. How does the AI Quiz Generator ensure valid MCQs?**
A: The prompt explicitly requests exactly 4 options per question and a
`correctAnswer` that must match one option, all in strict JSON array form.
The Mongoose `Quiz` schema also validates that each question has exactly 4
options as a safety net.

**Q11. How is chat context/history maintained?**
A: Each `Chat` document stores an ordered array of `{ role, content }`
messages. When sending a new message, the last 10 messages are converted
into Gemini's `startChat({ history })` format so the model has short-term
conversational memory, then the new AI reply is appended and the document
is saved.

## Database Design

**Q12. Why did you embed sub-documents (e.g. quiz questions) instead of
separate collections?**
A: Questions, flashcards, and chat messages are always read/written
together with their parent (a quiz is meaningless without its questions).
Embedding avoids extra joins/populates for the common read path and keeps
document size well within MongoDB's 16MB limit for this use case.

**Q13. How do you calculate attendance percentage efficiently?**
A: Via a MongoDB aggregation pipeline (`$group` by subject, `$sum` present
count, then `$project` a computed percentage) rather than pulling all
records into Node.js and calculating client-side — this scales better and
reduces data transferred.

## Frontend

**Q14. How is dark mode implemented?**
A: Tailwind's `darkMode: 'class'` strategy. `ThemeContext` toggles a `dark`
class on `<html>` and persists the choice to `localStorage`. Every styled
element uses Tailwind's `dark:` variant classes.

**Q15. How do you handle loading and error states?**
A: `Loader` component for in-flight requests, `react-hot-toast` for
success/error notifications, and a global Axios response interceptor that
automatically shows an error toast and handles 401s (session expiry) app-wide, so individual components don't need repetitive try/catch UI logic.

**Q16. Is the UI responsive?**
A: Yes — the sidebar collapses into an off-canvas drawer below the `lg`
breakpoint, grids reflow from multi-column to single-column, and all
interactive elements are sized for touch. Tested against mobile, tablet, and
desktop viewport widths.

## Testing / Validation

**Q17. How is user input validated?**
A: `express-validator` on the backend (e.g. email format, password length)
returns a 400 with a clear message on failure; the frontend performs
matching client-side validation before submission for immediate feedback.

**Q18. What happens if the Gemini API is down or the key is invalid?**
A: `config/gemini.js` wraps every call in a try/catch and throws a clean
`Error('AI generation failed...')`, which the global `errorHandler`
middleware converts into a proper JSON error response instead of crashing
the server.

## Architecture

**Q19. Explain the backend's folder structure.**
A: MVC-inspired: `models/` (Mongoose schemas), `controllers/` (business
logic), `routes/` (URL → controller mapping), `middleware/` (auth,
validation, error handling, uploads), `config/` (DB + AI client setup), and
`utils/` (helpers like token signing and PDF parsing/export).

**Q20. How would you scale this application?**
A: Move file uploads to cloud object storage (S3/Cloudinary), add Redis
caching for dashboard aggregations, horizontally scale the Node backend
behind a load balancer, and consider a message queue for long-running AI
calls to avoid blocking request threads.

## Runtime Verification & Dependency Management

**Q21. How was this project actually tested, beyond just writing the code?**
A: The backend was booted as a real Express process (with only the MongoDB
connection call stubbed, since no live database was available in the build
environment) and exercised with genuine HTTP requests: health check, 404
handling, JWT rejection paths, express-validator rules, and all ten route
groups. The frontend was verified with a real `vite build` (catching any
JSX/import errors a static read-through would miss) and a live Vite dev
server was used to confirm all fifteen pages — including dynamic routes
like `/chat/:id` and `/quiz/:id` — resolve correctly.

**Q22. Did this testing find any real bugs?**
A: Yes — one. The `protect` auth middleware originally wrapped both JWT
verification and the database user lookup in a single `try/catch`, so a
MongoDB connectivity issue was being mislabeled as `"token failed or
expired"` (a 401), when the actual problem was a database timeout (which
should surface as a 500). This was caught by deliberately testing the
middleware against an unreachable database and observing the response.
The fix separates the two failure modes so each produces an accurate error.

**Q23. `npm audit` shows vulnerabilities in the frontend — why weren't they
all force-fixed?**
A: `npm audit fix --force` was tried. It resolved the originally-flagged
react-router CVEs but pulled in react-router-dom v7, which turned out to
be affected by a *different*, newer high-severity advisory
(`GHSA-qwww-vcr4-c8h2`, a CSRF bypass specific to React Server Components
"RSC mode"). This app is a plain client-side SPA using `<BrowserRouter>` —
it doesn't use RSC mode at all, so that CVE doesn't apply to it, while the
v7 upgrade itself was an untested major-version bump with real breaking-
change risk. The remaining Vite advisories (path traversal, NTLM hash
disclosure) are specifically about the *development server*
(`vite dev`), not the production build output served by `vite build`.
Given all of this, the responsible choice was to stay on the fully
tested, verified versions (react-router-dom 6.30.4, Vite 5.4.x) rather
than force an upgrade whose new attack surface hadn't been evaluated —
this is itself a demonstrable engineering judgment call, not an oversight.

**Q24. What would you do differently for a real production deployment?**
A: Move file storage to a persistent object store (see
`DEPLOYMENT_GUIDE.md`), set up CI to run `npm audit`, `eslint`, and
`vite build` on every commit, and periodically evaluate major dependency
upgrades (like React Router v7/v8) in a dedicated branch with full
regression testing before adopting them — rather than either ignoring
`npm audit` forever or blindly force-upgrading whenever it complains.
