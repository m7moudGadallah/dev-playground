import express from 'express';
import {
  ConfigService,
  HttpRequestLoggerService,
  MongooseService,
} from './common/services';
import { AppModule } from './modules/app.module';
// import morgan from 'morgan';
import {
  GlobalExceptionHandlerMiddleware,
  GlobalLoggerMiddleware,
  RequestIdGeneratorMiddleware,
} from './common/middlewares';

const app = express();
const config = ConfigService.getInstance();
const httpRequestLogger = new HttpRequestLoggerService(config);
const exceptionHandler = new GlobalExceptionHandlerMiddleware();
const globalLoggerMiddleware = new GlobalLoggerMiddleware(httpRequestLogger);
const requestIdGenerator = new RequestIdGeneratorMiddleware();
const port = parseInt(config.get('PORT'));

function loadPreMiddlewares(): void {
  app.use(express.json());
  app.use(requestIdGenerator.generate);
  app.use(globalLoggerMiddleware.log);
  // app.use(morgan('dev'));
}

function loadPostMiddlewares(): void {
  app.use(exceptionHandler.handle);
}

app.listen(port, async () => {
  await new MongooseService().connect(config);
  console.log('Connected to MongoAppDB');
  const appModule = new AppModule();
  loadPreMiddlewares();
  app.use(appModule.configModule());
  loadPostMiddlewares();
  console.log(`App is up and running on port ${port}!`);
});
