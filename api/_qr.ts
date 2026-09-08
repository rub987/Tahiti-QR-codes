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

const CANVAS = 1024; // final output size
const PANEL = 820; // white rounded card behind the QR (guarantees quiet zone + contrast)
const QR = 720; // QR size — centered on the panel

/**
 * Generate an artistic background and composite the QR on a clean white rounded
 * card in the center. The artwork frames the card; the card guarantees the QR
 * modules keep full black-on-white contrast and an intact quiet zone, so the
 * code stays reliably scannable (decorations can't bleed onto the modules).
 */
export async function stylizeQr(ai: GoogleGenAI, qrBase64: string, style: string): Promise<string> {
  const backgroundBuffer = await generateBackground(ai, style);
  const bg = await sharp(backgroundBuffer).resize(CANVAS, CANVAS).toBuffer();

  const panel = Buffer.from(
    `<svg width="${PANEL}" height="${PANEL}"><rect width="${PANEL}" height="${PANEL}" rx="56" ry="56" fill="white"/></svg>`,
  );

  const qrBuffer = Buffer.from(qrBase64.split(',')[1], 'base64');
  const qr = await sharp(qrBuffer)
    .resize(QR, QR)
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toBuffer();

  const result = await sharp(bg)
    .composite([
      { input: panel, gravity: 'center' },
      { input: qr, gravity: 'center' },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${result.toString('base64')}`;
}
