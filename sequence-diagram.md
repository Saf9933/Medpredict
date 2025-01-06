```mermaid
sequenceDiagram
    participant Student as Medical Student
    participant Frontend
    participant Backend
    participant Inference

    %% MCQ Inference Flow
    Student->>Frontend: Click "Submit MCQ"
    Frontend->>Backend: POST /api/mcq { question, choices, user_answer, start_time }
    Backend-->>Backend: Session.create(), Question.create()
    Backend->>Inference: spawn api_mcq_inferrer.py(payload)
    Inference-->>Backend: { predicted, breakdown, confidence, time_taken, … }
    Backend-->>Backend: Response.create({ sessionId, questionId, … })
    Backend->>Frontend: JSON prediction result
    Frontend->>Student: Display MCQ result (bar chart, correct/incorrect)

    %% Flashcard Generation Flow
    Student->>Frontend: Enter term-definition pairs
    Frontend->>Backend: POST /api/flashcards { input }
    Backend-->>Frontend: JSON [{ term, definition }, …]
    Frontend->>Student: Render flashcard session UI

    %% Symptom Checker Flow (JS & Python)
    Student->>Frontend: Input symptoms list
    Frontend->>Backend: POST /api/symptoms (JS version)
    Backend-->>Frontend: JSON { predictions, … }
    alt If using Python version
        Frontend->>Backend: POST /api/symptoms-python { symptoms }
        Backend->>Inference: spawn symptom_api.py(payload)
        Inference-->>Backend: { predictions, precautions }
        Backend-->>Frontend: JSON { predictions, precautions }
    end
    Frontend->>Student: Display possible diagnoses

    %% Simulation & GPT Feedback Flow
    Student->>Frontend: Select a case
    Frontend->>Backend: GET /api/cases/:filename
    Backend-->>Frontend: JSON case steps
    Frontend->>Student: Render simulation UI
    Student->>Frontend: Step through simulation
    Student->>Frontend: Click "Finish" → gathers timeline, prompt
    Frontend->>Backend: POST /api/feedback { timeline, prompt }
    Backend->>Inference: axios POST to OpenRouter.ai
    Inference-->>Backend: { feedback }
    Backend-->>Frontend: JSON { feedback }
    Frontend->>Student: Display GPT feedback
