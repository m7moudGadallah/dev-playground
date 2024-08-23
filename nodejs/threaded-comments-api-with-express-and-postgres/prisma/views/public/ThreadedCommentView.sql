WITH RECURSIVE reply_counts AS (
  SELECT
    c."parentId" AS commentid,
    count(*) AS replies_count
  FROM
    comments c
  GROUP BY
    c."parentId"
),
threaded AS (
  SELECT
    c1.id,
    c1.message,
    c1."postId",
    c1."parentId",
    c1."createdAt",
    c1."updatedAt",
    0 AS LEVEL,
    COALESCE(rc.replies_count, (0) :: bigint) AS replies_count
  FROM
    (
      comments c1
      LEFT JOIN reply_counts rc ON ((c1.id = rc.commentid))
    )
  WHERE
    (c1."parentId" IS NULL)
  UNION
  ALL
  SELECT
    c2.id,
    c2.message,
    c2."postId",
    c2."parentId",
    c2."createdAt",
    c2."updatedAt",
    (threaded_1.level + 1) AS LEVEL,
    COALESCE(rc.replies_count, (0) :: bigint) AS replies_count
  FROM
    (
      (
        comments c2
        JOIN threaded threaded_1 ON ((c2."parentId" = threaded_1.id))
      )
      LEFT JOIN reply_counts rc ON ((c2.id = rc.commentid))
    )
)
SELECT
  id,
  message,
  "postId",
  "parentId",
  "createdAt",
  "updatedAt",
  LEVEL,
  replies_count AS "repliesCount"
FROM
  threaded;