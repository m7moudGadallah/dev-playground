import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { mountRoutes } from './mount-routes';

const PORT = Number(process.env?.PORT);
const NODE_ENV = process.env?.NODE_ENV;

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse Request body
app.use(express.json());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.listen(PORT, async () => {
  mountRoutes(app);
  console.log(`App is up and running in ${NODE_ENV} mode on port ${PORT}!`);
});
