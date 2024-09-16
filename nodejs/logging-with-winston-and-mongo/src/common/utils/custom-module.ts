import { Router } from 'express';

export interface CustomModuleOptions {
  path: string;
}

export abstract class CustomModule {
  protected path: string;
  protected router: Router;

  constructor(options: CustomModuleOptions) {
    const { path } = options;
    this.path = path;
    this.router = Router();
  }

  public abstract configModule(): Router;

  get prefix(): string {
    return this.path;
  }

  get routes(): Router {
    return this.router;
  }

  get providers(): { [key: string]: any } {
    return {};
  }
}
