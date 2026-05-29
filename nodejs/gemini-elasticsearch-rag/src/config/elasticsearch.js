import { Client as ElasticClient } from '@elastic/elasticsearch';

const ELASTIC_NODE = process.env.ELASTIC_NODE || 'http://localhost:9200';

export const esClient = new ElasticClient({ 
  node: ELASTIC_NODE 
});

export async function initElk(indexName) {
  const indexExists = await esClient.indices.exists({ index: indexName });
  if (!indexExists) {
    await esClient.indices.create({
      index: indexName,
      mappings: {
        properties: {
          text: { type: 'text' },
          metadata: { type: 'keyword' },
          text_vector: { 
            type: 'dense_vector', 
            dims: 768, 
            similarity: 'cosine',
            index: true 
          }
        }
      }
    });
    console.log(`Index "${indexName}" with dense_vector mapping created.`);
  }
}
