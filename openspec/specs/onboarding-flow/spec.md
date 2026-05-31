# Onboarding Flow

## Purpose

Specification for the Onboarding Flow, a 3-step swipable onboarding: Welcome, Unit Selection, and Weekly Goal.

## Requirements

### Requirement: Onboarding flow displays three skippable screens

The system SHALL present three screens in sequence: Welcome, Unit Selection, and Weekly Goal. The user SHALL be able to navigate between screens by horizontal swipe and by tapping progress dots. A "Saltar" (Skip) button SHALL be present on every screen.

#### Scenario: User sees welcome screen first

- **WHEN** the onboarding flow starts and `onboarding_completed` is not `"true"` in SharedPreferences
- **THEN** the Welcome screen is displayed with the Zenlift logo, welcome message, and "Empezar" CTA
- **AND** progress dots show step 1 as active

#### Scenario: User swipes between screens

- **WHEN** the user swipes left on the Welcome screen
- **THEN** the Unit Selection screen (kg/lb toggle) is displayed
- **AND** progress dots show the new current step as active
- **WHEN** the user swipes right on the Unit Selection screen
- **THEN** the Welcome screen is displayed again

#### Scenario: User taps progress dot to jump

- **WHEN** the user taps the third progress dot from the first screen
- **THEN** the Weekly Goal screen is displayed
- **AND** progress dots show step 3 as active

#### Scenario: Skip button on every screen

- **WHEN** the user taps "Saltar" on any of the three onboarding screens
- **THEN** the onboarding completes immediately
- **AND** defaults `weight_unit = "kg"` and `weekly_goal = "3"` are written to SharedPreferences
- **AND** `onboarding_completed` is set to `"true"` in SharedPreferences
- **AND** the app navigates to Home

### Requirement: User selects weight unit on unit screen

The system SHALL display a toggle between "kg" (kilograms) and "lb" (pounds) on the Unit Selection screen. The toggle SHALL default to "kg" as the pre-selected option.

#### Scenario: User selects kilograms

- **WHEN** the user taps "kg" on the Unit Selection screen
- **THEN** the kg option is highlighted with the primary container color (`#6750A4`)
- **AND** the lb option is displayed in a neutral style

#### Scenario: User selects pounds

- **WHEN** the user taps "lb" on the Unit Selection screen
- **THEN** the lb option is highlighted with the primary container color (`#6750A4`)
- **AND** the kg option is displayed in a neutral style

#### Scenario: Unit persists on completion

- **WHEN** the user selects "lb" and completes the onboarding (via skip or finish)
- **THEN** the SharedPreferences key `weight_unit` is set to `"lb"`

### Requirement: User selects weekly workout goal

The system SHALL display a stepper control for selecting 1 to 7 workouts per week. The stepper SHALL default to 3. The user SHALL use plus/minus buttons or tap a number to select.

#### Scenario: User increments weekly goal

- **WHEN** the user taps the "+" button on the Weekly Goal screen with current value 3
- **THEN** the displayed goal changes to 4

#### Scenario: User decrements weekly goal

- **WHEN** the user taps the "-" button on the Weekly Goal screen with current value 3
- **THEN** the displayed goal changes to 2

#### Scenario: Weekly goal is bounded

- **WHEN** the user taps "-" when the goal is 1
- **THEN** the goal remains at 1 (lower bound)
- **WHEN** the user taps "+" when the goal is 7
- **THEN** the goal remains at 7 (upper bound)

#### Scenario: Goal persists on completion

- **WHEN** the user selects 5 workouts/week and completes the onboarding
- **THEN** the SharedPreferences key `weekly_goal` is set to `"5"`

### Requirement: Onboarding completion persists to SharedPreferences

On finishing the onboarding (via the final screen or skip), the system SHALL persist `weight_unit`, `weekly_goal`, and `onboarding_completed` to SharedPreferences.

#### Scenario: All preferences saved on finish

- **WHEN** the onboarding completes with unit "kg" and goal "4"
- **THEN** SharedPreferences contains `weight_unit = "kg"`, `weekly_goal = "4"`, `onboarding_completed = "true"`

#### Scenario: Defaults saved on skip

- **WHEN** the user taps "Saltar" without interacting with unit or goal controls
- **THEN** SharedPreferences contains `weight_unit = "kg"`, `weekly_goal = "3"`, `onboarding_completed = "true"`

### Requirement: Layout guard prevents onboarding re-display

The root app shell SHALL check the `onboarding_completed` flag on startup. If `true`, the app SHALL render the normal navigation (Home/tabs). If not `true`, the app SHALL render the onboarding flow.

#### Scenario: Returning user skips onboarding

- **WHEN** the app starts and `onboarding_completed` is `"true"` in SharedPreferences
- **THEN** the onboarding flow is not shown
- **AND** the Home screen or tab navigator is displayed

#### Scenario: New user sees onboarding

- **WHEN** the app starts and `onboarding_completed` is not `"true"` in SharedPreferences
- **THEN** the onboarding flow is displayed

#### Scenario: Onboarding cannot be re-entered after completion

- **WHEN** the user completes the onboarding and `onboarding_completed` is set to `"true"`
- **THEN** navigating back or restarting the app does not show the onboarding flow
