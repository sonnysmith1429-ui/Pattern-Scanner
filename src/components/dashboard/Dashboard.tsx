import { motion } from 'framer-motion';
import { Star, RotateCcw, Download } from 'lucide-react';
import type { ScanResult } from '../../lib/types';
import MarketTrendCard from './MarketTrendCard';
import PatternsCard from './PatternsCard';
import IndicatorsCard from './IndicatorsCard';
import TradeBiasCard from './TradeBiasCard';
import ChartAnnotationCard from './ChartAnnotationCard';
import ConfidenceMeterCard from './ConfidenceMeterCard';
import AIExplanationCard from './AIExplanationCard';
import NewsCard from './NewsCard';
import Disclaimer from '../ui/Disclaimer';
import GlowButton from '../ui/GlowButton';

export default function Dashboard({
  result,
  onRescan,
  onToggleFavourite,
}: {
  result: ScanResult;
  onRescan: () => void;
  onToggleFavourite: () => void;
}) {
  return (
    <div className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Analysis Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            Scanned {new Date(result.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlowButton
            size="sm"
            variant="secondary"
            icon={<Star size={15} className={result.favourite ? 'fill-orange-400 text-orange-400' : ''} />}
            onClick={onToggleFavourite}
          >
            {result.favourite ? 'Favourited' : 'Favourite'}
          </GlowButton>
          <GlowButton size="sm" variant="secondary" icon={<Download size={15} />} onClick={() => {}}>
            Export
          </GlowButton>
          <GlowButton size="sm" icon={<RotateCcw size={15} />} onClick={onRescan}>
            New Scan
          </GlowButton>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <ChartAnnotationCard image={result.image} annotations={result.annotations} />
        <ConfidenceMeterCard confidence={result.overallConfidence} />

        <MarketTrendCard trend={result.trend} confidence={result.trendConfidence} />
        <PatternsCard patterns={result.patterns} />

        <IndicatorsCard indicators={result.indicators} />
        <TradeBiasCard bias={result.tradeBias} currentPrice={result.currentPrice} priceSource={result.priceSource} />

        {result.news && <NewsCard news={result.news} bias={result.tradeBias.bias} />}

        <AIExplanationCard text={result.explanation} />
      </div>

      <div className="mt-5">
        <Disclaimer />
      </div>
    </div>
  );
}
