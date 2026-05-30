## MODIFIED Requirements

### Requirement: Exercise picker filters and searches
The system SHALL provide search and two accessible filter controls, `Equipment` and `Muscle`, when selecting exercises from the library.

#### Scenario: Search exercises by name
- **WHEN** user types a query in the exercise picker search field
- **THEN** exercises whose names match the query (case-insensitive) are displayed
- **AND** active `Equipment` and `Muscle` filters SHALL still apply

#### Scenario: Filter exercises by muscle group
- **WHEN** user activates the `Muscle` filter control
- **THEN** a partially expanded bottom modal SHALL list muscle group options with a left local image and option name
- **AND** when user selects a muscle group, the modal SHALL close
- **AND** only exercises targeting that muscle group SHALL be displayed

#### Scenario: Filter exercises by equipment
- **WHEN** user activates the `Equipment` filter control
- **THEN** a partially expanded bottom modal SHALL list equipment options with a left local image and option name
- **AND** when user selects an equipment option, the modal SHALL close
- **AND** only exercises using that equipment SHALL be displayed

#### Scenario: Clear picker filter
- **WHEN** user selects `Todos` from an exercise picker filter modal
- **THEN** that filter group SHALL be cleared
- **AND** the modal SHALL close
- **AND** results SHALL continue to respect active search and the other filter group

#### Scenario: No results found
- **WHEN** search/filter yields zero exercises
- **THEN** a "No se encontraron ejercicios" empty state is displayed
