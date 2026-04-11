import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAI } from './_ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { style, description } = req.body as { style?: string; description?: string };

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
        imageConfig: { aspectRatio: '1:1' },
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
}
