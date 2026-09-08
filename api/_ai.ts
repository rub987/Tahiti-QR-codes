import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';

export const getAI = () => {
  // Vertex AI — pour les modèles texte
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credPath = '/tmp/gcp-credentials.json';
    writeFileSync(credPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.VERTEX_PROJECT,
      location: process.env.VERTEX_LOCATION || 'us-central1',
    });
  }
  if (process.env.VERTEX_PROJECT) {
    return new GoogleGenAI({
      vertexai: true,
      project: process.env.VERTEX_PROJECT,
      location: process.env.VERTEX_LOCATION || 'us-central1',
    });
  }
  // Gemini API — pour les modèles image (gemini-2.0-flash-preview-image-generation)
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON, VERTEX_PROJECT, or GEMINI_API_KEY env vars.');
};
