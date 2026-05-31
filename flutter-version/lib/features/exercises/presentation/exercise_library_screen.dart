import 'dart:async';

import 'package:flutter/material.dart';

import '../../../theme/zenlift_radii.dart';
import '../../../theme/zenlift_spacing.dart';
import '../domain/exercise.dart';
import '../domain/exercise_library.dart';

typedef ExerciseLibraryLoader =
    Future<ExerciseLibraryState> Function({
      String query,
      Set<String> muscleIds,
      String? equipment,
    });
typedef ExerciseFavoriteToggler = Future<ExerciseEntity?> Function(String id);
typedef ExerciseIdAction = Future<void> Function(String id);
typedef ExerciseAction = Future<void> Function();

class ExerciseLibraryScreen extends StatefulWidget {
  const ExerciseLibraryScreen({
    required this.loadExercises,
    required this.onToggleFavorite,
    required this.onOpenExercise,
    required this.onCreateExercise,
    super.key,
    this.initialState,
  });

  final ExerciseLibraryState? initialState;
  final ExerciseLibraryLoader loadExercises;
  final ExerciseFavoriteToggler onToggleFavorite;
  final ExerciseIdAction onOpenExercise;
  final ExerciseAction onCreateExercise;

  @override
  State<ExerciseLibraryScreen> createState() => _ExerciseLibraryScreenState();
}

class _ExerciseLibraryScreenState extends State<ExerciseLibraryScreen> {
  final _searchController = TextEditingController();
  final _selectedMuscleIds = <String>{};
  String? _selectedEquipment;
  Timer? _debounce;
  ExerciseLibraryState? _state;
  var _isLoading = false;

  @override
  void initState() {
    super.initState();
    _state = widget.initialState;
    if (_state == null) {
      _reload();
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    setState(() => _isLoading = true);
    final nextState = await widget.loadExercises(
      query: _searchController.text,
      muscleIds: Set<String>.unmodifiable(_selectedMuscleIds),
      equipment: _selectedEquipment,
    );
    if (!mounted) {
      return;
    }
    setState(() {
      _state = nextState;
      _isLoading = false;
    });
    if (nextState.hasError) {
      _showMessage(nextState.errorMessage!);
    }
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), _reload);
    setState(() {});
  }

  void _clearSearch() {
    _debounce?.cancel();
    _searchController.clear();
    _reload();
  }

  Future<void> _toggleFavorite(ExerciseLibraryItem item) async {
    final previous = item.exercise.isFavorite;
    final optimistic = _replaceExercise(
      item.exercise.id,
      isFavorite: !previous,
    );
    setState(() => _state = optimistic);
    try {
      final updated = await widget.onToggleFavorite(item.exercise.id);
      if (updated != null && mounted) {
        setState(
          () => _state = _replaceExercise(updated.id, exercise: updated),
        );
      }
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(
        () => _state = _replaceExercise(item.exercise.id, isFavorite: previous),
      );
      _showMessage('Could not update favorite.');
    }
  }

  ExerciseLibraryState _replaceExercise(
    String id, {
    ExerciseEntity? exercise,
    bool? isFavorite,
  }) {
    final current = _state ?? ExerciseLibraryState.empty;
    return ExerciseLibraryState(
      muscleGroups: current.muscleGroups,
      errorMessage: current.errorMessage,
      exercises: [
        for (final item in current.exercises)
          if (item.exercise.id == id)
            ExerciseLibraryItem(
              primaryMuscle: item.primaryMuscle,
              exercise:
                  exercise ??
                  ExerciseEntity(
                    id: item.exercise.id,
                    name: item.exercise.name,
                    equipment: item.exercise.equipment,
                    category: item.exercise.category,
                    isCustom: item.exercise.isCustom,
                    isFavorite: isFavorite ?? item.exercise.isFavorite,
                    notes: item.exercise.notes,
                    createdAt: item.exercise.createdAt,
                    updatedAt: item.exercise.updatedAt,
                  ),
            )
          else
            item,
      ],
    );
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = _state ?? ExerciseLibraryState.empty;
    final equipmentOptions = {
      for (final item in state.exercises) item.exercise.equipment,
    }.toList()..sort();

    return Scaffold(
      floatingActionButton: FloatingActionButton(
        key: const Key('exercise-library-create-button'),
        tooltip: 'Create exercise',
        onPressed: widget.onCreateExercise,
        child: const Icon(Icons.add),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _reload,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(
              ZenliftSpacing.lateral,
              ZenliftSpacing.stackMd,
              ZenliftSpacing.lateral,
              ZenliftSpacing.stackLg,
            ),
            children: [
              Text(
                'Exercise library',
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: ZenliftSpacing.stackMd),
              TextField(
                key: const Key('exercise-library-search-field'),
                controller: _searchController,
                onChanged: _onSearchChanged,
                textInputAction: TextInputAction.search,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Search exercises',
                  suffixIcon: _searchController.text.trim().isEmpty
                      ? null
                      : IconButton(
                          key: const Key('exercise-library-clear-search'),
                          tooltip: 'Clear search',
                          onPressed: _clearSearch,
                          icon: const Icon(Icons.close),
                        ),
                  border: const OutlineInputBorder(
                    borderRadius: BorderRadius.all(
                      Radius.circular(ZenliftRadii.medium),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: ZenliftSpacing.stackMd),
              _MuscleFilters(
                muscles: state.muscleGroups,
                selectedIds: _selectedMuscleIds,
                onChanged: (muscleId) {
                  setState(() {
                    if (!_selectedMuscleIds.add(muscleId)) {
                      _selectedMuscleIds.remove(muscleId);
                    }
                  });
                  _reload();
                },
              ),
              const SizedBox(height: ZenliftSpacing.stackSm),
              _EquipmentFilters(
                options: equipmentOptions,
                selected: _selectedEquipment,
                onChanged: (equipment) {
                  setState(() {
                    _selectedEquipment = _selectedEquipment == equipment
                        ? null
                        : equipment;
                  });
                  _reload();
                },
                onClear: () {
                  setState(() => _selectedEquipment = null);
                  _reload();
                },
              ),
              const SizedBox(height: ZenliftSpacing.stackMd),
              if (_isLoading && _state == null)
                const Padding(
                  padding: EdgeInsets.all(ZenliftSpacing.stackLg),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (state.isEmpty)
                const _ExerciseEmptyState()
              else
                for (final item in state.exercises) ...[
                  _ExerciseCard(
                    key: Key('exercise-card-${item.exercise.id}'),
                    item: item,
                    onOpen: () => widget.onOpenExercise(item.exercise.id),
                    onFavorite: () => _toggleFavorite(item),
                  ),
                  const SizedBox(height: ZenliftSpacing.stackSm),
                ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MuscleFilters extends StatelessWidget {
  const _MuscleFilters({
    required this.muscles,
    required this.selectedIds,
    required this.onChanged,
  });

  final List<MuscleGroupEntity> muscles;
  final Set<String> selectedIds;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    if (muscles.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: muscles.length,
        separatorBuilder: (context, index) =>
            const SizedBox(width: ZenliftSpacing.stackSm),
        itemBuilder: (context, index) {
          final muscle = muscles[index];
          return FilterChip(
            key: Key('exercise-library-muscle-${muscle.id}'),
            label: Text(muscle.displayNameEs),
            selected: selectedIds.contains(muscle.id),
            onSelected: (_) => onChanged(muscle.id),
          );
        },
      ),
    );
  }
}

class _EquipmentFilters extends StatelessWidget {
  const _EquipmentFilters({
    required this.options,
    required this.selected,
    required this.onChanged,
    required this.onClear,
  });

  final List<String> options;
  final String? selected;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;

  @override
  Widget build(BuildContext context) {
    if (options.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          Padding(
            padding: const EdgeInsets.only(right: ZenliftSpacing.stackSm),
            child: FilterChip(
              key: const Key('exercise-library-equipment-all'),
              label: const Text('All'),
              selected: selected == null,
              onSelected: (_) => onClear(),
            ),
          ),
          for (final option in options)
            Padding(
              padding: const EdgeInsets.only(right: ZenliftSpacing.stackSm),
              child: FilterChip(
                key: Key('exercise-library-equipment-$option'),
                label: Text(option),
                selected: selected == option,
                onSelected: (_) => onChanged(option),
              ),
            ),
        ],
      ),
    );
  }
}

class _ExerciseCard extends StatelessWidget {
  const _ExerciseCard({
    required this.item,
    required this.onOpen,
    required this.onFavorite,
    super.key,
  });

  final ExerciseLibraryItem item;
  final VoidCallback onOpen;
  final VoidCallback onFavorite;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final muscleColor = _parseColor(item.primaryMuscle?.color);
    return Card(
      child: InkWell(
        borderRadius: const BorderRadius.all(ZenliftRadii.card),
        onTap: onOpen,
        child: Padding(
          padding: const EdgeInsets.all(ZenliftSpacing.stackMd),
          child: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: muscleColor ?? colors.primary,
                  borderRadius: BorderRadius.circular(ZenliftRadii.full),
                ),
              ),
              const SizedBox(width: ZenliftSpacing.stackMd),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.exercise.name,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      [
                        item.primaryMuscle?.displayNameEs,
                        item.exercise.equipment,
                      ].whereType<String>().join(' · '),
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: colors.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                key: Key('exercise-favorite-${item.exercise.id}'),
                tooltip: item.exercise.isFavorite
                    ? 'Remove favorite'
                    : 'Mark favorite',
                onPressed: onFavorite,
                icon: Icon(
                  item.exercise.isFavorite ? Icons.star : Icons.star_border,
                  color: item.exercise.isFavorite
                      ? colors.tertiary
                      : colors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExerciseEmptyState extends StatelessWidget {
  const _ExerciseEmptyState();

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: ZenliftSpacing.stackLg),
      child: Column(
        children: [
          Icon(Icons.search_off, color: colors.onSurfaceVariant, size: 40),
          const SizedBox(height: ZenliftSpacing.stackMd),
          Text(
            'No se encontraron ejercicios',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: ZenliftSpacing.stackSm),
          Text(
            'Try another search or clear filters.',
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: colors.onSurfaceVariant),
          ),
        ],
      ),
    );
  }
}

Color? _parseColor(String? value) {
  if (value == null || !value.startsWith('#') || value.length != 7) {
    return null;
  }
  return Color(int.parse('ff${value.substring(1)}', radix: 16));
}
