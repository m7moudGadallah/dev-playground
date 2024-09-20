import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { GeneralController } from './general.controller';

export class GeneralModule extends CustomModule {
  constructor() {
    super({
      path: '/',
    });
  }

  config(): Router {
    const controller = new GeneralController();

    this.router.get('/', controller.ping);

    return this.router;
  }
}
