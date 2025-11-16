# Design: Dice Probability Calculator

## Design Overview
A standalone Angular 19 application using Signals for reactive state management and pure TypeScript for probability calculations. The design emphasizes simplicity with plain CSS, focusing on readability with a mobile-first approach where the goal result is prominently displayed at font-size 20px centered on mobile, while desktop shows the table on the left with the goal result positioned center-left. User inputs are debounced to prevent excessive recalculations, and the result table persists until new valid calculations complete.

## Tech Stack

### Languages & Frameworks
- **Language**: TypeScript 5.x
- **Framework**: Angular 19 (standalone components)
- **Build Tool**: Angular CLI (default setup with esbuild)
- **Styling**: Plain CSS (component-scoped)

### Data & State
- **State Management**: Angular Signals
- **Async Handling**: RxJS (for debouncing and async calculations)
- **Data Storage**: None (no persistence, fresh state on each session)
- **Data Format**: TypeScript interfaces for type safety

### Dependencies
- **@angular/core**: Core Angular framework with Signals support
- **@angular/common**: Common Angular directives and pipes
- **rxjs**: Reactive extensions for debouncing input changes

**Rationale**: Angular 19 with standalone components provides a modern, streamlined architecture without module boilerplate. Signals offer performant reactive state management that's simpler than traditional observables for UI state. Plain CSS keeps the project lightweight and easy to maintain. Pure TypeScript for calculations avoids Web Worker complexity while remaining sufficiently performant for the use case.

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   - Calculator Component (UI)       │
│   - Table Component (results)       │
│   - Goal Display Component          │
├─────────────────────────────────────┤
│   Business Logic Layer              │
│   - Calculator Service (state)      │
│   - Probability Engine (compute)    │
├─────────────────────────────────────┤
│   Data Layer                        │
│   - Type Definitions                │
│   - Constants (dice types)          │
└─────────────────────────────────────┘
```

### Component Breakdown

#### Component: AppComponent
**Purpose**: Root component that hosts the calculator application  
**Location**: `src/app/app.component.ts`  
**Responsibilities**:
- Bootstrap the application
- Provide main layout container
- No business logic (presentational only)

**Template**:
```html
<div class="app-container">
  <h1>Dice Probability Calculator</h1>
  <app-calculator></app-calculator>
</div>
```

#### Component: CalculatorComponent
**Purpose**: Main component orchestrating inputs, calculations, and result display  
**Location**: `src/app/components/calculator/calculator.component.ts`  
**Responsibilities**:
- Render input controls (dice count, dice type, modifier, goal)
- Coordinate state updates via CalculatorService
- Manage debounced input changes
- Display loading state during calculations
- Coordinate layout between table and goal display

**Signals (consumed)**:
- `diceCount`: Current number of dice selected
- `diceType`: Current dice type selected
- `modifier`: Current modifier value
- `goalNumber`: Target goal number
- `goalComparison`: Comparison type (exactly/or better/or worse)
- `probabilityResults`: Array of calculated probabilities
- `isCalculating`: Boolean indicating calculation in progress
- `goalResult`: Calculated goal probability result

**User Interactions**:
- Select dice count → Updates signal, triggers debounced calculation
- Select dice type → Updates signal, triggers debounced calculation
- Enter modifier → Debounced update, triggers calculation
- Enter goal number → Debounced update, recalculates goal probability
- Select goal comparison → Updates signal, recalculates goal probability

#### Component: ProbabilityTableComponent
**Purpose**: Display sorted probability distribution results  
**Location**: `src/app/components/probability-table/probability-table.component.ts`  
**Responsibilities**:
- Render probability results in sortable table
- Handle column header clicks for sorting
- Show/hide based on result availability
- Display only results ≥0.1% probability

**Props/Interface**:
```typescript
@Input() results: ProbabilityResult[] = [];
```

**State**:
- `sortColumn`: Signal<'result' | 'probability'>
- `sortDirection`: Signal<'asc' | 'desc'>

**User Interactions**:
- Click "Result" header → Toggles sort by result value
- Click "% Chance" header → Toggles sort by probability

#### Component: GoalResultComponent
**Purpose**: Display goal achievement probability prominently  
**Location**: `src/app/components/goal-result/goal-result.component.ts`  
**Responsibilities**:
- Show goal comparison result text
- Apply prominent styling (font-size 20px)
- Center on mobile, position center-left on desktop
- Hide if no goal is specified

**Props/Interface**:
```typescript
@Input() goalResult: GoalResult | null = null;
```

**Template**:
```html
<div class="goal-result" *ngIf="goalResult">
  <p>Your chance of rolling {{ goalResult.displayText }} is {{ goalResult.percentage }}%</p>
</div>
```

### Service: CalculatorService
**Purpose**: Manage application state and coordinate calculations  
**Location**: `src/app/services/calculator.service.ts`  
**Responsibilities**:
- Maintain all application state as Signals
- Provide methods to update state
- Trigger ProbabilityEngine calculations asynchronously
- Handle calculation cancellation when inputs change
- Apply debouncing to prevent excessive calculations

**Signals (writable)**:
```typescript
diceCount = signal<number>(1);
diceType = signal<DiceType | null>(null);
modifier = signal<number>(0);
goalNumber = signal<number | null>(null);
goalComparison = signal<GoalComparison>('exactly');
probabilityResults = signal<ProbabilityResult[]>([]);
isCalculating = signal<boolean>(false);
goalResult = signal<GoalResult | null>(null);
```

**Methods**:
- `setDiceCount(count: number): void`
- `setDiceType(type: DiceType): void`
- `setModifier(modifier: number): void`
- `setGoalNumber(goal: number | null): void`
- `setGoalComparison(comparison: GoalComparison): void`
- `calculateProbabilities(): void` (debounced)
- `cancelCurrentCalculation(): void`

### Service: ProbabilityEngine
**Purpose**: Pure calculation engine for dice probability mathematics  
**Location**: `src/app/services/probability-engine.service.ts`  
**Responsibilities**:
- Calculate probability distribution for dice combinations
- Filter results below 0.1% threshold
- Calculate goal achievement probabilities
- Perform calculations asynchronously (using setTimeout to yield to UI)
- Support calculation cancellation

**Methods**:
```typescript
calculateDistribution(
  diceCount: number, 
  diceType: number, 
  modifier: number,
  cancelSignal: { cancelled: boolean }
): Promise<ProbabilityResult[]>

calculateGoalProbability(
  results: ProbabilityResult[],
  goalNumber: number,
  comparison: GoalComparison
): number
```

**Algorithm**: 
- Use dynamic programming approach to build probability distribution
- For N dice of type dX: iterate through all possible outcomes
- Apply convolution method for combining dice probabilities
- Round percentages to one decimal place
- Filter out results below 0.1% threshold

## Data Model

### Entity: DiceType
```typescript
type DiceType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

interface DiceOption {
  value: DiceType;
  label: string;
  sides: number;
}
```

**Purpose**: Represents available dice types for selection  
**Relationships**: Used by CalculatorService state and ProbabilityEngine calculations

### Entity: ProbabilityResult
```typescript
interface ProbabilityResult {
  result: number;        // The dice roll outcome (including modifier)
  probability: number;   // Raw probability (0-1)
  percentage: number;    // Formatted percentage (0-100, rounded to 1 decimal)
}
```

**Purpose**: Represents a single outcome in the probability distribution  
**Relationships**: Array of these forms the complete distribution displayed in table

### Entity: GoalComparison
```typescript
type GoalComparison = 'exactly' | 'orBetter' | 'orWorse';

interface GoalComparisonOption {
  value: GoalComparison;
  label: string;
}
```

**Purpose**: Defines how goal achievement is calculated  
**Relationships**: Used to filter ProbabilityResult array for goal calculation

### Entity: GoalResult
```typescript
interface GoalResult {
  goalNumber: number;
  comparison: GoalComparison;
  probability: number;
  percentage: number;
  displayText: string;  // e.g., "8 or better"
}
```

**Purpose**: Contains calculated goal achievement probability and display text  
**Relationships**: Derived from ProbabilityResult array and user's goal inputs

## User Interface Design

### Screen: Main Calculator View

**Purpose**: Single-page application where user configures dice and views results  

**Layout (Mobile)**:
```
┌─────────────────────────┐
│  Dice Probability       │
│  Calculator (title)     │
├─────────────────────────┤
│  [Number: 1      ▼]     │
│  [Select di(c)e  ▼]     │
│  [Modifier:        ]    │
│  [Goal:            ]    │
│  [Comparison:    ▼]     │
├─────────────────────────┤
│                         │
│  Your chance of rolling │
│  8 or better is 45.3%   │  ← Font-size 20px, centered
│                         │
├─────────────────────────┤
│  Result | % Chance ▼    │  ← Font-size 12px
│  ─────────────────────  │
│    5    |  12.5%        │
│    6    |  16.7%        │
│    7    |  20.8%        │
│   ...   |  ...          │
└─────────────────────────┘
```

**Layout (Desktop)**:
```
┌───────────────────────────────────────────────────┐
│  Dice Probability Calculator                      │
├───────────────────────────────────────────────────┤
│  [Number: 1 ▼]  [Select di(c)e ▼]  [Modifier:  ] │
│  [Goal:      ]  [Comparison: Exactly ▼]          │
├─────────────────────┬─────────────────────────────┤
│  Result | % Chance ▼│   Your chance of rolling    │
│  ───────────────────│   8 or better is 45.3%      │
│    5    |  12.5%    │   (Font-size 20px)          │
│    6    |  16.7%    │                             │
│    7    |  20.8%    │                             │
│   ...   |  ...      │                             │
│  (Font-size 12px)   │                             │
│  (Left-aligned)     │   (Center-left positioned)  │
└─────────────────────┴─────────────────────────────┘
```

**Key Elements**:
- **Dice Count Dropdown**: Numbers 1-100, defaults to 1
- **Dice Type Dropdown**: Shows "Select di(c)e" initially, options: d2/Coin, d4, d6, d8, d10, d12, d20, d100
- **Modifier Input**: Text field accepting positive/negative integers, optional
- **Goal Number Input**: Text field for target number, optional
- **Goal Comparison Dropdown**: "Exactly", "Or Better", "Or Worse"
- **Goal Result Display**: Large prominent text (20px), centered on mobile, center-left on desktop
- **Probability Table**: Two-column sortable table (12px font), left-aligned on desktop

**User Interactions**:
- Change dice count → Debounced recalculation (300ms delay)
- Select dice type → Immediate recalculation trigger (after debounce)
- Type modifier → Debounced recalculation (300ms delay)
- Type goal number → Debounced goal recalculation (300ms delay)
- Change goal comparison → Immediate goal recalculation
- Click table header → Toggle sort (result or probability, asc/desc)

## Key Interactions & Flows

### Flow: Initial Calculation
**Scenario**: User wants to see probability for rolling 2d6

1. User selects "2" from dice count dropdown
2. User selects "d6" from dice type dropdown
3. System detects valid inputs (dice count + dice type selected)
4. System waits 300ms for additional input changes (debounce)
5. System calls ProbabilityEngine.calculateDistribution(2, 6, 0)
6. Calculation runs asynchronously, yielding to UI periodically
7. Results array generated: [{result: 2, percentage: 2.8%}, {result: 3, percentage: 5.6%}, ...]
8. Results filtered to only show ≥0.1% probability
9. Table component receives results and displays (sorted by result, ascending)
10. Table becomes visible (was hidden before valid calculation)

**Error Handling**:
- If user changes input during calculation → Cancel current calculation, start new one
- If calculation throws error → Log error, show user-friendly message, keep previous table visible

### Flow: Adding Modifier
**Scenario**: User wants to add +5 modifier to existing 2d6 calculation

1. User types "5" in modifier field
2. System debounces input (waits 300ms after last keystroke)
3. If user continues typing (e.g., "50"), timer resets
4. After 300ms of no input, calculation triggers
5. System cancels any in-progress calculation
6. ProbabilityEngine.calculateDistribution(2, 6, 5) called
7. Results shift by modifier: [{result: 7, percentage: 2.8%}, {result: 8, percentage: 5.6%}, ...]
8. Table updates with new modified results
9. Previous table remains visible until new results ready

**Error Handling**:
- If user enters non-numeric characters → Ignore invalid characters or show validation hint
- If modifier field is empty → Treat as 0 (no modifier)
- If modifier is negative (e.g., "-3") → Apply negative modifier correctly

### Flow: Goal Comparison
**Scenario**: User wants to know probability of rolling 10 or better on 2d6+5

1. User has already calculated 2d6+5 (results visible)
2. User types "10" in goal number field
3. System debounces input (300ms)
4. User selects "Or Better" from comparison dropdown
5. System immediately recalculates goal (no debounce needed for dropdown)
6. ProbabilityEngine.calculateGoalProbability(results, 10, 'orBetter') called
7. Engine sums probabilities for all results ≥10
8. GoalResult created: {goalNumber: 10, comparison: 'orBetter', percentage: 58.3%, displayText: "10 or better"}
9. GoalResultComponent displays: "Your chance of rolling 10 or better is 58.3%"
10. Goal result positioned center-left on desktop, centered on mobile

**Error Handling**:
- If goal number is impossible (outside possible range) → Display "0.0% chance"
- If goal field is empty → Hide goal result display
- If goal is valid but very unlikely (<0.1%) → Still display accurate percentage

### Flow: Sorting Results
**Scenario**: User wants to see most likely outcomes first

1. User clicks on "% Chance" column header
2. System toggles sortDirection signal (was 'asc', now 'desc')
3. System sets sortColumn signal to 'probability'
4. Table component re-sorts results array by probability descending
5. Arrow indicator changes to ↓ next to "% Chance"
6. Table re-renders with highest probabilities at top
7. User clicks "% Chance" again
8. System toggles sortDirection to 'asc'
9. Table shows lowest probabilities first, arrow changes to ↑

**Error Handling**:
- N/A (sorting is client-side manipulation of existing data)

### Flow: Changing Inputs with Existing Results
**Scenario**: User has 2d6 results visible, changes to 3d8

1. User sees 2d6 probability table on screen
2. User clicks dice type dropdown and selects "d8"
3. Inputs now invalid combination: 2d8 (user intended to change count too)
4. System keeps 2d6 table visible (last valid calculation)
5. User then changes dice count to "3"
6. System debounces (300ms)
7. After debounce, inputs are valid: 3d8
8. New calculation starts
9. 2d6 table remains visible during calculation
10. Once 3d8 calculation completes, table updates to show 3d8 results

**Error Handling**:
- Previous table persists until new valid calculation completes
- If user creates invalid state (e.g., clears dice type), table still shows
- Only when new valid inputs produce results does table update

## File Structure
```
dice-probability-calculator/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── calculator/
│   │   │   │   ├── calculator.component.ts
│   │   │   │   ├── calculator.component.html
│   │   │   │   └── calculator.component.css
│   │   │   ├── probability-table/
│   │   │   │   ├── probability-table.component.ts
│   │   │   │   ├── probability-table.component.html
│   │   │   │   └── probability-table.component.css
│   │   │   └── goal-result/
│   │   │       ├── goal-result.component.ts
│   │   │       ├── goal-result.component.html
│   │   │       └── goal-result.component.css
│   │   ├── services/
│   │   │   ├── calculator.service.ts
│   │   │   └── probability-engine.service.ts
│   │   ├── models/
│   │   │   └── types.ts
│   │   ├── constants/
│   │   │   └── dice.constants.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   └── app.config.ts
│   ├── styles.css
│   ├── main.ts
│   └── index.html
├── spec/
│   ├── requirements.md
│   └── design.md
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── README.md
```

## Design Decisions & Tradeoffs

### Decision: Use Signals Instead of Traditional Observables
**Choice**: Angular Signals for state management  
**Alternatives Considered**: 
- RxJS BehaviorSubjects with async pipe
- Traditional component properties with change detection
**Rationale**: Signals provide simpler mental model, better performance through fine-grained reactivity, and less boilerplate than observables. They're the recommended modern approach in Angular 19.  
**Tradeoffs**: 
- **Gain**: Simpler code, better performance, easier debugging
- **Lose**: Less familiar to developers who only know older Angular patterns

### Decision: Debounce Input Changes
**Choice**: 300ms debounce on text inputs and dropdown changes  
**Alternatives Considered**: 
- Immediate calculation on every keystroke
- "Calculate" button requiring explicit user action
- Longer debounce (500ms+)
**Rationale**: 300ms strikes balance between responsiveness and performance. Prevents expensive recalculations while user is still typing, but feels immediate once they pause.  
**Tradeoffs**: 
- **Gain**: Better performance, fewer unnecessary calculations
- **Lose**: Slight delay before results appear (but imperceptible to most users)

### Decision: Keep Previous Results Visible During Invalid State
**Choice**: Display last valid calculation results until new valid results are ready  
**Alternatives Considered**: 
- Clear table immediately when inputs become invalid
- Show "Calculating..." placeholder during invalid states
- Disable inputs until calculation completes
**Rationale**: Provides better UX by maintaining context. Users can reference previous results while adjusting inputs, especially useful when changing multiple fields in sequence.  
**Tradeoffs**: 
- **Gain**: Better UX, less jarring transitions, maintains context
- **Lose**: Could briefly show "stale" results if user doesn't notice inputs changed

### Decision: Pure TypeScript Calculations Instead of Web Workers
**Choice**: Asynchronous calculations using setTimeout/Promise in main thread  
**Alternatives Considered**: 
- Web Workers for true parallel processing
- Synchronous blocking calculations
**Rationale**: Web Workers add complexity (separate file, message passing overhead) for minimal benefit given the use case. Using setTimeout to periodically yield to UI keeps interface responsive even for large calculations while keeping code simple.  
**Tradeoffs**: 
- **Gain**: Simpler code, no worker setup complexity, easier debugging
- **Lose**: Very large calculations (100d100) may still cause brief UI lag

### Decision: No Testing Framework Setup
**Choice**: Skip test configuration and test files  
**Alternatives Considered**: 
- Set up Jest with Angular testing utilities
- Use default Karma/Jasmine
**Rationale**: User explicitly requested no tests  
**Tradeoffs**: 
- **Gain**: Faster initial development, less boilerplate
- **Lose**: No automated verification of probability calculations or component behavior

### Decision: Plain CSS Instead of CSS Framework
**Choice**: Component-scoped plain CSS  
**Alternatives Considered**: 
- Tailwind CSS for utility classes
- CSS framework like Bootstrap
- SCSS for variables and nesting
**Rationale**: Keeps project simple and lightweight. For a focused single-page app with clear design requirements, plain CSS is sufficient and more maintainable without external dependencies.  
**Tradeoffs**: 
- **Gain**: Zero dependencies, complete control, simple mental model
- **Lose**: More manual responsive design work, no pre-built components

## Non-Functional Considerations

### Performance
- **Debounced inputs**: 300ms debounce prevents excessive calculations during rapid input changes
- **Async calculation**: Use setTimeout to yield control every N iterations, keeping UI responsive
- **Result filtering**: Filter out <0.1% results early to reduce table rendering overhead
- **Calculation cancellation**: Cancel in-progress calculations when inputs change to avoid wasted work
- **Lazy calculation**: Only calculate goal probability when goal inputs are provided
- **Signal-based rendering**: Angular Signals ensure only affected components re-render

**Performance Targets**:
- 1-5 dice: <100ms calculation time
- 6-20 dice: <500ms calculation time
- 21-50 dice: <2 seconds with responsive UI
- 51-100 dice: <10 seconds with responsive UI

### Scalability
- **Current design handles**: 1-100 dice of any supported type
- **If requirements expand to mixed dice types**: Would need to refactor ProbabilityEngine to handle multiple dice type inputs, modify state to support array of dice selections
- **If requirements add visualization**: Could add chart component consuming same ProbabilityResult array
- **If requirements add history**: Would add HistoryService with localStorage, minimal impact on existing components

### Accessibility
- **Keyboard navigation**: All dropdowns and inputs are native HTML elements (fully keyboard accessible)
- **Labels**: All form inputs have associated `<label>` elements with proper `for` attributes
- **ARIA attributes**: Table uses semantic `<table>` markup for screen readers
- **Color contrast**: Ensure text meets WCAG AA standards (4.5:1 for normal text)
- **Focus indicators**: Maintain visible focus states on all interactive elements
- **Semantic HTML**: Use appropriate elements (table, section, label) for structure

### Error Handling
- **Invalid input detection**: Validate numeric inputs, reject non-numeric characters
- **Calculation errors**: Catch and log errors from ProbabilityEngine, display generic error message to user
- **Out-of-range goals**: Display "0.0% chance" for impossible goals rather than error
- **Empty states**: Handle empty/null inputs gracefully (treat as defaults or hide optional displays)
- **Cancellation handling**: Properly clean up cancelled calculations to prevent memory leaks

**Error States**:
- **Calculation fails**: Show "Unable to calculate probabilities. Please try again."
- **Invalid modifier**: Show hint: "Please enter a valid number"
- **Network unavailable**: N/A (no network requests)

### Browser Compatibility
- **Target browsers**: Modern evergreen browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+
- **ES version**: ES2020+ (supported by Angular 19)
- **CSS features**: Flexbox, CSS Grid (widely supported)
- **No polyfills needed**: Modern Angular and TypeScript handle browser compatibility

### Responsive Design
- **Mobile-first approach**: Design for mobile (320px+) then enhance for larger screens
- **Breakpoints**:
  - Mobile: 320px - 767px (single column, goal result centered above table)
  - Tablet: 768px - 1023px (transition layout, goal result starts moving right)
  - Desktop: 1024px+ (two-column layout, table left, goal result center-left)
- **Font scaling**: 
  - Table: 12px on all screen sizes
  - Goal result: 20px on all screen sizes (prominence through size, not scaling)
- **Touch targets**: Minimum 44x44px for mobile tap targets (dropdowns, headers)

## Testing Strategy

**Philosophy**: No automated testing per user request. All verification will be manual during development.

### Testing Tools & Framework
- **Testing Framework**: None
- **Test Runner Command**: N/A
- **Manual Verification**: Developer will manually test each feature in browser

### Verification Approach for Each Task Type

#### Code/Logic Tasks
- **Verification Method**: Manual testing in browser + console.log debugging
- **When to Test**: After implementing each service method or calculation
- **What to Verify**: 
  - Probability calculations match known distributions (e.g., 1d6 = 16.7% each)
  - Modifiers correctly shift results
  - Goal calculations sum correctly
  - Edge cases (1d2, 100d100, negative modifiers)

#### UI/Component Tasks
- **Verification Method**: Manual visual inspection and interaction testing
- **Browser Testing**: Chrome DevTools device emulation + actual mobile device
- **What to Verify**:
  - Inputs respond correctly to user actions
  - Table appears/disappears as expected
  - Sorting works correctly
  - Layout responds properly on mobile/tablet/desktop
  - Font sizes match specifications (12px table, 20px goal)
  - Goal result positioning (centered mobile, center-left desktop)

#### Configuration/Setup Tasks
- **Verification Method**: Run Angular dev server, check for errors
- **Success Criteria**: `ng serve` starts without errors, app loads in browser

### Manual Testing Checklist
After implementation, manually verify:

**Basic Functionality**:
- [ ] Can select dice count (1-100)
- [ ] Can select dice type (d2 through d100)
- [ ] Table appears after selecting valid inputs
- [ ] Table shows correct probabilities for known cases (1d6, 2d6, etc.)
- [ ] Results below 0.1% are hidden
- [ ] Percentages rounded to one decimal place

**Modifiers**:
- [ ] Can enter positive modifier (e.g., +5)
- [ ] Can enter negative modifier (e.g., -2)
- [ ] Results shift correctly by modifier amount
- [ ] Empty modifier field works (treated as 0)

**Goal Comparison**:
- [ ] Can enter goal number
- [ ] Can select comparison type (Exactly, Or Better, Or Worse)
- [ ] Goal result displays with correct percentage
- [ ] Goal result uses font-size 20px
- [ ] Goal result hidden when no goal entered

**Sorting**:
- [ ] Can click "Result" header to sort by result value
- [ ] Can click "% Chance" header to sort by probability
- [ ] Arrow indicators show correctly (↑↓)
- [ ] Clicking same header toggles direction

**Responsive Design**:
- [ ] Mobile (320px-767px): Goal result centered above table, table font 12px
- [ ] Desktop (1024px+): Table on left, goal result center-left
- [ ] Touch targets work well on mobile
- [ ] Dropdowns usable on mobile devices

**Edge Cases**:
- [ ] Changing inputs during calculation cancels previous calculation
- [ ] Previous table remains visible until new calculation completes
- [ ] Very large combinations (50d100) remain responsive
- [ ] Impossible goals show "0.0% chance"
- [ ] 1d2 shows 50.0% for results 1 and 2

## Development Approach

### Phase Breakdown
1. **Phase 1: Project Setup & Core Structure**
   - Generate Angular 19 project with standalone components
   - Create basic component structure (App, Calculator, Table, GoalResult)
   - Define TypeScript interfaces and constants
   - Set up basic routing and app config

2. **Phase 2: Probability Engine**
   - Implement ProbabilityEngine service
   - Create probability distribution calculation algorithm
   - Add filtering for <0.1% results
   - Implement goal probability calculation
   - Add async calculation with cancellation support

3. **Phase 3: State Management & Calculator Service**
   - Implement CalculatorService with Signals
   - Add debouncing for input changes
   - Connect service to ProbabilityEngine
   - Implement calculation cancellation logic
   - Handle state updates and computed signals

4. **Phase 4: UI Components**
   - Build CalculatorComponent with all inputs
   - Implement ProbabilityTableComponent with sorting
   - Create GoalResultComponent with conditional display
   - Wire components to CalculatorService signals

5. **Phase 5: Styling & Responsive Design**
   - Create mobile-first CSS for all components
   - Implement responsive layout (mobile/desktop breakpoints)
   - Apply font sizing (12px table, 20px goal)
   - Style table with sortable headers and arrows
   - Ensure touch-friendly mobile experience

6. **Phase 6: Polish & Edge Cases**
   - Handle invalid input states
   - Test debouncing behavior
   - Verify table persistence with invalid inputs
   - Test large dice combinations (performance)
   - Cross-browser manual testing

### Development Standards
- **TypeScript strict mode**: Enable strict type checking
- **Naming conventions**: 
  - Components: PascalCase with Component suffix (CalculatorComponent)
  - Services: PascalCase with Service suffix (ProbabilityEngine)
  - Signals: camelCase (diceCount, probabilityResults)
  - CSS classes: kebab-case (goal-result, probability-table)
- **File organization**: One component per folder with .ts/.html/.css files
- **Import organization**: Angular imports first, then app imports
- **Code formatting**: Use Prettier/Angular CLI defaults
- **Comments**: Document complex algorithms (probability calculation) and non-obvious decisions

## Open Questions
None remaining - all design questions have been clarified with user.

## References
- Requirements: `spec/requirements.md`
- Angular 19 Documentation: https://angular.dev
- Angular Signals Guide: https://angular.dev/guide/signals
- TypeScript Documentation: https://www.typescriptlang.org/docs/
