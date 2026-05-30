import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { RoutineForm } from '@/components/routine/RoutineForm';
import { createRoutineFromForm } from '@/features/routine/routineFormPersistence';
import type { RoutineFormValues } from '@/features/routine/routineFormSchema';
import { getDatabase } from '@/storage/database/connection';

export default function CreateRoutineScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  async function handleSubmit(values: RoutineFormValues) {
    const db = await getDatabase();
    const routineId = await createRoutineFromForm(db, values);

    router.replace(`/routine/${routineId}`);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RoutineForm
        title={String(t('routines.create'))}
        submitLabel={String(t('routines.create'))}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
