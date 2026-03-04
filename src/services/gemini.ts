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
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to stylize QR code");
};
