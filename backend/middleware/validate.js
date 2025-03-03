const Joi = require('joi');

// Reusable validation middleware factory
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({ error: 'Validation failed', details: messages });
    }
    next();
  };
}

// ─── Schemas ────────────────────────────────────────────

const symptomsSchema = Joi.object({
  symptoms: Joi.array().items(Joi.string().trim().max(100)).min(1).max(20).required(),
});

const flashcardsSchema = Joi.object({
  input: Joi.string().trim().min(1).max(10000).required(),
});

const mcqSchema = Joi.object({
  question: Joi.string().trim().min(1).max(2000).required(),
  choices: Joi.array().items(Joi.string().trim().min(1).max(500)).length(4).required(),
  user_answer: Joi.string().trim().max(10).optional().allow('', null),
  start_time: Joi.number().optional(),
  include_attention: Joi.boolean().optional(),
});

const createQuizSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  questionIds: Joi.array().items(Joi.string().uuid()).min(1).max(100).required(),
});

const textbookSearchSchema = Joi.object({
  fileId: Joi.string().trim().uuid().required(),
  query: Joi.string().trim().min(1).max(500).required(),
});

const textbookQuizSchema = Joi.object({
  fileId: Joi.string().trim().uuid().required(),
  topic: Joi.string().trim().max(500).optional().allow('', null),
});

const simulationRunSchema = Joi.object({
  caseTitle: Joi.string().trim().min(1).max(200).required(),
  timeline: Joi.array().max(200).required(),
  score: Joi.number().optional(),
  maxScore: Joi.number().optional(),
  grade: Joi.string().max(10).optional().allow('', null),
  elapsedSeconds: Joi.number().optional(),
  timerExpired: Joi.boolean().optional(),
  diagnosis: Joi.string().max(500).optional().allow('', null),
  diagnosisMatch: Joi.boolean().optional(),
});

const feedbackSchema = Joi.object({
  timeline: Joi.array().max(200).required(),
  prompt: Joi.string().trim().min(1).max(5000).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).max(128).required(),
});

module.exports = {
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
};
