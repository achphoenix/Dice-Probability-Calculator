import { Injectable } from '@angular/core';
import { ProbabilityResult, GoalComparison } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ProbabilityEngine {

  /**
   * Calculate probability distribution for rolling dice
   * Uses dynamic programming (convolution) approach
   * @param diceCount Number of dice to roll
   * @param diceType Number of sides on each die
   * @param modifier Modifier to add to results
   * @param cancelSignal Object to check if calculation should be cancelled
   */
  async calculateDistribution(
    diceCount: number,
    diceType: number,
    modifier: number,
    cancelSignal: { cancelled: boolean }
  ): Promise<ProbabilityResult[]> {
    // Start with probability distribution for a single die
    // For a die with N sides, each outcome (1 to N) has probability 1/N
    let distribution = new Map<number, number>();
    
    // Initialize with first die
    for (let i = 1; i <= diceType; i++) {
      distribution.set(i, 1 / diceType);
    }

    // Add remaining dice using convolution
    for (let die = 2; die <= diceCount; die++) {
      if (cancelSignal.cancelled) {
        return [];
      }

      const newDistribution = new Map<number, number>();
      
      // For each existing outcome, add each possible die roll
      for (const [existingValue, existingProb] of distribution) {
        for (let dieValue = 1; dieValue <= diceType; dieValue++) {
          const newValue = existingValue + dieValue;
          const newProb = existingProb * (1 / diceType);
          
          const currentProb = newDistribution.get(newValue) || 0;
          newDistribution.set(newValue, currentProb + newProb);
        }
      }
      
      distribution = newDistribution;
      
      // Yield to UI periodically (every 5 dice)
      if (die % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Check cancellation before final processing
    if (cancelSignal.cancelled) {
      return [];
    }

    // Apply modifier by shifting result values
    const resultsWithModifier = new Map<number, number>();
    for (const [value, prob] of distribution) {
      resultsWithModifier.set(value + modifier, prob);
    }

    // Convert to array (show all results regardless of probability)
    const results: ProbabilityResult[] = [];
    for (const [result, probability] of resultsWithModifier) {
      const percentage = Math.round(probability * 1000) / 10; // Round to 1 decimal place
      
      results.push({
        result,
        probability,
        percentage
      });
    }

    // Sort by result value (ascending)
    results.sort((a, b) => a.result - b.result);

    return results;
  }

  /**
   * Calculate probability of achieving a goal
   * @param results Array of probability results
   * @param goalNumber Target number
   * @param comparison Type of comparison (exactly, or better, or worse)
   * @returns Raw probability (0-1 range)
   */
  calculateGoalProbability(
    results: ProbabilityResult[],
    goalNumber: number,
    comparison: GoalComparison
  ): number {
    let totalProbability = 0;

    for (const result of results) {
      let includeResult = false;

      switch (comparison) {
        case 'exactly':
          includeResult = result.result === goalNumber;
          break;
        case 'orHigher':
          includeResult = result.result >= goalNumber;
          break;
        case 'orLower':
          includeResult = result.result <= goalNumber;
          break;
      }

      if (includeResult) {
        totalProbability += result.probability;
      }
    }

    // Return raw probability (0-1 range)
    return totalProbability;
  }
}
