// __tests__/smoke.test.js
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app     = require('../server'); // this is your app, not the real listener

test('POST /api/flashcards responds 200', async () => {
  await request(app)
    .post('/api/flashcards')
    .send({ input: 'X;Y' })
    .expect(200);
});
