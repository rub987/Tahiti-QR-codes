import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';

/**
 * AI client for image generation (Imagen 4).
 *
 * Uses Vertex AI so that model access is governed by the GCP project + region,
 * not the caller's country — the Gemini API (Google AI Studio) is geo-restricted
 * by the account's country and is unavailable in some territories.
 *
 * Priority: service-account JSON → VERTEX_PROJECT (ADC) → GEMINI_API_KEY fallback.
 */
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
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON, VERTEX_PROJECT, or GEMINI_API_KEY env vars.');
};
