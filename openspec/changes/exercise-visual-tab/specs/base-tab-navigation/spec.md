## MODIFIED Requirements

### Requirement: Icon-only tabs remain accessible
The tab bar SHALL hide visual tab labels while preserving accessible names for every tab target.

#### Scenario: Screen reader announces tab destination
- **WHEN** a screen reader focuses any bottom tab target
- **THEN** the tab target SHALL expose the destination name: Inicio, Rutinas, Ejercicios, Historial, or Ajustes

#### Scenario: Labels are not visually rendered
- **WHEN** the bottom tab bar renders
- **THEN** no visible text label SHALL render inside the tab bar for Inicio, Rutinas, Ejercicios, Historial, or Ajustes

### Requirement: Four primary tabs
The app shell SHALL expose five primary tabs: Inicio, Rutinas, Ejercicios, Historial, and Ajustes.

#### Scenario: Tabs are visible
- **WHEN** the app root layout renders
- **THEN** the tab bar shows five icon-only tab targets for Inicio, Rutinas, Ejercicios, Historial, and Ajustes
- **AND** each target SHALL preserve an accessible name for its destination

#### Scenario: Ejercicios tab order
- **WHEN** the tab bar renders
- **THEN** the Ejercicios tab SHALL appear after Rutinas
- **AND** the Ejercicios tab SHALL appear before Historial

### Requirement: Tab routes render placeholders
Each primary tab route SHALL render a stable screen for its product area.

#### Scenario: Home route renders
- **WHEN** the user opens the Inicio tab
- **THEN** the Home screen renders without starter instructional copy

#### Scenario: Routines route renders
- **WHEN** the user opens the Rutinas tab
- **THEN** the Routines screen renders without crashing

#### Scenario: Exercises route renders
- **WHEN** the user opens the Ejercicios tab
- **THEN** the exercise library screen renders without crashing

#### Scenario: History route renders
- **WHEN** the user opens the Historial tab
- **THEN** the History screen renders without crashing

#### Scenario: Settings route renders
- **WHEN** the user opens the Ajustes tab
- **THEN** the Settings screen renders without crashing

### Requirement: Tab bar uses straight black bottom design
The tab bar SHALL render as a full-width bottom navigation surface with a black background, straight edges, no border radius, no shadow, no visible border, and no blur-dependent styling. It SHALL preserve safe-area spacing and appropriate tab proportions for mobile use.

#### Scenario: Tab bar renders as straight bottom surface
- **WHEN** the tab bar renders
- **THEN** it SHALL occupy the bottom navigation area as a straight-edged black surface
- **AND** it SHALL NOT render as a floating container
- **AND** it SHALL NOT use border radius, shadow, visible border, or backdrop blur

#### Scenario: Tab targets preserve usable proportions
- **WHEN** the tab bar renders on a mobile viewport
- **THEN** each tab target SHALL remain at least 48px tall
- **AND** the five tabs SHALL share the available width evenly
- **AND** the bottom safe area SHALL not obscure any tab icon
