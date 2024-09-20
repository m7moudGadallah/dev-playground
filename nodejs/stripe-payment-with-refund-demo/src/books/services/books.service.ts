import { Book, BookModel } from '../interfaces';

interface BooksServiceOptions {
  models: {
    book: BookModel;
  };
}

export class BooksService {
  private readonly models: BooksServiceOptions['models'];

  constructor(options: BooksServiceOptions) {
    const { models } = options;
    this.models = models;
  }

  getBooks(): Promise<Partial<Book>[]> {
    return this.models.book.find().select({
      __v: false,
    });
  }
}
