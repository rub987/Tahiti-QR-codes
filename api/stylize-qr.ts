import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAI } from './_ai.js';
import { stylizeQr } from './_qr.js';
import { getClientIp, rateLimit } from './_rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { allowed, retryAfter } = rateLimit(getClientIp(req.headers));
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: `Too many requests. Retry in ${retryAfter}s.` });
  }

  const { qrBase64, style } = req.body as { qrBase64?: string; style?: string };
  if (!qrBase64 || !style) {
    return res.status(400).json({ error: 'qrBase64 and style are required' });
  }

  try {
    const image = await stylizeQr(getAI(), qrBase64, style);
    return res.json({ image });
  } catch (err: any) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate QR code' });
  }
}
