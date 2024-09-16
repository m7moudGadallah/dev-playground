import { Request, Response, NextFunction } from 'express';
import { BookmarksService } from './bookmarks.service';

export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookmarks = await this.bookmarksService.getBookmarks();

      res.status(200).json({
        status: 'success',
        data: {
          bookmarks,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookmark = await this.bookmarksService.createBookmark(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          bookmark,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
