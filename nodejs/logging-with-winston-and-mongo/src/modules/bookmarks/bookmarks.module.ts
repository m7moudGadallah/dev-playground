import { Router } from 'express';
import { CustomModule } from '../../common/utils';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarkModel } from './bookmarks.model';

interface ExportedProviders {}

interface ModuleProviders {
  bookmarksService: BookmarksService;
}

interface ModuleControllers {
  bookmarksController: BookmarksController;
}

export class BookmarksModule extends CustomModule {
  private _providers: ModuleProviders;
  private controllers: ModuleControllers;

  constructor() {
    super({
      path: '/api/v1/bookmarks',
    });

    this._providers = {
      bookmarksService: new BookmarksService(BookmarkModel),
    };
    this.controllers = {
      bookmarksController: new BookmarksController(
        this._providers.bookmarksService,
      ),
    };
  }

  public configModule(): Router {
    this.router
      .route('/')
      .get(this.controllers.bookmarksController.getBookmarks)
      .post(this.controllers.bookmarksController.createBookmark);
    return this.router;
  }

  get providers(): ExportedProviders {
    return {};
  }
}
