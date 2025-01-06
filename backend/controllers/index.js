const fs            = require("fs");
const path          = require("path");
const pdfParse      = require("pdf-parse");
const fuzzy         = require("fuzzy");
const { PythonShell } = require("python-shell");
const { spawn }     = require("child_process");    

//  Models import
const {
  Session,
  Question,
  QuestionOption,
  Response
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

// ---------------- SYMPTOM CLASSIFIER (JS version) ----------------
const classifySymptoms = (req, res) => {
  const symptoms = req.body.symptoms;
  if (!symptoms || !Array.isArray(symptoms)) return res.status(400).json({ error: "Symptom list is required." });

  const symptomData = fs.readFileSync(path.join(__dirname, "../archive/DiseaseAndSymptoms.csv"), "utf8");

  const rows = symptomData.split("\n").map((row) => row.split(","));
  const predictions = [];

  for (let i = 1; i < rows.length; i++) {
    const disease = rows[i][0];
    const rowSymptoms = rows[i].slice(1).map((s) => s.trim().toLowerCase());
    const matches = symptoms.filter((sym) => rowSymptoms.includes(sym.toLowerCase()));
    const confidence = (matches.length / rowSymptoms.filter(Boolean).length) * 100;
    if (confidence > 0) predictions.push({ disease, confidence });
  }

  predictions.sort((a, b) => b.confidence - a.confidence);
  return res.json({ predictions: predictions.slice(0, 3) });
};

// ---------------- SYMPTOM CLASSIFIER (Python version) ----------------

const runPythonSymptomClassifier = (req, res) => {
  const symptoms = req.body.symptoms;
  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: "Symptom list is required." });
  }

  const pythonProcess = spawn("python3", [
    "./archive/symptom_api.py",
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
  const { question, choices, user_answer, start_time } = req.body;
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
    qRec = await Question.create({ payload: { question, choices } });
    console.log(" Question created:", qRec.id);
  } catch (e) {
    console.warn("Question creation failed:", e);
  }

  // 3️⃣ Run the Python script
  const scriptPath    = path.join(__dirname, "../archive/api_mcq_inferrer.py");
  const payloadString = JSON.stringify({ question, choices, user_answer, start_time });
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
        sessionId:      session?.id,
        questionId:     qRec?.id,
        selectedOption: result.predicted,
        isCorrect:      result.correct,
        timeTaken:      result.time_taken
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


module.exports = {
  generateMiniQuiz,        
  searchTextbookConcept,   
  classifySymptoms,
  runPythonSymptomClassifier,
  generateFlashcards,
  classifyMCQ,
  createQuiz,
  listQuizzes,
  getQuiz
};
