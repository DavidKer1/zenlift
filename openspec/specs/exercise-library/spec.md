# Specification for the Exercise Library screen with search, filtering, and favorites.

## Purpose

Provide a searchable, filterable exercise library so users can browse, discover, and favorite exercises.

## Requirements

### Requirement: Search exercises with debounce

The system SHALL allow users to search exercises by name with a 300ms debounce. The search SHALL be case-insensitive and use the ExerciseRepo `search()` method which performs `LIKE '%' || ? || '%' COLLATE NOCASE`.

#### Scenario: User types a search query
- **WHEN** user types "bench" in the search bar
- **THEN** after 300ms of no further input, the list SHALL display all exercises whose name contains "bench" (case-insensitive)
- **AND** active muscle and equipment filters SHALL still apply

#### Scenario: User clears search
- **WHEN** user taps the clear button in the search bar
- **THEN** the search query SHALL be cleared immediately (no debounce)
- **AND** the full filtered list SHALL be displayed

#### Scenario: Keyboard dismiss on submit
- **WHEN** user presses submit/enter on the keyboard while searching
- **THEN** the keyboard SHALL dismiss

### Requirement: Filter exercises by muscle group

The system SHALL allow users to filter exercises by one or more muscle groups. Muscle filters SHALL use JOIN with exercise_muscles via ExerciseRepo `getByMuscle()`. Multiple selected muscles SHALL combine results (OR logic).

#### Scenario: Single muscle filter
- **WHEN** user selects "Chest" filter chip
- **THEN** the list SHALL display only exercises where Chest is primary or secondary muscle
- **AND** the "Chest" chip SHALL show selected state

#### Scenario: Multiple muscle filters
- **WHEN** user selects "Chest" and "Shoulders" filter chips
- **THEN** the list SHALL display exercises that involve Chest OR Shoulders
- **AND** both chips SHALL show selected state

#### Scenario: Deselect muscle filter
- **WHEN** user taps a selected muscle chip
- **THEN** that muscle SHALL be removed from the active filters
- **AND** the chip SHALL return to unselected state

### Requirement: Filter exercises by equipment

The system SHALL allow users to filter exercises by equipment type. Equipment filter SHALL use ExerciseRepo `getByEquipment()`. Equipment filter is single-select.

#### Scenario: Equipment filter active
- **WHEN** user selects "barbell" from equipment filter
- **THEN** the list SHALL display only barbell exercises
- **AND** the equipment filter SHALL show the selected state

#### Scenario: Clear equipment filter
- **WHEN** user taps the selected equipment filter again or selects "All"
- **THEN** the equipment filter SHALL be cleared
- **AND** all equipment types SHALL be displayed

### Requirement: Toggle exercise favorite

The system SHALL allow users to toggle an exercise as favorite via a star button on the ExerciseCard. The toggle SHALL persist immediately in SQLite via `ExerciseRepo.toggleFavorite()`. The UI SHALL update optimistically.

#### Scenario: Mark exercise as favorite
- **WHEN** user taps the star icon on a non-favorite exercise
- **THEN** the star icon SHALL immediately fill (orange)
- **AND** the exercise's `is_favorite` field SHALL be set to 1 in SQLite

#### Scenario: Unmark exercise as favorite
- **WHEN** user taps the star icon on an already-favorite exercise
- **THEN** the star icon SHALL immediately become outlined
- **AND** the exercise's `is_favorite` field SHALL be set to 0 in SQLite

#### Scenario: Toggle fails
- **WHEN** the SQLite toggleFavorite call fails
- **THEN** the UI SHALL revert the optimistic update
- **AND** an error SHALL be logged

### Requirement: ExerciseCard displays exercise info

The system SHALL render each exercise as a card showing: exercise name, primary muscle group (as a colored dot), equipment icon, and favorite toggle button. The card SHALL be pressable to navigate to exercise detail.

#### Scenario: ExerciseCard renders
- **WHEN** an exercise with primary muscle "Chest" and equipment "barbell" is displayed
- **THEN** the card SHALL show the exercise name
- **AND** a dot colored with the Chest muscle color (#EF4444)
- **AND** an equipment icon representing barbell
- **AND** a star button reflecting the current favorite state

#### Scenario: Tap card navigates
- **WHEN** user taps the ExerciseCard (not the star button)
- **THEN** the app SHALL navigate to exercise detail for that exercise

### Requirement: FlashList with estimated item size

The system SHALL use FlashList with `estimatedItemSize` for the exercise list to ensure smooth scrolling with 25+ exercises.

#### Scenario: Scroll through 25 exercises
- **WHEN** the list contains 25+ exercises
- **THEN** scrolling SHALL maintain 60 FPS
- **AND** FlashList SHALL be configured with `estimatedItemSize=72`

### Requirement: Empty state when no results

The system SHALL display an empty state message centered on screen when no exercises match the current search and filters.

#### Scenario: No matching exercises
- **WHEN** the search query and/or filters yield zero results
- **THEN** a centered view SHALL display "No se encontraron ejercicios" with an icon
- **AND** the FAB SHALL still be visible

### Requirement: FAB to create custom exercise

The system SHALL display a Floating Action Button with a "+" icon that navigates to the create exercise screen when tapped.

#### Scenario: Tap FAB
- **WHEN** user taps the FAB
- **THEN** the app SHALL navigate to the exercise creation screen

### Requirement: FilterChip selected and unselected states

The system SHALL render FilterChip with distinct visual states for selected and unselected. Selected chips SHALL use primary color, unselected chips SHALL use muted/outlined style.

#### Scenario: Chip selected
- **WHEN** a filter chip is in selected state
- **THEN** the chip SHALL have primary color background (#F97316) with white text
- **AND** HA minimum touch target of 48px height

#### Scenario: Chip unselected
- **WHEN** a filter chip is in unselected state
- **THEN** the chip SHALL have a border outline with muted text
- **AND** the background SHALL be transparent

### Requirement: SearchBar component

The system SHALL render a search bar with: a search icon on the left, a text input, and a clear button (X) visible only when text is present.

#### Scenario: SearchBar empty
- **WHEN** the search input is empty
- **THEN** the search icon SHALL be visible on the left
- **AND** the clear button SHALL be hidden

#### Scenario: SearchBar with text
- **WHEN** the search input contains text
- **THEN** the clear button (X) SHALL be visible on the right
- **AND** tapping the clear button SHALL clear the input immediately
