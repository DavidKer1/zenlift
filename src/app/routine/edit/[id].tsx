import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { RoutineForm } from '@/components/routine/RoutineForm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { FullRoutine } from '@/domain/entities';
import { mapFullRoutineToFormValues } from '@/features/routine/routineFormMapping';
import { updateRoutineFromForm } from '@/features/routine/routineFormPersistence';
import type { RoutineFormValues } from '@/features/routine/routineFormSchema';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';

export default function EditRoutineScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors, radius, spacing } = useZenliftTheme();
  const [routine, setRoutine] = useState<FullRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRoutine() {
      if (!id) {
        setLoadError(String(t('routines.notFound')));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const db = await getDatabase();
        const repo = new RoutineRepo(db);
        const nextRoutine = await repo.getFullRoutine(id);

        if (!isMounted) return;

        if (!nextRoutine) {
          setLoadError(String(t('routines.notFound')));
          setRoutine(null);
        } else {
          setRoutine(nextRoutine);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : String(t('routines.alerts.loadFailed')));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRoutine();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  const initialData = useMemo(
    () => (routine ? mapFullRoutineToFormValues(routine) : undefined),
    [routine],
  );

  async function handleSubmit(values: RoutineFormValues) {
    if (!id) throw new Error(String(t('routines.notFound')));

    const db = await getDatabase();
    await updateRoutineFromForm(db, id, values);
    router.replace(`/routine/${id}`);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <ThemedText type="small" themeColor="mutedText">
          {t('routines.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  if (loadError || !initialData) {
    return (
      <ThemedView style={[styles.centered, { padding: spacing.four }]}>
        <ThemedText type="subtitle">{t('routines.notFound')}</ThemedText>
        <ThemedText themeColor="mutedText">
          {loadError ?? t('routines.notFoundBody')}
        </ThemedText>
        <Pressable
          accessibilityLabel={String(t('routines.backToRoutines'))}
          onPress={() => router.replace('/routines')}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              opacity: pressed ? 0.74 : 1,
            },
          ]}>
          <ThemedText type="smallBold" style={[styles.buttonText, { color: colors.surface }]}>
            {t('routines.backToRoutines')}
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoutineForm
        initialData={initialData}
        title={String(t('routines.edit'))}
        submitLabel={String(t('routines.saveChanges'))}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 18,
  },
  buttonText: {
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
