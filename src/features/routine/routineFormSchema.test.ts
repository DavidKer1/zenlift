import { routineFormSchema } from './routineFormSchema';

describe('routineFormSchema', () => {
  it('requires a name, at least one day, and at least one exercise per day', () => {
    expect(routineFormSchema.safeParse({ name: '', description: '', days: [] }).success).toBe(false);

    const emptyDay = routineFormSchema.safeParse({
      name: 'Push Day',
      description: '',
      days: [{ key: 'd-1', name: 'Dia 1', exercises: [] }],
    });

    expect(emptyDay.success).toBe(false);
  });

  it('accepts a valid routine and coerces numeric exercise targets', () => {
    const result = routineFormSchema.safeParse({
      name: 'Push Day',
      description: '',
      goal: 'fuerza',
      days: [
        {
          key: 'd-1',
          name: 'Dia 1',
          exercises: [
            {
              key: 're-1',
              exerciseId: 'ex-1',
              exerciseName: 'Press de banca',
              targetSets: '3',
              targetRepsMin: '8',
              targetRepsMax: '',
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.days[0].exercises[0].targetSets).toBe(3);
      expect(result.data.days[0].exercises[0].targetRepsMax).toBeUndefined();
      expect(Object.keys(result.data.days[0].exercises[0])).toEqual([
        'key',
        'exerciseId',
        'exerciseName',
        'targetSets',
        'targetRepsMin',
        'targetRepsMax',
      ]);
    }
  });
});
