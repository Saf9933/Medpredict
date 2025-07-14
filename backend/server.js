// server.js
const app  = require('./app');
const PORT = process.env.PORT || 5032;

// only listen when NOT in test
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(` Server listening at http://localhost:${PORT}`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} in use — choose another via PORT env var.`);
      process.exit(1);
    }
    console.error(err);
  });
}

// export app (not the server) for Supertest
module.exports = app;
