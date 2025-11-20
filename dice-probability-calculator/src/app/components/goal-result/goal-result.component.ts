import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalResult, RollMode } from '../../models/types';

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

  getRollModeText(rollMode: RollMode): string {
    switch (rollMode) {
      case 'advantage':
        return ' with advantage';
      case 'disadvantage':
        return ' with disadvantage';
      case 'normal':
      default:
        return '';
    }
  }

  getColorStyle(percentage: number): { [key: string]: string } {
    let r: number, g: number, b: number;

    if (percentage >= 80) {
      // 80-100%: Bright/Saturated Green
      const factor = (percentage - 80) / 20; // 0 to 1
      r = Math.round(34 + (16 - 34) * factor);
      g = Math.round(197 + (255 - 197) * factor);
      b = Math.round(94 + (16 - 94) * factor);
    } else if (percentage >= 50) {
      // 50-80%: Saturated green to desaturated green
      const factor = (percentage - 50) / 30; // 0 to 1
      r = Math.round(100 + (34 - 100) * factor);
      g = Math.round(140 + (197 - 140) * factor);
      b = Math.round(80 + (94 - 80) * factor);
    } else if (percentage >= 20) {
      // 20-50%: Desaturated red to desaturated green
      const factor = (percentage - 20) / 30; // 0 to 1
      r = Math.round(200 + (100 - 200) * factor);
      g = Math.round(90 + (140 - 90) * factor);
      b = Math.round(70 + (80 - 70) * factor);
    } else {
      // 0-20%: Saturated Red
      const factor = percentage / 20; // 0 to 1
      r = Math.round(200 + (200 - 200) * factor);
      g = Math.round(30 + (90 - 30) * factor);
      b = Math.round(30 + (70 - 30) * factor);
    }

    const textColor = `rgb(${r}, ${g}, ${b})`;
    const bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
    const borderColor = `rgb(${r}, ${g}, ${b})`;

    return {
      '--result-color': textColor,
      '--result-bg': bgColor,
      '--result-border': borderColor
    };
  }
}
