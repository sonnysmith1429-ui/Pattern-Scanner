import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Trash2, Lock, ChevronDown, Wallet, Database, Sparkles, Info } from 'lucide-react';
import type { AppSettings, DataFreshness, UserContext, AIProviderName } from '../../types';
import GlassCard from '../ui/GlassCard';
import GlowButton from '../ui/GlowButton';
import DataFreshnessBadge from '../ui/DataFreshnessBadge';

const PRIVACY_TEXT =
  'Your screenshot is used only to identify your FPL squad. Image OCR runs entirely in your browser — screenshots are never uploaded to or stored on our servers. Squad context (bank, transfers) and analysis history are stored only in this browser\'s local storage.';

const ABOUT_TEXT =
  'FPL Analyst AI is an independent prototype and is not affiliated with, endorsed by, or connected to the Premier League or Fantasy Premier League. Player statistics are sourced from the official Fantasy Premier League API where available, with a clearly labelled demo dataset used as a fallback.';

function Row({ icon, title, desc, right }: { icon: React.ReactNode; title: string; desc?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/6 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 shrink-0">{icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          {desc && <p className="text-xs text-white/40">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function ExpandableSection({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard hover={false} className="mb-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">{icon}</div>
          <p className="text-sm font-medium">{title}</p>
        </div>
        <ChevronDown size={16} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden text-sm text-white/50 leading-relaxed pt-4">
          {content}
        </motion.p>
      )}
    </GlassCard>
  );
}

const PROVIDER_LABEL: Record<AIProviderName, string> = { anthropic: 'Anthropic', openai: 'OpenAI', mock: 'Built-in (no AI key configured)' };

export default function Settings({
  context,
  onChangeContext,
  settings,
  onChangeSettings,
  historyCount,
  onClearHistory,
  freshness,
  onRefresh,
  refreshing,
  aiProvider,
}: {
  context: UserContext;
  onChangeContext: (patch: Partial<UserContext>) => void;
  settings: AppSettings;
  onChangeSettings: (patch: Partial<AppSettings>) => void;
  historyCount: number;
  onClearHistory: () => void;
  freshness: DataFreshness | null;
  onRefresh: () => void;
  refreshing: boolean;
  aiProvider: AIProviderName | null;
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-8">Settings</h1>

      <GlassCard hover={false} className="mb-5">
        <h2 className="text-sm font-medium text-white/70 mb-1 flex items-center gap-2">
          <Wallet size={15} className="text-blue-400" /> Squad context
        </h2>
        <p className="text-xs text-white/35 mb-4">Used to estimate transfer affordability. Improves recommendation accuracy.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Bank (£m)</label>
            <input
              value={context.bank ?? ''}
              onChange={(e) => onChangeContext({ bank: e.target.value.trim() === '' ? null : Number(e.target.value.replace(/[^0-9.]/g, '')) })}
              placeholder="Unknown"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Free transfers</label>
            <input
              value={context.freeTransfers ?? ''}
              onChange={(e) => onChangeContext({ freeTransfers: e.target.value.trim() === '' ? null : Math.round(Number(e.target.value.replace(/[^0-9]/g, ''))) })}
              placeholder="Unknown"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400/60 placeholder:text-white/25"
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer mt-1 sm:mt-6">
            <input type="checkbox" checked={context.wildcardActive} onChange={(e) => onChangeContext({ wildcardActive: e.target.checked })} className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm text-white/70">Wildcard active</span>
          </label>
        </div>
      </GlassCard>

      <GlassCard hover={false} className="mb-5">
        <Row
          icon={settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          title="Appearance"
          desc={settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}
          right={
            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
              <button onClick={() => onChangeSettings({ theme: 'dark' })} className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${settings.theme === 'dark' ? 'bg-blue-500 text-white' : 'text-white/50'}`}>
                Dark
              </button>
              <button onClick={() => onChangeSettings({ theme: 'light' })} className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${settings.theme === 'light' ? 'bg-blue-500 text-white' : 'text-white/50'}`}>
                Light
              </button>
            </div>
          }
        />
        {freshness && (
          <Row icon={<Database size={16} />} title="FPL data" desc={freshness.note} right={<DataFreshnessBadge freshness={freshness} onRefresh={onRefresh} refreshing={refreshing} />} />
        )}
        <Row icon={<Sparkles size={16} />} title="AI analysis provider" desc="Configured server-side via environment variables" right={<span className="text-sm text-white/60">{aiProvider ? PROVIDER_LABEL[aiProvider] : 'Not run yet'}</span>} />
      </GlassCard>

      <GlassCard hover={false} className="mb-5">
        <Row
          icon={<Trash2 size={16} />}
          title="Clear saved analyses"
          desc={`${historyCount} saved on this device`}
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

      <ExpandableSection icon={<Lock size={16} />} title="Privacy" content={PRIVACY_TEXT} />
      <ExpandableSection icon={<Info size={16} />} title="About & disclaimer" content={ABOUT_TEXT} />
    </div>
  );
}
