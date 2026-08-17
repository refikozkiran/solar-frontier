// Data-driven boss configs. Boss.js (entity) + BossManager.js (system) read
// these — nothing boss-specific lives in GameScene. Placeholder procedural
// graphics only per Phase 2 spec; `color`/`accentColor` drive the generated
// texture until real art exists.
//
// hp/damage/rewards scale with `level` via a smooth curve so Boss 10
// (Mercury Overlord, level 50) is meaningfully tougher than Boss 1 (Metal
// Crawler, level 5) without a hand-tuned table for every one of the ten.
//
// HP is calibrated against the CURRENT baseline weapon (basic_blaster:
// 1 dmg / 350ms ≈ 2.86 dps — there's no damage-upgrade system yet, that's a
// later phase). At that DPS this keeps boss 1 (~40hp) around 14s and boss
// 10 (~160hp) around 55s, so even the Mercury final boss stays a fast,
// mobile-appropriate fight rather than a multi-minute grind.
function scaledStats(level) {
  const tier = level / 5; // 1..10
  return {
    hp: Math.round(40 + tier * tier * 1.2), // ~41 (lvl5) -> ~160 (lvl50)
    contactDamage: Math.min(3, 1 + Math.floor(tier / 4)),
    minionIntervalMs: Math.max(2600, 5200 - tier * 260),
    coinReward: Math.round(80 + tier * 55),
    xpReward: Math.round(120 + tier * 70)
  };
}

const RAW_BOSSES = [
  {
    id: 'metal_crawler',
    name: 'Metal Crawler',
    level: 5,
    color: 0xff8a3d,
    accentColor: 0xffe08a,
    movementPattern: 'sweep',
    minionType: 'basic',
    specialMechanic: 'none'
  },
  {
    id: 'mercury_drone',
    name: 'Mercury Drone',
    level: 10,
    color: 0x37e0ff,
    accentColor: 0xbfe6ff,
    movementPattern: 'figure8',
    minionType: 'chaser',
    specialMechanic: 'none'
  },
  {
    id: 'solar_beast',
    name: 'Solar Beast',
    level: 15,
    color: 0xff5566,
    accentColor: 0xffb3ba,
    movementPattern: 'sweep',
    minionType: 'shooter',
    specialMechanic: 'enrage_below_half'
  },
  {
    id: 'heat_titan',
    name: 'Heat Titan',
    level: 20,
    color: 0xff4400,
    accentColor: 0xffaa55,
    movementPattern: 'stomp',
    minionType: 'tank',
    specialMechanic: 'none'
  },
  {
    id: 'crater_guardian',
    name: 'Crater Guardian',
    level: 25,
    color: 0x8a6d3b,
    accentColor: 0xd9c08a,
    movementPattern: 'figure8',
    minionType: 'elite',
    specialMechanic: 'weak_point_core'
  },
  {
    id: 'meteor_king',
    name: 'Meteor King',
    level: 30,
    color: 0x996633,
    accentColor: 0xffcc88,
    movementPattern: 'sweep',
    minionType: 'tank',
    specialMechanic: 'enrage_below_half'
  },
  {
    id: 'plasma_destroyer',
    name: 'Plasma Destroyer',
    level: 35,
    color: 0x9d4dff,
    accentColor: 0xd9b3ff,
    movementPattern: 'figure8',
    minionType: 'elite',
    specialMechanic: 'weak_point_core'
  },
  {
    id: 'energy_titan',
    name: 'Energy Titan',
    level: 40,
    color: 0x37e0ff,
    accentColor: 0xffffff,
    movementPattern: 'stomp',
    minionType: 'elite',
    specialMechanic: 'enrage_below_half'
  },
  {
    id: 'core_guardian',
    name: 'Core Guardian',
    level: 45,
    color: 0xff2255,
    accentColor: 0xffccd9,
    movementPattern: 'figure8',
    minionType: 'elite',
    specialMechanic: 'weak_point_core'
  },
  {
    id: 'mercury_overlord',
    name: 'Mercury Overlord',
    level: 50,
    color: 0xffcc33,
    accentColor: 0xffffff,
    movementPattern: 'sweep',
    minionType: 'elite',
    specialMechanic: 'final_boss',
    isFinal: true
  }
];

export const MERCURY_BOSSES = Object.fromEntries(
  RAW_BOSSES.map((raw) => {
    const stats = scaledStats(raw.level);
    return [
      raw.id,
      {
        ...raw,
        planet: 'mercury',
        hp: stats.hp,
        maxHP: stats.hp,
        contactDamage: stats.contactDamage,
        // Phases: simple two-phase model (100%-50%, 50%-0%) shared by every
        // boss. specialMechanic decides what actually changes at the
        // threshold (see entities/Boss.js).
        phases: [
          { id: 'phase_1', hpThreshold: 1, speedMultiplier: 1 },
          { id: 'phase_2', hpThreshold: 0.5, speedMultiplier: 1.35 }
        ],
        attacks: ['contact_damage', 'minion_spawn'],
        weakPoint: raw.specialMechanic === 'weak_point_core' ? { damageMultiplier: 2 } : null,
        minionSpawn: {
          type: raw.minionType,
          intervalMs: stats.minionIntervalMs,
          maxAlive: 3
        },
        rewards: { coins: stats.coinReward, xp: stats.xpReward }
      }
    ];
  })
);

export function getBossConfig(bossId) {
  return MERCURY_BOSSES[bossId];
}

export function getBossForLevel(levelNumber) {
  return Object.values(MERCURY_BOSSES).find((b) => b.level === levelNumber) ?? null;
}
