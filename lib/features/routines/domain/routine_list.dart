import 'routine.dart';

class RoutineListState {
  const RoutineListState({
    required this.routines,
    this.archivedRoutine,
    this.errorMessage,
  });

  static const empty = RoutineListState(routines: <RoutineWithCounts>[]);

  final List<RoutineWithCounts> routines;
  final RoutineWithCounts? archivedRoutine;
  final String? errorMessage;

  bool get hasError => errorMessage != null && errorMessage!.isNotEmpty;
  bool get isEmpty => routines.isEmpty;

  RoutineListState copyWith({
    List<RoutineWithCounts>? routines,
    RoutineWithCounts? archivedRoutine,
    bool clearArchivedRoutine = false,
    String? errorMessage,
    bool clearError = false,
  }) {
    return RoutineListState(
      routines: routines ?? this.routines,
      archivedRoutine: clearArchivedRoutine
          ? null
          : archivedRoutine ?? this.archivedRoutine,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

enum RoutineTemplateKind { ppl, upperLower, fullBody }

class RoutineTemplateSummary {
  const RoutineTemplateSummary({
    required this.kind,
    required this.title,
    required this.subtitle,
  });

  final RoutineTemplateKind kind;
  final String title;
  final String subtitle;
}

const routineTemplateSuggestions = <RoutineTemplateSummary>[
  RoutineTemplateSummary(
    kind: RoutineTemplateKind.ppl,
    title: 'PPL',
    subtitle: 'Push, pull, legs split',
  ),
  RoutineTemplateSummary(
    kind: RoutineTemplateKind.upperLower,
    title: 'Upper/Lower',
    subtitle: 'Balanced 4-day structure',
  ),
  RoutineTemplateSummary(
    kind: RoutineTemplateKind.fullBody,
    title: 'Full Body',
    subtitle: 'Simple full-body training',
  ),
];
