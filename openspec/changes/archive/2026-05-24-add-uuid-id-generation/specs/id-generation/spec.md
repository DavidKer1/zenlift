## ADDED Requirements

### Requirement: Shared ID generator
The app SHALL expose a shared `generateId()` utility for creating entity IDs.

#### Scenario: ID utility is available
- **WHEN** domain or storage code imports from `src/utils/id`
- **THEN** it can call `generateId()` and receive a string

### Requirement: UUID-first behavior
The ID generator SHALL use `crypto.randomUUID()` when that API is available.

#### Scenario: Native UUID path is available
- **WHEN** `crypto.randomUUID()` exists
- **THEN** `generateId()` returns the value from that API

### Requirement: Fallback behavior
The ID generator SHALL still return unique text IDs when `crypto.randomUUID()` is unavailable.

#### Scenario: Native UUID path is unavailable
- **WHEN** `crypto.randomUUID()` does not exist
- **THEN** `generateId()` returns a non-empty text ID without throwing

### Requirement: SQLite-compatible uniqueness
Generated IDs SHALL be suitable for SQLite `TEXT PRIMARY KEY` fields.

#### Scenario: Repeated calls do not collide in sample
- **WHEN** `generateId()` is called 1000 times
- **THEN** every returned value in that sample is unique
