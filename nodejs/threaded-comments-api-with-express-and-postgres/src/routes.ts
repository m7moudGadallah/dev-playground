import { Express, Request, Response, NextFunction } from 'express';
import { PostgresDB } from './postgres-db';

export function mountRoutes(app: Express) {
  app.get(
    '/api/comments',
    async (req: Request, res: Response, next: NextFunction) => {
      const { prisma } = PostgresDB.getInstance();
      let comments: any[] = [];

      // Extract query parameters
      const postId = req.query.postId ? Number(req.query.postId) : undefined;
      const parentId = req.query.parentId
        ? Number(req.query.parentId)
        : undefined; // Default to null to fetch top-level comments
      const level = req.query.level ? Number(req.query.level) : undefined;
      const id = req.query.id ? Number(req.query.id) : undefined;

      console.log({ postId, parentId, level });
      try {
        // Recursive Common Table Expression (CTE) to fetch threaded comments
        comments = await prisma.threadedCommentView.findMany({
          where: {
            postId,
            parentId,
            level,
            id,
          },
          orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
        });

        res.status(200).json({
          status: 'success',
          data: {
            comments,
            count: comments.length,
          },
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: (error as Error).message,
          details: error,
        });
      }
    }
  );

  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
    });
  });
}
