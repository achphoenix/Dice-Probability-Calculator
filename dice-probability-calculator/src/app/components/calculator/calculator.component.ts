import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { DICE_OPTIONS, DICE_COUNT_OPTIONS, GOAL_COMPARISON_OPTIONS } from '../../constants/dice.constants';
import { ProbabilityTableComponent } from '../probability-table/probability-table.component';
import { GoalResultComponent } from '../goal-result/goal-result.component';
import { DiceType, GoalComparison } from '../../models/types';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, ProbabilityTableComponent, GoalResultComponent],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  calculatorService = inject(CalculatorService);
  
  diceOptions = DICE_OPTIONS;
  diceCountOptions = DICE_COUNT_OPTIONS;
  goalComparisonOptions = GOAL_COMPARISON_OPTIONS;

  onDiceCountChange(count: string): void {
    this.calculatorService.setDiceCount(Number(count));
  }

  onDiceTypeChange(type: string): void {
    if (type === '') {
      this.calculatorService.setDiceType(null);
    }
    else {
      this.calculatorService.setDiceType(type as DiceType);
    }
  }

  onModifierChange(modifier: string): void {
    // Allow empty string (treated as 0)
    if (modifier === '') {
      this.calculatorService.setModifier(0);
      return;
    }

    // Remove any non-numeric characters except minus sign at the start
    const cleaned = modifier.replace(/[^\d-]/g, '');
    
    // Ensure minus sign only appears at the start
    const sanitized = cleaned.charAt(0) === '-' 
      ? '-' + cleaned.slice(1).replace(/-/g, '')
      : cleaned.replace(/-/g, '');

    const num = Number(sanitized);
    
    // Validate it's a valid number and within reasonable range (-1000 to 1000)
    if (!isNaN(num) && num >= -1000 && num <= 1000) {
      this.calculatorService.setModifier(num);
    }
  }

  onGoalNumberChange(goal: string): void {
    // Allow empty string (no goal)
    if (goal === '') {
      this.calculatorService.setGoalNumber(null);
      return;
    }

    // Remove any non-numeric characters
    const cleaned = goal.replace(/\D/g, '');
    const num = Number(cleaned);
    
    // Validate it's a valid positive integer
    if (!isNaN(num) && num > 0 && num <= 10000) {
      this.calculatorService.setGoalNumber(num);
    }
  }

  onGoalComparisonChange(comparison: string): void {
    this.calculatorService.setGoalComparison(comparison as GoalComparison);
  }
}
