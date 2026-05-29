import fs from 'fs';
import { getEmbedding } from '../config/gemini.js';
import { initFoodModel, ingestFood } from '../models/egyptianFoodModel.js';

async function run() {
  try {
    console.log('Connecting to Elasticsearch and verifying index...');
    await initFoodModel();

    console.log('Reading egyptian_food_data.json...');
    const dataPath = new URL('../data/egyptian_food_data.json', import.meta.url);
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const items = JSON.parse(rawData);

    console.log(`Starting ingestion of ${items.length} items...`);

    for (const item of items) {
      console.log(`Embedding & Indexing [${item.metadata}]...`);
      const vector = await getEmbedding(item.text);
      await ingestFood(item.text, item.metadata, vector);
    }

    console.log('All documents successfully indexed!');
  } catch (error) {
    console.error('Ingestion failed:', error);
  }
}

run();
