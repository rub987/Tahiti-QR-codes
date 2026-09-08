import React, { useState } from 'react';
import * as QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Palette,
  Download,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  Flower2,
  Waves,
  Brush,
  ChevronRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { VaiLogo } from './components/VaiLogo';
import { stylizeQRCode } from './services/gemini';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { translations, type Lang, type StyleId } from './lib/i18n';

const STYLE_META: { id: StyleId; icon: React.ReactNode }[] = [
  { id: 'watercolor', icon: <Palette className="w-4 h-4" /> },
  { id: 'tattoo', icon: <Brush className="w-4 h-4" /> },
  { id: 'tropical', icon: <Flower2 className="w-4 h-4" /> },
  { id: 'landscape', icon: <Waves className="w-4 h-4" /> },
  { id: 'tiki', icon: <Sparkles className="w-4 h-4" /> },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('fr');
  const [url, setUrl] = useState('https://tahiti-tourisme.fr');
  const [selectedStyleId, setSelectedStyleId] = useState<StyleId>('watercolor');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const t = translations[lang];

  const generateQR = async () => {
    try {
      setIsGenerating(true);
      setStep(2);

      const qrDataUrl = await QRCode.toDataURL(url, {
        margin: 4,
        width: 1024,
        errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#ffffff' },
      });

      const style = t.styles[selectedStyleId];
      const stylePrompt = `${style.name}: ${style.description}${customPrompt ? ` - ${customPrompt}` : ''}`;
      const stylized = await stylizeQRCode(qrDataUrl, stylePrompt);
      setFinalResult(stylized);
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(t.genError);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!finalResult) return;
    const link = document.createElement('a');
    link.href = finalResult;
    link.download = `tahiti-qr-${selectedStyleId}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-tahiti-ink/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <VaiLogo className="h-8 md:h-10 w-auto text-tahiti-ink" />

          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center bg-tahiti-ink/5 border border-tahiti-ink/10 rounded-full px-1 py-1">
              <button
                onClick={() => setLang('fr')}
                className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all',
                  lang === 'fr' ? 'bg-tahiti-ocean text-white' : 'text-tahiti-ink/40 hover:text-tahiti-ink',
                )}
              >
                FR
              </button>
              <div className="w-[1px] h-3 bg-tahiti-ink/10 mx-1" />
              <button
                onClick={() => setLang('en')}
                className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all',
                  lang === 'en' ? 'bg-tahiti-ocean text-white' : 'text-tahiti-ink/40 hover:text-tahiti-ink',
                )}
              >
                EN
              </button>
            </div>

            <a
              href="https://ai.redsoyu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-tahiti-ink/5 border border-tahiti-ink/10 rounded-full px-4 py-2 text-[11px] font-bold tracking-tight text-tahiti-ink hover:bg-tahiti-ink hover:text-white transition-all group"
            >
              <span>ai.redsoyu.com</span>
              <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
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
                    {t.headingPre}
                    <span className="serif italic">{t.headingEm1}</span>
                    {t.headingMid}
                    <span className="serif italic">{t.headingEm2}</span>
                    {t.headingPost}
                  </h2>
                  <p className="text-lg text-tahiti-ink/60 max-w-md">{t.subtitle}</p>
                </div>

                <div className="space-y-6">
                  {/* URL input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">
                      {t.urlLabel}
                    </label>
                    <Input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t.urlPlaceholder}
                      className="h-12 rounded-2xl border-tahiti-ink/10 bg-white/50 focus-visible:ring-tahiti-ink/20 text-base"
                    />
                  </div>

                  {/* Style picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">
                      {t.styleLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {STYLE_META.map((style) => {
                        const copy = t.styles[style.id];
                        const active = selectedStyleId === style.id;
                        return (
                          <button
                            key={style.id}
                            onClick={() => setSelectedStyleId(style.id)}
                            className={cn(
                              'flex flex-col items-start p-4 rounded-2xl border transition-all text-left',
                              active
                                ? 'border-tahiti-ink bg-tahiti-ink text-white shadow-lg'
                                : 'border-tahiti-ink/10 bg-white/50 hover:bg-white',
                            )}
                          >
                            <div className={cn('mb-2 p-2 rounded-lg', active ? 'bg-white/20' : 'bg-tahiti-ink/5')}>
                              {style.icon}
                            </div>
                            <span className="font-medium text-sm">{copy.name}</span>
                            <span className={cn('text-[10px] mt-1 leading-tight', active ? 'text-white/60' : 'text-tahiti-ink/40')}>
                              {copy.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom prompt */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-tahiti-ink/40">
                      {t.customLabel}
                    </label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder={t.customPlaceholder}
                      className="rounded-2xl border-tahiti-ink/10 bg-white/50 focus-visible:ring-tahiti-ink/20 resize-none min-h-[80px]"
                    />
                  </div>

                  {/* Generate button */}
                  <Button
                    onClick={generateQR}
                    disabled={!url || isGenerating}
                    size="lg"
                    className="w-full rounded-full bg-tahiti-ink text-white hover:bg-tahiti-ink/90 hover:scale-105 active:scale-95 transition-all h-14 text-base font-medium gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t.generate}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview */}
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
                      <p className="text-xs font-bold uppercase tracking-wider opacity-40">{t.exampleTag}</p>
                      <p className="text-sm font-medium">{t.exampleTitle}</p>
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
                <h2 className="text-4xl font-medium serif italic">{t.resultTitle}</h2>
                <p className="text-tahiti-ink/60">{t.resultSubtitle}</p>
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
                        {t.loading}
                      </motion.p>
                    </div>
                  ) : (
                    <div className="w-[300px] md:w-[400px] aspect-square rounded-2xl overflow-hidden shadow-inner bg-white">
                      {finalResult ? (
                        <motion.img
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
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
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-8 h-14 rounded-full border-tahiti-ink/10 font-medium gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t.restart}
                </Button>
                <Button
                  onClick={downloadImage}
                  disabled={!finalResult}
                  size="lg"
                  className="px-10 h-14 rounded-full bg-tahiti-ink text-white hover:bg-tahiti-ink/90 gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t.download}
                </Button>
              </div>

              <div className="max-w-md text-center space-y-4">
                <p className="text-xs text-tahiti-ink/40 leading-relaxed">{t.note}</p>
                <div className="p-4 bg-tahiti-ocean/5 rounded-2xl border border-tahiti-ocean/10 text-[10px] text-tahiti-ocean font-medium">
                  {t.tip}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-tahiti-ink/5 text-center space-y-4">
        <p className="text-sm text-tahiti-ink/40">{t.footer}</p>
        <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all">
          <ImageIcon className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
          <QrCode className="w-5 h-5" />
        </div>
      </footer>
    </div>
  );
}
