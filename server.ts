import express from 'express';
import dotenv from 'dotenv';
import { getImageAI } from './api/_ai.js';
import { stylizeQr } from './api/_qr.js';
import { getClientIp, rateLimit } from './api/_rateLimit.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/stylize-qr', async (req, res) => {
  const { allowed, retryAfter } = rateLimit(getClientIp(req.headers));
  if (!allowed) {
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: `Too many requests. Retry in ${retryAfter}s.` });
  }

  const { qrBase64, style } = req.body;
  if (!qrBase64 || !style) return res.status(400).json({ error: 'qrBase64 and style are required' });

  try {
    const image = await stylizeQr(getImageAI(), qrBase64, style);
    return res.json({ image });
  } catch (err: any) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to stylize QR code' });
  }
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => console.log(`Dev API server running on http://localhost:${PORT}`));
