# 🔭 Future Scope

While the current system covers the core academic workflow end-to-end,
several enhancements would extend its value for a production or
next-iteration academic release:

1. **Voice-based AI interaction** — integrate speech-to-text and
   text-to-speech so students can talk to the assistant hands-free.
2. **Multi-language support** — regional language notes summarization and
   chat (e.g. Gujarati, Hindi) using Gemini's multilingual capabilities.
3. **Collaborative study rooms** — real-time shared notes, quizzes, and
   flashcards among a group of students using WebSockets.
4. **Plagiarism & citation checker** — for assignment submissions.
5. **OCR for handwritten notes** — extend PDF upload to accept scanned
   handwritten pages via an OCR pipeline.
6. **Push notifications** — browser/mobile push for assignment deadlines
   and low-attendance warnings instead of in-app only.
7. **Spaced-repetition scheduling** — apply the SM-2 algorithm to
   flashcards so review timing adapts to recall performance.
8. **LMS integrations** — sync assignments/attendance with Google
   Classroom or Moodle via their public APIs.
9. **Native mobile apps** — React Native wrapper reusing the existing
   REST API for offline-first mobile access.
10. **Analytics for faculty/admin** — cohort-level performance insights,
    at-risk student flagging based on attendance + quiz trends.
11. **Vector-based semantic search** — embed notes for RAG-style Q&A
    that cites exact note sections in chat answers.
12. **Subscription/quota management** — per-user Gemini API usage limits
    and billing tiers if scaled beyond a single institution.
