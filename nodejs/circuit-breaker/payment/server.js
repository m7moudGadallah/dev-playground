const express = require('express');
const morgan = require('morgan');
const { logger } = require('./utils');
const { api } = require('./api');

const app = express();

const { PORT } = process.env;

logger();
app.use(morgan('dev'));

app.use('/api', api);

app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}...`);
})