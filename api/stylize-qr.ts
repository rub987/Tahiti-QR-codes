import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function getAI() {
  const project = process.env.VERTEX_PROJECT;
  const location = process.env.VERTEX_LOCATION || 'us-central1';

  if (!project) throw new Error('VERTEX_PROJECT is not set');

  // If a service account JSON is provided as an env var, write it to a temp file
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const tmpPath = path.join(os.tmpdir(), 'gcp-sa.json');
    fs.writeFileSync(tmpPath, serviceAccountJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
  }

  return new GoogleGenAI({ vertexai: true, project, location });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { qrBase64, style } = req.body as { qrBase64?: string; style?: string };

  if (!qrBase64 || !style) {
    return res.status(400).json({ error: 'qrBase64 and style are required' });
  }

  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: {
        parts: [
          {
            inlineData: {
              data: qrBase64.split(',')[1],
              mimeType: 'image/png',
            },
          },
          {
            text: `STRICT SCANNABILITY REQUIREMENT: Transform this QR code into an artistic version in the style of ${style}.

CRITICAL RULES FOR FUNCTIONALITY:
1. FINDER PATTERNS (the 3 large corner squares): These MUST remain SOLID BLACK and PERFECTLY SQUARE. Do NOT add any faces, patterns, or textures inside the white or black parts of these three corners. They must be pure black and white.
2. CONTRAST: The background must be LIGHT and the QR modules (dots) must be DARK. Ensure a very high contrast ratio.
3. MODULE INTEGRITY: The small black squares (modules) must remain distinct and not bleed into each other.
4. NO DISTORTION: Keep the QR code as a perfect flat square. Do not apply 3D effects or perspective warps to the QR grid itself.
5. ARTISTIC INTEGRATION: You may add artistic elements (Polynesian patterns, Tiki motifs, flowers) AROUND the QR code and SUBTLY in the background, but they must not interfere with the readability of the black modules.
6. The final image MUST be scannable by a standard smartphone camera.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
      }
    }

    return res.status(500).json({ error: 'No image returned from Vertex AI' });
  } catch (err: any) {
    console.error('Vertex AI error:', err);
    return res.status(500).json({ error: err.message || 'Failed to stylize QR code' });
  }
}
