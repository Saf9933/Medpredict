const { Sequelize, DataTypes } = require('sequelize');
const fs   = require('fs');
const path = require('path');

// 1️⃣ Ensure the `data/` directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 2️⃣ Configure Sequelize for on-disk SQLite
const sequelize = new Sequelize({
  dialect:  'sqlite',
  storage: path.join(dataDir, 'medpredict.sqlite'),
  logging: false,
});

// 3️⃣ Define all models

const Session = sequelize.define('Session', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  start_time:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  end_time:    { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'sessions',
  timestamps: false,
});

const Question = sequelize.define('Question', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text:          { type: DataTypes.TEXT, allowNull: false },
  correct_label: { type: DataTypes.STRING, allowNull: true  },
  category:      { type: DataTypes.STRING, allowNull: true  },
}, {
  tableName: 'questions',
  timestamps: false,
});

const QuestionOption = sequelize.define('QuestionOption', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  question_id:   { type: DataTypes.UUID, allowNull: false },
  label:         { type: DataTypes.STRING, allowNull: false },
  text:          { type: DataTypes.TEXT,   allowNull: false },
}, {
  tableName: 'question_options',
  timestamps: false,
});
// 1) Define Quiz
const Quiz = sequelize.define('Quiz', {
  id:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName:  'quizzes',
  timestamps: false,
});

// 2) Define QuizQuestion
const QuizQuestion = sequelize.define('QuizQuestion', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quiz_id:      { type: DataTypes.UUID, allowNull: false },
  question_id:  { type: DataTypes.UUID, allowNull: false },
  order:        { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName:  'quiz_questions',
  timestamps: false,
});

const Response = sequelize.define('Response', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  quiz_id:        { type: DataTypes.UUID, allowNull: true },
  session_id:     { type: DataTypes.UUID, allowNull: false },
  question_id:    { type: DataTypes.UUID, allowNull: false },
  selected_label: { type: DataTypes.STRING,  allowNull: false },
  is_correct:     { type: DataTypes.BOOLEAN, allowNull: false },
  time_taken:     { type: DataTypes.FLOAT,   allowNull: false },
  created_at:     { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, {
  tableName: 'responses',
  timestamps: false,
});

const FlashcardSession = sequelize.define('FlashcardSession', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  session_id:  { type: DataTypes.UUID, allowNull: false },
  start_time:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  end_time:    { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'flashcard_sessions',
  timestamps: false,
});

const FlashcardInteraction = sequelize.define('FlashcardInteraction', {
  id:                    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  flashcard_session_id:  { type: DataTypes.UUID, allowNull: false },
  term:                  { type: DataTypes.STRING, allowNull: false },
  user_says_memorized:   { type: DataTypes.BOOLEAN, allowNull: true  },
  time_taken:            { type: DataTypes.FLOAT,   allowNull: false },
}, {
  tableName: 'flashcard_interactions',
  timestamps: false,
});

const Simulation = sequelize.define('Simulation', {
  id:   { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'simulations',
  timestamps: false,
});

const SimulationStep = sequelize.define('SimulationStep', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  simulation_id: { type: DataTypes.UUID, allowNull: false },
  step_order:    { type: DataTypes.INTEGER, allowNull: false },
  prompt:        { type: DataTypes.TEXT,    allowNull: true  },
  options:       { type: DataTypes.JSON,    allowNull: true  },
}, {
  tableName: 'simulation_steps',
  timestamps: false,
});

const SimulationRun = sequelize.define('SimulationRun', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  simulation_id:  { type: DataTypes.UUID, allowNull: false },
  session_id:     { type: DataTypes.UUID, allowNull: false },
  timeline:       { type: DataTypes.JSON, allowNull: true  },
  gpt_response:   { type: DataTypes.JSON, allowNull: true  },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'simulation_runs',
  timestamps: false,
});

const ApiLog = sequelize.define('ApiLog', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  endpoint:    { type: DataTypes.STRING,  allowNull: false },
  status_code: { type: DataTypes.INTEGER, allowNull: false },
  duration_ms: { type: DataTypes.INTEGER, allowNull: false },
  created_at:  { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, {
  tableName: 'api_logs',
  timestamps: false,
});

// Link Quiz ↔ QuizQuestion
Quiz.hasMany(QuizQuestion,   { foreignKey: 'quiz_id',     onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id'               });

// Link Question ↔ QuizQuestion
Question.hasMany(QuizQuestion,   { foreignKey: 'question_id', onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Question, { foreignKey: 'question_id'         });

// MCQ flow
Question.hasMany(QuestionOption,     { foreignKey: 'question_id', onDelete: 'CASCADE' });
QuestionOption.belongsTo(Question,   { foreignKey: 'question_id' });

Session.hasMany(Response,            { foreignKey: 'session_id',   onDelete: 'CASCADE' });
Response.belongsTo(Session,          { foreignKey: 'session_id'       });

Question.hasMany(Response,           { foreignKey: 'question_id',    onDelete: 'CASCADE' });
Response.belongsTo(Question,         { foreignKey: 'question_id'       });

// Flashcards
Session.hasMany(FlashcardSession,    { foreignKey: 'session_id',     onDelete: 'CASCADE' });
FlashcardSession.belongsTo(Session,  { foreignKey: 'session_id'       });
FlashcardSession.hasMany(FlashcardInteraction, { foreignKey: 'flashcard_session_id', onDelete: 'CASCADE' });
FlashcardInteraction.belongsTo(FlashcardSession, { foreignKey: 'flashcard_session_id' });

// Simulation
Simulation.hasMany(SimulationStep,   { foreignKey: 'simulation_id',  onDelete: 'CASCADE' });
SimulationStep.belongsTo(Simulation, { foreignKey: 'simulation_id'       });

Session.hasMany(SimulationRun,       { foreignKey: 'session_id',     onDelete: 'CASCADE' });
SimulationRun.belongsTo(Session,     { foreignKey: 'session_id'       });
Simulation.hasMany(SimulationRun,    { foreignKey: 'simulation_id',  onDelete: 'CASCADE' });
SimulationRun.belongsTo(Simulation,  { foreignKey: 'simulation_id'    });

// API Logs: no FKs

// 5️⃣ Sync & export
sequelize.sync()
  .then(() => console.log(' Database synced!'))
  .catch(e => console.error(' Sync error:', e));

  module.exports = {
    sequelize,
    Session,
    Question,
    QuestionOption,
    Response,
    FlashcardSession,
    FlashcardInteraction,
    Simulation,
    SimulationStep,
    SimulationRun,
    ApiLog,
    Quiz,           
    QuizQuestion,   
  };