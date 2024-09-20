import { Router } from 'express';
import { CustomModule } from '../common/utils';
import { BooksService } from './services';
import { BooksController } from './books.controller';

export class BooksModule extends CustomModule {
  private readonly controller;
  constructor(options: { providers: { booksService: BooksService } }) {
    super({
      path: '/api/v1/books',
    });
    const { providers } = options;

    this.controller = new BooksController(providers.booksService);
  }

  config(): Router {
    this.router.get('/', this.controller.getBooks);
    return this.router;
  }
}
