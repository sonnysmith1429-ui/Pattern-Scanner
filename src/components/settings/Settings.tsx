import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Moon, Sun, Bell, Trash2, Lock, ChevronRight } from 'lucide-react';
import type { AppSettings } from '../../lib/types';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-500' : 'bg-white/15'
      }`}
    >
      <motion.span
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
        animate={{ left: checked ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function Row({
  icon,
  title,
  desc,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/6 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {desc && <p className="text-xs text-white/40 truncate">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export default function Settings({
  settings,
  onChange,
  onClearHistory,
  historyCount,
}: {
  settings: AppSettings;
  onChange: (patch: Partial<AppSettings>) => void;
  onClearHistory: () => void;
  historyCount: number;
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-8">Settings</h1>

      <GlassCard hover={false} className="mb-5">
        <h2 className="text-sm font-medium text-white/50 mb-1">Scan Mode</h2>
        <p className="text-xs text-white/35 mb-4">Choose how the AI engine analyses your charts.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onChange({ scanMode: 'fast' })}
            className={`rounded-2xl p-4 text-left transition-all cursor-pointer border ${
              settings.scanMode === 'fast'
                ? 'border-blue-400/60 bg-blue-500/10'
                : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <Zap size={18} className="text-blue-400 mb-2" />
            <p className="text-sm font-medium">Fast Scan</p>
            <p className="text-xs text-white/40 mt-0.5">Quicker results, fewer indicators</p>
          </button>
          <button
            onClick={() => onChange({ scanMode: 'accuracy' })}
            className={`rounded-2xl p-4 text-left transition-all cursor-pointer border ${
              settings.scanMode === 'accuracy'
                ? 'border-blue-400/60 bg-blue-500/10'
                : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.05]'
            }`}
          >
            <Gauge size={18} className="text-blue-400 mb-2" />
            <p className="text-sm font-medium">High Accuracy</p>
            <p className="text-xs text-white/40 mt-0.5">Deeper scan, full indicator suite</p>
          </button>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="mb-5">
        <Row
          icon={settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          title="Appearance"
          desc={settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}
          right={
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button
                onClick={() => onChange({ theme: 'dark' })}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  settings.theme === 'dark' ? 'bg-blue-500 text-white' : 'text-white/50'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onChange({ theme: 'light' })}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  settings.theme === 'light' ? 'bg-blue-500 text-white' : 'text-white/50'
                }`}
              >
                Light
              </button>
            </div>
          }
        />
        <Row
          icon={<Bell size={16} />}
          title="Notifications"
          desc="Scan completion alerts"
          right={<Toggle checked={settings.notifications} onChange={() => onChange({ notifications: !settings.notifications })} />}
        />
      </GlassCard>

      <GlassCard hover={false} className="mb-5">
        <Row
          icon={<Trash2 size={16} />}
          title="Clear History"
          desc={`${historyCount} saved scan${historyCount === 1 ? '' : 's'}`}
          right={
            confirmClear ? (
              <div className="flex gap-2">
                <GlowButton size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                  Cancel
                </GlowButton>
                <GlowButton
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                >
                  Confirm
                </GlowButton>
              </div>
            ) : (
              <GlowButton size="sm" variant="danger" onClick={() => setConfirmClear(true)} disabled={historyCount === 0}>
                Clear
              </GlowButton>
            )
          }
        />
      </GlassCard>

      <GlassCard hover={false}>
        <button
          onClick={() => setShowPrivacy((s) => !s)}
          className="w-full flex items-center justify-between cursor-pointer"
        >
          <Row
            icon={<Lock size={16} />}
            title="Privacy"
            desc="How your images and data are handled"
            right={
              <ChevronRight
                size={16}
                className={`text-white/30 transition-transform ${showPrivacy ? 'rotate-90' : ''}`}
              />
            }
          />
        </button>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden text-sm text-white/50 leading-relaxed pt-2 pb-1"
          >
            Uploaded chart images are processed to generate your analysis and are stored only on this
            device's local storage for your scan history. Images are never shared with third parties.
            You can clear your uploaded images and scan history at any time using the option above.
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
