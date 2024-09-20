import { Request, Response, NextFunction } from 'express';
import { BooksService } from './services';
import { catchAsync } from '../common/utils';

export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  getBooks = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const books = await this.booksService.getBooks();
      res.status(200).json({
        status: 'success',
        data: {
          books,
          count: books.length,
        },
      });
    },
  );
}
