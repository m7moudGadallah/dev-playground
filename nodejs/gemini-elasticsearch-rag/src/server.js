import express from 'express';
import morgan from 'morgan';
import { getEmbedding, generateAnswer } from './config/gemini.js';
import { initFoodModel, ingestFood, searchFood } from './models/egyptianFoodModel.js';

const app = express();
app.use(morgan('dev'));
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint A: Ingest / Chunk data and store vectors
app.post('/api/ingest', async (req, res) => {
  try {
    const { text, metadata } = req.body;
    if (!text) return res.status(400).json({ error: 'Text field is required' });

    const vector = await getEmbedding(text);
    const result = await ingestFood(text, metadata, vector);

    res.json({ success: true, docId: result._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint B: Query & RAG Pipeline
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    // Step 1: Embed the user's query
    const queryVector = await getEmbedding(question);

    // Step 2 & 3: Query Elasticsearch using kNN & get matching raw text contexts
    const contexts = await searchFood(queryVector, 3);
    
    if (contexts.length === 0) {
      return res.json({ answer: "I couldn't find any matching information in my knowledge base to answer your question." });
    }

    // Step 4 & 5: Ask Gemini using context and question
    const answer = await generateAnswer(contexts, question);

    res.json({
      answer,
      sourcesUsed: contexts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initFoodModel().catch(console.error);
  console.log(`RAG backend listening on port ${PORT}`);
});
