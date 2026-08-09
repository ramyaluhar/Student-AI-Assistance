# AI Powered Student Assistant using Generative AI
### A Full-Stack Web Application Integrating Google Gemini for Automated Academic Support

**GTU BE Semester 7 — Mini Project Report**

*Prepared in IEEE two-column paper conventions (rendered here in linear
Markdown for portability; reflow into a two-column template such as the
official IEEE conference `.docx`/`.tex` template for final submission).*

---

## Abstract

Students routinely manage lecture notes, revision material, attendance, and
deadlines across disconnected tools, which fragments study time and adds
manual overhead to otherwise automatable tasks. This paper presents the
design and implementation of an **AI Powered Student Assistant**, a MERN
(MongoDB, Express.js, React, Node.js) web application that integrates
Google's Gemini generative AI model to automate note summarization, quiz
generation, flashcard creation, and study planning. The system further
provides attendance tracking, assignment reminders, and a visual progress
dashboard built with Chart.js, secured end-to-end with JWT authentication.
We describe the system architecture, database design, AI integration
strategy, and UI/UX implementation, and discuss the resulting platform's
practical utility, limitations, and future scope.

**Index Terms** — Generative AI, MERN Stack, Gemini API, Educational
Technology, JSON Web Tokens, MongoDB, React.js, Natural Language Processing

---

## I. Introduction

The proliferation of digital learning materials has not been matched by
tools that help students *process* that material efficiently. A typical
semester generates hundreds of pages of PDF notes, dozens of assignments,
and continuous attendance obligations — yet the tools students use to
manage these (PDF readers, spreadsheets, calendar apps, and messaging
groups) are not designed to work together. Meanwhile, general-purpose AI
chat assistants can answer questions but are not integrated with a
student's actual course material, attendance record, or deadlines.

This project addresses that gap by building a single, purpose-built web
platform where a student's notes, AI-assisted study material, and academic
tracking data live together. The core contribution is not the AI model
itself (we use Google's off-the-shelf Gemini API) but the **system design**
that turns a general-purpose LLM into domain-specific, structured academic
tooling — reliably converting free-form PDF text into JSON-structured
summaries, quizzes, and flashcards, and combining that with traditional
CRUD-based tracking features (attendance, assignments, planning) in one
cohesive, secure, responsive application.

### A. Objectives
1. Provide a secure, role-based (student/admin) authentication system.
2. Allow PDF note upload with automatic text extraction and AI
   summarization.
3. Automatically generate assessment material (MCQ quizzes, flashcards)
   from either uploaded notes or arbitrary topics.
4. Offer conversational AI assistance with persistent chat history.
5. Track attendance and assignment deadlines with clear visual warnings.
6. Aggregate all of the above into a single progress dashboard.
7. Deliver the system as a responsive, accessible, dark/light-mode-capable
   web application deployable to standard cloud hosting.

---

## II. Literature Survey / Related Work

Existing note-taking apps (e.g., Notion, Evernote) provide storage and
organization but no automated academic-content generation. Dedicated
flashcard tools (e.g., Anki, Quizlet) support spaced repetition but require
manual card creation or rely on shared community decks rather than a
student's own material. General LLM chat interfaces (ChatGPT, Gemini web
app) can summarize or quiz on pasted text, but lack persistence tied to a
student's course structure, attendance, or assignment tracking, and require
manual copy-pasting of content for every interaction.

The proposed system differentiates itself by **combining** generative AI
content transformation with structured academic record-keeping in a single
authenticated, per-student data model — every AI output (summary, quiz,
flashcard) is generated directly from a student's own uploaded material and
persisted alongside their attendance and planning data, rather than being a
disconnected, stateless AI interaction.

---

## III. System Architecture

The application follows a classic three-tier architecture:

1. **Presentation Tier** — a React 18 single-page application (Vite
   build tooling, Tailwind CSS styling) communicating with the backend
   exclusively over a versioned REST API.
2. **Application Tier** — a Node.js/Express server exposing the REST API,
   implementing authentication, validation, business logic (controllers),
   and orchestrating calls to the Gemini generative AI API.
3. **Data Tier** — MongoDB, accessed via Mongoose ODM, storing users and
   all feature data (notes, chats, quizzes, flashcards, study tasks,
   attendance, assignments) as per-user-scoped documents.

```
┌──────────────┐      HTTPS/JSON       ┌──────────────────┐      ┌───────────────┐
│   React SPA   │ ───────────────────▶ │  Express REST API │ ───▶ │   MongoDB      │
│ (Vite+Tailwind)│ ◀─────────────────── │  (Node.js)         │ ◀─── │  (Mongoose)    │
└──────────────┘                       └────────┬──────────┘      └───────────────┘
                                                  │
                                                  ▼
                                        ┌───────────────────┐
                                        │ Google Gemini API   │
                                        │ (Generative AI)      │
                                        └───────────────────┘
```

### A. Backend Layered Design
The Express server follows an MVC-inspired layering:
- **Routes** map HTTP verbs/URLs to controller functions.
- **Middleware** handles cross-cutting concerns: JWT verification
  (`authMiddleware`), centralized error translation (`errorMiddleware`),
  file upload handling (`uploadMiddleware`, via Multer), and request
  validation (`validateMiddleware`, via express-validator).
- **Controllers** contain all business logic, calling into Mongoose models
  and the Gemini AI wrapper.
- **Models** define Mongoose schemas with validation, hashing hooks
  (bcrypt for passwords), and indexes.

### B. AI Integration Layer
All Gemini calls are centralized in `config/gemini.js`, exposing a single
`generateText(prompt, systemInstruction)` helper. This isolation means (a)
prompt-engineering changes happen in one place, (b) swapping providers
(e.g., to an OpenAI-compatible endpoint) requires editing only this file,
and (c) errors from the AI provider are caught and normalized into the
application's standard error format rather than leaking provider-specific
exceptions to the client.

For structured outputs (quiz questions, flashcards, note summaries), the
prompt explicitly instructs Gemini to return **strict JSON** with a defined
schema. The response is stripped of markdown code fences and parsed;
parsing failures are handled gracefully (fallback to raw text for
summaries, or a clear `502` error for quizzes/flashcards prompting a retry)
rather than crashing the request.

### C. Authentication & Authorization
JWTs are issued on login/registration (`generateToken.js`), signed with a
server-side secret and a configurable expiry (default 7 days). The
`protect` middleware verifies the token on every protected route and
attaches the resolved user document (minus the password field) to
`req.user`. An `adminOnly` middleware further restricts admin routes.
Every data-access query in the controllers is scoped to `req.user._id`,
which is the primary mechanism preventing horizontal privilege escalation
(one student accessing another's data).

---

## IV. Database Design

MongoDB's document model was chosen over a relational schema because most
of the application's data is naturally hierarchical and read/written as a
unit — a quiz and its questions, a chat and its messages, a flashcard deck
and its cards. These are modeled as **embedded sub-documents** rather than
separate collections, avoiding join-equivalent `$lookup` operations on the
common read path.

Eight top-level collections are used: `users`, `notes`, `chats`, `quizzes`,
`flashcarddecks`, `studytasks`, `attendances`, and `assignments`. Each
feature collection (except `users`) carries a `user` reference field, and
`notes` are optionally referenced from `quizzes`/`flashcarddecks` when
generated from an uploaded document rather than a free-text topic. Full
field-level schema and an entity-relationship diagram are provided in
`DATABASE_SCHEMA.md` and `ER_DIAGRAM.md` respectively.

Compound indexes are defined on `{ user, subject, date }` for attendance
and `{ user, date }` for study tasks to keep the dashboard's aggregation
queries efficient as data grows.

---

## V. Methodology / Implementation Workflow

The AI-driven features follow a consistent four-step pipeline:

1. **Acquire source material** — either extracted PDF text (via
   `pdf-parse`) or a user-typed topic string.
2. **Prompt construction** — a feature-specific prompt template embeds the
   source material (truncated to a safe token budget) and explicit output
   instructions (JSON schema, question count, difficulty).
3. **Generation & parsing** — the prompt is sent to Gemini via the shared
   `generateText` helper; the response is cleaned and parsed as JSON.
4. **Persistence & response** — the parsed structure is saved to MongoDB
   (enabling future retrieval without re-calling the AI) and returned to
   the client.

This pipeline is implemented independently for the **Notes Summarizer**
(`noteController.summarizeNote`), **Quiz Generator**
(`quizController.generateQuiz`), **Flashcard Generator**
(`flashcardController.generateFlashcards`), and **AI Study Planner**
(`plannerController.generateAIPlan`), each with a tailored prompt and
schema while sharing the same underlying AI client and error-handling
approach — demonstrating the benefit of the centralized AI abstraction.

The **Chat Assistant** follows a slightly different, stateful pattern: it
uses Gemini's `startChat({ history })` API with the last ten messages of a
conversation thread converted into the expected `{ role, parts }` format,
giving the model short-term conversational memory without resending the
entire history on every turn indefinitely.

---

## VI. Frontend Design & User Experience

The frontend is a component-driven React 18 application built with Vite.
Global concerns are handled via two React Context providers:
`AuthContext` (session state, login/register/logout, profile updates) and
`ThemeContext` (dark/light mode, persisted to `localStorage`, applied via
Tailwind's `class`-strategy dark mode).

A shared `DashboardLayout` component composes a responsive `Sidebar`
(collapsing into an off-canvas drawer below the `lg` breakpoint) and a
`Navbar` (user menu, theme toggle) around every authenticated page,
ensuring visual and navigational consistency across all seventeen
features. Reusable primitives — `Loader`, `EmptyState`, `StatCard`,
`ProtectedRoute` — reduce duplication and keep individual feature pages
focused on their specific data flow.

All network calls are routed through a single Axios instance
(`api/axiosInstance.js`) with request interceptors attaching the JWT and
response interceptors centralizing error-toast display and 401-triggered
logout — meaning individual pages do not need repetitive try/catch
boilerplate for common failure cases.

Data visualization on the Daily Progress Dashboard uses **Chart.js** (via
`react-chartjs-2`) with three chart types chosen for their fit to the
underlying data: a line chart for quiz-score trend over time, a doughnut
chart for completed-vs-pending study tasks, and a bar chart for
subject-wise attendance percentages.

---

## VII. Security Considerations

- **Password storage:** bcrypt hashing (10 salt rounds) via a Mongoose
  pre-save hook; the password field is excluded from query results by
  default (`select: false`).
- **Transport-level headers:** `helmet` middleware sets secure HTTP
  response headers.
- **Rate limiting:** `express-rate-limit` caps each client to 300 requests
  per 15-minute window across all `/api` routes, protecting both the
  server and the Gemini API quota from abuse.
- **Input validation:** `express-validator` enforces email format and
  minimum password length at the API boundary, in addition to
  client-side validation for immediate user feedback.
- **Authorization scoping:** every controller query is filtered by
  `req.user._id`, and admin-only routes are additionally gated by role.
- **File upload restrictions:** Multer's file filter accepts only
  `application/pdf` MIME types, with a configurable maximum file size.

---

## VIII. Results

The completed system implements all seventeen specified features: secure
registration/login, an AI chat assistant with persisted history, PDF note
upload with AI summarization and PDF export, AI-generated MCQ quizzes with
scoring and explanations, AI-generated flashcard decks with an interactive
flip-card viewer, a manual and AI-assisted study planner, a subject-wise
attendance tracker with low-attendance warnings, an assignment reminder
system with status workflow, a Chart.js-powered progress dashboard, an
admin panel for platform oversight, a fully responsive mobile-friendly UI,
and dark/light theming throughout.

The layered backend architecture (isolated AI client, scoped controllers,
centralized error handling) proved effective for adding four independent
AI-powered features (summarizer, quiz generator, flashcard generator, AI
planner) with minimal code duplication, each requiring only a new prompt
template and Mongoose schema rather than new infrastructure.

---

## IX. Conclusion

This project demonstrates that a general-purpose generative AI API can be
transformed into reliable, structured academic tooling through careful
system design: consistent prompt-to-JSON pipelines, centralized error
handling for AI unpredictability, and per-user data scoping for security.
The resulting AI Powered Student Assistant consolidates note management,
AI-assisted revision material generation, study planning, and academic
tracking into a single secure, responsive web application, directly
addressing the fragmentation problem outlined in the introduction while
remaining straightforward to extend, as outlined in the Future Scope
document.

---

## References

[1] Google AI, "Gemini API Documentation," Google for Developers, 2025.
[Online]. Available: https://ai.google.dev/

[2] MongoDB Inc., "MongoDB Documentation," 2025. [Online]. Available:
https://www.mongodb.com/docs/

[3] Meta Platforms Inc. (React team), "React Documentation," 2025.
[Online]. Available: https://react.dev/

[4] OpenJS Foundation, "Express.js Guide," 2025. [Online]. Available:
https://expressjs.com/

[5] Tailwind Labs, "Tailwind CSS Documentation," 2025. [Online]. Available:
https://tailwindcss.com/docs

[6] Chart.js Contributors, "Chart.js Documentation," 2025. [Online].
Available: https://www.chartjs.org/docs/

[7] IETF, "RFC 7519: JSON Web Token (JWT)," 2015. [Online]. Available:
https://datatracker.ietf.org/doc/html/rfc7519

---

*End of Report — see companion documents `PROJECT_ABSTRACT.md`,
`DATABASE_SCHEMA.md`, `ER_DIAGRAM.md`, `API_DOCUMENTATION.md`,
`VIVA_QUESTIONS.md`, and `FUTURE_SCOPE.md` for supporting detail referenced
throughout this report.*
