import { getExerciseVisual, seededExerciseVisuals } from './exerciseVisuals';

type SeedExercise = {
  id: string;
  name: string;
};

const seedData = require('../../../assets/exercise.json') as {
  exercises: SeedExercise[];
};

describe('exerciseVisuals', () => {
  it('has visual metadata for every seeded exercise', () => {
    for (const exercise of seedData.exercises) {
      const visual = getExerciseVisual({
        id: exercise.id,
        name: exercise.name,
        notes: null,
      });

      expect(visual.descriptionEs.length).toBeGreaterThan(40);
      expect(visual.photoAlt).toContain(exercise.name);
      expect(visual.photo).toBeTruthy();
    }
  });

  it('uses custom notes as the description for custom exercises', () => {
    const visual = getExerciseVisual({
      id: 'custom-1',
      name: 'Curl inventado',
      notes: 'Mantener codos pegados al torso y controlar la bajada.',
    });

    expect(visual.descriptionEs).toBe(
      'Mantener codos pegados al torso y controlar la bajada.',
    );
    expect(visual.photoAlt).toBe('Foto de referencia para Curl inventado');
  });

  it('keeps seeded visual ids unique', () => {
    const ids = Object.keys(seededExerciseVisuals);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(seedData.exercises.length);
  });
});
