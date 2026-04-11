import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';

export const getAI = () => {
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
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON and VERTEX_PROJECT env vars.');
};
