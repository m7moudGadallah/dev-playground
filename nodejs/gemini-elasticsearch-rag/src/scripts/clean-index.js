import { esClient } from '../config/elasticsearch.js';

const INDEX_NAME = 'egyptian_food';

async function run() {
  try {
    console.log(`Checking if index "${INDEX_NAME}" exists...`);
    const exists = await esClient.indices.exists({ index: INDEX_NAME });
    
    if (exists) {
      console.log(`Deleting index "${INDEX_NAME}"...`);
      await esClient.indices.delete({ index: INDEX_NAME });
      console.log(`Index "${INDEX_NAME}" successfully deleted.`);
    } else {
      console.log(`Index "${INDEX_NAME}" does not exist. No action needed.`);
    }
  } catch (error) {
    console.error('Failed to delete index:', error);
  } finally {
    process.exit(0);
  }
}

run();
