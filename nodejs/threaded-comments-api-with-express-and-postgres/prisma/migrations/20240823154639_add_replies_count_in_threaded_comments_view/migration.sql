-- 20240823154639_add_replies_count_in_threaded_comments_view.sql

-- Drop the view if it already exists
DROP VIEW IF EXISTS threaded_comments_vw;

-- Create the threaded comments view
CREATE VIEW threaded_comments_vw AS
  WITH RECURSIVE reply_counts AS (
    -- Compute the count of direct replies for each comment
    SELECT 
      c."parentId" AS commentId,
      COUNT(*) AS replies_count
    FROM comments c
    GROUP BY c."parentId"
  ),
  threaded AS (
    -- Base case: Select root comments
    SELECT 
      c1.id,
      c1.message,
      c1."postId",
      c1."parentId",
      c1."createdAt",
      c1."updatedAt",
      0 AS level, -- Root level
      COALESCE(rc.replies_count, 0) AS replies_count
    FROM comments c1
    LEFT JOIN reply_counts rc ON c1.id = rc.commentId
    WHERE c1."parentId" IS NULL -- Start with top-level comments
    UNION ALL
    -- Recursive case: Select child comments and their replies
    SELECT 
      c2.id,
      c2.message,
      c2."postId",
      c2."parentId",
      c2."createdAt",
      c2."updatedAt",
      threaded.level + 1 AS level,
      COALESCE(rc.replies_count, 0) AS replies_count
    FROM comments c2
    INNER JOIN threaded ON c2."parentId" = threaded.id
    LEFT JOIN reply_counts rc ON c2.id = rc.commentId
  )
  SELECT
    id,
    message,
    "postId",
    "parentId",
    "createdAt",
    "updatedAt",
    level,
    replies_count AS "repliesCount"
  FROM threaded;
