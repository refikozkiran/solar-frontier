// Enemy definitions keyed by enemyType. Phase 1 only implements 'basic'
// (see entities/BasicEnemy.js). The remaining ids are reserved so
// WaveManager / level data can already reference them by name in the
// future without a data-shape change.
export const ENEMIES = {
  basic: {
    id: 'basic',
    name: 'Drifter',
    hp: 2,
    speed: 160, // px/sec, straight downward
    damage: 1,
    score: 10,
    coinReward: 2,
    xpReward: 5,
    color: 0xff5566
  },

  // Wired up in Phase 2 for Mercury's difficulty progression (see
  // data/mercuryLevels.js). All still render as BasicEnemy's sprite —
  // color/scale below give visual variety without new movement code,
  // which is the deliberate scope line for this phase (see Known
  // limitations in the Phase 2 handoff notes).
  chaser: {
    id: 'chaser',
    name: 'Chaser',
    hp: 3,
    speed: 220,
    damage: 1,
    score: 15,
    coinReward: 3,
    xpReward: 8,
    color: 0xffaa33,
    scale: 0.9
  },
  shooter: {
    id: 'shooter',
    name: 'Shooter',
    hp: 4,
    speed: 100,
    damage: 1,
    score: 20,
    coinReward: 4,
    xpReward: 10,
    color: 0x9d4dff,
    scale: 1
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    hp: 12,
    speed: 70,
    damage: 2,
    score: 40,
    coinReward: 8,
    xpReward: 20,
    color: 0x8a6d3b,
    scale: 1.35
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    hp: 20,
    speed: 130,
    damage: 2,
    score: 80,
    coinReward: 15,
    xpReward: 40,
    color: 0xffe066,
    scale: 1.15
  }
};

export function getEnemyConfig(enemyType) {
  return ENEMIES[enemyType];
}
