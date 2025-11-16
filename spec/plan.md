# Implementation Plan: Dice Probability Calculator

## Overview
Building a standalone Angular 19 web application that calculates and displays probability distributions for dice combinations (e.g., 2d6+3) with goal comparison functionality. Users can select dice configurations, see probability tables, and check odds of achieving specific target numbers.

## Current State
- Empty project directory with only specification documents
- Target tech stack: Angular 19 with standalone components, TypeScript 5.x, Signals for state management, plain CSS

## Desired End State
A fully functional single-page application where users can:
- Select dice count (1-100) and type (d2, d4, d6, d8, d10, d12, d20, d100)
- Add optional modifiers (+/- integers)
- View probability distribution in a sortable table
- Check goal achievement probability with comparison operators
- Experience mobile-responsive design with appropriate font sizing and layout

**Success Criteria:**
- [x] All user stories from requirements.md are implemented
- [x] All acceptance criteria are met
- [x] Application matches design specifications (layout, fonts, responsive behavior)
- [x] Probability calculations are mathematically accurate
- [x] Application runs without errors on modern browsers
- [x] Mobile-first responsive design functions correctly

## What We're NOT Doing
- Custom dice types beyond standard set (no d3, d7, d14, d30, etc.)
- Mixed dice type pools in single roll (e.g., 2d6 + 3d8)
- Saving or sharing calculations
- History of previous calculations
- Advanced statistics (mean, median, standard deviation)
- Graphical charts/visualizations of distributions
- Advantage/disadvantage mechanics
- Dice explosion or special rolling rules
- User accounts or authentication
- Comparison between different dice combinations
- Export functionality (PDF, CSV)
- Automated testing (per user request)
- Web Workers for calculations (using async approach instead)

## Implementation Approach
We'll build in 5 phases, starting with project foundation and working up through data layer, business logic, UI components, and finally polish. This order ensures we have solid infrastructure before building UI, and allows testing calculations independently before connecting to components. Each phase builds naturally on the previous one, with clear verification points.

---

## Phase 1: Project Setup & Foundation

### Overview
Initialize Angular 19 project with standalone components architecture, set up TypeScript configuration, install dependencies, and create the basic file structure according to design specifications.

### Tasks

#### 1.1 Generate Angular 19 Project
**Action**:
- Run `ng new dice-probability-calculator` with Angular CLI
- Select: Standalone components (not NgModules), CSS for styling, no SSR
- Confirm Angular 19 is installed (check `package.json`)

**Files Created**:
- `package.json` with Angular 19 dependencies
- `angular.json` configuration
- `tsconfig.json` and `tsconfig.app.json`
- `src/main.ts`, `src/index.html`, `src/styles.css`
- `src/app/app.component.ts` (standalone)
- `src/app/app.config.ts`

**Success Criteria**:
- [x] All code changes completed
- [x] Project generates without errors
- [x] Angular 19.x listed in package.json
- [x] Dev server starts successfully: `ng serve`
- [x] Default Angular app loads at `http://localhost:4200`
- [x] No console errors in browser

**Verification Steps**:
1. Run `ng serve` in terminal
2. Open browser to `http://localhost:4200`
3. Verify default Angular welcome page appears
4. Check browser console for errors
5. Expected: Clean page load, no errors

#### 1.2 Set Up Project Structure
**Action**:
- Create directory structure per design.md
- Create placeholder component files (we'll implement later)
- Set up TypeScript strict mode in tsconfig.json
- Install RxJS dependency (if not already included)

**Directories to Create**:
- `src/app/components/calculator/`
- `src/app/components/probability-table/`
- `src/app/components/goal-result/`
- `src/app/services/`
- `src/app/models/`
- `src/app/constants/`

**Files to Create** (empty placeholders):
- `src/app/components/calculator/calculator.component.ts`
- `src/app/components/calculator/calculator.component.html`
- `src/app/components/calculator/calculator.component.css`
- `src/app/components/probability-table/probability-table.component.ts`
- `src/app/components/probability-table/probability-table.component.html`
- `src/app/components/probability-table/probability-table.component.css`
- `src/app/components/goal-result/goal-result.component.ts`
- `src/app/components/goal-result/goal-result.component.html`
- `src/app/components/goal-result/goal-result.component.css`

**Success Criteria**:
- [x] All code changes completed
- [x] All directories created
- [x] All placeholder files created
- [x] TypeScript strict mode enabled
- [x] Project still compiles: `ng build`
- [x] No TypeScript errors

**Verification Steps**:
1. Verify directory structure matches design.md
2. Run `ng build` to check compilation
3. Expected: Build succeeds, all paths exist

---

## Phase 2: Data Layer

### Overview
Define TypeScript interfaces, types, and constants that form the data model. This includes dice types, probability results, goal comparisons, and related data structures from design.md.

### Tasks

#### 2.1 Define Type Definitions
**File**: `src/app/models/types.ts`
**Action**:
- Implement all TypeScript interfaces and types from design.md
- Export all types for use across application

**Code Structure** (from design.md):
```typescript
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
export type GoalComparison = 'exactly' | 'orBetter' | 'orWorse';

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
```

**Test Requirements**:
- [ ] Manually verify types compile without errors
- [ ] Import types into a test file and verify TypeScript accepts valid data
- [ ] Verify TypeScript rejects invalid data (e.g., 'd7' as DiceType)

**Verification Steps**:
1. Run `ng build` or TypeScript compiler
2. Create temporary test file importing types
3. Verify type safety works (invalid assignments show errors)
4. Expected: Clean compilation, type checking works

**Success Criteria**:
- [x] All code changes completed
- [x] File `src/app/models/types.ts` created with all interfaces
- [x] No TypeScript compilation errors
- [x] Types can be imported by other modules
- [x] Type safety verified manually

#### 2.2 Create Dice Constants
**File**: `src/app/constants/dice.constants.ts`
**Action**:
- Create array of available dice options with labels
- Create array of goal comparison options with labels
- Export constants for use in dropdowns

**Code Structure**:
```typescript
import { DiceOption, GoalComparisonOption } from '../models/types';

export const DICE_OPTIONS: DiceOption[] = [
  { value: 'd2', label: 'd2 / Coin', sides: 2 },
  { value: 'd4', label: 'd4', sides: 4 },
  { value: 'd6', label: 'd6', sides: 6 },
  { value: 'd8', label: 'd8', sides: 8 },
  { value: 'd10', label: 'd10', sides: 10 },
  { value: 'd12', label: 'd12', sides: 12 },
  { value: 'd20', label: 'd20', sides: 20 },
  { value: 'd100', label: 'd100', sides: 100 }
];

export const GOAL_COMPARISON_OPTIONS: GoalComparisonOption[] = [
  { value: 'exactly', label: 'Exactly' },
  { value: 'orBetter', label: 'Or Better' },
  { value: 'orWorse', label: 'Or Worse' }
];

export const DICE_COUNT_OPTIONS: number[] = Array.from({ length: 100 }, (_, i) => i + 1);
```

**Test Requirements**:
- [ ] Verify constants compile without errors
- [ ] Manually check array lengths and values in console
- [ ] Verify types match interfaces from types.ts

**Verification Steps**:
1. Run `ng build`
2. Import constants in browser console or temporary component
3. Log DICE_OPTIONS and verify all 8 dice types present
4. Log DICE_COUNT_OPTIONS and verify array has 100 elements (1-100)
5. Expected: All constants accessible, correct structure

**Success Criteria**:
- [x] All code changes completed
- [x] File `src/app/constants/dice.constants.ts` created
- [x] All constants defined and exported
- [x] No TypeScript errors
- [x] Constants match design specifications

---

## Phase 3: Probability Calculation Engine

### Overview
Implement the core probability calculation logic in ProbabilityEngine service. This is pure mathematical logic independent of UI, using dynamic programming to calculate dice probability distributions.

### Tasks

#### 3.1 Create Probability Engine Service
**File**: `src/app/services/probability-engine.service.ts`
**Action**:
- Generate service with Angular CLI: `ng generate service services/probability-engine`
- Implement probability distribution calculation algorithm
- Use dynamic programming / convolution method
- Add async yielding with setTimeout to keep UI responsive
- Implement cancellation support via cancellation token

**Implements User Story**: Story 1 (Calculate Basic Dice Probabilities) - calculation logic

**Code Structure** (from design.md):
```typescript
@Injectable({
  providedIn: 'root'
})
export class ProbabilityEngine {
  
  async calculateDistribution(
    diceCount: number,
    diceType: number,
    modifier: number,
    cancelSignal: { cancelled: boolean }
  ): Promise<ProbabilityResult[]> {
    // Dynamic programming approach
    // Build probability distribution through convolution
    // Yield periodically with setTimeout
    // Check cancelSignal.cancelled periodically
    // Filter results below 0.1% threshold
    // Round percentages to 1 decimal place
    // Return array of ProbabilityResult
  }

  calculateGoalProbability(
    results: ProbabilityResult[],
    goalNumber: number,
    comparison: GoalComparison
  ): number {
    // Sum probabilities based on comparison type
    // 'exactly': match goalNumber
    // 'orBetter': >= goalNumber
    // 'orWorse': <= goalNumber
    // Return percentage (0-100)
  }
}
```

**Algorithm Details**:
- Start with single die distribution: [1/sides, 1/sides, ...]
- For each additional die, convolve with existing distribution
- Convolution: for each outcome, multiply probabilities and sum
- Yield control every N iterations (e.g., every 1000) using `await new Promise(resolve => setTimeout(resolve, 0))`
- After all dice calculated, apply modifier by shifting result values
- Filter out results where percentage < 0.1%
- Round percentages to 1 decimal: `Math.round(percentage * 10) / 10`

**Test Requirements**:
- [ ] Manually test known distributions:
  - 1d6: Each result (1-6) should be 16.7%
  - 2d6: Result 7 should be 16.7%, result 2 should be 2.8%
  - 1d20: Each result (1-20) should be 5.0%
- [ ] Test with modifier: 1d6+5 should give results 6-11, same percentages
- [ ] Test cancellation: Start large calculation, cancel, verify promise resolves without completing
- [ ] Test filtering: 10d10 should exclude very unlikely results (<0.1%)

**Verification Steps**:
1. Create temporary test component or use browser console
2. Instantiate ProbabilityEngine
3. Call `calculateDistribution(1, 6, 0, {cancelled: false})`
4. Log results and verify: 6 results, each ~16.7%
5. Test 2d6: Verify result 7 is most likely (~16.7%)
6. Test modifier: 1d6+10 gives results 11-16
7. Expected: Mathematically correct probability distributions

**Success Criteria**:
- [x] All code changes completed
- [x] Service created at correct path
- [x] `calculateDistribution` method implemented
- [x] `calculateGoalProbability` method implemented
- [x] Known distributions produce correct results (verified manually)
- [x] Filtering of <0.1% results works
- [x] Rounding to 1 decimal place works
- [x] Async behavior doesn't block (verified with large dice pools)
- [x] Cancellation mechanism works

---

## Phase 4: State Management Service

### Overview
Implement CalculatorService using Angular Signals for reactive state management. This service coordinates user inputs, triggers calculations, handles debouncing, and manages cancellation.

### Tasks

#### 4.1 Create Calculator Service with Signals
**File**: `src/app/services/calculator.service.ts`
**Action**:
- Generate service: `ng generate service services/calculator`
- Define all state signals per design.md
- Implement methods to update signals
- Add debouncing for input changes using RxJS
- Connect to ProbabilityEngine for calculations
- Implement calculation cancellation when inputs change

**Code Structure** (from design.md):
```typescript
import { Injectable, signal, computed, effect } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { ProbabilityEngine } from './probability-engine.service';
import { DiceType, GoalComparison, ProbabilityResult, GoalResult } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  // Writable signals
  diceCount = signal<number>(1);
  diceType = signal<DiceType | null>(null);
  modifier = signal<number>(0);
  goalNumber = signal<number | null>(null);
  goalComparison = signal<GoalComparison>('exactly');
  probabilityResults = signal<ProbabilityResult[]>([]);
  isCalculating = signal<boolean>(false);
  goalResult = signal<GoalResult | null>(null);

  private calculationTrigger$ = new Subject<void>();
  private currentCancellationToken = { cancelled: false };

  constructor(private probabilityEngine: ProbabilityEngine) {
    // Set up debounced calculation trigger
    this.calculationTrigger$
      .pipe(debounceTime(300))
      .subscribe(() => this.executeCalculation());
  }

  // Public methods to update state
  setDiceCount(count: number): void { ... }
  setDiceType(type: DiceType): void { ... }
  setModifier(modifier: number): void { ... }
  setGoalNumber(goal: number | null): void { ... }
  setGoalComparison(comparison: GoalComparison): void { ... }

  private triggerCalculation(): void { ... }
  private async executeCalculation(): Promise<void> { ... }
  private cancelCurrentCalculation(): void { ... }
  private calculateGoalResult(): void { ... }
}
```

**Implementation Details**:
- Each setter method updates signal and calls `triggerCalculation()`
- `triggerCalculation()` cancels current calculation and emits to `calculationTrigger$` Subject
- RxJS `debounceTime(300)` waits 300ms before executing
- `executeCalculation()` validates inputs (diceCount > 0, diceType !== null)
- If valid, sets `isCalculating(true)`, calls ProbabilityEngine, updates `probabilityResults`
- After results updated, calls `calculateGoalResult()` if goal inputs present
- Cancellation token (`{cancelled: false}`) passed to engine, set to `{cancelled: true}` when cancelled

**Implements User Story**: 
- Story 1: Calculation triggering and state management
- Story 2: Modifier application
- Story 3: Goal comparison state management

**Test Requirements**:
- [ ] Manually test signal updates in component
- [ ] Verify debouncing: Change input rapidly, verify calculation waits 300ms
- [ ] Test cancellation: Change input during calculation, verify previous calculation stops
- [ ] Test goal calculation: Set goal number and comparison, verify goalResult signal updates
- [ ] Test invalid states: Clear dice type, verify calculation doesn't trigger

**Verification Steps**:
1. Import service into app.component temporarily
2. Subscribe to signals or log in effects
3. Call setters and verify signals update
4. Rapidly call setDiceCount multiple times, verify only one calculation after 300ms
5. Test with valid inputs (e.g., setDiceCount(2), setDiceType('d6')), verify probabilityResults populates
6. Expected: Debouncing works, calculations trigger correctly, signals update reactively

**Success Criteria**:
- [x] All code changes completed
- [x] Service created with all signals defined
- [x] All setter methods implemented
- [x] Debouncing configured at 300ms
- [x] Calculation triggering logic works
- [x] Cancellation mechanism implemented
- [x] Goal calculation logic implemented
- [x] Signals update correctly when tested manually
- [x] Invalid states handled (no calculation without dice type)

---

## Phase 5: UI Components Implementation

### Overview
Build all UI components (Calculator, ProbabilityTable, GoalResult) with templates and connect them to CalculatorService signals. Implement user interactions including input handling and table sorting.

### Tasks

#### 5.1 Create App Component Root Layout
**File**: `src/app/app.component.ts`, `src/app/app.component.html`, `src/app/app.component.css`
**Action**:
- Update app.component to use standalone architecture
- Import CalculatorComponent
- Create simple root layout with title

**Template** (from design.md):
```html
<div class="app-container">
  <h1>Dice Probability Calculator</h1>
  <app-calculator></app-calculator>
</div>
```

**CSS**:
```css
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}
```

**Success Criteria**:
- [x] All code changes completed
- [x] AppComponent updated to standalone
- [x] Template includes title and calculator component placeholder
- [x] Basic layout CSS applied
- [x] App compiles without errors

**Verification Steps**:
1. Run `ng serve`
2. Open browser to localhost:4200
3. Verify title appears
4. Expected: Title visible, no errors (calculator component empty for now)

#### 5.2 Implement Calculator Component Structure
**File**: `src/app/components/calculator/calculator.component.ts`
**Action**:
- Create standalone component
- Inject CalculatorService
- Consume signals from service
- Import constants (DICE_OPTIONS, DICE_COUNT_OPTIONS, GOAL_COMPARISON_OPTIONS)

**Component Code**:
```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalculatorService } from '../../services/calculator.service';
import { DICE_OPTIONS, DICE_COUNT_OPTIONS, GOAL_COMPARISON_OPTIONS } from '../../constants/dice.constants';
import { ProbabilityTableComponent } from '../probability-table/probability-table.component';
import { GoalResultComponent } from '../goal-result/goal-result.component';

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
    this.calculatorService.setDiceType(type as any);
  }

  onModifierChange(modifier: string): void {
    const num = modifier === '' ? 0 : Number(modifier);
    if (!isNaN(num)) {
      this.calculatorService.setModifier(num);
    }
  }

  onGoalNumberChange(goal: string): void {
    const num = goal === '' ? null : Number(goal);
    if (goal === '' || !isNaN(num!)) {
      this.calculatorService.setGoalNumber(num);
    }
  }

  onGoalComparisonChange(comparison: string): void {
    this.calculatorService.setGoalComparison(comparison as any);
  }
}
```

**Success Criteria**:
- [x] All code changes completed
- [x] Component created as standalone
- [x] Service injected correctly
- [x] All constants imported
- [x] All event handler methods implemented
- [x] Component compiles without errors

**Verification Steps**:
1. Run `ng build`
2. Check for TypeScript errors
3. Expected: Clean compilation, no errors

#### 5.3 Implement Calculator Component Template
**File**: `src/app/components/calculator/calculator.component.html`
**Action**:
- Create form inputs for all user controls
- Bind to signals via two-way binding or event handlers
- Include child components (table and goal result)
- Match layout structure from design.md

**Implements User Story**: 
- Story 1: Dice selection dropdowns
- Story 2: Modifier input field
- Story 3: Goal input and comparison dropdown

**Template Structure**:
```html
<div class="calculator-container">
  <div class="input-section">
    <div class="input-group">
      <label for="dice-count">Number of Dice:</label>
      <select 
        id="dice-count" 
        [value]="calculatorService.diceCount()"
        (change)="onDiceCountChange($any($event.target).value)">
        <option *ngFor="let count of diceCountOptions" [value]="count">{{ count }}</option>
      </select>
    </div>

    <div class="input-group">
      <label for="dice-type">Dice Type:</label>
      <select 
        id="dice-type"
        [value]="calculatorService.diceType() ?? ''"
        (change)="onDiceTypeChange($any($event.target).value)">
        <option value="" disabled>Select di(c)e</option>
        <option *ngFor="let option of diceOptions" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="input-group">
      <label for="modifier">Modifier:</label>
      <input 
        type="text" 
        id="modifier"
        [value]="calculatorService.modifier() || ''"
        (input)="onModifierChange($any($event.target).value)"
        placeholder="e.g., +5 or -2">
    </div>

    <div class="input-group">
      <label for="goal-number">Goal Number:</label>
      <input 
        type="text" 
        id="goal-number"
        [value]="calculatorService.goalNumber() ?? ''"
        (input)="onGoalNumberChange($any($event.target).value)"
        placeholder="Optional">
    </div>

    <div class="input-group">
      <label for="goal-comparison">Comparison:</label>
      <select 
        id="goal-comparison"
        [value]="calculatorService.goalComparison()"
        (change)="onGoalComparisonChange($any($event.target).value)">
        <option *ngFor="let option of goalComparisonOptions" [value]="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>

  <div class="results-section">
    <app-goal-result [goalResult]="calculatorService.goalResult()"></app-goal-result>
    <app-probability-table [results]="calculatorService.probabilityResults()"></app-probability-table>
  </div>
</div>
```

**Test Requirements**:
- [ ] Verify all dropdowns populate correctly
- [ ] Test dice count dropdown (1-100 options visible)
- [ ] Test dice type dropdown (8 options + "Select di(c)e" placeholder)
- [ ] Test modifier input accepts positive/negative numbers
- [ ] Test goal inputs respond to changes
- [ ] Verify signals update when inputs change

**Verification Steps**:
1. Run `ng serve` and open browser
2. Check dice count dropdown: verify 100 options (1-100)
3. Check dice type dropdown: verify 8 dice types plus placeholder
4. Type in modifier field: verify input accepts numbers and +/- symbols
5. Change any input: verify CalculatorService signals update (check with Angular DevTools)
6. Expected: All inputs functional, signals update correctly

**Success Criteria**:
- [x] All code changes completed
- [x] Template created with all input fields
- [x] All form controls bound to service signals
- [x] Dropdowns populated from constants
- [x] Event handlers wired correctly
- [x] Inputs render and respond to user interaction

#### 5.4 Create Probability Table Component
**File**: `src/app/components/probability-table/probability-table.component.ts`
**Action**:
- Create standalone component
- Accept results array as input
- Implement sorting logic with signals for sort column and direction
- Display table only when results exist

**Implements User Story**: Story 4 (Sort and Analyze Results)

**Component Code**:
```typescript
import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProbabilityResult } from '../../models/types';

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

  private _results = signal<ProbabilityResult[]>([]);
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

  toggleSort(column: 'result' | 'percentage'): void {
    if (this.sortColumn() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Change column, reset to ascending
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: 'result' | 'percentage'): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }
}
```

**Template**: `src/app/components/probability-table/probability-table.component.html`
```html
<div class="table-container" *ngIf="_results().length > 0">
  <table>
    <thead>
      <tr>
        <th (click)="toggleSort('result')" class="sortable">
          Result {{ getSortIcon('result') }}
        </th>
        <th (click)="toggleSort('percentage')" class="sortable">
          % Chance {{ getSortIcon('percentage') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let row of sortedResults()">
        <td>{{ row.result }}</td>
        <td>{{ row.percentage }}%</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Test Requirements**:
- [ ] Verify table displays when results exist
- [ ] Test default sort (result ascending)
- [ ] Click "Result" header: verify sort toggles
- [ ] Click "% Chance" header: verify sort by percentage
- [ ] Verify arrow indicators (↑↓) appear correctly
- [ ] Test with real probability data (2d6)

**Verification Steps**:
1. Set up valid dice configuration (e.g., 2 dice, d6)
2. Wait for results to calculate
3. Verify table appears with results sorted by result (low to high)
4. Click "Result" header: verify sort reverses (high to low)
5. Click "% Chance" header: verify sort by percentage
6. Verify arrow indicators match current sort
7. Expected: Table sorts correctly, indicators accurate

**Success Criteria**:
- [x] All code changes completed
- [x] Component created with sorting logic
- [x] Template displays table correctly
- [x] Sorting works for both columns
- [x] Sort direction toggles correctly
- [x] Arrow indicators display correctly
- [x] Table hidden when no results
- [x] Manual testing confirms sorting behavior

#### 5.5 Create Goal Result Component
**File**: `src/app/components/goal-result/goal-result.component.ts`
**Action**:
- Create standalone component
- Accept goalResult as input
- Display prominent text with 20px font
- Hide when goalResult is null

**Implements User Story**: Story 3 (Check Goal Achievement Probability)

**Component Code**:
```typescript
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
}
```

**Template**: `src/app/components/goal-result/goal-result.component.html`
```html
<div class="goal-result" *ngIf="goalResult">
  <p>
    Your chance of rolling {{ goalResult.displayText }} is {{ goalResult.percentage }}%
  </p>
</div>
```

**Test Requirements**:
- [ ] Verify component displays when goalResult exists
- [ ] Verify component hidden when goalResult is null
- [ ] Test with various goal configurations (exactly, or better, or worse)
- [ ] Verify displayText formats correctly
- [ ] Verify font-size is 20px (will be set in CSS)

**Verification Steps**:
1. Set up dice configuration with goal number and comparison
2. Verify goal result text appears
3. Verify text includes goal number, comparison type, and percentage
4. Clear goal number field
5. Verify goal result disappears
6. Expected: Component shows/hides correctly, text formatted properly

**Success Criteria**:
- [x] All code changes completed
- [x] Component created and accepts input
- [x] Template displays text conditionally
- [x] Text format matches design (includes displayText and percentage)
- [x] Component hidden when no goal specified
- [x] Manual testing confirms behavior

---

## Phase 6: Styling & Responsive Design

### Overview
Apply CSS styling to all components following mobile-first approach. Implement responsive layout with breakpoints, ensure correct font sizes (12px for table, 20px for goal result), and position goal result appropriately (centered mobile, center-left desktop).

### Tasks

#### 6.1 Create Global Styles
**File**: `src/styles.css`
**Action**:
- Add CSS reset/normalization
- Set global font family and base styles
- Ensure box-sizing border-box

**Implements User Story**: Story 5 (Mobile-Responsive Experience)

**CSS**:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
}

input, select {
  font-family: inherit;
  font-size: 16px; /* Prevents zoom on iOS */
}
```

**Success Criteria**:
- [x] All code changes completed
- [x] Global styles applied
- [x] Font family set
- [x] CSS reset in place

**Verification Steps**:
1. Run app and inspect in browser
2. Verify font applies globally
3. Expected: Consistent styling baseline

#### 6.2 Style Calculator Component (Mobile-First)
**File**: `src/app/components/calculator/calculator.component.css`
**Action**:
- Create mobile-first layout (single column)
- Style input groups with labels and form controls
- Ensure touch-friendly tap targets (44x44px minimum)
- Add responsive breakpoint for desktop layout

**CSS Structure**:
```css
.calculator-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: 600;
  font-size: 14px;
}

.input-group select,
.input-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  min-height: 44px; /* Touch-friendly */
}

.input-group select:focus,
.input-group input:focus {
  outline: 2px solid #007bff;
  border-color: #007bff;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Desktop layout */
@media (min-width: 1024px) {
  .input-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .results-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
  }
}
```

**Test Requirements**:
- [ ] Test on mobile viewport (320px-767px)
- [ ] Test on tablet viewport (768px-1023px)
- [ ] Test on desktop viewport (1024px+)
- [ ] Verify touch targets are at least 44x44px on mobile
- [ ] Test focus states on inputs
- [ ] Verify layout shifts correctly at breakpoints

**Verification Steps**:
1. Open browser DevTools, set to mobile viewport (375px)
2. Verify inputs stack vertically, full width
3. Verify tap targets are large enough (44px+)
4. Expand to desktop width (1200px)
5. Verify input-section displays as 2-column grid
6. Verify results-section displays table on left, goal on right
7. Expected: Responsive layout works, touch-friendly on mobile

**Success Criteria**:
- [x] All code changes completed
- [x] Mobile-first CSS written
- [x] Desktop breakpoint implemented
- [x] Touch-friendly tap targets on mobile
- [x] Focus states visible
- [x] Layout tested at multiple viewport sizes
- [x] Manual verification confirms responsive behavior

#### 6.3 Style Probability Table Component
**File**: `src/app/components/probability-table/probability-table.component.css`
**Action**:
- Set font-size to 12px per design
- Style table with borders and alternating rows
- Make headers clickable with hover states
- Ensure table scrollable on mobile if needed

**CSS**:
```css
.table-container {
  width: 100%;
  overflow-x: auto;
  font-size: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead th {
  background-color: #f0f0f0;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

thead th.sortable {
  cursor: pointer;
  user-select: none;
}

thead th.sortable:hover {
  background-color: #e0e0e0;
}

tbody td {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}

tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f0f0f0;
}
```

**Test Requirements**:
- [ ] Verify font-size is 12px
- [ ] Test table scrolling on narrow mobile screens
- [ ] Verify header hover states work
- [ ] Test alternating row colors
- [ ] Verify borders and spacing

**Verification Steps**:
1. View table with results
2. Use browser DevTools to verify computed font-size: 12px
3. Hover over headers, verify hover effect
4. Verify alternating row colors
5. Test on narrow viewport (320px), verify table scrolls if needed
6. Expected: Table styled correctly, 12px font, scrollable on mobile

**Success Criteria**:
- [x] All code changes completed
- [x] Font-size set to 12px
- [x] Table styled with borders and colors
- [x] Headers clickable with hover states
- [x] Table scrollable on small screens
- [x] Manual testing confirms styling

#### 6.4 Style Goal Result Component
**File**: `src/app/components/goal-result/goal-result.component.css`
**Action**:
- Set font-size to 20px per design
- Center text on mobile
- Position center-left on desktop
- Add visual prominence (bold, color)

**Implements User Story**: Story 3 (Goal display prominence) and Story 5 (Goal positioning)

**CSS**:
```css
.goal-result {
  padding: 20px;
  background-color: #e7f3ff;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.goal-result p {
  font-size: 20px;
  font-weight: 600;
  color: #0056b3;
  text-align: center;
  margin: 0;
}

/* Desktop: adjust positioning */
@media (min-width: 1024px) {
  .goal-result p {
    text-align: left;
  }
}
```

**Test Requirements**:
- [ ] Verify font-size is 20px
- [ ] Test centering on mobile (<1024px)
- [ ] Test left-alignment on desktop (≥1024px)
- [ ] Verify visual prominence (color, background, border)

**Verification Steps**:
1. View goal result on mobile viewport (375px)
2. Verify text is centered
3. Verify font-size is 20px (DevTools)
4. Switch to desktop viewport (1200px)
5. Verify text is left-aligned
6. Verify background color and border appear
7. Expected: 20px font, centered mobile, left-aligned desktop

**Success Criteria**:
- [x] All code changes completed
- [x] Font-size set to 20px
- [x] Text centered on mobile
- [x] Text left-aligned on desktop
- [x] Visual prominence styling applied
- [x] Manual testing confirms responsive behavior

---

## Phase 7: Polish, Edge Cases & Final Testing

### Overview
Handle edge cases, improve error handling, test large dice combinations, and perform comprehensive manual testing across all user stories and acceptance criteria.

### Tasks

#### 7.1 Implement Input Validation & Error Handling
**Action**:
- Add validation for modifier input (only accept numbers and +/-)
- Add validation for goal input (only accept numbers)
- Handle edge case: negative modifier producing negative results
- Handle edge case: goal number outside possible range (show 0.0%)
- Handle edge case: empty modifier/goal fields

**Files to Modify**:
- `src/app/components/calculator/calculator.component.ts` (validation in event handlers)
- `src/app/services/calculator.service.ts` (validate before calculation)

**Test Requirements**:
- [ ] Type letters in modifier field: verify rejected or ignored
- [ ] Type letters in goal field: verify rejected or ignored
- [ ] Enter negative modifier (e.g., -5): verify results shift correctly
- [ ] Enter goal impossible to reach: verify shows 0.0%
- [ ] Leave modifier empty: verify treated as 0
- [ ] Leave goal empty: verify goal result hidden

**Verification Steps**:
1. Test modifier input with various inputs:
   - Valid: "5", "+5", "-5", "0"
   - Invalid: "abc", "5a", "+-5"
2. Test goal input with various inputs:
   - Valid: "10", "100", ""
   - Invalid: "abc", "10.5"
3. Test edge case: 1d6 with goal 10 → should show 0.0%
4. Test edge case: 1d6 with modifier -10 → verify handles gracefully
5. Expected: Invalid input rejected, edge cases handled without errors

**Success Criteria**:
- [x] All code changes completed
- [x] Input validation implemented
- [x] Invalid characters rejected from number fields
- [x] Negative modifiers work correctly
- [x] Impossible goals show 0.0%
- [x] Empty fields handled (treated as null/0)
- [x] No console errors on edge cases

#### 7.2 Test Performance with Large Dice Combinations
**Action**:
- Test calculation performance with large combinations
- Verify UI remains responsive during calculation
- Add loading indicator if needed
- Test cancellation with large calculations

**Test Requirements**:
- [ ] Test 10d10: verify calculation completes quickly (<1s)
- [ ] Test 50d50: verify UI remains responsive, calculation completes
- [ ] Test 100d100: verify calculation completes, may take several seconds
- [ ] Test changing inputs during large calculation: verify cancels cleanly
- [ ] Verify isCalculating signal works (could display loading spinner)

**Verification Steps**:
1. Select 100 dice, d100
2. Observe calculation time
3. During calculation, try clicking inputs
4. Verify UI doesn't freeze (can still interact)
5. Change dice count mid-calculation
6. Verify previous calculation cancels, new one starts
7. Expected: Large calculations complete, UI stays responsive, cancellation works

**Success Criteria**:
- [ ] Large combinations tested (10d10, 50d50, 100d100)
- [ ] UI remains responsive during calculations
- [ ] Cancellation works for large calculations
- [ ] No browser crashes or freezes
- [ ] Performance is acceptable (100d100 completes within ~10 seconds)

#### 7.3 Comprehensive Manual Testing - All User Stories
**Action**:
- Systematically test all acceptance criteria from requirements.md
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on actual mobile device (iOS and/or Android)
- Verify all edge cases from requirements

**Implements User Story**: All stories (final verification)

**Test Checklist from Requirements**:

**Story 1: Calculate Basic Dice Probabilities**
- [ ] Select number of dice from 1 to 100
- [ ] Select dice type (d2/Coin, d4, d6, d8, d10, d12, d20, d100)
- [ ] Dice type dropdown shows "Select di(c)e" as default
- [ ] Number of dice dropdown defaults to 1
- [ ] Probability table displays automatically with valid inputs
- [ ] Table shows "Result" and "% Chance" columns
- [ ] Results below 0.1% are hidden
- [ ] Percentages rounded to one decimal place
- [ ] Table sorted by result value (lowest to highest) by default
- [ ] Calculation happens without blocking user input

**Story 2: Apply Roll Modifiers**
- [ ] Can enter positive modifier
- [ ] Can enter negative modifier
- [ ] Field accepts zero
- [ ] Field can be left blank (treated as no modifier)
- [ ] Field defaults to empty
- [ ] Probability table updates to show modified results
- [ ] Table recalculates automatically when modifier changes
- [ ] Invalid characters rejected

**Story 3: Check Goal Achievement Probability**
- [ ] Can enter target number
- [ ] Can select comparison type: "Exactly", "Or Better", "Or Worse"
- [ ] Goal result displays as separate text
- [ ] Goal result appears above table on mobile
- [ ] Goal result appears next to table on desktop
- [ ] Goal field is optional
- [ ] Goal comparison uses modified results when modifier applied

**Story 4: Sort and Analyze Results**
- [ ] Table headers are clickable
- [ ] Clicking "Result" header sorts by result value
- [ ] Clicking "% Chance" header sorts by probability
- [ ] Arrow indicator shows current sort column and direction
- [ ] Default sort is by result value (lowest to highest)
- [ ] Can toggle between ascending and descending

**Story 5: Mobile-Responsive Experience**
- [ ] Interface works on mobile viewport
- [ ] All dropdowns and inputs tappable on mobile
- [ ] Table readable and scrollable on small screens
- [ ] Goal result appears above table on mobile view
- [ ] Layout scales for tablet and desktop
- [ ] Goal result appears next to table on desktop view

**Edge Cases to Test**:
- [ ] User changes inputs mid-calculation
- [ ] Very large combinations (100d100)
- [ ] Large modifiers (e.g., 1d6+100)
- [ ] Negative modifiers (e.g., 1d6-5)
- [ ] User enters "0" vs leaving field blank
- [ ] Goal is impossible to achieve
- [ ] Goal field is empty
- [ ] Multiple clicks on same header (toggle sort)

**Verification Steps**:
1. Go through each checklist item systematically
2. Test on Chrome desktop
3. Test on Chrome mobile emulation (DevTools)
4. Test on actual mobile device if available
5. Test on Firefox and Edge
6. Document any issues found
7. Expected: All checklist items pass, all edge cases handled

**Success Criteria**:
- [ ] All user story acceptance criteria verified manually
- [ ] All edge cases tested and handled correctly
- [ ] Testing completed on multiple browsers
- [ ] Mobile testing completed (emulated and/or real device)
- [ ] No critical bugs or errors found
- [ ] Application matches all design specifications
- [ ] All functional requirements met

#### 7.4 Final Code Cleanup & Documentation
**Action**:
- Remove any console.log statements used during development
- Add comments to complex probability calculation logic
- Ensure consistent code formatting
- Update README.md with project description and run instructions

**File**: `README.md`
**Action**: Update with project information

**README Content**:
```markdown
# Dice Probability Calculator

A web application that calculates and displays probability distributions for rolling various dice combinations.

## Features
- Calculate probabilities for standard dice (d2, d4, d6, d8, d10, d12, d20, d100)
- Support for 1-100 dice
- Add positive or negative modifiers
- Check goal achievement probability (exactly, or better, or worse)
- Sortable probability table
- Mobile-responsive design

## Tech Stack
- Angular 19 (standalone components)
- TypeScript 5.x
- Angular Signals for state management
- Plain CSS (mobile-first design)

## Development

Install dependencies:
```
npm install
```

Run development server:
```
ng serve
```

Navigate to `http://localhost:4200/`

Build for production:
```
ng build
```

## Usage
1. Select number of dice (1-100)
2. Select dice type (d2 through d100)
3. Optionally add a modifier (+/- integer)
4. View probability distribution in table
5. Optionally enter a goal number and comparison type
6. Click table headers to sort results
```

**Success Criteria**:
- [x] All code changes completed
- [x] Console.log statements removed
- [x] Complex algorithms commented
- [x] Code formatted consistently
- [x] README.md updated with project info
- [x] Project ready for delivery

---

## Verification Checklist

### Requirements Completion

#### User Story 1: Calculate Basic Dice Probabilities
- [ ] Can select dice count (1-100 in dropdown)
- [ ] Can select dice type (8 options)
- [ ] Dice type shows "Select di(c)e" by default
- [ ] Dice count defaults to 1
- [ ] Probability table displays automatically when valid
- [ ] Table has "Result" and "% Chance" columns
- [ ] Results below 0.1% probability are hidden
- [ ] Percentages rounded to one decimal place
- [ ] Table sorted by result (low to high) by default
- [ ] Calculation is asynchronous (doesn't block UI)

#### User Story 2: Apply Roll Modifiers
- [ ] Modifier input field accepts positive numbers
- [ ] Modifier input accepts negative numbers
- [ ] Modifier input accepts zero
- [ ] Modifier field can be left blank (treated as 0)
- [ ] Modifier field defaults to empty
- [ ] Probability table updates with modified results
- [ ] Table recalculates automatically when modifier changes
- [ ] Invalid characters are rejected from modifier field

#### User Story 3: Check Goal Achievement Probability
- [ ] Goal number input field exists
- [ ] Goal comparison dropdown exists (Exactly, Or Better, Or Worse)
- [ ] Goal result displays as separate text
- [ ] Goal result appears above table on mobile (<1024px)
- [ ] Goal result appears next to table on desktop (≥1024px)
- [ ] Goal field is optional (table still shows without goal)
- [ ] Goal comparison uses modified results when modifier applied

#### User Story 4: Sort and Analyze Results
- [ ] Table headers are clickable
- [ ] Clicking "Result" header sorts by result value
- [ ] Clicking "% Chance" header sorts by probability
- [ ] Arrow indicator shows current sort column and direction
- [ ] Default sort is by result value (ascending)
- [ ] Can toggle between ascending and descending for each column

#### User Story 5: Mobile-Responsive Experience
- [ ] Interface designed mobile-first
- [ ] All dropdowns and inputs are tappable on mobile (44x44px targets)
- [ ] Table is readable and scrollable on small screens
- [ ] Goal result appears above table on mobile
- [ ] Layout scales appropriately for tablet and desktop
- [ ] Goal result appears next to table on desktop

### Design Implementation
- [ ] All components from design.md implemented:
  - [ ] AppComponent (root layout)
  - [ ] CalculatorComponent (main UI)
  - [ ] ProbabilityTableComponent (table with sorting)
  - [ ] GoalResultComponent (goal display)
- [ ] All services from design.md implemented:
  - [ ] CalculatorService (state management with Signals)
  - [ ] ProbabilityEngine (calculation logic)
- [ ] Data model matches design.md:
  - [ ] types.ts with all interfaces and types
  - [ ] dice.constants.ts with constants
- [ ] File structure matches design.md
- [ ] Tech stack matches design.md (Angular 19, TypeScript, Signals, plain CSS)

### Functional Requirements
- [ ] FR1: Supports d2, d4, d6, d8, d10, d12, d20, d100
- [ ] FR2: Probability calculations are accurate (verified manually)
- [ ] FR3: Asynchronous calculation (UI stays responsive)
- [ ] FR4: Results below 0.1% filtered out
- [ ] FR5: Modifier support (positive and negative integers)
- [ ] FR6: Goal comparison works (Exactly, Or Better, Or Worse)
- [ ] FR7: Dynamic sorting by result or percentage

### Non-Functional Requirements
- [ ] Performance: Common combinations (1-10 dice) complete in <500ms
- [ ] Performance: Large combinations (50+ dice) show no UI freezing
- [ ] Performance: Debouncing prevents excessive calculations (300ms)
- [ ] Usability: Default state allows immediate use (minimal clicks)
- [ ] Usability: Key information visible without scrolling on mobile
- [ ] Accessibility: All inputs keyboard accessible
- [ ] Accessibility: Form inputs have proper labels
- [ ] Browser compatibility: Works on Chrome, Firefox, Safari, Edge

### Visual Design
- [ ] Table font-size is 12px
- [ ] Goal result font-size is 20px
- [ ] Goal result centered on mobile
- [ ] Goal result center-left on desktop
- [ ] Mobile breakpoint at 320px-767px
- [ ] Desktop breakpoint at 1024px+
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Responsive layout works at all viewport sizes

### Quality Checks
- [ ] Project builds without errors: `ng build`
- [ ] Dev server starts: `ng serve`
- [ ] Application loads without errors
- [ ] No console errors during normal usage
- [ ] TypeScript strict mode enabled
- [ ] Code is formatted consistently

### User Acceptance
- [ ] Manually tested all user flows
- [ ] Verified all edge cases from requirements:
  - [ ] Changing inputs mid-calculation
  - [ ] Very large dice combinations (100d100)
  - [ ] Large modifiers
  - [ ] Negative modifiers
  - [ ] User enters "0" vs leaving field blank
  - [ ] Impossible goals (show 0.0%)
  - [ ] Empty goal field (hides goal result)
  - [ ] Multiple clicks on same header (toggle sort)
- [ ] Tested on multiple browsers
- [ ] Tested on mobile device (emulated or real)

---

## Development Notes

### Suggested Order
1. Follow phases sequentially - each builds on the previous
2. Verify success criteria for each task before moving to next
3. Test manually after each major component implementation
4. Don't skip Phase 7 - edge case handling is critical

### If You Get Stuck
- Review requirements.md for the "why" (business logic)
- Review design.md for the "how" (technical approach)
- Test calculations manually first (known distributions like 1d6, 2d6)
- Use Angular DevTools to inspect Signals in real-time
- Test on actual mobile device if responsive behavior unclear

### Key Technical Challenges
1. **Probability calculation algorithm**: Use dynamic programming/convolution approach
2. **Async yielding**: Use setTimeout to periodically yield control to UI thread
3. **Debouncing**: RxJS Subject + debounceTime operator
4. **Cancellation**: Pass cancellation token object, set flag when cancelled
5. **Responsive layout**: CSS Grid with media queries for layout shift

### Manual Testing Tips
- Test 1d6 first (known distribution: 16.7% each)
- Test 2d6 next (result 7 should be ~16.7%, most likely)
- Verify 1d6+10 shows results 11-16 (same percentages, shifted)
- Test sorting: click headers and verify order changes
- Test on narrow viewport first (320px), then expand to desktop

## References
- Requirements: `spec/requirements.md`
- Design: `spec/design.md`
- Angular 19 Documentation: https://angular.dev
- Angular Signals Guide: https://angular.dev/guide/signals
