import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Trash2,
  RefreshCw,
  ScanLine,
  AlertCircle,
  Tag,
  Newspaper,
} from 'lucide-react';
import GlowButton from '../ui/GlowButton';
import GlassCard from '../ui/GlassCard';
import { demoChartImage } from '../../lib/mockData';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
const ACCEPTED_EXT = /\.(png|jpe?g|heic|heif|webp)$/i;

function parsePrice(raw: string): number | undefined {
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export default function UploadScreen({
  onScan,
  onBack,
  newsEnabled,
}: {
  onScan: (image: string, manualPrice?: number, ticker?: string) => void;
  onBack: () => void;
  newsEnabled: boolean;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [tickerInput, setTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const validType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.test(file.name);
    if (!validType) {
      setError('Unsupported file type. Please upload a PNG, JPEG, HEIC or WebP image.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setZoom(1);
      setRotation(0);
      setCropMode(false);
      setPriceInput('');
      setTickerInput('');
    };
    reader.readAsDataURL(file);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function useSampleChart() {
    setError(null);
    setImage(demoChartImage());
    setZoom(1);
    setRotation(0);
    setCropMode(false);
    setPriceInput('');
    setTickerInput('');
  }

  return (
    <div className="min-h-[100svh] px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm transition-colors cursor-pointer">
            ← Back
          </button>
          <span className="text-xs uppercase tracking-widest text-white/40">Step 1 of 2</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-semibold text-center mb-2"
        >
          Upload your chart
        </motion.h2>
        <p className="text-center text-white/50 mb-10">
          Drag and drop a screenshot, or choose one from your device.
        </p>

        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`glass rounded-[28px] border-2 border-dashed transition-all cursor-pointer p-14 flex flex-col items-center justify-center text-center gap-4 ${
                  dragOver ? 'border-blue-400 bg-blue-500/5 scale-[1.01]' : 'border-white/15'
                }`}
              >
                <motion.div
                  animate={{ y: dragOver ? -6 : [0, -8, 0] }}
                  transition={{ duration: 2.4, repeat: dragOver ? 0 : Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-2xl bg-blue-500/15 flex items-center justify-center"
                >
                  <UploadCloud className="text-blue-400" size={36} />
                </motion.div>
                <div>
                  <p className="font-medium mb-1">Drop your chart image here</p>
                  <p className="text-sm text-white/40">PNG, JPEG, HEIC or WebP — up to 20MB</p>
                </div>
                <GlowButton
                  size="md"
                  icon={<ImageIcon size={16} />}
                  onClick={() => inputRef.current?.click()}
                >
                  Choose File
                </GlowButton>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.heic,.heif,.webp,image/png,image/jpeg,image/webp,image/heic,image/heif"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-red-400 text-sm justify-center"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={useSampleChart}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Or try it with a sample chart
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard className="p-3 sm:p-4" hover={false}>
                <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center">
                  <motion.img
                    src={image}
                    alt="Chart preview"
                    animate={{ scale: zoom, rotate: rotation }}
                    transition={{ duration: 0.3 }}
                    className="max-w-full max-h-full object-contain select-none"
                    draggable={false}
                  />
                  {cropMode && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-8 border-2 border-blue-400/80 rounded-xl"
                      style={{
                        boxShadow: '0 0 0 2000px rgba(0,0,0,0.55)',
                      }}
                    >
                      {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map(
                        (pos) => (
                          <div
                            key={pos}
                            className={`absolute ${pos} w-3 h-3 rounded-full bg-blue-400 border-2 border-white`}
                          />
                        ),
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <IconAction icon={<ZoomIn size={16} />} label="Zoom in" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} />
                  <IconAction icon={<ZoomOut size={16} />} label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} />
                  <IconAction icon={<RotateCw size={16} />} label="Rotate" onClick={() => setRotation((r) => r + 90)} />
                  <IconAction
                    icon={<Crop size={16} />}
                    label="Crop"
                    active={cropMode}
                    onClick={() => setCropMode((c) => !c)}
                  />
                  <IconAction icon={<RefreshCw size={16} />} label="Replace" onClick={() => inputRef.current?.click()} />
                  <IconAction
                    icon={<Trash2 size={16} />}
                    label="Delete"
                    onClick={() => {
                      setImage(null);
                      setError(null);
                      setPriceInput('');
                      setTickerInput('');
                    }}
                  />
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.heic,.heif,.webp,image/png,image/jpeg,image/webp,image/heic,image/heif"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              </GlassCard>

              <div className="mt-6 max-w-md mx-auto grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="asset-price" className="flex items-center gap-1.5 text-sm text-white/60 mb-2">
                    <Tag size={14} />
                    Current price <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      $
                    </span>
                    <input
                      id="asset-price"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder="e.g. 182.50"
                      className="w-full glass rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-blue-400/50 placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="asset-ticker" className="flex items-center gap-1.5 text-sm text-white/60 mb-2">
                    <Newspaper size={14} />
                    Ticker <span className="text-white/30">(optional)</span>
                  </label>
                  <input
                    id="asset-ticker"
                    type="text"
                    value={tickerInput}
                    onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AAPL"
                    className="w-full glass rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/50 placeholder:text-white/30"
                  />
                </div>
              </div>

              <p className="text-xs text-white/35 mt-3 text-center max-w-md mx-auto">
                {newsEnabled
                  ? "Price makes entry/target/stop levels real instead of estimated. Ticker pulls in recent news sentiment to factor into the bias."
                  : 'Price makes entry/target/stop levels real instead of estimated. Add a free news API key in Settings to also factor in live news sentiment.'}
              </p>

              <div className="mt-6 flex justify-center">
                <GlowButton
                  size="lg"
                  icon={<ScanLine size={20} />}
                  onClick={() => onScan(image, parsePrice(priceInput), tickerInput.trim() || undefined)}
                  className="shadow-[0_0_50px_rgba(59,130,246,0.45)] animate-pulse-glow"
                >
                  Scan Pattern
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IconAction({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 ${
        active ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
