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
${description ? `Description: ${description}.` : ''}
Inspired by the beauty of Tahiti and French Polynesia.
The image should be visually stunning with a clean central area to allow a QR code to be placed on top.
No text, no watermarks.`;

    const negativePrompt = 'text, words, letters, watermark, logo, people, faces, dark center, busy center';

    const r = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        negativePrompt,
      },
    });

    const imageBytes = r.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) throw new Error('No image generated');

    const base64 = typeof imageBytes === 'string'
      ? imageBytes
      : Buffer.from(imageBytes).toString('base64');

    return res.json({ image: `data:image/png;base64,${base64}` });
  } catch (err: any) {
    console.error('Imagen error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate background' });
  }
}
