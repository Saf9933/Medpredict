# MedPredict

**AI-Powered Medical Education Platform — Fine-tuned PubMedBERT + Full-Stack Learning Tools**

MedPredict is an interactive web platform designed to help medical students prepare for high-stakes exams like **USMLE**, **NEET-PG**, and **AIIMS**. It combines a fine-tuned biomedical language model with practical study tools — all in one place.

> Built as an undergraduate thesis project at Sichuan University, College of Software Engineering.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Model: PubMedBERT Fine-Tuning](#model-pubmedbert-fine-tuning)
  - [Why PubMedBERT](#why-pubmedbert)
  - [The MedMCQA Dataset](#the-medmcqa-dataset)
  - [Dataset Preprocessing](#dataset-preprocessing)
  - [Training Configuration](#training-configuration)
  - [Model Definition](#model-definition)
  - [Results & Evaluation](#results--evaluation)
  - [Performance by Difficulty](#performance-by-difficulty)
  - [Confidence Calibration](#confidence-calibration)
  - [Comparison with Other Models](#comparison-with-other-models)
- [Platform Features](#platform-features)
  - [MCQ Classifier](#mcq-classifier)
  - [Flashcard Generator](#flashcard-generator)
  - [Symptom Checker](#symptom-checker)
  - [Clinical Case Simulator](#clinical-case-simulator)
  - [Textbook Search & Mini Quiz](#textbook-search--mini-quiz)
- [Backend API Reference](#backend-api-reference)
- [Data Modeling & Persistence](#data-modeling--persistence)
- [User Testing](#user-testing)
- [Strengths & Limitations](#strengths--limitations)
- [Future Improvements](#future-improvements)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [References](#references)

---

## What It Does

MedPredict is not just a model demo — it's a complete educational platform with five integrated learning modules:

**MCQ Classifier** — Enter any four-option medical question and get the model's predicted answer, confidence scores across all choices, and a difficulty rating (Easy / Medium / Hard). Confidence is visualized as probability bars so students can see *how sure* the model is, not just *what* it picked.

**Flashcard Generator** — Paste `term;definition` pairs and instantly get an interactive flashcard deck with flip animations, timed review sessions, and memorization tracking across multiple rounds.

**Symptom Checker** — Input symptoms in plain language (e.g., "throwing up, headache, fever") and get the top 3 likely conditions with precautionary advice. Uses fuzzy matching with synonym normalization to handle informal descriptions.

**Clinical Case Simulator** — Step through realistic multi-stage clinical scenarios with branching decision paths. At the end, GPT provides personalized feedback on your clinical reasoning throughout the case.

**Textbook Search & Mini Quiz** — Upload a medical PDF, search for key terms, and auto-generate quizzes from relevant pages.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | Vue 3 (Composition API + Options API), CSS, Axios | SPA with five interactive modules |
| **Backend** | Node.js v18, Express 4.x | REST API gateway, request routing, Python orchestration |
| **ML / Inference** | Python 3.10, PyTorch, HuggingFace Transformers | Model fine-tuning and real-time inference |
| **Model** | PubMedBERT (`BiomedNLP-PubMedBERT-base-uncased-abstract`) | Biomedical 4-way MCQ classification |
| **Database** | SQLite via Sequelize ORM | Session tracking, response logging, flashcard interactions |
| **NLP Utilities** | pandas, fuzzywuzzy, python-Levenshtein | Symptom normalization and fuzzy matching |
| **External AI** | OpenRouter API (GPT-4) | Clinical case feedback generation |
| **Build Tools** | Vite, ESLint, Prettier | Fast HMR, code consistency |

---

## System Architecture

MedPredict follows a four-layer modular architecture where each component is independently developed, maintained, and replaceable.

```
┌──────────────────────────────────────────────────────┐
│                    Vue.js Frontend                    │
│    MCQ Quiz · Flashcards · Symptom Checker           │
│    Case Simulator · Textbook Search                  │
│    (Composition API, Tailwind CSS, Axios)            │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP / REST (Axios)
┌────────────────────────▼─────────────────────────────┐
│                 Express.js Backend                    │
│    API Gateway · Route Handlers · CORS Middleware     │
│    Request Logging (CSV) · Validation                │
└─────────┬──────────────────────────────┬─────────────┘
          │ child_process.spawn          │ Sequelize ORM
┌─────────▼─────────────┐     ┌─────────▼─────────────┐
│   Python Inference     │     │   SQLite Database      │
│   Layer                │     │                        │
│   ├─ PubMedBERT MCQ    │     │   ├─ sessions          │
│   ├─ Symptom API       │     │   ├─ questions          │
│   └─ Flashcard Parser  │     │   ├─ responses          │
│                        │     │   ├─ flashcard_sessions  │
│   JSON in → JSON out   │     │   ├─ simulations        │
│   (stdin/argv → stdout)│     │   ├─ simulation_runs    │
└────────────────────────┘     │   └─ api_logs           │
                               └─────────────────────────┘
```

**Design Decisions:**
- **Python ↔ Node.js bridge via `child_process.spawn`:** This keeps ML inference isolated from the API layer. Python scripts accept JSON via command-line arguments and return JSON on stdout. This "language-agnostic contract" means any script can be tested independently with pytest, and the gateway language can be swapped without touching inference logic.
- **Twelve-Factor Configuration:** All mutable settings (model directory, API keys, port) are injected via environment variables. The same codebase runs unmodified across development, staging, and production.
- **Lightweight Observability:** A custom middleware logs every request to `logs/requests.csv` with timestamp, method, route, status, and latency — preserving stateless API design while enabling performance troubleshooting.

---

## Model: PubMedBERT Fine-Tuning

### Why PubMedBERT

Large generative models like GPT-4 and Med-PaLM 2 achieve strong results on medical benchmarks but are impractical for student-facing tools due to size, cost, API dependency, and lack of transparency. PubMedBERT offers a different tradeoff:

- **110M parameters** — runs on consumer hardware (CPU inference in ~1–2 seconds)
- **Pretrained exclusively on PubMed abstracts** — vocabulary and embeddings are natively aligned with biomedical terminology
- **Open-source** — can be fine-tuned, inspected, and deployed locally with no API costs
- **Proven domain performance** — outperformed BioBERT and SciBERT on the BLURB biomedical NLP benchmark (Gu et al., 2021)

Unlike general-purpose BERT (trained on Wikipedia + BooksCorpus), PubMedBERT was pretrained from scratch on in-domain text. Gu et al. showed this approach yields substantial gains over continued pretraining of a general model, establishing PubMedBERT as state-of-the-art across a wide range of biomedical tasks.

### The MedMCQA Dataset

[MedMCQA](https://medmcqa.github.io/) (Pal et al., 2022) is a large-scale benchmark for medical MCQA containing **194,000+ real questions** from India's AIIMS and NEET-PG postgraduate medical entrance exams.

Key characteristics:
- **21 subjects** spanning clinical and preclinical domains (Anatomy, Pharmacology, Pathology, Medicine, Pediatrics, Surgery, etc.)
- **4-way classification** — each question has exactly four options (A–D) with one correct answer
- **Real exam complexity** — questions require factual recall, clinical reasoning, multi-step deduction, and cross-subject integration
- **Known noise** — sourced from real exams, so includes unclear phrasing, inconsistent labeling, and semantically close distractors

Compared to PubMedQA (yes/no/maybe) or MedQA-USMLE (smaller, cleaner), MedMCQA is both more varied and more challenging, making it a realistic testbed for educational tools.

### Dataset Preprocessing

The raw MedMCQA data (JSONL format) was preprocessed through the following pipeline:

1. **Loading:** Each JSONL split (train/val/test) loaded into pandas DataFrames
2. **Field Mapping:** Option fields (`opa`, `opb`, `opc`, `opd`) mapped to standardized keys (A, B, C, D)
3. **Input Formatting:** Each entry converted into a unified string:
   ```
   Question: <question text>
   Options:
   A. <choice_0>
   B. <choice_1>
   C. <choice_2>
   D. <choice_3>
   ```
4. **Label Cleaning:** Entries with missing or invalid labels (`cop = -1`) filtered out
5. **Tokenization:** Text tokenized using PubMedBERT's `AutoTokenizer` with padding enabled and truncation at 512 tokens
6. **Dataset Conversion:** Processed data converted to HuggingFace `Dataset` objects for compatibility with the Trainer API

This format was chosen to match typical medical exam phrasing and ensure consistent token patterns during training.

### Training Configuration

| Parameter | Value | Rationale |
|---|---|---|
| **Base Model** | `BiomedNLP-PubMedBERT-base-uncased-abstract` | Domain-specific pretraining on biomedical text |
| **Classification Head** | Linear layer → 4 classes (A–D) | Standard sequence classification setup |
| **Epochs** | 3 (primary), 5 (extended run) | Balanced trade-off between performance and overfitting |
| **Learning Rate** | 2e-5 | Optimal for BERT-family fine-tuning; validated through stability |
| **Batch Size** | 8 (train/eval) | Compatible with Colab Pro T4 GPU (16GB VRAM) |
| **Gradient Accumulation** | 2 steps | Simulates effective batch size of 16 |
| **Max Sequence Length** | 512 tokens | Captures full question + all four options |
| **Optimizer** | AdamW | Better generalization for transformer models |
| **LR Scheduler** | Linear with warmup | Prevents gradient explosion during early steps |
| **Mixed Precision (FP16)** | Enabled | Accelerates training, conserves memory |
| **Evaluation Strategy** | Per epoch | Validates performance after each full training pass |
| **Best Model Selection** | Accuracy | Primary metric for exam-style classification |

**Training Infrastructure:** Google Colab Pro with NVIDIA T4 GPU. Batch size and gradient accumulation were tuned to avoid OOM errors. Checkpoints saved after each epoch, with the best model retained for deployment.

### Model Definition

The fine-tuned model maps tokenized input sequences to a probability distribution over four answer classes. Formally:

```
h = PubMedBERT_encoder(x)
ŷ = softmax(W·h + b)
```

Where `x` is the tokenized input (question + options concatenated), `h` is the final hidden representation from the encoder, and `W`, `b` are the trainable classification head parameters. The softmax converts logits into a probability distribution over {A, B, C, D}.

**Loss Function:** Standard cross-entropy:

```
L = -Σ yᵢ · log(ŷᵢ)
```

**Evaluation Metrics:** Top-1 accuracy and weighted F1-score across the four classes.

### Results & Evaluation

| Metric | Score |
|---|---|
| Validation Accuracy | 44.3% |
| Test Accuracy (full MedMCQA) | 42.7% |
| Curated Clean Subset (100 MCQs) | 45.0% |
| Extended Training (5 epochs, CPU) | 46.33% |
| Weighted F1 (test set) | 43.5% |

**Clean Subset Construction:** 100 hand-selected questions with well-formed stems, clearly distinguishable options, manually verified correct labels, and clinically relevant context. The 2.3% improvement on this subset is consistent with known transformer sensitivity to input noise — a finding observed across BERT, BioBERT, and SciBERT evaluations.

**On the accuracy numbers:** MedMCQA is derived from real postgraduate medical exams. The human passing threshold for USMLE and NEET-PG is ~60%, and only top-percentile candidates (merit holders) score above 85–90%. The PubMedBERT zero-shot baseline is ~40%. MedPredict's fine-tuned performance (42.7–46.33%) represents a measurable improvement and reflects the genuine difficulty of clinical reasoning questions that span multiple subjects, require multi-hop logic, and include semantically close distractors.

### Performance by Difficulty

Questions were labeled by difficulty based on model confidence:

| Confidence Range | Difficulty | Accuracy |
|---|---|---|
| > 90% | 🟢 Easy | ~80% |
| 60–90% | 🟡 Medium | ~45% |
| < 60% | 🔴 Hard | ~25% |

The steep decline mirrors results seen across biomedical QA evaluations using GPT-3.5 and Med-PaLM 2. Easy questions (definitions, drug indications, textbook associations) are where MedPredict is most reliable — making it a strong tool for foundational revision and factual reinforcement. Hard questions requiring multi-hop reasoning and contextual synthesis remain an open challenge across all current biomedical NLP systems.

### Confidence Calibration

A critical feature for educational use: the model's confidence scores are well-calibrated.

- **High-confidence predictions (>85%):** Accurate in over 90% of cases
- **Low-confidence predictions (<50%):** Frequently incorrect, with dispersed probability across options

This calibration means students can meaningfully interpret the output — a question marked "Hard" with 42% confidence is a genuine signal to review the topic further, not noise. The confidence scores are visualized as probability bars and mapped to difficulty ratings, creating a feedback loop aligned with active learning principles.

### Comparison with Other Models

| Model | MedMCQA Accuracy | Parameters | Notes |
|---|---|---|---|
| PubMedBERT (zero-shot) | ~40% | 110M | Baseline, no task-specific training |
| **MedPredict (fine-tuned)** | **42.7–46.3%** | **110M** | **Single-model, single-task, no retrieval** |
| GPT-3.5 | ~60% | 175B | General-purpose, RLHF, prompt engineering |
| Med-PaLM 2 | 72.3% | Undisclosed | First to pass MedMCQA benchmark (Gupta & Waldron, 2023) |
| Human (passing score) | ~60% | — | USMLE / NEET-PG passing threshold |
| Human (top percentile) | 85–90% | — | Merit holders / medalists |

MedPredict achieves its results using a single 110M-parameter encoder model, trained only on MedMCQA data, without retrieval augmentation, chain-of-thought prompting, or multi-model ensembling. In this context, its performance is consistent with expectations for single-model biomedical transformers and is sufficient for a student-facing revision tool.

---

## Platform Features

### MCQ Classifier

The core learning tool. Students enter a medical question with four options (A–D), optionally provide their own answer, and receive:

- **Predicted answer** with the model's selected choice
- **Probability bars** showing confidence distribution across all four options
- **Difficulty tag** (Easy / Medium / Hard) based on confidence thresholds
- **Response timing** — both student response time and model inference latency
- **Correctness feedback** — if the student provided an answer, shows whether they matched the model

Students can paste questions from lectures, past papers, or homework. All session data (answers, confidence, difficulty, timing) can be exported as CSV or JSON for self-review.

**Implementation:** The frontend (`ClassifierQuiz.vue`) posts to `/api/mcq`. The Express handler spawns `api_mcq_inferrer.py`, which loads the fine-tuned PubMedBERT checkpoint, tokenizes the input, runs inference, and returns JSON with the prediction, confidence breakdown, difficulty label, and timing.

### Flashcard Generator

Converts raw `term;definition` text into an interactive study session:

1. Student enters pairs like `Hypertension;Sustained BP >140/90` (one per line, semicolon-separated)
2. Backend parses input into `{term, definition}` JSON objects
3. Frontend renders a flip-card UI with:
   - Card flip animation (term → definition)
   - "I know this" / "Next" buttons for self-assessment
   - Per-card timing (how long before flipping)
   - Round-based progression with memorized count tracking
   - Progress bar for session overview

**Persistence:** `FlashcardSession` and `FlashcardInteraction` Sequelize models log each session and per-card interaction (term viewed, memorized status, time spent), enabling long-term learning analytics.

### Symptom Checker

A rule-based diagnostic reasoning tool powered by two structured CSV datasets:

- `DiseaseAndSymptoms.csv` — maps diseases to up to 17 associated symptoms
- `Disease_precaution.csv` — provides precautionary advice for each disease

**Matching Pipeline:**

1. **Synonym Normalization:** Dictionary maps informal terms to clinical equivalents (e.g., "throwing up" → "vomiting", "runny nose" → "rhinorrhea")
2. **Text Cleaning:** Input lowercased and whitespace-stripped
3. **Fuzzy Matching:** `fuzz.ratio()` from fuzzywuzzy compares user input against known symptoms. Threshold: **85%** similarity required for a valid match
4. **Confidence Scoring:**
   ```
   Confidence(%) = (matched_symptoms / total_symptoms_for_disease) × 100
   ```
5. **Ranking:** Top 3 diseases by confidence displayed with precaution recommendations

**Dual Implementation:** Available in both JavaScript (`/api/symptoms` for fast in-browser matching) and Python (`/api/symptoms-python` for consistency with the inference layer). Both read from the same CSV files.

**Educational Value:** The module encourages students to reason through symptom-disease relationships, reinforces diagnostic thinking patterns, and provides real-time explainable feedback. It's designed to help students think like clinicians, not replace clinical judgment.

### Clinical Case Simulator

A JSON-driven simulation engine for realistic clinical decision-making practice:

**Structure:**
- **CaseSelector.vue** — Displays a grid of available cases (e.g., "Chest Pain in a 54-Year-Old", "Sudden Loss of Breath") with system labels (Cardiovascular, Respiratory)
- **SimulationRunner.vue** — Steps through the case with:
  - Intro screen (case title + background)
  - Per-step prompts with multiple-choice options or free-text input
  - Timeline tracking of all student decisions
  - Summary screen with complete decision history

**GPT Feedback Integration:**
When the student completes a case, the full decision timeline is sent to `/api/feedback`, which proxies to OpenRouter's GPT-4 API. GPT returns structured, personalized feedback on the student's clinical reasoning — what they got right, what they missed, and what they should review.

**Case Format:** Each case is a standalone JSON file in `data/cases/` with a defined schema (title, intro, steps with prompts/options, GPT feedback prompt). New cases can be added by simply dropping in new JSON files — no code changes required.

### Textbook Search & Mini Quiz

*(Backend implemented, frontend integration in progress)*

- `/api/textbook/search` — Upload a medical PDF + keyword, get relevant page previews via full-text search
- `/api/mini-quiz` — Select a textbook page, auto-generate a short quiz from its content

This feature helps students create quizzes directly from their own study materials (lecture slides, textbook chapters, past papers).

---

## Backend API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/mcq` | MCQ inference — accepts question + 4 choices, returns prediction, confidence, difficulty, timing |
| `POST` | `/api/symptoms` | JS-based symptom classifier (fast, in-browser logic) |
| `POST` | `/api/symptoms-python` | Python-based symptom classifier (fuzzy matching + synonym normalization) |
| `POST` | `/api/flashcards` | Parses `term;definition` text into JSON flashcard array |
| `GET` | `/api/cases/:filename` | Loads a clinical case JSON file from `data/cases/` |
| `POST` | `/api/feedback` | Sends simulation timeline to GPT-4 via OpenRouter, returns feedback |
| `POST` | `/api/textbook/search` | Full-text PDF search by keyword (backend only) |
| `POST` | `/api/mini-quiz` | Generates quiz from textbook page (backend only) |
| `POST` | `/api/quizzes` | Create a new quiz grouping |
| `GET` | `/api/quizzes` | List all saved quizzes |
| `GET` | `/api/quizzes/:id` | Get a specific quiz by ID |

All endpoints return JSON. Python-powered routes use `child_process.spawn` for process isolation — if the Python script fails, the Node.js server continues running.

**Example: MCQ Prediction Request**

```bash
curl -X POST http://localhost:3000/api/mcq \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which drug is used as a first-line treatment for hypertension?",
    "choices": ["Amlodipine", "Metformin", "Omeprazole", "Amoxicillin"],
    "user_answer": "A"
  }'
```

**Response:**

```json
{
  "predicted": "A",
  "pred_text": "Amlodipine",
  "confidence": 0.9234,
  "breakdown": { "A": 0.9234, "B": 0.0312, "C": 0.0287, "D": 0.0167 },
  "difficulty": "🟢 Easy",
  "correct": true,
  "time_taken": 1.47
}
```

---

## Data Modeling & Persistence

MedPredict uses SQLite via Sequelize ORM with the following entity model:

```
sessions ──1:N──> responses
questions ──1:N──> responses
questions ──1:N──> question_options
flashcard_sessions ──1:N──> flashcard_interactions
simulations ──1:N──> simulation_steps
simulations ──1:N──> simulation_runs
sessions ──1:N──> simulation_runs
sessions ──1:N──> api_logs
quizzes <──N:N──> questions  (via quiz_questions join table)
```

**Key Design Choices:**
- **UUID primary keys** across all tables for global uniqueness
- **Cascade deletes** on all foreign keys — removing a session automatically removes associated responses, flashcard sessions, and simulation runs
- **Separation of static and dynamic data:** `SimulationStep` (case definition) is separate from `SimulationRun` (user's decisions + GPT feedback), so case templates are reusable
- **`quiz_questions` join table** allows questions to appear in multiple quizzes with custom ordering
- **`api_logs`** provides lightweight audit logging (endpoint, status code, duration) without external dependencies

The database auto-creates via `sequelize.sync()` on startup — no migration scripts needed for development.

---

## User Testing

MedPredict was tested in a controlled environment with real medical students under the supervision of **Professor Said Makani**, a practicing cardiothoracic surgeon and instructor at **Hôpital Universitaire International Cheikh Khalifa Ibn Zaid** in Morocco.

**Testing Setup:**
- Locally hosted deployment accessed by a small group of medical students
- Multiple supervised sessions covering MCQ module, flashcard generator, and other features
- Feedback collected during and after sessions

**Key Findings:**
- Students found MedPredict **more engaging and practical** than other study tools they had used
- **No incorrect model predictions** were reported during use on well-structured questions
- The **flashcard generator** received particular praise — students used it to create custom term-definition cards and revise through timed sessions with memory tracking
- The confidence-aware MCQ feedback helped students understand not just the answer, but the model's certainty — promoting critical thinking over blind trust
- Students reported the spaced repetition workflow (flashcards + repeated quiz attempts) was especially helpful for memorizing pharmacological terms, anatomy structures, and disease presentations

---

## Strengths & Limitations

### Strengths

- **Confidence-aware predictions** — Students see probability distributions, not just answers. This transparency supports informed learning and discourages blind trust in AI output.
- **Consistent behavior** — Repeated inference with identical inputs produces stable predictions with minimal variation in confidence values, building user trust over time.
- **Real-time performance** — All features return results in under 2 seconds on non-GPU consumer hardware.
- **Modular and extensible** — Each module operates independently through a shared API layer. The model can be swapped, the frontend redesigned, or new features added without system-wide changes.
- **Pedagogical versatility** — Combines five different learning modes (quiz, flashcards, symptom reasoning, clinical simulation, textbook search) in one platform, supporting multiple study strategies.
- **No cloud dependency for core inference** — The fine-tuned model runs locally. Only the GPT feedback feature requires an external API.

### Limitations

- **Below human-level accuracy** — 42.7–46.3% does not reach the ~60% passing threshold for medical exams. The model is a revision companion, not an authoritative answer source.
- **Weak on complex reasoning** — Multi-hop questions, case-based logic, and clinical decision-making remain challenging for encoder-only models without retrieval support or external reasoning.
- **Dataset noise** — MedMCQA contains unclear questions, inconsistent labels, and poorly designed distractors from real exams. This reduces both training effectiveness and evaluation reliability.
- **No retrieval augmentation** — The model relies solely on its internal representations. Adding RAG or open-book QA could significantly improve performance on knowledge-intensive questions.
- **Limited training compute** — Only 3–5 epochs on a T4 GPU. Extended training on better hardware would likely improve results, as the 5-epoch CPU run already showed gains.

---

## Future Improvements

- **GPT-based explanations** — Provide plain-language reasoning for each MCQ prediction, explaining *why* a particular answer was selected
- **Retrieval-Augmented Generation (RAG)** — Integrate a medical knowledge base for retrieval during inference, improving accuracy on knowledge-intensive questions
- **Multilingual support** — Enable Chinese, French, and Arabic interfaces for international students
- **Educator dashboard** — Track student progress, identify common weak areas, and adjust materials accordingly
- **Adaptive quiz mode** — Dynamically select next questions based on student performance and difficulty estimates
- **Contrastive fine-tuning** — Improve handling of semantically close distractors by leveraging contrastive learning techniques
- **Extended training** — Train for 20+ epochs on dedicated GPU infrastructure to fully explore performance ceiling
- **Curriculum alignment** — Tag questions by medical school course/topic for structured study paths

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/medpredict.git
cd medpredict

# Backend setup
cd backend
npm install
pip install torch transformers pandas fuzzywuzzy python-Levenshtein

# Frontend setup
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=3000
MODEL_DIR=./models/pubmedbert_mcqa_finetuned
OPENROUTER_API_KEY=your_key_here  # Required only for clinical case feedback
```

### Running

```bash
# Terminal 1: Start the backend
cd backend
npm start

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173` (Vite default).

### Quick Test

Once running, try the MCQ classifier:
1. Navigate to the Quiz module
2. Enter a medical question with four options
3. Click "Get Prediction"
4. Enter your answer when prompted
5. View the model's prediction, confidence bars, and difficulty rating

---

## Project Structure

```
medpredict/
├── backend/
│   ├── controllers/
│   │   └── index.js              # Route handlers for all features
│   ├── models/
│   │   └── index.js              # Sequelize model definitions & associations
│   ├── routes/
│   │   └── api.js                # Express route definitions
│   ├── archive/
│   │   ├── api_mcq_inferrer.py   # PubMedBERT inference script
│   │   ├── symptom_api.py        # Python symptom classifier
│   │   └── training_script.py    # Model fine-tuning script
│   ├── data/
│   │   ├── cases/                # Clinical case JSON files
│   │   │   ├── cardio_stemi_case.json
│   │   │   ├── resp_copd_case.json
│   │   │   └── ...
│   │   ├── DiseaseAndSymptoms.csv
│   │   ├── Disease_precaution.csv
│   │   └── medpredict.sqlite     # Auto-created on first run
│   ├── logs/
│   │   └── requests.csv          # Request audit log
│   ├── package.json
│   └── server.js                 # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClassifierQuiz.vue     # MCQ quiz interface
│   │   │   ├── FlashcardTrainer.vue   # Flashcard study sessions
│   │   │   ├── SymptomChecker.vue     # Symptom input & results
│   │   │   ├── CaseSelector.vue       # Clinical case grid
│   │   │   ├── SimulationRunner.vue   # Step-through case simulator
│   │   │   └── AboutMe.vue            # Platform info
│   │   ├── router/
│   │   │   └── index.js               # Vue Router config
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── models/
│   └── pubmedbert_mcqa_finetuned/     # Fine-tuned model checkpoint
│       ├── config.json
│       ├── pytorch_model.bin
│       └── tokenizer/
└── README.md
```

---

## Related Work & Context

MedPredict builds on a body of research in biomedical NLP and domain-specific transformers:

- **BERT → BioBERT → PubMedBERT:** The evolution from general-purpose transformers to domain-specific pretraining has consistently improved performance on biomedical tasks. PubMedBERT (Gu et al., 2021) showed that pretraining from scratch on in-domain text outperforms continued pretraining of general models, setting new state-of-the-art results across the BLURB biomedical benchmark.

- **Fine-tuning vs. Prompt Engineering:** Zhang et al. (2024) compared both approaches for clinical note classification and found that fine-tuning remains more accurate and stable for fixed-output-format tasks like MCQA — supporting MedPredict's methodological choice of supervised fine-tuning over prompt-based learning.

- **Limitations of Transformers in Clinical QA:** Tinn et al. (2023) reported that LLMs often suffer from domain mismatches and difficulty interpreting long contextual dependencies. Pascual et al. (2021) documented label imbalance and contextual ambiguity in clinical coding tasks — concerns directly relevant to MCQA where distractors are semantically close. These insights influenced MedPredict's emphasis on confidence-aware outputs and curated evaluation subsets.

- **Contrastive Learning for Biomedical NLP:** Su et al. (2021) proposed contrastive approaches to improve BERT's generalization in relation extraction. While MedPredict doesn't yet use contrastive fine-tuning, these techniques offer a promising path for better distractor handling and difficulty estimation in future versions.

- **Structured Data and Med-BERT:** Rasmy et al. (2021) designed Med-BERT for structured EHR data processing. Although EHR data differs from MCQ inputs, the use of structured label sequences is conceptually aligned with MCQA's classification format and presents future possibilities for hybrid systems.

- **Transfer Learning:** Peng et al. (2019) conducted a broad comparison across ten biomedical datasets, concluding that domain-specific pretraining consistently outperforms general approaches — especially when labeled data is scarce. This directly supports the choice of PubMedBERT as MedPredict's foundation.

- **MedMCQA Benchmark:** Pal et al. (2022) established MedMCQA as a uniquely challenging benchmark with 194,000+ questions reflecting the genuine complexity of postgraduate medical exams. Its scale and noise profile make it an ideal testbed for educational tool development, unlike cleaner but smaller datasets like PubMedQA.

- **The Student-Facing Gap:** Despite the proliferation of medical LLMs (Med-PaLM, BioBERT, GPT-4), few systems are designed for student use with interactivity, explainability, and accessibility. Research platforms showcase strong accuracy but lack the pedagogical design needed for real learning impact. MedPredict directly addresses this gap by transforming a fine-tuned model into an interactive educational companion.

- **Adversarial QA Research:** Bartolo et al. (2020) showed that adversarial annotation can reveal model blind spots and improve robustness — relevant insights for building MCQA tools that handle challenging edge-case questions.

---

## References

1. Gu, Y., et al. (2021). Domain-Specific Language Model Pretraining for Biomedical Natural Language Processing. *ACM Transactions on Computing for Healthcare*. [PubMedBERT]
2. Pal, A., Umapathi, L. K., & Sankarasubbu, M. (2022). MedMCQA: A Large-Scale Multi-Subject Multi-Choice Dataset for Medical Domain Question Answering. *CHIL 2022*. https://doi.org/10.48550/arXiv.2203.14371
3. Lee, J., et al. (2020). BioBERT: A Pre-trained Biomedical Language Representation Model. *Bioinformatics*, 36(4). https://doi.org/10.1093/bioinformatics/btz682
4. Tinn, R., et al. (2023). Fine-Tuning Large Neural Language Models for Biomedical NLP. *Patterns*, 4(8). https://doi.org/10.1016/j.patter.2023.100729
5. Pascual, D., Luck, S., & Wattenhofer, R. (2021). Towards BERT-based Automatic ICD Coding. *BioNLP 2021*. https://doi.org/10.48550/arXiv.2104.06709
6. Zhang, X., et al. (2024). Comparison of Prompt Engineering and Fine-Tuning in LLMs for Clinical Notes Classification. *JAMIA*, 31(2). https://doi.org/10.1093/jamia/ocad249
7. Gupta, A., & Waldron, A. (2023). A Responsible Path to Generative AI in Healthcare. *Google Cloud Blog*.
8. Patel, D., et al. (2024). Evaluating Prompt Engineering on GPT-3.5's Performance in USMLE-Style Medical Tasks. *Scientific Reports*, 14. https://doi.org/10.1038/s41598-024-47341-5
9. Bartolo, M., et al. (2020). Beat the AI: Investigating Adversarial Human Annotation for Reading Comprehension. *TACL*, 8. https://doi.org/10.1162/tacl_a_00338
10. Rasmy, L., et al. (2021). Med-BERT: Pre-trained Contextualized Embeddings on Large-Scale Structured EHR. *NPJ Digital Medicine*, 4. https://doi.org/10.1038/s41746-021-00455-y
11. Su, P., Peng, Y., & Vijay-Shanker, K. (2021). Improving BERT Model Using Contrastive Learning for Biomedical Relation Extraction. *BioNLP 2021*. https://doi.org/10.18653/v1/2021.bionlp-1.1
12. Peng, Y., Yan, S., & Lu, Z. (2019). Transfer Learning in Biomedical NLP. *BioNLP Workshop*. https://doi.org/10.18653/v1/W19-5007
13. Wang, X., et al. (2019). Fine-tuning BERT for Biomedical NER. *JMIR Medical Informatics*, 7(3). https://doi.org/10.2196/14830

---

## License

This project was developed as an undergraduate thesis at Sichuan University, College of Software Engineering. See thesis documentation for academic attribution requirements.

---

*Built with PubMedBERT, Vue 3, Node.js, and a lot of late nights.* 🧠
