# Dice Probability Calculator

A standalone Angular 19 web application that calculates and displays probability distributions for rolling various dice combinations. Users can select dice configurations, see probability tables, and check odds of achieving specific target numbers.

## Features

- **Dice Selection**: Calculate probabilities for standard dice (d2/Coin, d4, d6, d8, d10, d12, d20, d100)
- **Multiple Dice**: Support for 1-100 dice in a single roll
- **Modifiers**: Add positive or negative integer modifiers to adjust results
- **Goal Comparison**: Check probability of achieving a goal with three comparison types:
  - Exactly: Probability of rolling exactly the goal number
  - Or Better: Probability of rolling the goal number or higher
  - Or Worse: Probability of rolling the goal number or lower
- **Sortable Table**: Click column headers to sort by result value or percentage
- **Responsive Design**: Mobile-first design that works on phones, tablets, and desktops
- **Input Validation**: Automatic filtering of invalid characters and range validation

## Tech Stack

- **Framework**: Angular 19.2.0 (standalone components)
- **Language**: TypeScript 5.x with strict mode
- **State Management**: Angular Signals
- **Async Handling**: RxJS for debouncing and reactive programming
- **Styling**: Plain CSS with mobile-first responsive design
- **Build Tool**: Angular CLI with esbuild

## Architecture

The application follows a clean architecture with clear separation of concerns:

- **Components**: Standalone Angular components with minimal boilerplate
  - `AppComponent`: Root layout with title
  - `CalculatorComponent`: Main UI with input controls
  - `ProbabilityTableComponent`: Sortable results table
  - `GoalResultComponent`: Prominent goal probability display
  
- **Services**:
  - `CalculatorService`: State management with Signals and debouncing
  - `ProbabilityEngine`: Pure calculation logic using dynamic programming

- **Models**: TypeScript interfaces for type safety
- **Constants**: Dice options and comparison types

## Development

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher

### Installation

```bash
npm install
```

### Development Server

To start a local development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

### Building

To build the project for production:

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

## Usage

1. **Select Number of Dice**: Choose from 1 to 100 dice using the dropdown
2. **Select Dice Type**: Choose the type of dice (d2 through d100)
3. **Add Modifier** (Optional): Enter a positive or negative modifier (e.g., +5 or -2)
4. **Set Goal** (Optional): Enter a target number and select comparison type
5. **View Results**: 
   - Probability table shows all possible results with their percentage chances
   - Results below 0.1% probability are automatically filtered
   - Click table headers to sort by result or percentage
   - Goal probability (if set) displays prominently above the table on mobile, next to it on desktop

## Examples

### Example 1: Rolling 2d6
- Set "Number of Dice" to 2
- Set "Dice Type" to d6
- Result: Table shows outcomes 2-12 with probabilities
- Most likely result: 7 at 16.7%

### Example 2: Rolling 1d20+5
- Set "Number of Dice" to 1
- Set "Dice Type" to d20
- Set "Modifier" to 5
- Result: Table shows outcomes 6-25, each at 5.0%

### Example 3: Goal Comparison
- Set up any dice combination (e.g., 2d6)
- Enter "8" in Goal Number
- Select "Or Better" from Comparison dropdown
- Result: Displays "Your chance of rolling 8 or better is 41.7%"

## Design Decisions

### Why Angular Signals?
Signals provide simpler, more performant reactive state management compared to traditional RxJS observables for UI state.

### Why Dynamic Programming for Calculations?
The convolution approach efficiently calculates exact probability distributions even for large dice combinations, avoiding the need for Monte Carlo simulation.

### Why Debouncing?
Input debouncing (300ms) prevents excessive recalculations while users are still typing, improving performance and user experience.

### Why Async Yielding?
Periodically yielding control with `setTimeout` ensures the UI remains responsive even during large calculations (e.g., 100d100).

## Browser Compatibility

Works on modern versions of:
- Chrome
- Firefox  
- Safari
- Edge

## Performance

- Small combinations (1-10 dice): <100ms
- Medium combinations (11-50 dice): <1 second
- Large combinations (51-100 dice): 1-10 seconds
- UI remains responsive during all calculations
- Debouncing prevents excessive calculations

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── calculator/          # Main UI component
│   │   ├── probability-table/   # Results table with sorting
│   │   └── goal-result/         # Goal probability display
│   ├── services/
│   │   ├── calculator.service.ts      # State management
│   │   └── probability-engine.service.ts  # Calculation logic
│   ├── models/
│   │   └── types.ts             # TypeScript interfaces
│   ├── constants/
│   │   └── dice.constants.ts    # Dice and comparison options
│   ├── app.component.*          # Root component
│   └── app.config.ts            # App configuration
├── styles.css                   # Global styles
└── index.html                   # HTML entry point
```

## License

This project is licensed under the MIT License.

## Acknowledgments

Built as a coding exercise to demonstrate:
- Modern Angular 19 standalone components
- Signals-based state management
- Clean architecture and separation of concerns
- Responsive mobile-first design
- TypeScript strict mode best practices

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
