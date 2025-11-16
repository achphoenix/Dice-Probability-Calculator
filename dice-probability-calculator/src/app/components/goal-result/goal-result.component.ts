import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalResult } from '../../models/types';

@Component({
  selector: 'app-goal-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './goal-result.component.html',
  styleUrls: ['./goal-result.component.css']
})
export class GoalResultComponent {
  @Input() goalResult: GoalResult | null = null;

  formatPercentage(probability: number, percentage: number): string {
    // Check raw probability (0-1 scale) to see if it's very small but non-zero
    if (probability > 0 && probability < 0.001) {
      return '<0.1';
    }
    return percentage.toFixed(1);
  }
}
