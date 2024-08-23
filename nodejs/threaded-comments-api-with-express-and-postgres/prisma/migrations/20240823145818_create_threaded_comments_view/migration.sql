-- 20240824_create_threaded_comments_view.sql

-- Drop the view if it already exists
DROP VIEW IF EXISTS threaded_comments_vw;

-- Create the threaded comments view
CREATE VIEW threaded_comments_vw AS
  WITH RECURSIVE threaded AS (
    SELECT 
      c1.id,
      c1.message,
      c1."postId",
      c1."parentId",
      c1."createdAt",
      c1."updatedAt",
      0 AS level -- Root level
    FROM comments c1
    WHERE c1."parentId" IS NULL -- Start with top-level comments
    UNION ALL
    SELECT 
      c2.id,
      c2.message,
      c2."postId",
      c2."parentId",
      c2."createdAt",
      c2."updatedAt",
      threaded.level + 1 AS level
    FROM comments c2
    INNER JOIN threaded ON c2."parentId" = threaded.id
  )
  SELECT * FROM threaded;