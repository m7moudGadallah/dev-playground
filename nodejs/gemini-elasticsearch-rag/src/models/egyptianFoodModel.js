import { esClient, initElk } from '../config/elasticsearch.js';

const INDEX_NAME = 'egyptian_food';

export async function initFoodModel() {
  await initElk(INDEX_NAME);
}

export async function ingestFood(text, metadata, vector) {
  const result = await esClient.index({
    index: INDEX_NAME,
    document: {
      text,
      metadata: metadata || 'general',
      text_vector: vector
    },
    refresh: 'wait_for'
  });
  return result;
}

export async function searchFood(queryVector, size = 3) {
  const searchResponse = await esClient.search({
    index: INDEX_NAME,
    size: size,
    query: {
      knn: {
        field: 'text_vector',
        query_vector: queryVector,
        k: 5
      }
    }
  });
  return searchResponse.hits.hits.map(hit => hit._source.text);
}
