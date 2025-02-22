const fs            = require("fs");
const path          = require("path");
const crypto        = require("crypto");
const pdfParse      = require("pdf-parse");
const fuzzy         = require("fuzzy");
const axios         = require("axios");
const { PythonShell } = require("python-shell");
const { spawn }     = require("child_process");
const { chunkText, buildBM25Index, searchBM25, storeTextbook, getTextbook, embedChunks, searchHybrid } = require("../lib/rag");
require("dotenv").config();    

//  Models import
const {
  Session,
  Question,
  QuestionOption,
  Response,
  Quiz,
  QuizQuestion,
  SimulationRun
} = require("../models");
// ---------------- TEXTBOOK SEARCH ----------------
const searchTextbookConcept = async (req, res) => {
  const file = req.file;
  const term = req.body.term?.toLowerCase();

  if (!file || !term) return res.status(400).json({ error: "PDF file and search term are required." });

  try {
    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdfParse(dataBuffer);

    const matches = [];
    const pages = data.text.split("\f"); // Page breaks
    pages.forEach((page, i) => {
      const index = page.toLowerCase().indexOf(term);
      if (index !== -1) {
        const preview = page.slice(Math.max(0, index - 50), index + 50).replace(/\n/g, " ");
        matches.push({ page: i + 1, preview });
      }
    });

    fs.unlinkSync(file.path); // delete uploaded file
    return res.json({ matches });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process PDF." });
  }
};

// ---------------- MINI QUIZ GENERATOR ----------------
const generateMiniQuiz = (req, res) => {
  const file = req.file;
  const term = req.body.term;

  if (!file || !term) {
    return res.status(400).json({ error: "PDF file and term are required." });
  }

  const pythonPath = path.join(__dirname, '../../src/textbook.py');
  const pdfPath = file.path;

  let options = {
    mode: 'json',
    pythonOptions: ['-u'],
    args: [pdfPath, term]
  };

  PythonShell.run(pythonPath, options, function (err, results) {
    fs.unlinkSync(pdfPath); // clean uploaded file

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Python script failed." });
    }

    return res.json({ quiz: results });
  });
};

// ---------------- SYNONYM MAP ----------------
const SYMPTOM_SYNONYMS = {
  "headache": "headache", "head pain": "headache", "migraine": "headache",
  "fever": "high_fever", "high fever": "high_fever", "temperature": "high_fever",
  "cough": "cough", "coughing": "cough",
  "vomiting": "vomiting", "throwing up": "vomiting", "nausea": "nausea",
  "fatigue": "fatigue", "tired": "fatigue", "tiredness": "fatigue", "exhaustion": "fatigue",
  "weight loss": "weight_loss", "losing weight": "weight_loss",
  "weight gain": "weight_gain",
  "itching": "itching", "itch": "itching", "itchy": "itching",
  "skin rash": "skin_rash", "rash": "skin_rash",
  "stomach pain": "stomach_pain", "abdominal pain": "abdominal_pain", "belly pain": "stomach_pain",
  "chest pain": "chest_pain",
  "joint pain": "joint_pain", "knee pain": "knee_pain",
  "back pain": "back_pain",
  "dizziness": "dizziness", "dizzy": "dizziness",
  "diarrhea": "diarrhoea", "diarrhoea": "diarrhoea", "loose stools": "diarrhoea",
  "constipation": "constipation",
  "breathlessness": "breathlessness", "shortness of breath": "breathlessness",
  "chills": "chills", "shivering": "shivering",
  "sore throat": "throat_irritation", "throat pain": "throat_irritation",
  "runny nose": "runny_nose", "sneezing": "continuous_sneezing",
  "muscle pain": "muscle_pain", "body aches": "muscle_pain",
  "sweating": "sweating", "night sweats": "sweating",
  "blurred vision": "blurred_and_distorted_vision",
  "anxiety": "anxiety", "depression": "depression",
  "swelling": "swelling_joints", "swollen joints": "swelling_joints",
  "yellowing": "yellowing_of_eyes", "jaundice": "yellowing_of_eyes",
  "dark urine": "dark_urine", "loss of appetite": "loss_of_appetite",
  "acidity": "acidity", "indigestion": "indigestion",
  "ulcers": "ulcers_on_tongue",
  "muscle wasting": "muscle_wasting", "stiff neck": "stiff_neck",
  "burning urination": "burning_micturition", "painful urination": "burning_micturition",
  "spotting urination": "spotting__urination",
  "obesity": "obesity", "restlessness": "restlessness",
  "lethargy": "lethargy", "mood swings": "mood_swings",
  "irregular sugar": "irregular_sugar_level", "dehydration": "dehydration",
  "palpitations": "fast_heart_rate", "fast heart rate": "fast_heart_rate",
};

// ---------------- PRECAUTIONS LOADER ----------------
let _precautionMap = null;
function loadPrecautions() {
  if (_precautionMap) return _precautionMap;
  _precautionMap = {};
  try {
    const raw = fs.readFileSync(path.join(__dirname, "../archive/Disease precaution.csv"), "utf8");
    const rows = raw.split("\n");
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",");
      if (!cols[0]) continue;
      const disease = cols[0].trim();
      const precs = cols.slice(1).map(p => p.trim()).filter(Boolean);
      _precautionMap[disease.toLowerCase()] = precs;
    }
  } catch (e) {
    console.warn("Could not load precautions CSV:", e.message);
  }
  return _precautionMap;
}

// ---------------- FUZZY SYMPTOM RESOLVER ----------------
function resolveSymptom(input, knownSymptoms) {
  const lower = input.toLowerCase().trim();
  // 1. Exact synonym match
  if (SYMPTOM_SYNONYMS[lower]) return SYMPTOM_SYNONYMS[lower];
  // 2. Direct match in dataset
  const underscored = lower.replace(/\s+/g, "_");
  if (knownSymptoms.has(underscored)) return underscored;
  if (knownSymptoms.has(lower)) return lower;
  // 3. Fuzzy match against known symptoms
  const results = fuzzy.filter(underscored, Array.from(knownSymptoms));
  if (results.length > 0 && results[0].score > 20) return results[0].string;
  return null;
}

// ---------------- SYMPTOM CLASSIFIER (JS version) ----------------
const classifySymptoms = (req, res) => {
  const symptoms = req.body.symptoms;
  if (!symptoms || !Array.isArray(symptoms)) return res.status(400).json({ error: "Symptom list is required." });

  const symptomData = fs.readFileSync(path.join(__dirname, "../archive/DiseaseAndSymptoms.csv"), "utf8");
  const rows = symptomData.split("\n").map((row) => row.split(","));

  // Collect all known symptoms from the dataset
  const knownSymptoms = new Set();
  for (let i = 1; i < rows.length; i++) {
    rows[i].slice(1).forEach(s => { const t = s.trim().toLowerCase(); if (t) knownSymptoms.add(t); });
  }

  // Resolve user inputs to canonical symptom names
  const resolved = symptoms.map(s => resolveSymptom(s, knownSymptoms)).filter(Boolean);
  if (resolved.length === 0) {
    return res.json({ predictions: [], precautions: [], resolved: [] });
  }

  const predictions = [];
  for (let i = 1; i < rows.length; i++) {
    const disease = rows[i][0];
    if (!disease) continue;
    const rowSymptoms = rows[i].slice(1).map((s) => s.trim().toLowerCase());
    const matches = resolved.filter((sym) => rowSymptoms.includes(sym));
    const total = rowSymptoms.filter(Boolean).length;
    if (total === 0) continue;
    const confidence = (matches.length / total) * 100;
    if (confidence > 0) predictions.push({ disease, confidence });
  }

  predictions.sort((a, b) => b.confidence - a.confidence);
  const top = predictions.slice(0, 3);

  // Lookup precautions for top disease
  const precautionMap = loadPrecautions();
  let precautions = [];
  if (top.length > 0) {
    precautions = precautionMap[top[0].disease.toLowerCase()] || [];
  }

  return res.json({ predictions: top, precautions, resolved });
};

// ---------------- SYMPTOM CLASSIFIER (Python version) ----------------

const runPythonSymptomClassifier = (req, res) => {
  const symptoms = req.body.symptoms;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: "Symptom list is required." });
  }

  const pythonProcess = spawn("python3", [
    path.join(__dirname, "../archive/symptom_api.py"),
    JSON.stringify(symptoms)
  ]);

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (errorOutput) {
      console.error(" Python stderr:", errorOutput);
      return res.status(500).json({ error: "Python script error", detail: errorOutput });
    }

    try {
      const parsed = JSON.parse(output.trim());
      console.log(" Final parsed output:", parsed);
      return res.json(parsed);
    } catch (e) {
      console.error(" Failed to parse:", output);
      return res.status(500).json({ error: "Invalid JSON from Python" });
    }
  });
};




// ---------------- FLASHCARD GENERATOR ----------------
const generateFlashcards = (req, res) => {
  const rawInput = req.body.input;
  if (!rawInput) return res.status(400).json({ error: "Flashcard input is required." });

  const flashcards = rawInput
    .split("\n")
    .map((line) => {
      const parts = line.split(";");
      return parts.length === 2 ? { term: parts[0].trim(), definition: parts[1].trim() } : null;
    })
    .filter(Boolean);

  return res.json({ flashcards });
};

// ---------------- MCQ classifier ----------------
async function classifyMCQ(req, res) {
  console.log("classifyMCQ invoked", req.body);
  const { question, choices, user_answer, start_time, include_attention } = req.body;
  if (!question || !choices || choices.length !== 4) {
    return res.status(400).json({ error: "Question and 4 choices are required." });
  }

  // 1️⃣ Create a new Session
  let session;
  try {
    session = await Session.create();
    console.log(" Session created:", session.id);
  } catch (e) {
    console.warn("Session creation failed:", e);
  }

  //  Record the Question
  let qRec;
  try {
    qRec = await Question.create({ text: question, correct_label: user_answer || null });
    console.log(" Question created:", qRec.id);
  } catch (e) {
    console.warn("Question creation failed:", e);
  }

  // 3️⃣ Run the Python script
  const scriptPath    = path.join(__dirname, "../archive/api_mcq_inferrer.py");
  const payloadString = JSON.stringify({ question, choices, user_answer, start_time, include_attention: !!include_attention });
  const pyProc        = spawn("python3", [scriptPath, payloadString]);

  let output = "", error = "";
  pyProc.stdout.on("data", data => (output += data.toString()));
  pyProc.stderr.on("data", data => (error  += data.toString()));

  pyProc.on("close", async () => {
    if (error) {
      console.error("Inference error:", error);
      return res.status(500).json({ error: "Python error", detail: error });
    }

    let result;
    try {
      result = JSON.parse(output.trim());
    } catch (e) {
      console.error("Invalid JSON from inference:", e, output);
      return res.status(500).json({ error: "Invalid inference output" });
    }

    // 4️⃣ Persist the Response
    try {
      await Response.create({
        session_id:     session?.id,
        question_id:    qRec?.id,
        selected_label: result.predicted,
        is_correct:     result.correct,
        time_taken:     result.time_taken
      });
    } catch (e) {
      console.warn("Response creation failed:", e);
    }

    // 5️⃣ Return the result
    res.json(result);
  });
}
// 1️⃣ Create a new quiz with an ordered list of question IDs
async function createQuiz(req, res) {
  const { title, questionIds } = req.body;
  if (!title || !Array.isArray(questionIds)) {
    return res.status(400).json({ error: "Title and questionIds array required." });
  }

  try {
    const quiz = await Quiz.create({ title });
    await Promise.all(
      questionIds.map((qid, idx) =>
        QuizQuestion.create({ quiz_id: quiz.id, question_id: qid, order: idx })
      )
    );
    return res.status(201).json(quiz);
  } catch (err) {
    console.error("CreateQuiz error:", err);
    return res.status(500).json({ error: "Failed to create quiz." });
  }
}

// 2️⃣ List all quizzes (id & title)
async function listQuizzes(req, res) {
  try {
    const quizzes = await Quiz.findAll({ attributes: ["id", "title"] });
    return res.json(quizzes);
  } catch (err) {
    console.error("ListQuizzes error:", err);
    return res.status(500).json({ error: "Failed to list quizzes." });
  }
}

// 3️⃣ Get one quiz with its questions and options
async function getQuiz(req, res) {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: {
        model: QuizQuestion,
        include: {
          model: Question,
          include: QuestionOption
        },
        order: [["order", "ASC"]]
      }
    });
    if (!quiz) return res.status(404).json({ error: "Quiz not found." });
    return res.json(quiz);
  } catch (err) {
    console.error("GetQuiz error:", err);
    return res.status(500).json({ error: "Failed to fetch quiz." });
  }
}


// ════════════════════════════════════════════════════════════════
// RAG TEXTBOOK SYSTEM
// ════════════════════════════════════════════════════════════════

// Helper: call OpenRouter chat completion
async function callOpenRouter(messages, maxTokens = 1024) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct",
      messages,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "MedPredict Textbook RAG",
      },
    }
  );
  return response.data.choices?.[0]?.message?.content || "";
}

// POST /api/textbook/upload — parse PDF, chunk, build index
const uploadTextbook = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "PDF file is required." });

  try {
    const dataBuffer = fs.readFileSync(file.path);
    const data = await pdfParse(dataBuffer);
    fs.unlinkSync(file.path);

    const chunks = chunkText(data.text);
    if (chunks.length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF. The file may be scanned/image-based." });
    }

    const index = buildBM25Index(chunks);
    const fileId = crypto.randomUUID();
    const pageCount = data.numpages || new Set(chunks.map(c => c.page)).size;

    storeTextbook(fileId, { chunks, index, embeddings: null, filename: file.originalname });

    // Compute dense embeddings in background (non-blocking)
    embedChunks(chunks).then((embeddings) => {
      if (embeddings) {
        const tb = getTextbook(fileId);
        if (tb) tb.embeddings = embeddings;
        console.log(`Embeddings ready for ${fileId} (${embeddings.length} vectors)`);
      }
    }).catch((err) => {
      console.warn("Background embedding failed:", err.message);
    });

    return res.json({ fileId, chunkCount: chunks.length, pageCount });
  } catch (err) {
    console.error("uploadTextbook error:", err);
    return res.status(500).json({ error: "Failed to process PDF." });
  }
};

// POST /api/textbook/search-rag — Hybrid (BM25 + dense) search
const searchTextbook = async (req, res) => {
  const { fileId, query } = req.body;
  if (!fileId || !query) return res.status(400).json({ error: "fileId and query are required." });

  const tb = getTextbook(fileId);
  if (!tb) return res.status(404).json({ error: "Textbook not found or expired. Please re-upload." });

  const { results: hits, method } = await searchHybrid(tb, query, 5);
  const results = hits.map(h => ({
    text: tb.chunks[h.index].text,
    page: tb.chunks[h.index].page,
    score: Math.round(h.score * 10000) / 10000,
  }));

  return res.json({ results, method });
};

// POST /api/textbook/ask — Hybrid search + AI answer
const askTextbook = async (req, res) => {
  const { fileId, query } = req.body;
  if (!fileId || !query) return res.status(400).json({ error: "fileId and query are required." });

  const tb = getTextbook(fileId);
  if (!tb) return res.status(404).json({ error: "Textbook not found or expired. Please re-upload." });

  const { results: hits } = await searchHybrid(tb, query, 5);
  const sources = hits.map(h => ({
    text: tb.chunks[h.index].text,
    page: tb.chunks[h.index].page,
    score: Math.round(h.score * 10000) / 10000,
  }));

  if (sources.length === 0) {
    return res.json({ answer: "No relevant passages found for your query.", sources: [] });
  }

  const context = sources.map((s, i) => `[Page ${s.page}] ${s.text}`).join("\n\n");

  try {
    const answer = await callOpenRouter([
      {
        role: "system",
        content: "You are a helpful medical study assistant. Answer the student's question using ONLY the textbook excerpts provided. Cite page numbers. If the excerpts don't contain enough info, say so.",
      },
      {
        role: "user",
        content: `Textbook excerpts:\n${context}\n\nQuestion: ${query}`,
      },
    ]);

    return res.json({ answer, sources });
  } catch (err) {
    console.error("askTextbook AI error:", err.message);
    return res.json({
      answer: "AI service unavailable. Here are the most relevant passages from your textbook.",
      sources,
    });
  }
};

// POST /api/textbook/quiz — generate MCQs from textbook
const generateQuizFromTextbook = async (req, res) => {
  const { fileId, topic } = req.body;
  if (!fileId) return res.status(400).json({ error: "fileId is required." });

  const tb = getTextbook(fileId);
  if (!tb) return res.status(404).json({ error: "Textbook not found or expired. Please re-upload." });

  // Use topic for targeted search, otherwise use first chunks
  let contextChunks;
  if (topic && topic.trim()) {
    const { results: hits } = await searchHybrid(tb, topic, 10);
    contextChunks = hits.map(h => tb.chunks[h.index].text);
  } else {
    contextChunks = tb.chunks.slice(0, 10).map(c => c.text);
  }

  if (contextChunks.length === 0) {
    return res.status(400).json({ error: "Not enough content to generate a quiz." });
  }

  const context = contextChunks.join("\n\n");

  try {
    const raw = await callOpenRouter(
      [
        {
          role: "system",
          content:
            'You are a medical quiz generator. Generate exactly 5 multiple-choice questions from the provided textbook content. Return ONLY valid JSON: an array of objects, each with "question" (string), "options" (array of 4 strings labeled A-D), and "answer" (the correct letter like "A", "B", "C", or "D"). No extra text.',
        },
        {
          role: "user",
          content: `Textbook content:\n${context}\n\nGenerate 5 MCQs as JSON.`,
        },
      ],
      2048
    );

    // Try to extract JSON from the response
    let quiz;
    try {
      // Handle cases where AI wraps JSON in markdown code blocks
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      quiz = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      console.error("Quiz parse error:", e, "Raw:", raw);
      return res.status(500).json({ error: "Failed to parse quiz from AI response." });
    }

    return res.json({ quiz });
  } catch (err) {
    console.error("generateQuizFromTextbook error:", err.message);
    return res.status(500).json({ error: "AI service unavailable. Please try again later." });
  }
};

// ---------------- SAVE SIMULATION RUN ----------------
async function saveSimulationRun(req, res) {
  const { caseTitle, timeline, score, maxScore, grade, elapsedSeconds, timerExpired, diagnosis, diagnosisMatch } = req.body;
  if (!caseTitle || !timeline) {
    return res.status(400).json({ error: "caseTitle and timeline are required." });
  }

  try {
    const session = await Session.create();
    const run = await SimulationRun.create({
      simulation_id: session.id,
      session_id: session.id,
      timeline: {
        caseTitle,
        entries: timeline,
        score,
        maxScore,
        grade,
        elapsedSeconds,
        timerExpired,
        diagnosis,
        diagnosisMatch
      }
    });
    return res.status(201).json({ id: run.id, sessionId: session.id });
  } catch (err) {
    console.error("saveSimulationRun error:", err);
    return res.status(500).json({ error: "Failed to save simulation run." });
  }
}

module.exports = {
  generateMiniQuiz,
  searchTextbookConcept,
  classifySymptoms,
  runPythonSymptomClassifier,
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
};
