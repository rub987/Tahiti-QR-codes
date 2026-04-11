import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const getAI = () => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
  }

  return new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });
};

// Stylize a QR code with an artistic style using Vertex AI image generation
app.post('/api/stylize-qr', async (req, res) => {
  const { qrBase64, style } = req.body;

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
          2. CONTRAST: The background must be LIGHT and the QR modules (dots) must be DARK. Ensure a very high contrast ratio. If the style is "wood" or "dark", use a light-colored wood or a brightened version of the texture.
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
});

// Generate an artistic background image
app.post('/api/generate-background', async (req, res) => {
  const { style, description } = req.body;

  if (!style) {
    return res.status(400).json({ error: 'style is required' });
  }

  try {
    const ai = getAI();

    const prompt = `A high-quality, artistic and elegant background image for a QR code.
  Style: ${style}.
  Description: ${description || ''}.
  The image should be visually stunning, reflecting the beauty of Tahiti, with a central area that is relatively clean to allow a QR code to be placed on top.
  Avoid text or complex small details in the very center.
  Make it look like a professional branding asset.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
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
    return res.status(500).json({ error: err.message || 'Failed to generate background' });
  }
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Vertex AI server running on http://localhost:${PORT}`);
});
