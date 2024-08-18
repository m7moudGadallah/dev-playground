const express = require('express');
const { createClient } = require('redis');

const PORT = process.env.PORT || 3000; // Default port if not specified in .env
const REDIS_URL = process.env.REDIS_URL;

// Create Express App
const app = express();

// Create Redis Client
const redisClient = createClient({
  url: REDIS_URL,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Set default route
app.get('/', (_, res) => {
  res.status(200).json({ success: true, message: 'App is up and running' });
});

// Add tag
app.post('/tags', async (req, res) => {
  const { tag } = req.body;

  if (!tag) {
    res
      .status(400)
      .json({ success: false, message: '"tag" field is required' });
  }

  try {
    await redisClient.sAdd('tags', tag);
    res.status(200).json({ success: true, message: `Tag "${tag}" added` });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error adding tag', error });
  }
});

// Get tags
app.get('/tags', async (req, res) => {
  const { prefix } = req.query;

  let tags = [];

  try {
    tags = await redisClient.sMembers('tags');

    if (prefix) {
      tags = tags.filter((tag) => tag.startsWith(prefix));
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error retrieving tags', error });
  }

  res.status(200).json({
    success: true,
    tags,
  });
});

// Delete tag
app.delete('/tags/:tag', async (req, res) => {
  const { tag } = req.params;

  if (!tag) {
    return res.status(400).json({ success: false, message: 'Tag is required' });
  }

  try {
    const removed = await redisClient.sRem('tags', tag);

    if (removed === 0) {
      return res
        .status(404)
        .json({ success: false, message: `Tag "${tag}" not found` });
    }

    res.status(200).json({ success: true, message: `Tag "${tag}" deleted` });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error deleting tag', error });
  }
});

// Start the server and connect to Redis
app.listen(PORT, async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis!');
  } catch (error) {
    console.error('Failed to connect to Redis', error);
  }

  console.log(`App is up and running on port ${PORT} 🚀`);
});
