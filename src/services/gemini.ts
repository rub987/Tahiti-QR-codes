import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const generateArtisticBackground = async (style: string, description: string) => {
  const ai = getAI();
  if (!ai) throw new Error("API Key missing");

  const prompt = `A high-quality, artistic and elegant background image for a QR code. 
  Style: ${style}. 
  Description: ${description}. 
  The image should be visually stunning, reflecting the beauty of Tahiti, with a central area that is relatively clean to allow a QR code to be placed on top. 
  Avoid text or complex small details in the very center. 
  Make it look like a professional branding asset.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};

export const stylizeQRCode = async (qrBase64: string, style: string) => {
  const ai = getAI();
  if (!ai) throw new Error("API Key missing");

  // This uses the image-to-image capability to "re-imagine" the QR code
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: qrBase64.split(',')[1],
            mimeType: "image/png",
          },
        },
        {
          text: `Transform this QR code into a beautiful artistic piece in the style of ${style}. 
          Keep the overall square structure and the three large corner squares (position markers) clearly visible so it remains scannable. 
          Integrate Polynesian patterns, tropical flowers, or local textures into the modules of the QR code. 
          The result should be an artistic QR code that works.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to stylize QR code");
};
