import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import type { FullRoutine } from '@/domain/entities';
import { useZenliftTheme } from '@/providers/ThemeProvider';
import { getDatabase } from '@/storage/database/connection';
import { RoutineRepo } from '@/storage/repositories/RoutineRepo';

type RoutineHeaderProps = {
  routine: FullRoutine;
  onRefresh: () => void;
  onBack: () => void;
};

export function RoutineHeader({ routine, onRefresh, onBack }: RoutineHeaderProps) {
  const { colors, radius } = useZenliftTheme();
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(routine.name);
  const nameInputRef = useRef<TextInput>(null);

  const handleNamePress = useCallback(() => {
    setEditedName(routine.name);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [routine.name]);

  const saveName = useCallback(async () => {
    setIsEditingName(false);
    const trimmed = editedName.trim();
    if (trimmed.length === 0 || trimmed === routine.name) {
      setEditedName(routine.name);
      return;
    }

    try {
      const db = await getDatabase();
      const repo = new RoutineRepo(db);
      await repo.update(routine.id, { name: trimmed });
      onRefresh();
    } catch (error) {
      console.error('[RoutineHeader] Failed to update name:', error);
      setEditedName(routine.name);
    }
  }, [editedName, routine.name, routine.id, onRefresh]);

  const handleNameBlur = useCallback(() => {
    saveName();
  }, [saveName]);

  const handleNameSubmit = useCallback(() => {
    saveName();
  }, [saveName]);

  const handleDuplicate = useCallback(async () => {
    try {
      const db = await getDatabase();
      const repo = new RoutineRepo(db);
      await repo.duplicate(routine.id, String(t('routines.alerts.duplicatedName', { name: routine.name })));

      Alert.alert(
        String(t('routines.alerts.duplicatedTitle')),
        String(t('routines.alerts.duplicatedBody', { name: routine.name })),
      );
      onRefresh();
    } catch (error) {
      console.error('[RoutineHeader] Failed to duplicate:', error);
      Alert.alert(String(t('common.error')), String(t('routines.alerts.duplicateFailed')));
    }
  }, [routine.id, routine.name, onRefresh, t]);

  const handleArchive = useCallback(async () => {
    try {
      const db = await getDatabase();
      const repo = new RoutineRepo(db);
      await repo.archive(routine.id);
      onBack();
    } catch (error) {
      console.error('[RoutineHeader] Failed to archive:', error);
      Alert.alert(String(t('common.error')), String(t('routines.alerts.archiveFailed')));
    }
  }, [routine.id, onBack, t]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      String(t('routines.alerts.deleteTitle')),
      String(t('routines.alerts.deleteBodyNamed', { name: routine.name })),
      [
        { text: String(t('common.cancel')), style: 'cancel' },
        {
          text: String(t('common.delete')),
          style: 'destructive',
          onPress: async () => {
            try {
              const db = await getDatabase();
              const repo = new RoutineRepo(db);
              await repo.delete(routine.id);
              onBack();
            } catch (error) {
              console.error('[RoutineHeader] Failed to delete:', error);
              Alert.alert(String(t('common.error')), String(t('routines.alerts.deleteFailed')));
            }
          },
        },
      ],
    );
  }, [routine.id, routine.name, onBack, t]);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={String(t('common.back'))}
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: colors.surface, borderRadius: radius.md },
          pressed && styles.pressed,
        ]}>
        <SymbolView
          name={'chevron.left' as SymbolViewProps['name']}
          size={20}
          tintColor={colors.text}
        />
      </Pressable>

      <View style={styles.nameBlock}>
        {isEditingName ? (
          <TextInput
            ref={nameInputRef}
            accessibilityLabel={String(t('routines.editNameA11y'))}
            autoFocus
            onBlur={handleNameBlur}
            onChangeText={setEditedName}
            onSubmitEditing={handleNameSubmit}
            returnKeyType="done"
            style={[
              styles.nameInput,
              {
                borderColor: colors.primary,
                color: colors.text,
                fontSize: 28,
                lineHeight: 36,
              },
            ]}
            value={editedName}
          />
        ) : (
          <Pressable
            accessibilityHint={String(t('routines.editNameHint'))}
            accessibilityLabel={routine.name}
            onPress={handleNamePress}
            style={{ minHeight: 48, justifyContent: 'center' }}>
            <ThemedText type="subtitle" style={styles.name}>
              {routine.name}
            </ThemedText>
          </Pressable>
        )}

        {routine.description ? (
          <ThemedText themeColor="mutedText" style={styles.description}>
            {routine.description}
          </ThemedText>
        ) : null}

        {routine.goal ? (
          <View
            style={[
              styles.goalPill,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: radius.pill,
              },
            ]}>
            <ThemedText type="smallBold" style={{ color: colors.primary }}>
              {t(`routines.goal.${routine.goal}`, { defaultValue: routine.goal })}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.actions, { borderColor: colors.border }]}>
        <Pressable
          accessibilityLabel={`${t('routines.duplicate')} ${routine.name}`}
          onPress={handleDuplicate}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
            pressed && styles.pressed,
          ]}>
          <SymbolView
            name={'doc.on.doc' as SymbolViewProps['name']}
            size={18}
            tintColor={colors.text}
          />
          <ThemedText type="small" style={styles.actionLabel}>
            {t('routines.duplicate')}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityLabel={`${t('routines.archive')} ${routine.name}`}
          onPress={handleArchive}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.surfaceElevated, borderRadius: radius.md },
            pressed && styles.pressed,
          ]}>
          <SymbolView
            name={'archivebox' as SymbolViewProps['name']}
            size={18}
            tintColor={colors.text}
          />
          <ThemedText type="small" style={styles.actionLabel}>
            {t('routines.archive')}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityLabel={`${t('common.delete')} ${routine.name}`}
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.danger + '14', borderRadius: radius.md },
            pressed && styles.pressed,
          ]}>
          <SymbolView
            name={'trash' as SymbolViewProps['name']}
            size={18}
            tintColor={colors.danger}
          />
          <ThemedText type="small" style={[styles.actionLabel, { color: colors.danger }]}>
            {t('common.delete')}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
    width: 40,
  },
  container: {
    gap: 4,
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  goalPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  name: {
    fontSize: 28,
    lineHeight: 36,
  },
  nameBlock: {
    gap: 2,
  },
  nameInput: {
    borderBottomWidth: 2,
    fontWeight: '700',
    minHeight: 52,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.74,
  },
});
