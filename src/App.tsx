import React, { useState, useRef, useEffect } from 'react';
import * as QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Palette, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon,
  MapPin,
  Flower2,
  Waves,
  Brush,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { VaiLogo } from './components/VaiLogo';
import { generateArtisticBackground, stylizeQRCode } from './services/gemini';
import { cn } from './lib/utils';

const STYLES = [
  { id: 'watercolor', name: 'Aquarelle Tropicale', icon: <Palette className="w-4 h-4" />, description: 'Couleurs douces et textures fluides inspirées de la peinture à l\'eau.' },
  { id: 'tattoo', name: 'Tattoo Polynésien', icon: <Brush className="w-4 h-4" />, description: 'Motifs traditionnels en noir et blanc ou dégradés.' },
  { id: 'tropical', name: 'Fleurs Tropicales', icon: <Flower2 className="w-4 h-4" />, description: 'Hibiscus, Tiaré et végétation luxuriante.' },
  { id: 'landscape', name: 'Paysages de Tahiti', icon: <Waves className="w-4 h-4" />, description: 'Lagons turquoise, montagnes et couchers de soleil.' },
  { id: 'tiki', name: 'Tiki Sculpté', icon: <Sparkles className="w-4 h-4" />, description: 'Textures de bois clair sculpté et motifs Tiki traditionnels.' },
];

export default function App() {
  const [url, setUrl] = useState('https://tahiti-tourisme.fr');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Input, 2: Result

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    try {
      setIsGenerating(true);
      setStep(2);

      // 1. Generate base QR code
      const qrDataUrl = await QRCode.toDataURL(url, {
        margin: 4,
        width: 1024,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeData(qrDataUrl);

      // 2. Generate artistic background or stylize
      const stylePrompt = `${selectedStyle.name}: ${selectedStyle.description} ${customPrompt ? `- ${customPrompt}` : ''}`;
      const stylized = await stylizeQRCode(qrDataUrl, stylePrompt);
      
      setFinalResult(stylized);
    } catch (error: any) {
      console.error("Generation failed:", error);
      const message = error.message === "API Key missing" 
        ? "Clé API manquante. Veuillez configurer GEMINI_API_KEY dans vos variables d'environnement."
        : "La génération a échoué. Veuillez réessayer.";
      alert(message);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!finalResult) return;
    const link = document.createElement('a');
    link.href = finalResult;
    link.download = `tahiti-qr-${selectedStyle.id}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6 md:p-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center text-tahiti-ink">
            <VaiLogo className="h-10 md:h-12 w-auto" />
          </div>
          <div className="h-8 w-[1px] bg-tahiti-ink/10 hidden md:block" />
          <h1 className="text-2xl font-bold tracking-tight text-tahiti-ink">
            Tahiti<span className="serif italic font-light">Artistic</span>QR
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-tahiti-ink/60">
          <MapPin className="w-4 h-4" />
          <span>Polynésie Française</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-20">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-12 items-center pt-10"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-medium leading-[1.1] tracking-tight">
                    L'élégance du <span className="serif italic">numérique</span> au service du <span className="serif italic">Fenua</span>.
                  </h2>
                  <p className="text-lg text-tahiti-ink/60 max-w-md">
                    Créez des QR codes uniques qui capturent l'essence de Tahiti. Parfait pour vos menus, cartes de visite ou signalétique.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">Lien ou Texte</label>
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://votre-site.com"
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">Style Artistique</label>
                    <div className="grid grid-cols-2 gap-3">
                      {STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style)}
                          className={cn(
                            "flex flex-col items-start p-4 rounded-2xl border transition-all text-left",
                            selectedStyle.id === style.id 
                              ? "border-tahiti-ink bg-tahiti-ink text-white shadow-lg" 
                              : "border-tahiti-ink/10 bg-white/50 hover:bg-white"
                          )}
                        >
                          <div className={cn("mb-2 p-2 rounded-lg", selectedStyle.id === style.id ? "bg-white/20" : "bg-tahiti-ink/5")}>
                            {style.icon}
                          </div>
                          <span className="font-medium text-sm">{style.name}</span>
                          <span className={cn("text-[10px] mt-1 leading-tight", selectedStyle.id === style.id ? "text-white/60" : "text-tahiti-ink/40")}>
                            {style.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">Personnalisation (Optionnel)</label>
                    <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ex: Ajouter des perles noires, fond sable blanc..."
                      className="input-field min-h-[80px] resize-none"
                    />
                  </div>

                  <button 
                    onClick={generateQR}
                    disabled={!url || isGenerating}
                    className="btn-primary w-full flex items-center justify-center gap-2 group"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Générer mon QR Code Artistique
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white/30 border border-white/50 group">
                <img 
                  src="https://picsum.photos/seed/tahiti-art/1000/1000" 
                  alt="Preview" 
                  className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <QrCode className="w-full h-full text-tahiti-ink/20" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-tahiti-hibiscus flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-40">Exemple</p>
                      <p className="text-sm font-medium">Style Tattoo & Hibiscus</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center pt-10 space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-medium serif italic">Votre œuvre est prête</h2>
                <p className="text-tahiti-ink/60">Vérifiez la scannabilité avant de l'imprimer.</p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-tahiti-hibiscus/20 to-tahiti-ocean/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative glass p-8 rounded-[32px] shadow-2xl">
                  {isGenerating ? (
                    <div className="w-[300px] md:w-[400px] aspect-square flex flex-col items-center justify-center space-y-4">
                      <Loader2 className="w-12 h-12 text-tahiti-ink animate-spin" />
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-sm font-medium animate-pulse"
                      >
                        L'IA façonne votre QR code...
                      </motion.p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-[300px] md:w-[400px] aspect-square rounded-2xl overflow-hidden shadow-inner bg-white">
                        {finalResult ? (
                          <motion.img 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            src={finalResult} 
                            alt="Artistic QR Code" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-tahiti-ink/5">
                            <QrCode className="w-20 h-20 text-tahiti-ink/10" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-full border border-tahiti-ink/10 font-medium hover:bg-white transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recommencer
                </button>
                <button 
                  onClick={downloadImage}
                  disabled={!finalResult}
                  className="btn-primary px-10 py-4 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger l'image
                </button>
              </div>

              <div className="max-w-md text-center space-y-4">
                <div className="text-xs text-tahiti-ink/40 leading-relaxed">
                  Note: Les QR codes artistiques utilisent des techniques de vision par ordinateur. 
                  Bien que nous optimisions pour la scannabilité, certains lecteurs anciens pourraient avoir des difficultés. 
                </div>
                <div className="p-4 bg-tahiti-ocean/5 rounded-2xl border border-tahiti-ocean/10 text-[10px] text-tahiti-ocean font-medium">
                  CONSEIL : Si le code ne scanne pas, essayez de réduire la luminosité de votre écran ou d'augmenter la taille de l'image.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-tahiti-ink/5 text-center space-y-4">
        <p className="text-sm text-tahiti-ink/40">
          © 2024 Tahiti Artistic QR — L'innovation au cœur du Pacifique.
        </p>
        <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
          <ImageIcon className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
          <QrCode className="w-5 h-5" />
        </div>
      </footer>
    </div>
  );
}
