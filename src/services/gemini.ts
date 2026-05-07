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
