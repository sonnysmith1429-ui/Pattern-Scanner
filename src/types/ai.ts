import type { CategoryScores, TeamAnalysis } from './analysis';

export type AIProviderName = 'anthropic' | 'openai' | 'mock';

/** Structured payload sent to the AI layer — the analytics engine's output, never raw stats invention. */
export interface AIAnalysisRequest {
  overallScore: number;
  categoryScores: CategoryScores;
  squadSummary: {
    playerId: number;
    name: string;
    position: string;
    price: number;
    isStarter: boolean;
    overallScore: number;
    form: number;
    notes: string[];
  }[];
  weaknesses: { title: string; priority: string; description: string }[];
  topRecommendations: {
    outName: string;
    inName: string;
    reasons: string[];
    projectedGainPoints: number;
  }[];
  captain: { name: string; projectedPoints: number; reason: string };
  benchScore: number;
  dataAvailable: {
    hasXG: boolean;
    hasFixtures: boolean;
    hasBank: boolean;
  };
}

export interface AIWeaknessExplanation {
  title: string;
  explanation: string;
}

export interface AIRecommendationExplanation {
  outName: string;
  inName: string;
  verdict: string;
}

export interface AIAnalysisResponse {
  summary: string;
  overallVerdict: string;
  weaknesses: AIWeaknessExplanation[];
  recommendations: AIRecommendationExplanation[];
  captainSuggestion: string;
  benchSuggestion: string;
  dataLimitations: string[];
  provider: AIProviderName;
}

export interface AIProvider {
  name: AIProviderName;
  generate(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}

/** Helper for building AIAnalysisRequest from a computed TeamAnalysis — kept in lib/ai to avoid a circular import here. */
export type TeamAnalysisRef = TeamAnalysis;
