# 🗄️ Database Schema

Database: **MongoDB** (Mongoose ODM). Each collection below corresponds to
one Mongoose model in `backend/models/`.

---

## 1. `users`
| Field      | Type     | Notes                                  |
|------------|----------|------------------------------------------|
| _id        | ObjectId | Primary key                              |
| name       | String   | required                                  |
| email      | String   | required, unique, lowercase               |
| password   | String   | required, bcrypt-hashed, `select:false`   |
| role       | String   | `student` \| `admin` (default: student)   |
| avatar     | String   | optional URL                              |
| college    | String   | optional                                  |
| branch     | String   | optional                                  |
| semester   | Number   | 1–8                                       |
| theme      | String   | `light` \| `dark`                         |
| isActive   | Boolean  | default true (admin can disable)          |
| createdAt / updatedAt | Date | timestamps                     |

## 2. `notes`
| Field           | Type     | Notes                          |
|------------------|----------|----------------------------------|
| _id              | ObjectId | Primary key                       |
| user             | ObjectId | ref → users                       |
| title            | String   | required                          |
| subject          | String   | default "General"                 |
| originalFileName | String   | required                          |
| filePath         | String   | required, server disk path        |
| extractedText    | String   | parsed PDF text                   |
| summary          | String   | AI-generated                      |
| keyPoints        | [String] | AI-generated bullet list          |
| createdAt / updatedAt | Date | timestamps                    |

## 3. `chats`
| Field     | Type     | Notes                                     |
|-----------|----------|---------------------------------------------|
| _id       | ObjectId | Primary key                                  |
| user      | ObjectId | ref → users                                  |
| title     | String   | derived from first message                   |
| messages  | [SubDoc] | `{ role: 'user'|'assistant', content, createdAt }` |
| createdAt / updatedAt | Date | timestamps                        |

## 4. `quizzes`
| Field       | Type     | Notes                                       |
|-------------|----------|------------------------------------------------|
| _id         | ObjectId | Primary key                                     |
| user        | ObjectId | ref → users                                     |
| note        | ObjectId | ref → notes (nullable)                          |
| topic       | String   | required                                         |
| difficulty  | String   | easy \| medium \| hard                          |
| questions   | [SubDoc] | `{ question, options[4], correctAnswer, explanation }` |
| lastScore   | Number   | percentage of last attempt                       |
| attempts    | Number   | attempt count                                     |
| createdAt / updatedAt | Date | timestamps                              |

## 5. `flashcarddecks`
| Field   | Type     | Notes                                |
|---------|----------|------------------------------------------|
| _id     | ObjectId | Primary key                               |
| user    | ObjectId | ref → users                               |
| note    | ObjectId | ref → notes (nullable)                    |
| title   | String   | required                                   |
| cards   | [SubDoc] | `{ front, back }`                          |
| createdAt / updatedAt | Date | timestamps                       |

## 6. `studytasks`
| Field       | Type     | Notes                                |
|-------------|----------|------------------------------------------|
| _id         | ObjectId | Primary key                               |
| user        | ObjectId | ref → users                               |
| subject     | String   | required                                   |
| task        | String   | required                                   |
| date        | Date     | required                                   |
| duration    | Number   | minutes, default 60                        |
| priority    | String   | low \| medium \| high                     |
| completed   | Boolean  | default false                              |
| aiGenerated | Boolean  | true if created by AI planner              |
| createdAt / updatedAt | Date | timestamps                       |

## 7. `attendances`
| Field   | Type     | Notes                          |
|---------|----------|----------------------------------|
| _id     | ObjectId | Primary key                       |
| user    | ObjectId | ref → users                       |
| subject | String   | required                          |
| date    | Date     | required, default now             |
| status  | String   | present \| absent                 |
| createdAt / updatedAt | Date | timestamps                |

## 8. `assignments`
| Field        | Type     | Notes                                       |
|--------------|----------|------------------------------------------------|
| _id          | ObjectId | Primary key                                     |
| user         | ObjectId | ref → users                                     |
| title        | String   | required                                         |
| subject      | String   | default "General"                                |
| description  | String   | optional                                         |
| dueDate      | Date     | required                                         |
| status       | String   | pending \| in-progress \| completed \| overdue  |
| createdAt / updatedAt | Date | timestamps                              |

---

## Indexes
- `users.email` — unique index
- `attendances { user, subject, date }` — compound index for fast summaries
- `studytasks { user, date }` — compound index for planner queries

## Relationships Summary
- One `User` → many `Note`, `Chat`, `Quiz`, `FlashcardDeck`, `StudyTask`, `Attendance`, `Assignment`
- One `Note` → many `Quiz` / `FlashcardDeck` (optional source reference)
