const express = require('express');

const PORT = process.env.PORT;
const app = express();

app.get('/', (_, res) => res.send('<h1>Hello World!</h1>'));

app.listen(PORT, () => console.log(`app is up and running on port: ${PORT}`));
