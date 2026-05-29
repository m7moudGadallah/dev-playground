import { GoogleGenAI } from '@google/genai';

export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

export async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: {
      outputDimensionality: 768
    }
  });
  return response.embeddings[0].values;
}

export async function generateAnswer(contexts, question) {
  const systemPrompt = `You are an expert AI assistant. Answer the user's question accurately using ONLY the provided contexts. If the answer cannot be found in the context, politely state that you don't know.\n\n`;
  const contextBlock = `--- CONTEXT ---\n${contexts.join('\n\n')}\n--------------\n\n`;
  const userQueryBlock = `User Question: ${question}\nAnswer:`;

  const fullPrompt = `${systemPrompt}${contextBlock}${userQueryBlock}`;

  const generationResult = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt
  });

  return generationResult.text;
}
