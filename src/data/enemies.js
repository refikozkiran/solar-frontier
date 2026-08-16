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

  // Reserved for future phases.
  chaser: { id: 'chaser', name: 'Chaser', hp: 3, speed: 220, damage: 1, score: 15, coinReward: 3, xpReward: 8 },
  shooter: { id: 'shooter', name: 'Shooter', hp: 4, speed: 100, damage: 1, score: 20, coinReward: 4, xpReward: 10 },
  tank: { id: 'tank', name: 'Tank', hp: 12, speed: 70, damage: 2, score: 40, coinReward: 8, xpReward: 20 },
  elite: { id: 'elite', name: 'Elite', hp: 20, speed: 130, damage: 2, score: 80, coinReward: 15, xpReward: 40 }
};

export function getEnemyConfig(enemyType) {
  return ENEMIES[enemyType];
}
