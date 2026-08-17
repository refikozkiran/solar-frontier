// Generates all 50 Mercury levels from a difficulty curve rather than 50
// hand-authored objects. getMercuryLevel()/getLevelData() is the only
// contract WaveManager/LevelManager care about, so this file can be
// rewritten (e.g. swapped for hand-tuned per-level data) without touching
// any consumer.
import { getBossForLevel } from './mercuryBosses.js';

const BOSS_LEVELS = new Set([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);

// Ten five-level tiers. Each tier both widens the enemy roster and raises
// eliteChance, so difficulty climbs on two axes at once instead of just
// "more HP" (spec section 7). Ranges are inclusive.
const TIERS = [
  { max: 5, enemyTypes: ['basic'], eliteChance: 0 },
  { max: 10, enemyTypes: ['basic', 'chaser'], eliteChance: 0 },
  { max: 15, enemyTypes: ['basic', 'chaser', 'shooter'], eliteChance: 0 },
  { max: 20, enemyTypes: ['basic', 'chaser', 'shooter', 'tank'], eliteChance: 0.04 },
  { max: 25, enemyTypes: ['basic', 'chaser', 'shooter', 'tank'], eliteChance: 0.12 },
  { max: 30, enemyTypes: ['chaser', 'shooter', 'tank'], eliteChance: 0.16 },
  { max: 35, enemyTypes: ['chaser', 'shooter', 'tank', 'elite'], eliteChance: 0.2 },
  { max: 40, enemyTypes: ['chaser', 'shooter', 'tank', 'elite'], eliteChance: 0.28 },
  { max: 45, enemyTypes: ['shooter', 'tank', 'elite'], eliteChance: 0.36 },
  { max: 50, enemyTypes: ['tank', 'elite'], eliteChance: 0.45 }
];

function tierFor(level) {
  return TIERS.find((t) => level <= t.max) ?? TIERS[TIERS.length - 1];
}

/** 0 at level 1, climbing smoothly to 1 at level 49 (level 50 is the boss). */
function difficultyScalar(level) {
  return Math.min(1, (level - 1) / 48);
}

function pickType(tier, waveRatio, rng) {
  // waveRatio (0..1) is how far through THIS level's 5 waves we are, so
  // wave 5 skews toward the tier's harder/rarer types even within one level.
  const pool = tier.enemyTypes;
  const eliteRoll = rng();
  if (pool.includes('elite') && eliteRoll < tier.eliteChance * (0.5 + waveRatio)) {
    return 'elite';
  }
  const weightedIndex = Math.min(pool.length - 1, Math.floor(rng() * pool.length * (0.4 + waveRatio * 0.9)));
  return pool[weightedIndex] ?? pool[0];
}

// Deterministic PRNG (mulberry32) seeded per-level so the generated level
// set is stable across reloads/builds instead of re-rolling every import.
function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildWave(level, waveNumber, tier, scalar, rng) {
  const waveRatio = (waveNumber - 1) / 4; // 0, 0.25, 0.5, 0.75, 1

  // Enemy count grows with both level and how late the wave is within its
  // level. Kept modest (mobile screen, single spawn lane logic) but roughly
  // triples from level 1 wave 1 to level 49 wave 5.
  const baseCount = 4 + Math.round(scalar * 10) + Math.round(waveRatio * 3);

  // How many distinct groups (enemy types) make up this wave — 1 early on,
  // up to 3 once the roster and "wave complexity" spec bullet kick in.
  const groupCount = Math.max(1, Math.min(3, 1 + Math.floor((scalar + waveRatio) / 0.9)));

  const enemies = [];
  let remaining = baseCount;
  for (let g = 0; g < groupCount; g++) {
    const isLast = g === groupCount - 1;
    const count = isLast ? remaining : Math.max(1, Math.round(baseCount / groupCount));
    remaining -= count;
    enemies.push({ type: pickType(tier, waveRatio, rng), count });
  }

  // Spawn frequency: starts relaxed (700ms), tightens toward 260ms at the
  // hardest combination of level + late wave.
  const spawnIntervalMs = Math.round(700 - scalar * 300 - waveRatio * 100);

  return { enemies, spawnIntervalMs: Math.max(220, spawnIntervalMs) };
}

function buildLevel(level) {
  const tier = tierFor(level);
  const scalar = difficultyScalar(level);
  const rng = mulberry32(level * 7919 + 13);
  const isBoss = BOSS_LEVELS.has(level);
  const boss = isBoss ? getBossForLevel(level) : null;

  const waves = [];
  for (let w = 1; w <= 5; w++) {
    if (isBoss && w === 5) {
      // The boss IS wave 5 — no separate 6th wave (spec section 8/9).
      waves.push({ isBossWave: true, bossId: boss.id });
    } else {
      waves.push(buildWave(level, w, tier, scalar, rng));
    }
  }

  return {
    id: level,
    planet: 'mercury',
    level,
    isBoss,
    bossId: boss?.id ?? null,
    difficulty: Math.round((scalar * 9 + 1) * 10) / 10, // ~1.0 - 10.0
    waves
  };
}

// Built once at module load — 50 plain objects, cheap and stable.
export const MERCURY_LEVELS = Object.fromEntries(
  Array.from({ length: 50 }, (_, i) => i + 1).map((level) => [level, buildLevel(level)])
);

export const MERCURY_BOSS_LEVELS = Array.from(BOSS_LEVELS).sort((a, b) => a - b);

export function getMercuryLevel(levelNumber) {
  return MERCURY_LEVELS[levelNumber];
}

export function isMercuryBossLevel(levelNumber) {
  return BOSS_LEVELS.has(levelNumber);
}
