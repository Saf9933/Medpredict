// __tests__/smoke.test.js
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app     = require('../server');

// ─── Health Check ─────────────────────────────────────────
test('GET /healthz returns status ok', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});

// ─── Flashcards ───────────────────────────────────────────
test('POST /api/flashcards returns parsed flashcards', async () => {
  const res = await request(app)
    .post('/api/flashcards')
    .send({ input: 'Hypertension;High blood pressure\nBradycardia;Slow heart rate' });
  expect(res.status).toBe(200);
  expect(res.body.flashcards).toHaveLength(2);
  expect(res.body.flashcards[0]).toHaveProperty('term', 'Hypertension');
  expect(res.body.flashcards[0]).toHaveProperty('definition', 'High blood pressure');
});

test('POST /api/flashcards rejects empty input', async () => {
  const res = await request(app)
    .post('/api/flashcards')
    .send({ input: '' });
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

test('POST /api/flashcards rejects missing body', async () => {
  const res = await request(app)
    .post('/api/flashcards')
    .send({});
  expect(res.status).toBe(400);
});

// ─── Symptom Classifier ──────────────────────────────────
test('POST /api/symptoms returns predictions for valid symptoms', async () => {
  const res = await request(app)
    .post('/api/symptoms')
    .send({ symptoms: ['headache', 'fever', 'cough'] });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('predictions');
  expect(res.body).toHaveProperty('precautions');
  expect(Array.isArray(res.body.predictions)).toBe(true);
});

test('POST /api/symptoms rejects non-array symptoms', async () => {
  const res = await request(app)
    .post('/api/symptoms')
    .send({ symptoms: 'headache' });
  expect(res.status).toBe(400);
});

test('POST /api/symptoms rejects empty array', async () => {
  const res = await request(app)
    .post('/api/symptoms')
    .send({ symptoms: [] });
  expect(res.status).toBe(400);
});

// ─── MCQ Classifier ──────────────────────────────────────
test('POST /api/mcq rejects incomplete choices', async () => {
  const res = await request(app)
    .post('/api/mcq')
    .send({
      question: 'What is hypertension?',
      choices: ['A', 'B'],  // only 2 instead of 4
    });
  expect(res.status).toBe(400);
});

test('POST /api/mcq rejects missing question', async () => {
  const res = await request(app)
    .post('/api/mcq')
    .send({
      choices: ['A', 'B', 'C', 'D'],
    });
  expect(res.status).toBe(400);
});

// ─── Quiz CRUD ────────────────────────────────────────────
test('GET /api/quizzes returns array', async () => {
  const res = await request(app).get('/api/quizzes');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('POST /api/quizzes rejects missing title', async () => {
  const res = await request(app)
    .post('/api/quizzes')
    .send({ questionIds: [] });
  expect(res.status).toBe(400);
});

// ─── Textbook RAG ─────────────────────────────────────────
test('POST /api/textbook/search-rag rejects missing fileId', async () => {
  const res = await request(app)
    .post('/api/textbook/search-rag')
    .send({ query: 'test' });
  expect(res.status).toBe(400);
});

test('POST /api/textbook/ask rejects missing query', async () => {
  const res = await request(app)
    .post('/api/textbook/ask')
    .send({ fileId: '00000000-0000-0000-0000-000000000000' });
  expect(res.status).toBe(400);
});

// ─── Simulation Run ──────────────────────────────────────
test('POST /api/simulation-runs rejects missing caseTitle', async () => {
  const res = await request(app)
    .post('/api/simulation-runs')
    .send({ timeline: [] });
  expect(res.status).toBe(400);
});

// ─── Auth Endpoints ──────────────────────────────────────
test('POST /api/auth/register creates a user and returns token', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123' });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('token');
  expect(res.body).toHaveProperty('userId');
});

test('POST /api/auth/register rejects duplicate email', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'dupe@example.com', password: 'password123' });
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'dupe@example.com', password: 'password123' });
  expect(res.status).toBe(409);
});

test('POST /api/auth/login succeeds with correct credentials', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'login@example.com', password: 'mypassword' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'login@example.com', password: 'mypassword' });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
});

test('POST /api/auth/login rejects wrong password', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'wrong@example.com', password: 'correctpass' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'wrong@example.com', password: 'wrongpass' });
  expect(res.status).toBe(401);
});

test('POST /api/auth/register rejects invalid email', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'not-an-email', password: 'password123' });
  expect(res.status).toBe(400);
});
