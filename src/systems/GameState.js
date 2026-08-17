import { getShipConfig, DEFAULT_SHIP_ID } from '../data/player.js';
import { createDefaultStoneState } from '../data/stones.js';

/**
 * Single centralized game state. Every system (CurrencyManager, XPManager,
 * SaveManager, PlayerShip) reads/writes through this object rather than
 * keeping its own copy or stashing data on a Sprite/Container. This is what
 * makes save/load and HUD sync straightforward.
 */
function createDefaultState() {
  const shipConfig = getShipConfig(DEFAULT_SHIP_ID);

  return {
    player: {
      shipId: DEFAULT_SHIP_ID,
      hp: shipConfig.maxHP,
      maxHP: shipConfig.maxHP,
      coins: 0,
      xp: 0,
      xpToNextLevel: 100,
      level: 1,
      upgrades: {} // e.g. { damage: 2, fireRate: 1 } — reserved for future phases
    },
    progression: {
      currentPlanet: 'mercury',
      currentLevel: 1,
      // Per-planet arrays of completed level numbers, e.g. { mercury: [1,2,3] }.
      // Unlocked level is always derived from this — never stored directly.
      completedLevels: { mercury: [] }
    },
    inventory: {
      stones: [] // collected cosmic stone ids, kept for anything reading a flat list
    },
    // Per-planet boolean, e.g. { mercury: false, venus: false, ... } —
    // mirrors data/stones.js so a fresh save always has all 8 keys.
    stones: createDefaultStoneState()
  };
}

export const GameState = createDefaultState();

export function resetGameState() {
  Object.assign(GameState, createDefaultState());
}
