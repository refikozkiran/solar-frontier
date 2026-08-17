// Central place for values that are referenced by string elsewhere in the
// codebase. Nothing here should ever be balance/gameplay data — see src/data
// for that. This file is purely structural/architectural constants.

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  LEVEL_COMPLETE: 'LevelCompleteScene',
  MERCURY_MAP: 'MercuryLevelMapScene'
};

// Vertical regions of the 720x1280 logical canvas. Kept in one place so the
// HUD, the drag-bounds, and enemy spawn/despawn logic all agree.
export const LAYOUT = {
  HUD_HEIGHT: 140, // top HUD strip, player ship may not enter this band
  PLAYABLE_TOP: 150,
  PLAYABLE_BOTTOM: 1220,
  PLAYABLE_LEFT: 40,
  PLAYABLE_RIGHT: GAME_WIDTH - 40,
  SPAWN_Y: -40,
  DESPAWN_Y: GAME_HEIGHT + 80
};

export const DEPTH = {
  BACKGROUND: 0,
  STARS: 1,
  POWERUPS: 4,
  ENEMIES: 5,
  BOSS: 5,
  PROJECTILES: 6,
  PLAYER: 7,
  EFFECTS: 8,
  HUD: 20,
  MAP_PATH: 1,
  MAP_NODES: 5,
  MAP_HUD: 20
};

// Event names used on the global EventBus (see utils/EventBus.js). Using
// constants instead of raw strings prevents typo-driven bugs and keeps
// systems decoupled from each other and from the Scene.
export const EVENTS = {
  PLAYER_DAMAGED: 'player-damaged',
  PLAYER_DIED: 'player-died',
  PLAYER_STATS_CHANGED: 'player-stats-changed',

  ENEMY_KILLED: 'enemy-killed',
  ENEMY_SPAWNED: 'enemy-spawned',

  WAVE_STARTED: 'wave-started',
  WAVE_COMPLETED: 'wave-completed',
  LEVEL_STARTED: 'level-started',
  LEVEL_COMPLETED: 'level-completed',
  LEVEL_FAILED: 'level-failed',

  COINS_CHANGED: 'coins-changed',
  XP_CHANGED: 'xp-changed',
  PLAYER_LEVEL_UP: 'player-level-up',

  POWERUP_COLLECTED: 'powerup-collected',
  POWERUP_EXPIRED: 'powerup-expired',

  BOSS_WAVE_STARTED: 'boss-wave-started',
  BOSS_SPAWNED: 'boss-spawned',
  BOSS_HP_CHANGED: 'boss-hp-changed',
  BOSS_PHASE_CHANGED: 'boss-phase-changed',
  BOSS_DEFEATED: 'boss-defeated'
};

export const TEXTURE_KEYS = {
  PLAYER_SHIP: 'tex-player-ship',
  ENEMY_BASIC: 'tex-enemy-basic',
  PROJECTILE_BASIC: 'tex-projectile-basic',
  STAR_SMALL: 'tex-star-small',
  STAR_LARGE: 'tex-star-large',
  POWERUP_DOUBLE: 'tex-powerup-double',
  PARTICLE_SPARK: 'tex-particle-spark'
};

// Bumped to v2 for the Phase 2 save shape (per-planet completedLevels map +
// stones). SaveManager.loadGame() merges defensively either way, but a new
// key avoids ever trying to interpret a v1 payload as v2 progression data.
export const STORAGE_KEY = 'solar-frontier-save-v2';
