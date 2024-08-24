import express from 'express';
import morgan from 'morgan';
import { mountRoutes } from './routes';
import { PostgresDB } from './postgres-db';

const PORT = Number(process.env.PORT);

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.listen(PORT, async () => {
  // Connect to prisma
  try {
    await PostgresDB.getInstance().connect();
    console.log('Postgres connected!');
  } catch (error) {
    console.error("Can't connect to postgres: ", error);
    process.exit(1);
  }
  mountRoutes(app);
  console.log(`App is up and running on port ${PORT}!`);
});
