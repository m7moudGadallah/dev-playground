import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { Request, Response } from 'express';
import { BookmarksModule } from './bookmarks/bookmarks.module';

export class AppModule extends CustomModule {
  private modules: { [key: string]: CustomModule };

  constructor() {
    super({
      path: '/',
    });

    this.modules = {
      BookmarksModule: new BookmarksModule(),
    };
  }

  public configModule(): Router {
    for (const module of Object.values(this.modules)) {
      this.router.use(module.prefix, module.configModule());
    }

    this.router.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
      });
    });
    return this.router;
  }
}
