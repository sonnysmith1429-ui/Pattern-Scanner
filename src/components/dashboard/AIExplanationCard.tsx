import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function AIExplanationCard({ text }: { text: string }) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 120));
    const interval = setInterval(() => {
      i += step;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <GlassCard delay={0.25} className="col-span-1 lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-blue-400" />
        <h3 className="text-sm font-medium text-white/50">AI Explanation</h3>
      </div>
      <p className="text-[15px] leading-relaxed text-white/80">
        {shown}
        {shown.length < text.length && (
          <span className="inline-block w-1.5 h-4 align-middle bg-blue-400/70 ml-0.5 animate-pulse" />
        )}
      </p>
    </GlassCard>
  );
}
