import type { AIAnalysisRequest, AIAnalysisResponse, AIProvider } from '../../../types/index.ts';

/**
 * Deterministic, isomorphic (browser + server) provider that turns the
 * analytics engine's output straight into prose without adding a single
 * fact that wasn't already in the request. Used whenever no AI API key is
 * configured, and as the safety-net fallback if a real provider errors or
 * returns something unparseable.
 */
function tierWord(score: number): string {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'decent';
  if (score >= 40) return 'below-average';
  return 'weak';
}

function bestAndWorstCategory(scores: AIAnalysisRequest['categoryScores']) {
  const entries = Object.entries(scores) as [string, number][];
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const worst = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return { best, worst };
}

const CATEGORY_LABELS: Record<string, string> = {
  playerQuality: 'player quality',
  form: 'form',
  fixtures: 'fixtures',
  value: 'value for money',
  squadBalance: 'squad balance',
  availability: 'availability',
};

export const mockAiProvider: AIProvider = {
  name: 'mock',
  async generate(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { best, worst } = bestAndWorstCategory(request.categoryScores);
    const tier = tierWord(request.overallScore);

    const summary = `Your squad rates ${request.overallScore}/100, which is ${tier}. It is strongest on ${CATEGORY_LABELS[best[0]] ?? best[0]} (${best[1]}/100) and weakest on ${CATEGORY_LABELS[worst[0]] ?? worst[0]} (${worst[1]}/100), based on the ${request.squadSummary.length} players in your squad.`;

    const overallVerdict = request.weaknesses.length
      ? `The biggest issue flagged is "${request.weaknesses[0].title}" (${request.weaknesses[0].priority} priority): ${request.weaknesses[0].description}`
      : `No major weaknesses were flagged — the squad is well balanced across the categories analysed.`;

    const weaknesses = request.weaknesses.map((w) => ({
      title: w.title,
      explanation: w.description,
    }));

    const recommendations = request.topRecommendations.map((r) => ({
      outName: r.outName,
      inName: r.inName,
      verdict: `${r.reasons.join('. ')}. Projected gain: ${r.projectedGainPoints >= 0 ? '+' : ''}${r.projectedGainPoints.toFixed(1)} pts.`,
    }));

    const captainSuggestion = `${request.captain.name} projects for ${request.captain.projectedPoints.toFixed(1)} points as captain: ${request.captain.reason}`;

    const benchSuggestion =
      request.benchScore >= 70
        ? `Bench strength is ${request.benchScore}/100 — a solid safety net if a starter is rotated or injured.`
        : request.benchScore >= 45
          ? `Bench strength is ${request.benchScore}/100 — usable, but don't expect much if you need to turn to it.`
          : `Bench strength is ${request.benchScore}/100 — this bench offers little cover, which is a risk if starters are rotated.`;

    const dataLimitations: string[] = [];
    if (!request.dataAvailable.hasXG) dataLimitations.push('Expected goals/assists (xG/xA) data was unavailable for some players.');
    if (!request.dataAvailable.hasFixtures) dataLimitations.push('Upcoming fixture data was unavailable, so fixture scoring used a neutral default.');
    if (!request.dataAvailable.hasBank) dataLimitations.push('Bank balance was not provided, so transfer affordability is an estimate.');

    return {
      summary,
      overallVerdict,
      weaknesses,
      recommendations,
      captainSuggestion,
      benchSuggestion,
      dataLimitations,
      provider: 'mock',
    };
  },
};
