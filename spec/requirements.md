# Requirements: Dice Probability Calculator

## Project Overview
A web application that calculates and displays the probability distribution for rolling various dice combinations. Users can specify a dice constellation (e.g., 4d8), see the percentage chance for each possible outcome, and optionally check their odds of hitting a specific goal number.

## Target Users
Tabletop RPG players, game designers, and anyone who needs to understand dice probability for gaming or statistical purposes. Users want quick, accurate probability calculations without manual math or complex tools.

## User Stories

### Story 1: Calculate Basic Dice Probabilities
**As a** tabletop RPG player  
**I want to** select a number and type of dice to roll  
**So that** I can see the probability distribution of all possible outcomes

**Acceptance Criteria:**
- [ ] User can select number of dice from 1 to 100 via dropdown
- [ ] User can select dice type (d2/Coin, d4, d6, d8, d10, d12, d20, d100) via dropdown
- [ ] Dice type dropdown shows "Select di(c)e" as default, calculation disabled until valid dice selected
- [ ] Number of dice dropdown defaults to 1
- [ ] Probability table displays automatically when valid inputs are provided
- [ ] Table shows two columns: "Result" and "% Chance"
- [ ] Results below 0.1% probability are hidden
- [ ] Percentages are rounded to one decimal place (e.g., 15.3%)
- [ ] Table is sorted by result value (lowest to highest) by default
- [ ] Calculation happens asynchronously without blocking user input

**Edge Cases:**
- User changes inputs mid-calculation (previous calculation should be cancelled)
- Very large dice combinations (e.g., 100d100) may take time to calculate
- Total displayed percentages may not sum to 100% due to hiding <0.1% results and rounding

### Story 2: Apply Roll Modifiers
**As a** RPG player  
**I want to** add positive or negative modifiers to my dice roll  
**So that** I can account for bonuses or penalties in my game

**Acceptance Criteria:**
- [ ] User can enter a modifier in a text input field
- [ ] Field accepts positive numbers, negative numbers (with minus symbol), and zero
- [ ] Field can be left blank (treated as no modifier)
- [ ] Field defaults to empty
- [ ] Probability table updates to show modified results (e.g., 1d6+10 shows results 11-16)
- [ ] Table recalculates automatically when modifier changes
- [ ] Invalid characters are rejected or ignored

**Edge Cases:**
- Large modifiers that shift all results significantly (e.g., 1d6+100)
- Negative modifiers that could theoretically produce impossible results (app handles gracefully)
- User enters "0" vs leaving field blank (both treated as no modifier)

### Story 3: Check Goal Achievement Probability
**As a** player  
**I want to** enter a target number and see my chances of hitting it  
**So that** I can evaluate my odds before making a game decision

**Acceptance Criteria:**
- [ ] User can optionally enter a goal number in a text field
- [ ] User can select comparison type via dropdown: "Exactly", "Or Better", "Or Worse"
- [ ] Goal comparison result displays as separate text near the table (e.g., "Your chance of rolling 8 or better is 45.3%")
- [ ] On mobile: goal result appears above the table
- [ ] On desktop: goal result appears next to the table
- [ ] Goal field is optional; probability table still displays without a goal
- [ ] Goal comparison uses modified results when modifier is applied

**Edge Cases:**
- Goal is impossible to achieve with current dice (displays "0.0% chance")
- Goal field is empty (no goal comparison shown)
- Goal is within possible range but very unlikely (<1%)

### Story 4: Sort and Analyze Results
**As a** user  
**I want to** sort the probability table by different criteria  
**So that** I can quickly find the most or least likely outcomes

**Acceptance Criteria:**
- [ ] Table headers are clickable
- [ ] Clicking "Result" header sorts by result value (low to high or high to low)
- [ ] Clicking "% Chance" header sorts by probability (high to low or low to high)
- [ ] Arrow indicator shows which column is currently sorted and direction
- [ ] Default sort is by result value (lowest to highest)
- [ ] User can toggle between ascending and descending for each column

**Edge Cases:**
- Multiple clicks on same header toggle sort direction
- Switching between columns preserves sort direction preference

### Story 5: Mobile-Responsive Experience
**As a** mobile user  
**I want to** use the calculator comfortably on my phone  
**So that** I can calculate probabilities during game sessions away from my computer

**Acceptance Criteria:**
- [ ] Interface designed mobile-first
- [ ] All dropdowns and inputs are easily tappable on mobile
- [ ] Table is readable and scrollable on small screens
- [ ] Goal result appears above table on mobile view
- [ ] Layout scales appropriately for tablet and desktop sizes
- [ ] Goal result appears next to table on desktop view

**Edge Cases:**
- Very long probability tables on mobile (should scroll smoothly)
- Landscape vs portrait orientation on mobile

## Functional Requirements

### FR1: Dice Type Support
**Description**: System must support standard polyhedral dice types from d2 to d100  
**Priority**: High  
**Acceptance**: User can select and calculate probabilities for d2/Coin, d4, d6, d8, d10, d12, d20, and d100

### FR2: Probability Calculation Engine
**Description**: System must accurately calculate probability distribution for any valid dice combination  
**Priority**: High  
**Acceptance**: Calculated probabilities match known probability distributions (e.g., 1d6 shows 16.7% for each result 1-6)

### FR3: Asynchronous Calculation
**Description**: Probability calculations must not block the user interface  
**Priority**: High  
**Acceptance**: User can modify inputs during calculation; ongoing calculation is cancelled when inputs change

### FR4: Result Filtering
**Description**: Results with probability below 1% are excluded from display  
**Priority**: Medium  
**Acceptance**: Table only shows results with ≥1.0% probability

### FR5: Modifier Support
**Description**: System must support positive and negative integer modifiers  
**Priority**: High  
**Acceptance**: Modifier correctly adjusts all result values in probability table and goal comparison

### FR6: Goal Comparison
**Description**: System must calculate probability of achieving goal with three comparison types  
**Priority**: Medium  
**Acceptance**: "Exactly", "Or Better", and "Or Worse" comparisons produce mathematically correct probabilities

### FR7: Dynamic Sorting
**Description**: Users can sort probability table by result value or probability percentage  
**Priority**: Low  
**Acceptance**: Clicking column headers sorts table; visual indicator shows current sort column and direction

## Non-Functional Requirements

### Performance
- Calculations for common dice combinations (up to 10 dice) should complete in under 500ms
- Large combinations (50+ dice) should show loading indicator if calculation takes >1 second
- Interface must remain responsive during all calculations (async processing)

### Usability
- Default state allows immediate use with minimal clicks (1 for dice count, 1 for dice type)
- Key information (goal result) visible without scrolling on mobile
- Table sorting is intuitive with standard UI patterns (clickable headers with arrows)

### Accessibility
- All interactive elements should be keyboard accessible
- Sufficient color contrast for readability
- Form inputs should have appropriate labels

### Browser Compatibility
- Works on modern versions of Chrome, Firefox, Safari, and Edge
- Follows web standards for broad compatibility

## Out of Scope
The following features are explicitly NOT included in this version:

- Custom dice types beyond the standard set (no d3, d7, d14, d30, etc.)
- Dice pools with mixed types in a single roll (e.g., 2d6 + 3d8 simultaneously)
- Saving or sharing calculations
- History of previous calculations
- Advanced statistics (mean, median, standard deviation)
- Graphical chart/visualization of probability distribution
- Advantage/disadvantage mechanics (rolling multiple and taking highest/lowest)
- Dice explosion or other special rolling rules
- User accounts or authentication
- Comparison between different dice combinations
- Export functionality (PDF, CSV, etc.)

## Success Criteria
This project is successful when:

- [ ] User can calculate probabilities for any supported dice combination in under 3 clicks
- [ ] Probability calculations are mathematically accurate (verified against known distributions)
- [ ] App works smoothly on mobile devices (iOS Safari and Android Chrome)
- [ ] Users can modify inputs and see results update without page refresh or blocking
- [ ] Goal comparison provides clear, actionable probability information

## Open Questions
- Should there be a "Clear All" or "Reset" button to return to default state?
- Should the app remember user's last selections (using localStorage)?
- Is there a preferred color scheme or visual style for the app?
- Should very large calculations (e.g., 100d100) have a warning or confirmation before proceeding?
