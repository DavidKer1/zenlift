# Onboarding Flow (Delta)

## ADDED Requirements

### Requirement: Onboarding screens use tonal surfaces
All three onboarding screens SHALL use `#0C0B10` background with `#18191D` card containers for content sections. CTA buttons SHALL use white background with black text. Progress dots SHALL use white at 80% opacity for active and 10% for inactive.

#### Scenario: Welcome screen renders
- **WHEN** the Welcome screen renders
- **THEN** the background SHALL be `#0C0B10`, content cards SHALL be `#18191D` with 12px radius, and the CTA SHALL be white on black

#### Scenario: Progress dots use opacity
- **WHEN** progress dots render
- **THEN** the active dot SHALL be white at 80% opacity and inactive dots at 10% opacity

## MODIFIED Requirements

### Requirement: User selects weight unit on unit screen
The system SHALL display a toggle between "kg" (kilograms) and "lb" (pounds) on the Unit Selection screen. The toggle SHALL default to "kg" as pre-selected. The selected option SHALL use white background with black text; the unselected option SHALL use `#28272F` with white 50% text.

#### Scenario: User selects kilograms
- **WHEN** the user taps "kg" on the Unit Selection screen
- **THEN** the kg option is highlighted with white (`#FFFFFF`) background and black (`#0C0B10`) text
- **AND** the lb option is displayed with `#28272F` background and white 50% text

#### Scenario: User selects pounds
- **WHEN** the user taps "lb" on the Unit Selection screen
- **THEN** the lb option is highlighted with white (`#FFFFFF`) background and black text
- **AND** the kg option returns to `#28272F` background
