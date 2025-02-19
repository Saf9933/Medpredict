// backend/routes/index.js

const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const axios     = require('axios');
const crypto    = require('crypto');
require('dotenv').config();

const upload    = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
const router    = express.Router();

// Auth & validation middleware
const { generateToken, authMiddleware, optionalAuth } = require('../middleware/auth');
const {
  validate,
  symptomsSchema,
  flashcardsSchema,
  mcqSchema,
  createQuizSchema,
  textbookSearchSchema,
  textbookQuizSchema,
  simulationRunSchema,
  feedbackSchema,
  registerSchema,
  loginSchema,
} = require('../middleware/validate');

const {
  generateMiniQuiz,
  classifySymptoms,
  runPythonSymptomClassifier,
  searchTextbookConcept,
  generateFlashcards,
  classifyMCQ,
  createQuiz,
  listQuizzes,
  getQuiz,
  uploadTextbook,
  searchTextbook,
  askTextbook,
  generateQuizFromTextbook,
  saveSimulationRun,
} = require('../controllers');

// ─── Auth Endpoints ─────────────────────────────────────
// Simple in-memory user store (swap for DB model in production)
const users = new Map();

router.post('/auth/register', validate(registerSchema), (req, res) => {
  const { email, password } = req.body;
  if (users.has(email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }
  // Hash password with crypto (no bcrypt dependency needed for demo)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const userId = crypto.randomUUID();
  users.set(email, { userId, hash, salt });
  const token = generateToken(userId);
  return res.status(201).json({ token, userId });
});

router.post('/auth/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const hash = crypto.scryptSync(password, user.salt, 64).toString('hex');
  if (hash !== user.hash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = generateToken(user.userId);
  return res.json({ token, userId: user.userId });
});

// ─── AI Rate Limiter (applied to expensive endpoints) ───
function getAiLimiter(req) {
  return req.app.get('aiLimiter');
}

// === Mini Quiz Generator ===
router.post('/mini-quiz', upload.single('pdf'), generateMiniQuiz);

// === Symptom Classifier (JS) ===
router.post('/symptoms', validate(symptomsSchema), classifySymptoms);

// === Symptom Classifier (Python) ===
router.post('/symptoms-python', validate(symptomsSchema), runPythonSymptomClassifier);

// === Textbook Search (legacy) ===
router.post('/textbook/search', upload.single('pdf'), searchTextbookConcept);

// === Textbook RAG System ===
router.post('/textbook/upload', upload.single('pdf'), uploadTextbook);
router.post('/textbook/search-rag', validate(textbookSearchSchema), searchTextbook);
router.post('/textbook/ask', (req, res, next) => {
  const limiter = getAiLimiter(req);
  if (limiter) return limiter(req, res, () => next());
  next();
}, validate(textbookSearchSchema), askTextbook);
router.post('/textbook/quiz', (req, res, next) => {
  const limiter = getAiLimiter(req);
  if (limiter) return limiter(req, res, () => next());
  next();
}, validate(textbookQuizSchema), generateQuizFromTextbook);

// === Flashcard Generator ===
router.post('/flashcards', validate(flashcardsSchema), generateFlashcards);

// === MCQ Classifier ===
router.post('/mcq', validate(mcqSchema), classifyMCQ);

// === Quiz CRUD ===
router.post('/quizzes', validate(createQuizSchema), createQuiz);
router.get('/quizzes', listQuizzes);
router.get('/quizzes/:id', getQuiz);

// === Simulation Run Persistence ===
router.post('/simulation-runs', validate(simulationRunSchema), saveSimulationRun);

// === Clinical Case Loader (whitelist-based) ===
const ALLOWED_CASES = new Set();
const casesDir = path.join(__dirname, '..', '..', 'data', 'cases');
try {
  if (fs.existsSync(casesDir)) {
    fs.readdirSync(casesDir)
      .filter(f => f.endsWith('.json'))
      .forEach(f => ALLOWED_CASES.add(f));
  }
} catch (e) { /* ignore */ }

router.get('/cases/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!ALLOWED_CASES.has(filename)) {
    return res.status(404).json({ error: 'Case file not found' });
  }
  const casePath = path.join(casesDir, filename);
  res.sendFile(casePath);
});

// === GPT Feedback Proxy ===
router.post('/feedback', (req, res, next) => {
  const limiter = getAiLimiter(req);
  if (limiter) return limiter(req, res, () => next());
  next();
}, validate(feedbackSchema), async (req, res) => {
  const { timeline, prompt } = req.body;
  const formattedTimeline = timeline
    .map((t, i) => `Step ${i + 1}: ${t.choice || t.test || t.input}`)
    .join('\n');
  const fullPrompt = `${prompt}\n\nTimeline:\n${formattedTimeline}`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: fullPrompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:8080',
          'X-Title': 'MedSim Case Feedback'
        },
        timeout: 30000,
      }
    );

    const feedback = response.data.choices?.[0]?.message?.content || 'No feedback returned.';
    res.json({ feedback });

  } catch (err) {
    console.error('OpenRouter GPT Error:', err.message);
    res.status(500).json({ error: 'Failed to get GPT feedback' });
  }
});

module.exports = router;
