// app.js
const express   = require('express');
const cors      = require('cors');
const routes    = require('./routes');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// only sync when NOT in test
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync({ force: true })
    .then(() => console.log(' Database & tables ready'))
    .catch(e => console.error(' DB sync error:', e));
}

module.exports = app;

