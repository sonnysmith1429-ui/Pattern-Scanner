import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Hash,
  ChevronDown,
  Wallet,
} from 'lucide-react';
import GlowButton from '../ui/GlowButton';
import GlassCard from '../ui/GlassCard';
import type { UserContext } from '../../types';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_EXT = /\.(png|jpe?g|webp)$/i;

type ImageSource = { type: 'image'; image: string };
type ManagerSource = { type: 'managerId'; managerId: number; gameweek: number };

export default function UploadScreen({
  onSubmit,
  onDemo,
  onBack,
  initialContext,
}: {
  onSubmit: (source: ImageSource | ManagerSource, context: UserContext) => void;
  onDemo: () => void;
  onBack: () => void;
  initialContext: UserContext;
}) {
  const [mode, setMode] = useState<'image' | 'managerId'>('image');
  const [image, setImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [managerId, setManagerId] = useState('');
  const [gameweek, setGameweek] = useState('');

  const [showContext, setShowContext] = useState(false);
  const [bank, setBank] = useState(initialContext.bank != null ? String(initialContext.bank) : '');
  const [freeTransfers, setFreeTransfers] = useState(initialContext.freeTransfers != null ? String(initialContext.freeTransfers) : '');
  const [wildcard, setWildcard] = useState(initialContext.wildcardActive);

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    const validType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.test(file.name);
    if (!validType) {
      setError('Unsupported file type. Please upload a PNG, JPEG or WebP image.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('That image is too large. Please upload a file under 20MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setZoom(1);
      setRotation(0);
    };
    reader.onerror = () => setError('Could not read that file. Please try a different image.');
    reader.readAsDataURL(file);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function context(): UserContext {
    return {
      bank: bank.trim() === '' ? null : Number(bank),
      freeTransfers: freeTransfers.trim() === '' ? null : Math.round(Number(freeTransfers)),
      wildcardActive: wildcard,
    };
  }

  function submitImage() {
    if (!image) return;
    onSubmit({ type: 'image', image }, context());
  }

  function submitManagerId() {
    const id = Number(managerId);
    const gw = Number(gameweek);
    if (!Number.isFinite(id) || id <= 0) {
      setError('Enter a valid FPL manager ID (the number in your Points page URL).');
      return;
    }
    if (!Number.isFinite(gw) || gw <= 0) {
      setError('Enter a valid gameweek number.');
      return;
    }
    setError(null);
    onSubmit({ type: 'managerId', managerId: id, gameweek: gw }, context());
  }

  return (
    <div className="min-h-[100svh] px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm transition-colors cursor-pointer">
            ← Back
          </button>
          <span className="text-xs uppercase tracking-widest text-white/40">Step 1 of 3</span>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-semibold text-center mb-2">
          Upload your FPL team
        </motion.h2>
        <p className="text-center text-white/50 mb-8">Drag and drop a screenshot of your squad, or import by manager ID.</p>

        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 bg-white/5 rounded-full p-1">
            {(
              [
                { key: 'image', label: 'Screenshot', icon: <ImageIcon size={14} /> },
                { key: 'managerId', label: 'Manager ID', icon: <Hash size={14} /> },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setMode(t.key);
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  mode === t.key ? 'bg-blue-500 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'image' ? (
          <AnimatePresence mode="wait">
            {!image ? (
              <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                  aria-label="Upload FPL team screenshot"
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
                    <p className="font-medium mb-1">Upload your FPL team screenshot</p>
                    <p className="text-sm text-white/40">PNG, JPG or WebP — up to 20MB</p>
                  </div>
                  <GlowButton size="md" icon={<ImageIcon size={16} />} onClick={() => inputRef.current?.click()}>
                    Choose File
                  </GlowButton>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-rose-400 text-sm justify-center">
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <GlassCard className="p-3 sm:p-4" hover={false}>
                  <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video flex items-center justify-center">
                    <motion.img
                      src={image}
                      alt="Squad screenshot preview"
                      animate={{ scale: zoom, rotate: rotation }}
                      transition={{ duration: 0.3 }}
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <IconAction icon={<ZoomIn size={16} />} label="Zoom in" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))} />
                    <IconAction icon={<ZoomOut size={16} />} label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} />
                    <IconAction icon={<RotateCw size={16} />} label="Rotate" onClick={() => setRotation((r) => r + 90)} />
                    <IconAction icon={<RefreshCw size={16} />} label="Replace" onClick={() => inputRef.current?.click()} />
                    <IconAction icon={<Trash2 size={16} />} label="Delete" onClick={() => { setImage(null); setError(null); }} />
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">FPL Manager ID</label>
                <input
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 1234567"
                  inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
                />
                <p className="text-xs text-white/35 mt-1.5">Find this in the URL of your Points page on the official FPL site.</p>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1.5 block">Gameweek</label>
                <input
                  value={gameweek}
                  onChange={(e) => setGameweek(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 4"
                  inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Squad context */}
        <div className="mt-6">
          <button
            onClick={() => setShowContext((s) => !s)}
            className="w-full flex items-center justify-between text-sm text-white/60 hover:text-white transition-colors cursor-pointer glass rounded-2xl px-4 py-3"
          >
            <span className="flex items-center gap-2">
              <Wallet size={15} />
              Squad context (optional) — improves transfer recommendations
            </span>
            <ChevronDown size={16} className={`transition-transform ${showContext ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showContext && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-2xl p-4 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Money in the bank (£m)</label>
                    <input
                      value={bank}
                      onChange={(e) => setBank(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="e.g. 1.4"
                      inputMode="decimal"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block">Free transfers</label>
                    <input
                      value={freeTransfers}
                      onChange={(e) => setFreeTransfers(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 1"
                      inputMode="numeric"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer mt-1 sm:mt-6">
                    <input type="checkbox" checked={wildcard} onChange={(e) => setWildcard(e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
                    <span className="text-sm text-white/70">Wildcard active</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <GlowButton
            size="lg"
            icon={<Sparkles size={20} />}
            onClick={mode === 'image' ? submitImage : submitManagerId}
            disabled={mode === 'image' ? !image : false}
            className="shadow-[0_0_50px_rgba(59,130,246,0.45)]"
          >
            Analyse My Squad
          </GlowButton>
          <button onClick={onDemo} className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
            Or try it with a Demo Squad
          </button>
        </div>

        <p className="text-center text-xs text-white/30 mt-8 max-w-md mx-auto">
          Your screenshot is used only to identify your FPL squad and is processed in your browser — it is not uploaded or stored on our servers.
        </p>
      </div>
    </div>
  );
}

function IconAction({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
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
