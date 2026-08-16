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
  PLACEHOLDER_MAP: 'PlaceholderMapScene'
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
  PROJECTILES: 6,
  PLAYER: 7,
  EFFECTS: 8,
  HUD: 20
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
  POWERUP_EXPIRED: 'powerup-expired'
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

export const STORAGE_KEY = 'solar-frontier-save-v1';
