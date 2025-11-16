import { DiceOption, GoalComparisonOption } from '../models/types';

export const DICE_OPTIONS: DiceOption[] = [
  { value: 'd2', label: 'D2 / Coin', sides: 2 },
  { value: 'd4', label: 'D4', sides: 4 },
  { value: 'd6', label: 'D6', sides: 6 },
  { value: 'd8', label: 'D8', sides: 8 },
  { value: 'd10', label: 'D10', sides: 10 },
  { value: 'd12', label: 'D12', sides: 12 },
  { value: 'd20', label: 'D20', sides: 20 },
  { value: 'd100', label: 'D100', sides: 100 }
];

export const GOAL_COMPARISON_OPTIONS: GoalComparisonOption[] = [
  { value: 'orHigher', label: 'Or Higher' },
  { value: 'orLower', label: 'Or Lower' },
  { value: 'exactly', label: 'Exactly' }
];

export const DICE_COUNT_OPTIONS: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
