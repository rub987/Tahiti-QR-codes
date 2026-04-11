// Calls the local Express server which uses Vertex AI for image generation.

export const generateArtisticBackground = async (style: string, description: string): Promise<string> => {
  const res = await fetch('/api/generate-background', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ style, description }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate background');
  }

  const data = await res.json();
  return data.image;
};

export const stylizeQRCode = async (qrBase64: string, style: string): Promise<string> => {
  const res = await fetch('/api/stylize-qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrBase64, style }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to stylize QR code');
  }

  const data = await res.json();
  return data.image;
};
