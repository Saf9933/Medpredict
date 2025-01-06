// backend/routes/index.js

const express   = require('express');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const axios     = require('axios');
require('dotenv').config();

const upload    = multer({ dest: 'uploads/' });
const router    = express.Router();

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
} = require('../controllers');

// === Mini Quiz Generator ===
router.post('/mini-quiz', upload.single('pdf'), generateMiniQuiz);

// === Symptom Classifier (JS) ===
router.post('/symptoms', classifySymptoms);

// === Symptom Classifier (Python) ===
router.post('/symptoms-python', runPythonSymptomClassifier);

// === Textbook Search ===
router.post('/textbook/search', upload.single('pdf'), searchTextbookConcept);

// === Flashcard Generator ===
router.post('/flashcards', generateFlashcards);

// === MCQ Classifier ===
router.post('/mcq', classifyMCQ);

router.post('/quizzes',    createQuiz);
router.get('/quizzes',     listQuizzes);
router.get('/quizzes/:id', getQuiz);
// === Clinical Case Loader ===
router.get('/cases/:filename', (req, res) => {
  const filename = req.params.filename;
  const casePath = path.join(__dirname, '..', '..', 'data', 'cases', filename);

  if (!fs.existsSync(casePath)) {
    return res.status(404).json({ error: 'Case file not found' });
  }
  res.sendFile(casePath);
});

// === GPT Feedback Proxy ===
router.post('/feedback', async (req, res) => {
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
          'HTTP-Referer': 'http://localhost:8080',
          'X-Title': 'MedSim Case Feedback'
        }
      }
    );

    const feedback = response.data.choices?.[0]?.message?.content || '⚠️ No feedback returned.';
    res.json({ feedback });

  } catch (err) {
    console.error('OpenRouter GPT Error:', err.message);
    res.status(500).json({ error: 'Failed to get GPT feedback' });
  }
});

module.exports = router;
