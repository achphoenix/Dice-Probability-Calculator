import { Injectable, signal, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProbabilityEngine } from './probability-engine.service';
import { DiceType, GoalComparison, ProbabilityResult, GoalResult } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  // Writable signals for application state
  diceCount = signal<number>(1);
  diceType = signal<DiceType | null>(null);
  modifier = signal<number>(0);
  goalNumber = signal<number | null>(null);
  goalComparison = signal<GoalComparison>('orHigher');
  probabilityResults = signal<ProbabilityResult[]>([]);
  isCalculating = signal<boolean>(false);
  goalResult = signal<GoalResult | null>(null);

  // Subjects for debounced calculation triggering
  private calculationTrigger$ = new Subject<void>();
  private goalCalculationTrigger$ = new Subject<void>();
  private currentCancellationToken = { cancelled: false };

  constructor(private probabilityEngine: ProbabilityEngine) {
    // Set up debounced calculation trigger (300ms delay)
    this.calculationTrigger$
      .pipe(debounceTime(300))
      .subscribe(() => this.executeCalculation());

    // Set up debounced goal calculation trigger (300ms delay)
    this.goalCalculationTrigger$
      .pipe(debounceTime(300))
      .subscribe(() => this.calculateGoalResult());

    // Effect to recalculate goal when results or goal inputs change
    effect(() => {
      const results = this.probabilityResults();
      const goal = this.goalNumber();
      const comparison = this.goalComparison();

      if (results.length > 0 && goal !== null) {
        this.calculateGoalResult();
      }
      else {
        this.goalResult.set(null);
      }
    });
  }

  // Public methods to update state
  setDiceCount(count: number): void {
    this.diceCount.set(count);
    this.triggerCalculation();
  }

  setDiceType(type: DiceType | null): void {
    this.diceType.set(type);
    this.triggerCalculation();
  }

  setModifier(modifier: number): void {
    this.modifier.set(modifier);
    this.triggerCalculation();
  }

  setGoalNumber(goal: number | null): void {
    this.goalNumber.set(goal);
    // Goal calculation happens via effect
  }

  setGoalComparison(comparison: GoalComparison): void {
    this.goalComparison.set(comparison);
    // Goal calculation happens via effect
  }

  // Trigger calculation (cancel current and emit to debounced subject)
  private triggerCalculation(): void {
    this.cancelCurrentCalculation();
    this.calculationTrigger$.next();
  }

  // Cancel ongoing calculation
  private cancelCurrentCalculation(): void {
    this.currentCancellationToken.cancelled = true;
    this.currentCancellationToken = { cancelled: false };
  }

  // Execute probability distribution calculation
  private async executeCalculation(): Promise<void> {
    const count = this.diceCount();
    const type = this.diceType();
    const mod = this.modifier();

    // Validate inputs
    if (count <= 0 || count > 100 || type === null) {
      this.probabilityResults.set([]);
      return;
    }

    // Get sides from dice type
    const sides = parseInt(type.substring(1));

    // Set calculating flag
    this.isCalculating.set(true);

    try {
      // Calculate distribution
      const results = await this.probabilityEngine.calculateDistribution(
        count,
        sides,
        mod,
        this.currentCancellationToken
      );

      // Only update if not cancelled
      if (!this.currentCancellationToken.cancelled) {
        this.probabilityResults.set(results);
      }
    }
    catch (error) {
      console.error('Error calculating probability distribution:', error);
      this.probabilityResults.set([]);
    }
    finally {
      this.isCalculating.set(false);
    }
  }

  // Calculate goal achievement probability
  private calculateGoalResult(): void {
    const results = this.probabilityResults();
    const goal = this.goalNumber();
    const comparison = this.goalComparison();

    if (results.length === 0 || goal === null) {
      this.goalResult.set(null);
      return;
    }

    const probability = this.probabilityEngine.calculateGoalProbability(
      results,
      goal,
      comparison
    );

    // Convert probability to percentage and round to 1 decimal place
    const percentage = Math.round(probability * 1000) / 10;

    // Create display text based on comparison
    let displayText = '';
    switch (comparison) {
      case 'exactly':
        displayText = `${goal} exactly`;
        break;
      case 'orHigher':
        displayText = `${goal} or higher`;
        break;
      case 'orLower':
        displayText = `${goal} or lower`;
        break;
    }

    this.goalResult.set({
      goalNumber: goal,
      comparison,
      probability: probability, // Raw probability (0-1 range)
      percentage: percentage, // Rounded percentage (0-100 range)
      displayText
    });
  }
}
