import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProbabilityResult, GoalComparison } from '../../models/types';

@Component({
  selector: 'app-probability-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './probability-table.component.html',
  styleUrls: ['./probability-table.component.css']
})
export class ProbabilityTableComponent {
  @Input() set results(value: ProbabilityResult[]) {
    this._results.set(value);
  }

  @Input() set goalNumber(value: number | null) {
    this._goalNumber.set(value);
  }

  @Input() set goalComparison(value: GoalComparison) {
    this._goalComparison.set(value);
  }

  protected _results = signal<ProbabilityResult[]>([]);
  protected _goalNumber = signal<number | null>(null);
  protected _goalComparison = signal<GoalComparison>('exactly');
  sortColumn = signal<'result' | 'percentage'>('result');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedResults = computed(() => {
    const results = [...this._results()];
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return results.sort((a, b) => {
      const aVal = column === 'result' ? a.result : a.percentage;
      const bVal = column === 'result' ? b.result : b.percentage;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  });

  highestPercentageResults = computed(() => {
    const results = this._results();
    if (results.length === 0) {
      return new Set<number>();
    }

    // Find the maximum percentage
    const maxPercentage = Math.max(...results.map(r => r.percentage));
    
    // Find all results with this maximum percentage
    const maxResults = results.filter(r => r.percentage === maxPercentage);
    
    // Only return the set if there are 1-3 results with max percentage
    // Return empty set if 4 or more (no bolding)
    if (maxResults.length >= 1 && maxResults.length <= 3) {
      return new Set(maxResults.map(r => r.result));
    }
    
    return new Set<number>();
  });

  toggleSort(column: 'result' | 'percentage'): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    }
    else {
      // Change column, reset to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: 'result' | 'percentage'): string {
    if (this.sortColumn() !== column) {
      return '';
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  formatPercentage(probability: number, percentage: number): string {
    // Check raw probability (0-1 scale) to see if it's very small but non-zero
    if (probability > 0 && probability < 0.001) {
      return '<0.1';
    }
    return percentage.toFixed(1);
  }

  shouldHighlight(result: number): boolean {
    const goal = this._goalNumber();
    const comparison = this._goalComparison();
    
    // No highlighting if no goal is set
    if (goal === null) {
      return false;
    }

    switch (comparison) {
      case 'exactly':
        return result === goal;
      case 'orHigher':
        return result >= goal;
      case 'orLower':
        return result <= goal;
      default:
        return false;
    }
  }

  shouldBeBold(result: number): boolean {
    return this.highestPercentageResults().has(result);
  }
}
