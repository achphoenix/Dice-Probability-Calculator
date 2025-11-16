// Dice types
export type DiceType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceOption {
  value: DiceType;
  label: string;
  sides: number;
}

// Probability results
export interface ProbabilityResult {
  result: number;
  probability: number;
  percentage: number;
}

// Goal comparison
export type GoalComparison = 'exactly' | 'orHigher' | 'orLower';

export interface GoalComparisonOption {
  value: GoalComparison;
  label: string;
}

export interface GoalResult {
  goalNumber: number;
  comparison: GoalComparison;
  probability: number;
  percentage: number;
  displayText: string;
}
