// Data-driven level definitions. Adding level 401 should never require a
// new Scene — only a new entry here (or in a per-planet file once the
// roster grows large; see note at bottom of this file).
//
// Every level has exactly 5 waves per spec. Each wave lists enemy groups by
// type + count; WaveManager turns this into actual spawns with a
// spawnIntervalMs stagger so a "count: 5" doesn't all appear on one frame.

export const LEVELS = {
  mercury: {
    1: {
      planet: 'mercury',
      level: 1,
      boss: null,
      waves: [
        { enemies: [{ type: 'basic', count: 5 }], spawnIntervalMs: 700 },
        { enemies: [{ type: 'basic', count: 7 }], spawnIntervalMs: 650 },
        { enemies: [{ type: 'basic', count: 10 }], spawnIntervalMs: 550 },
        { enemies: [{ type: 'basic', count: 12 }], spawnIntervalMs: 500 },
        { enemies: [{ type: 'basic', count: 15 }], spawnIntervalMs: 450 }
      ]
    }
  }
};

export function getLevelData(planetId, levelNumber) {
  return LEVELS[planetId]?.[levelNumber];
}

// As content scales toward 400 levels x 8 planets, this file should be
// split into src/data/levels/<planet>.js and merged here, and/or generated
// from a level-authoring tool. The getLevelData() contract stays the same
// either way, so nothing downstream (WaveManager/LevelManager) needs to
// change when that split happens.
