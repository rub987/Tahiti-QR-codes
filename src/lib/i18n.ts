export type Lang = 'fr' | 'en';

export type StyleId = 'watercolor' | 'tattoo' | 'tropical' | 'landscape' | 'tiki';

type StyleCopy = { name: string; description: string };

export type Translation = {
  headingPre: string;
  headingEm1: string;
  headingMid: string;
  headingEm2: string;
  headingPost: string;
  subtitle: string;
  urlLabel: string;
  urlPlaceholder: string;
  styleLabel: string;
  customLabel: string;
  customPlaceholder: string;
  generate: string;
  exampleTag: string;
  exampleTitle: string;
  resultTitle: string;
  resultSubtitle: string;
  loading: string;
  restart: string;
  download: string;
  note: string;
  tip: string;
  genError: string;
  footer: string;
  styles: Record<StyleId, StyleCopy>;
};

export const translations: Record<Lang, Translation> = {
  fr: {
    headingPre: 'Créer gratuitement un ',
    headingEm1: 'QR code',
    headingMid: ' made in ',
    headingEm2: 'fenua',
    headingPost: '.',
    subtitle:
      "Créez des QR codes uniques qui capturent l'essence de Tahiti. Parfait pour vos menus, cartes de visite ou signalétique.",
    urlLabel: 'Lien ou Texte',
    urlPlaceholder: 'https://votre-site.com',
    styleLabel: 'Style Artistique',
    customLabel: 'Personnalisation (Optionnel)',
    customPlaceholder: 'Ex: Ajouter des perles noires, fond sable blanc...',
    generate: 'Générer mon QR Code Artistique',
    exampleTag: 'Exemple',
    exampleTitle: 'Style Tattoo & Hibiscus',
    resultTitle: 'Votre œuvre est prête',
    resultSubtitle: "Vérifiez la scannabilité avant de l'imprimer.",
    loading: "L'IA façonne votre QR code...",
    restart: 'Recommencer',
    download: "Télécharger l'image",
    note: 'Note : Les QR codes artistiques utilisent des techniques de vision par ordinateur. Bien que nous optimisions pour la scannabilité, certains lecteurs anciens pourraient avoir des difficultés.',
    tip: "CONSEIL : Si le code ne scanne pas, essayez de réduire la luminosité de votre écran ou d'augmenter la taille de l'image.",
    genError: 'La génération a échoué. Veuillez réessayer.',
    footer: '© 2026 Tahiti Artistic QR — L\'innovation au cœur du Pacifique.',
    styles: {
      watercolor: { name: 'Aquarelle Tropicale', description: "Couleurs douces et textures fluides inspirées de la peinture à l'eau." },
      tattoo: { name: 'Tattoo Polynésien', description: 'Motifs traditionnels en noir et blanc ou dégradés.' },
      tropical: { name: 'Fleurs Tropicales', description: 'Hibiscus, Tiaré et végétation luxuriante.' },
      landscape: { name: 'Paysages de Tahiti', description: 'Lagons turquoise, montagnes et couchers de soleil.' },
      tiki: { name: 'Tiki Sculpté', description: 'Textures de bois clair sculpté et motifs Tiki traditionnels.' },
    },
  },
  en: {
    headingPre: 'Create a free ',
    headingEm1: 'QR code',
    headingMid: ' made in ',
    headingEm2: 'fenua',
    headingPost: '.',
    subtitle:
      'Create unique QR codes that capture the essence of Tahiti. Perfect for your menus, business cards or signage.',
    urlLabel: 'Link or Text',
    urlPlaceholder: 'https://your-site.com',
    styleLabel: 'Artistic Style',
    customLabel: 'Customization (Optional)',
    customPlaceholder: 'E.g. Add black pearls, white sand background...',
    generate: 'Generate my Artistic QR Code',
    exampleTag: 'Example',
    exampleTitle: 'Tattoo & Hibiscus Style',
    resultTitle: 'Your artwork is ready',
    resultSubtitle: 'Check that it scans before printing.',
    loading: 'AI is crafting your QR code...',
    restart: 'Start over',
    download: 'Download image',
    note: 'Note: Artistic QR codes rely on computer vision techniques. Although we optimize for scannability, some older readers may struggle.',
    tip: 'TIP: If the code does not scan, try lowering your screen brightness or increasing the image size.',
    genError: 'Generation failed. Please try again.',
    footer: '© 2026 Tahiti Artistic QR — Innovation at the heart of the Pacific.',
    styles: {
      watercolor: { name: 'Tropical Watercolor', description: 'Soft colors and fluid textures inspired by watercolor painting.' },
      tattoo: { name: 'Polynesian Tattoo', description: 'Traditional patterns in black and white or gradients.' },
      tropical: { name: 'Tropical Flowers', description: 'Hibiscus, Tiare and lush vegetation.' },
      landscape: { name: 'Tahiti Landscapes', description: 'Turquoise lagoons, mountains and sunsets.' },
      tiki: { name: 'Carved Tiki', description: 'Light carved-wood textures and traditional Tiki motifs.' },
    },
  },
};
