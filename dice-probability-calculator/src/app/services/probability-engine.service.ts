import { Injectable } from '@angular/core';
import { ProbabilityResult, GoalComparison, RollMode, DiceGroup } from '../models/types';

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
   * @param rollMode Whether to roll normally, with advantage, or with disadvantage
   * @param cancelSignal Object to check if calculation should be cancelled
   * 
   * NOTE: When mixed dice types are added in the future, advantage/disadvantage
   * should apply to the entire roll (roll all dice twice, sum each set, take higher/lower)
   */
  async calculateDistribution(
    diceCount: number,
    diceType: number,
    modifier: number,
    rollMode: RollMode,
    cancelSignal: { cancelled: boolean }
  ): Promise<ProbabilityResult[]> {
    // Calculate base distribution (normal roll)
    const baseDistribution = await this.calculateBaseDistribution(
      diceCount,
      diceType,
      modifier,
      cancelSignal
    );

    if (cancelSignal.cancelled || baseDistribution.length === 0) {
      return [];
    }

    // If normal mode, return base distribution
    if (rollMode === 'normal') {
      return baseDistribution;
    }

    // For advantage/disadvantage, we need to calculate the distribution of
    // rolling twice and taking the higher/lower value
    return this.calculateAdvantageDisadvantageDistribution(
      baseDistribution,
      rollMode,
      cancelSignal
    );
  }

  /**
   * Calculate base probability distribution for a single roll
   */
  private async calculateBaseDistribution(
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
   * Calculate probability distribution for mixed dice types
   * @param diceGroups Array of dice groups (each with count and type)
   * @param modifier Modifier to add to results
   * @param rollMode Whether to roll normally, with advantage, or with disadvantage
   * @param cancelSignal Object to check if calculation should be cancelled
   */
  async calculateMixedDistribution(
    diceGroups: DiceGroup[],
    modifier: number,
    rollMode: RollMode,
    cancelSignal: { cancelled: boolean }
  ): Promise<ProbabilityResult[]> {
    if (diceGroups.length === 0) {
      return [];
    }

    // Calculate base distribution for mixed dice
    const baseDistribution = await this.calculateMixedBaseDistribution(
      diceGroups,
      modifier,
      cancelSignal
    );

    if (cancelSignal.cancelled || baseDistribution.length === 0) {
      return [];
    }

    // If normal mode, return base distribution
    if (rollMode === 'normal') {
      return baseDistribution;
    }

    // For advantage/disadvantage, calculate the distribution of rolling twice
    return this.calculateAdvantageDisadvantageDistribution(
      baseDistribution,
      rollMode,
      cancelSignal
    );
  }

  /**
   * Calculate base probability distribution for mixed dice types
   */
  private async calculateMixedBaseDistribution(
    diceGroups: DiceGroup[],
    modifier: number,
    cancelSignal: { cancelled: boolean }
  ): Promise<ProbabilityResult[]> {
    // Start with a distribution representing "0" with probability 1
    let distribution = new Map<number, number>();
    distribution.set(0, 1);

    // Process each dice group
    for (const group of diceGroups) {
      if (cancelSignal.cancelled) {
        return [];
      }

      // Calculate distribution for this group
      const groupDistribution = await this.calculateSingleGroupDistribution(
        group.count,
        group.sides,
        cancelSignal
      );

      if (cancelSignal.cancelled) {
        return [];
      }

      // Convolve with existing distribution
      const newDistribution = new Map<number, number>();
      
      for (const [existingValue, existingProb] of distribution) {
        for (const [groupValue, groupProb] of groupDistribution) {
          const newValue = existingValue + groupValue;
          const newProb = existingProb * groupProb;
          
          const currentProb = newDistribution.get(newValue) || 0;
          newDistribution.set(newValue, currentProb + newProb);
        }
      }
      
      distribution = newDistribution;

      // Yield to UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Apply modifier
    const resultsWithModifier = new Map<number, number>();
    for (const [value, prob] of distribution) {
      resultsWithModifier.set(value + modifier, prob);
    }

    // Convert to array
    const results: ProbabilityResult[] = [];
    for (const [result, probability] of resultsWithModifier) {
      const percentage = Math.round(probability * 1000) / 10;
      
      results.push({
        result,
        probability,
        percentage
      });
    }

    // Sort by result value
    results.sort((a, b) => a.result - b.result);

    return results;
  }

  /**
   * Calculate distribution for a single group of identical dice
   */
  private async calculateSingleGroupDistribution(
    count: number,
    sides: number,
    cancelSignal: { cancelled: boolean }
  ): Promise<Map<number, number>> {
    let distribution = new Map<number, number>();
    
    // Initialize with first die
    for (let i = 1; i <= sides; i++) {
      distribution.set(i, 1 / sides);
    }

    // Add remaining dice using convolution
    for (let die = 2; die <= count; die++) {
      if (cancelSignal.cancelled) {
        return new Map();
      }

      const newDistribution = new Map<number, number>();
      
      for (const [existingValue, existingProb] of distribution) {
        for (let dieValue = 1; dieValue <= sides; dieValue++) {
          const newValue = existingValue + dieValue;
          const newProb = existingProb * (1 / sides);
          
          const currentProb = newDistribution.get(newValue) || 0;
          newDistribution.set(newValue, currentProb + newProb);
        }
      }
      
      distribution = newDistribution;
      
      // Yield to UI periodically
      if (die % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    return distribution;
  }

  /**
   * Calculate advantage/disadvantage distribution
   * Advantage: Roll twice, take higher
   * Disadvantage: Roll twice, take lower
   */
  private calculateAdvantageDisadvantageDistribution(
    baseDistribution: ProbabilityResult[],
    rollMode: RollMode,
    cancelSignal: { cancelled: boolean }
  ): ProbabilityResult[] {
    const newDistribution = new Map<number, number>();

    // For each possible outcome of first roll
    for (const first of baseDistribution) {
      if (cancelSignal.cancelled) {
        return [];
      }

      // For each possible outcome of second roll
      for (const second of baseDistribution) {
        // Determine which value to take based on advantage/disadvantage
        const takenValue = rollMode === 'advantage' 
          ? Math.max(first.result, second.result)
          : Math.min(first.result, second.result);

        // Combined probability is product of individual probabilities
        const combinedProb = first.probability * second.probability;

        // Add to distribution
        const currentProb = newDistribution.get(takenValue) || 0;
        newDistribution.set(takenValue, currentProb + combinedProb);
      }
    }

    // Convert to array
    const results: ProbabilityResult[] = [];
    for (const [result, probability] of newDistribution) {
      const percentage = Math.round(probability * 1000) / 10;
      
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
