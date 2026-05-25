## 1. UI Components

- [x] 1.1 Create `src/components/ui/SearchBar.tsx` — search icon, TextInput, clear button, onSubmitEditing dismiss keyboard, controlled value via props
- [x] 1.2 Create `src/components/ui/FilterChip.tsx` — selected/unselected visual states, 48px min height touch target, onPress callback, label prop, chip with border/pill shape
- [x] 1.3 Create `src/components/ui/ExerciseCard.tsx` — exercise name, primary muscle colored dot (from `muscleColors`), equipment icon, favorite star toggle button, onPress navigates, onFavoriteToggle callback

## 2. Exercise Library Screen

- [x] 2.1 Create `src/app/exercise/index.tsx` with SafeAreaView, header title, and SearchBar
- [x] 2.2 Add horizontal ScrollView with FilterChip list for muscle groups — fetch from MuscleGroupRepo, multi-select state with Set<string>
- [x] 2.3 Add equipment filter section (horizontal FilterChip row or single-select chips)
- [x] 2.4 Implement debounced search logic (300ms) with useRef/useEffect on search text changes
- [x] 2.5 Wire filtering logic — combine search query, muscle filters, and equipment filter to produce filtered exercise list
- [x] 2.6 Add FlashList with `estimatedItemSize={72}` rendering ExerciseCard items
- [x] 2.7 Add empty state view (centered "No se encontraron ejercicios" with icon) when filtered results are empty
- [x] 2.8 Add FAB (absolute positioned, bottom-right) with "+" icon that navigates to exercise create

## 3. Favorites Integration

- [x] 3.1 Implement optimistic toggle on ExerciseCard favorite button — call `ExerciseRepo.toggleFavorite()`, update local state, revert on error

## 4. Verification

- [ ] 4.1 Run TypeScript typecheck and fix any errors
- [ ] 4.2 Test search with debounce: type text, verify results update after 300ms pause
- [ ] 4.3 Test muscle filter: select one or more chips, verify filtered results via JOIN
- [ ] 4.4 Test equipment filter: select equipment, verify filtered results
- [ ] 4.5 Test favorites toggle: tap star, verify persistence across re-renders, revert on simulated error
- [ ] 4.6 Test FlashList smooth scroll with 25+ exercises
- [ ] 4.7 Test empty state with no-matching search query
