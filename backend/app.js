// app.js
const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const routes      = require('./routes');
const { sequelize } = require('./models');

const app = express();

// CORS — restrict to known origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
];
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// Rate limiting — general: 100 req/min per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

// Stricter limit for expensive AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'AI endpoint rate limit reached. Please wait a moment.' },
});
app.set('aiLimiter', aiLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// only sync when NOT in test
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ alter: true })
    .then(() => console.log(' Database & tables ready'))
    .catch(e => console.error(' DB sync error:', e));
}

module.exports = app;
