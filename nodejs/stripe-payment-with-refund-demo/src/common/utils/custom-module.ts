import { Router } from 'express';

interface CustomModuleOptions {
  path: string;
}

export abstract class CustomModule {
  protected path: string;
  protected router: Router;

  constructor(options: CustomModuleOptions) {
    const { path } = options;
    this.path = path;
    this.router = Router();
    this.router.route(path);
  }

  get prefix() {
    return this.path;
  }

  abstract config(): Router;
}
