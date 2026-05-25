import { FlashList, type FlashListProps } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/routine/EmptyState';
import { RoutineCard } from '@/components/routine/RoutineCard';
import {
  SuggestedTemplates,
  type SuggestedRoutineTemplate,
} from '@/components/routine/SuggestedTemplates';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FAB } from '@/components/ui/FAB';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import {
  RoutineRepo,
  type RoutineWithCounts,
} from '@/storage/repositories/RoutineRepo';

type RoutineListProps = FlashListProps<RoutineWithCounts> & {
  estimatedItemSize?: number;
};

const RoutineFlashList = FlashList as React.ComponentType<RoutineListProps>;
const CREATE_ROUTINE_ROUTE = '/routine/create';

async function getRoutineRepo() {
  const db = await getDatabase();
  return new RoutineRepo(db);
}

export default function RoutinesScreen() {
  const { colors, radius, spacing } = useZenliftTheme();
  const [routines, setRoutines] = useState<RoutineWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [archivedRoutine, setArchivedRoutine] = useState<RoutineWithCounts | null>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndoTimeout = useCallback(() => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
  }, []);

  const navigateToCreate = useCallback(() => {
    router.push(CREATE_ROUTINE_ROUTE as never);
  }, []);

  const handleTemplatePress = useCallback((template: SuggestedRoutineTemplate) => {
    router.push({
      pathname: CREATE_ROUTINE_ROUTE,
      params: { template: template.id },
    } as never);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadRoutines() {
        try {
          setIsLoading(true);
          setErrorMessage(null);
          const repo = await getRoutineRepo();
          const nextRoutines = await repo.getAllWithDayCount();

          if (isActive) {
            setRoutines(nextRoutines);
          }
        } catch (error) {
          if (isActive) {
            console.error('[Routines] Failed to load routines:', error);
            setErrorMessage('No pudimos cargar tus rutinas.');
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadRoutines();

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(
    () => () => {
      clearUndoTimeout();
    },
    [clearUndoTimeout],
  );

  const handleArchive = useCallback(
    async (routine: RoutineWithCounts) => {
      try {
        clearUndoTimeout();
        const repo = await getRoutineRepo();
        await repo.archive(routine.id);
        setRoutines((current) => current.filter((item) => item.id !== routine.id));
        setArchivedRoutine(routine);
        setErrorMessage(null);
        undoTimeoutRef.current = setTimeout(() => {
          setArchivedRoutine(null);
          undoTimeoutRef.current = null;
        }, 5000);
      } catch (error) {
        console.error('[Routines] Failed to archive routine:', error);
        setErrorMessage('No pudimos archivar la rutina.');
      }
    },
    [clearUndoTimeout],
  );

  const handleUndoArchive = useCallback(async () => {
    if (!archivedRoutine) return;

    try {
      clearUndoTimeout();
      const repo = await getRoutineRepo();
      await repo.unarchive(archivedRoutine.id);
      setRoutines((current) =>
        [...current, archivedRoutine].sort((a, b) => a.sort_order - b.sort_order),
      );
      setArchivedRoutine(null);
      setErrorMessage(null);
    } catch (error) {
      console.error('[Routines] Failed to undo archive:', error);
      setErrorMessage('No pudimos restaurar la rutina.');
    }
  }, [archivedRoutine, clearUndoTimeout]);

  const handleRoutinePress = useCallback((routine: RoutineWithCounts) => {
    router.push(`/routine/${routine.id}` as never);
  }, []);

  const renderRoutine = useCallback(
    ({ item }: { item: RoutineWithCounts }) => (
      <RoutineCard onArchive={handleArchive} onPress={handleRoutinePress} routine={item} />
    ),
    [handleArchive, handleRoutinePress],
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <View style={[styles.header, { paddingHorizontal: spacing.four }]}>
          <ThemedText type="subtitle" style={styles.title}>
            Mis Rutinas
          </ThemedText>
          <ThemedText themeColor="mutedText">
            Elige una rutina para revisar sus días y ejercicios.
          </ThemedText>
        </View>

        {routines.length < 2 ? (
          <SuggestedTemplates onTemplatePress={handleTemplatePress} />
        ) : null}
      </View>
    ),
    [handleTemplatePress, routines.length, spacing.four],
  );

  const keyExtractor = useCallback((item: RoutineWithCounts) => item.id, []);
  const showEmptyState = !isLoading && routines.length === 0;

  return (
    <GestureHandlerRootView style={styles.screen}>
      <ThemedView style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {showEmptyState ? (
            <View style={styles.emptyScroll}>
              <View style={[styles.header, { paddingHorizontal: spacing.four }]}>
                <ThemedText type="subtitle" style={styles.title}>
                  Mis Rutinas
                </ThemedText>
                <ThemedText themeColor="mutedText">
                  Guarda tus plantillas para empezar workouts sin pensar de más.
                </ThemedText>
              </View>
              <EmptyState onCreatePress={navigateToCreate} />
              <SuggestedTemplates onTemplatePress={handleTemplatePress} />
            </View>
          ) : (
            <RoutineFlashList
              contentContainerStyle={{
                paddingBottom: 188,
                paddingHorizontal: spacing.four,
              }}
              data={routines}
              estimatedItemSize={80}
              keyExtractor={keyExtractor}
              ListEmptyComponent={
                <View style={[styles.loadingState, { paddingTop: spacing.six }]}>
                  <ThemedText themeColor="mutedText">
                    {isLoading ? 'Cargando rutinas...' : 'No hay rutinas activas.'}
                  </ThemedText>
                </View>
              }
              ListHeaderComponent={renderListHeader}
              renderItem={renderRoutine}
              showsVerticalScrollIndicator={false}
            />
          )}

          {errorMessage ? (
            <ThemedView
              type="surface"
              style={[
                styles.inlineMessage,
                {
                  borderColor: colors.danger,
                  borderRadius: radius.md,
                  marginHorizontal: spacing.four,
                },
              ]}>
              <ThemedText type="smallBold" style={{ color: colors.danger }}>
                {errorMessage}
              </ThemedText>
            </ThemedView>
          ) : null}

          {archivedRoutine ? (
            <ThemedView
              type="surface"
              style={[
                styles.undoBar,
                {
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  marginHorizontal: spacing.four,
                },
              ]}>
              <ThemedText type="small" style={styles.undoText}>
                Rutina archivada
              </ThemedText>
              <Pressable
                accessibilityLabel={`Deshacer archivo de ${archivedRoutine.name}`}
                accessibilityRole="button"
                onPress={handleUndoArchive}
                style={({ pressed }) => [
                  styles.undoButton,
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <ThemedText type="smallBold" style={{ color: colors.primary }}>
                  Deshacer
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : null}

          <FAB onPress={navigateToCreate} />
        </SafeAreaView>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  emptyScroll: {
    flex: 1,
    gap: 20,
    paddingBottom: 188,
  },
  header: {
    gap: 4,
    paddingBottom: 20,
    paddingTop: 16,
  },
  inlineMessage: {
    borderWidth: 1,
    bottom: 174,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    right: 0,
    zIndex: 25,
  },
  listHeader: {
    gap: 20,
    marginHorizontal: -24,
    paddingBottom: 20,
  },
  loadingState: {
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
  },
  undoBar: {
    alignItems: 'center',
    borderWidth: 1,
    bottom: 104,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    left: 0,
    minHeight: 52,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    zIndex: 30,
  },
  undoButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  undoText: {
    flex: 1,
  },
});
