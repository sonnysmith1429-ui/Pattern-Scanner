import type { Position, UpcomingFixture, DataSource } from './fpl';
import type { Squad } from './squad';

export interface PlayerAnalysis {
  playerId: number;
  position: Position;
  overallScore: number;
  formScore: number;
  fixtureScore: number;
  valueScore: number;
  attackingScore: number;
  defensiveScore: number;
  minutesScore: number;
  riskScore: number;
  expectedPoints5gw: number;
  pointsPerMillion: number;
  percentileVsPosition: number;
  notes: string[];
  upcomingFixtures: UpcomingFixture[];
}

export type WeaknessPriority = 'high' | 'medium' | 'low';

export interface Weakness {
  id: string;
  title: string;
  priority: WeaknessPriority;
  description: string;
  affectedPlayerIds: number[];
  suggestedReplacementIds: number[];
}

export interface TransferRecommendation {
  id: string;
  outPlayerId: number;
  inPlayerId: number;
  reasons: string[];
  projectedGainPoints: number;
  fixtureImprovement: number;
  valueImprovement: number;
  costDelta: number;
  affordable: boolean;
  outReplacementScore: number;
  inReplacementScore: number;
}

export interface CaptainSuggestion {
  bestPlayerId: number;
  bestProjectedPoints: number;
  bestReason: string;
  alternativePlayerId: number | null;
  alternativeProjectedPoints: number | null;
  alternativeReason: string | null;
}

export interface SquadStructure {
  clubConcentration: { teamId: number; teamName: string; count: number }[];
  spendByPosition: Record<Position, number>;
  pointsByPosition: Record<Position, number>;
  premiumCount: number;
  benchSpend: number;
  totalValue: number;
  notes: string[];
}

export interface BenchAnalysis {
  score: number;
  expectedMinutesAvg: number;
  totalBenchCost: number;
  notes: string[];
}

export interface CategoryScores {
  playerQuality: number;
  form: number;
  fixtures: number;
  value: number;
  squadBalance: number;
  availability: number;
}

export type ScoreTier = 'poor' | 'below-average' | 'decent' | 'strong' | 'elite';

export interface TeamAnalysis {
  overallScore: number;
  tier: ScoreTier;
  categoryScores: CategoryScores;
  playerAnalyses: PlayerAnalysis[];
  weaknesses: Weakness[];
  recommendations: TransferRecommendation[];
  captain: CaptainSuggestion;
  bench: BenchAnalysis;
  structure: SquadStructure;
  generatedAt: string;
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  squad: Squad;
  teamAnalysis: TeamAnalysis;
  dataSource: DataSource;
  favourite: boolean;
  label: string;
}
