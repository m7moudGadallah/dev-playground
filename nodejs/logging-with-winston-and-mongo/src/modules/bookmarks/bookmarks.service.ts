import { Bookmark } from './interfaces';
import { BookmarkModel } from './bookmarks.model';

export class BookmarksService {
  constructor(private readonly bookmarksModel: typeof BookmarkModel) {}

  getBookmarks(): Promise<Bookmark[]> {
    return this.bookmarksModel.find();
  }

  createBookmark(data: Bookmark): Promise<Bookmark> {
    return this.bookmarksModel.create(data);
  }
}
