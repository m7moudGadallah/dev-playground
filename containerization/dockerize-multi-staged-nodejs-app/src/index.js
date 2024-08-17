const express = require('express');

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const app = express();

app.get('/', (_, res) => res.send('<h1>Hello World!</h1>'));

app.listen(PORT, () =>
  console.log(
    `App is up and running at ${NODE_ENV} environment, and listening on port ${PORT}🚀`
  )
);
