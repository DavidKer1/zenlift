## ADDED Requirements

### Requirement: SDK-aligned dependencies
The project foundation SHALL include the dependencies needed by the Zenlift MVP using versions compatible with the installed Expo SDK 55 project.

#### Scenario: Dependencies are installed
- **WHEN** a developer inspects `package.json`
- **THEN** the required local-first, form, validation, list, haptics, date, SVG, and chart dependencies are present

#### Scenario: Expo SDK remains consistent
- **WHEN** Expo-managed packages are installed
- **THEN** their versions are compatible with Expo SDK 55

### Requirement: Source structure exists
The project foundation SHALL provide the base source directories for app routes, domain entities, domain services, calculations, storage, repositories, migrations, features, UI components, workout components, chart components, utilities, theme, and providers.

#### Scenario: Folder structure matches architecture
- **WHEN** a developer lists the `src/` tree
- **THEN** the architecture folders from the Zenlift compact docs are present

### Requirement: TypeScript and Expo Router remain valid
The project foundation SHALL keep strict TypeScript and Expo Router configuration working after dependency and structure changes.

#### Scenario: TypeScript validates
- **WHEN** `npx tsc --noEmit` runs
- **THEN** it completes without type errors

#### Scenario: Expo app starts
- **WHEN** `npx expo start` runs
- **THEN** the project starts without configuration errors
