import express from 'express';
import { configService, mongooseService } from './dependency-registry';
import { AppModule } from './app.module';
import { preMiddlewareLoader, postMiddlewareLoader } from './common/utils';

const app = express();
const appModule = new AppModule();

const port: number = Number(configService.get('PORT'));

app.listen(port, async () => {
  await mongooseService.connect();
  console.log('MongoDB connected!');

  preMiddlewareLoader({ app });
  app.use(appModule.prefix, appModule.config());
  postMiddlewareLoader({ app, config: configService });

  console.log(`Server is up and running on port ${port}!`);
});
