import sharp from 'sharp';
import type { GoogleGenAI } from '@google/genai';

// Overridable via the IMAGE_MODEL env var (no code change needed to switch models).
// The gen-lang-client project has access to Gemini image models (Nano Banana) but
// NOT to the Imagen publisher models on Vertex, so we use gemini-2.5-flash-image
// via generateContent (not the Imagen-only generateImages API).
const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-2.5-flash-image';

const backgroundPrompt = (style: string) => `Generate a high-quality artistic background image (square, 1:1) for a QR code, style: ${style}.
Inspired by the beauty of Tahiti and French Polynesia — turquoise lagoons, tropical flowers, Polynesian patterns, lush vegetation.
The image must have a clean, uncluttered CENTER area (about 60% of the image) with soft colors or subtle textures — this is where the QR code will be placed.
The artistic elements (hibiscus flowers, Polynesian motifs, waves) should be concentrated around the EDGES and CORNERS.
High contrast between light areas and decorative elements. No text, no letters, no watermarks, no people, no faces.`;

/** Generate an artistic Tahiti-themed background image (Gemini image model, via generateContent). */
export async function generateBackground(ai: GoogleGenAI, style: string): Promise<Buffer> {
  const r = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: backgroundPrompt(style),
    config: { responseModalities: ['IMAGE'] },
  });

  const parts = r.candidates?.[0]?.content?.parts ?? [];
  const inline = parts.find((p: any) => p.inlineData?.data)?.inlineData;
  if (!inline?.data) throw new Error(`No image returned by ${IMAGE_MODEL}`);

  return Buffer.from(inline.data, 'base64');
}

/**
 * Generate a background and composite the QR code on top of it.
 * The QR (white background, black modules) is blended with `multiply`, so white
 * areas let the artwork show through while the dark modules stay scannable.
 */
export async function stylizeQr(ai: GoogleGenAI, qrBase64: string, style: string): Promise<string> {
  const backgroundBuffer = await generateBackground(ai, style);
  const bg = await sharp(backgroundBuffer).resize(1024, 1024).toBuffer();

  const qrBuffer = Buffer.from(qrBase64.split(',')[1], 'base64');
  const qr = await sharp(qrBuffer)
    .resize(800, 800)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toBuffer();

  const result = await sharp(bg)
    .composite([{ input: qr, blend: 'multiply', gravity: 'center' }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${result.toString('base64')}`;
}
