# 🔗 ER Diagram

Rendered with [Mermaid](https://mermaid.js.org/) — view on GitHub, GitLab, or
paste into https://mermaid.live to visualize.

```mermaid
erDiagram
    USER ||--o{ NOTE : uploads
    USER ||--o{ CHAT : starts
    USER ||--o{ QUIZ : generates
    USER ||--o{ FLASHCARD_DECK : generates
    USER ||--o{ STUDY_TASK : plans
    USER ||--o{ ATTENDANCE : records
    USER ||--o{ ASSIGNMENT : tracks
    NOTE ||--o{ QUIZ : "source for"
    NOTE ||--o{ FLASHCARD_DECK : "source for"
    CHAT ||--|{ MESSAGE : contains
    QUIZ ||--|{ QUESTION : contains
    FLASHCARD_DECK ||--|{ CARD : contains

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role
        string college
        string branch
        number semester
        boolean isActive
    }

    NOTE {
        ObjectId _id PK
        ObjectId user FK
        string title
        string subject
        string filePath
        string extractedText
        string summary
        array keyPoints
    }

    CHAT {
        ObjectId _id PK
        ObjectId user FK
        string title
    }

    MESSAGE {
        string role
        string content
        date createdAt
    }

    QUIZ {
        ObjectId _id PK
        ObjectId user FK
        ObjectId note FK
        string topic
        string difficulty
        number lastScore
        number attempts
    }

    QUESTION {
        string question
        array options
        string correctAnswer
        string explanation
    }

    FLASHCARD_DECK {
        ObjectId _id PK
        ObjectId user FK
        ObjectId note FK
        string title
    }

    CARD {
        string front
        string back
    }

    STUDY_TASK {
        ObjectId _id PK
        ObjectId user FK
        string subject
        string task
        date date
        number duration
        string priority
        boolean completed
        boolean aiGenerated
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId user FK
        string subject
        date date
        string status
    }

    ASSIGNMENT {
        ObjectId _id PK
        ObjectId user FK
        string title
        string subject
        date dueDate
        string status
    }
```

### Notes on the diagram
- `MESSAGE`, `QUESTION`, and `CARD` are **embedded sub-documents** in MongoDB
  (not separate collections), shown here as related entities purely for
  conceptual clarity.
- `NOTE → QUIZ` / `NOTE → FLASHCARD_DECK` relationships are optional — a quiz
  or deck can instead be generated from a free-text topic with no note.
