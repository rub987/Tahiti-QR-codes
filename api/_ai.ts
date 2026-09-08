import { GoogleGenAI } from '@google/genai';

/**
 * Client for image generation via the Gemini API (Google AI Studio).
 *
 * Imagen 4 (imagen-4.0-generate-001) is available here, unlike the auto-created
 * `gen-lang-client-*` Vertex AI projects, which return 404 NOT_FOUND for the
 * Imagen publisher models. Requires a GEMINI_API_KEY from https://aistudio.google.com/apikey.
 */
export const getImageAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is required for image generation.');
  return new GoogleGenAI({ apiKey });
};
