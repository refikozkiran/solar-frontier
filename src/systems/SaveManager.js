import { GameState } from './GameState.js';
import { STORAGE_KEY } from '../config/constants.js';
import { createDefaultStoneState } from '../data/stones.js';

/**
 * Thin persistence interface over localStorage. Forward-compatible shape:
 * completedLevels/stones are per-planet objects so Venus..Neptune slot in
 * without a save-format change. A future backend-backed save can implement
 * the same saveGame/loadGame/resetSave contract without changing any caller.
 */
export const SaveManager = {
  saveGame() {
    const payload = {
      version: 2,
      savedAt: Date.now(),
      player: {
        level: GameState.player.level,
        xp: GameState.player.xp,
        xpToNextLevel: GameState.player.xpToNextLevel,
        coins: GameState.player.coins,
        upgrades: GameState.player.upgrades,
        shipId: GameState.player.shipId
      },
      progression: {
        currentPlanet: GameState.progression.currentPlanet,
        currentLevel: GameState.progression.currentLevel,
        completedLevels: GameState.progression.completedLevels
      },
      inventory: {
        stones: GameState.inventory.stones
      },
      stones: GameState.stones
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.warn('[SaveManager] Failed to save game:', err);
      return false;
    }
  },

  loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      Object.assign(GameState.player, {
        level: data.player?.level ?? GameState.player.level,
        xp: data.player?.xp ?? GameState.player.xp,
        xpToNextLevel: data.player?.xpToNextLevel ?? GameState.player.xpToNextLevel,
        coins: data.player?.coins ?? GameState.player.coins,
        upgrades: data.player?.upgrades ?? GameState.player.upgrades,
        shipId: data.player?.shipId ?? GameState.player.shipId
      });

      Object.assign(GameState.progression, {
        currentPlanet: data.progression?.currentPlanet ?? GameState.progression.currentPlanet,
        currentLevel: data.progression?.currentLevel ?? GameState.progression.currentLevel,
        completedLevels: this._normalizeCompletedLevels(data.progression?.completedLevels)
      });

      Object.assign(GameState.inventory, {
        stones: data.inventory?.stones ?? GameState.inventory.stones
      });

      Object.assign(GameState.stones, {
        ...createDefaultStoneState(),
        ...(data.stones ?? {})
      });

      return true;
    } catch (err) {
      console.warn('[SaveManager] Failed to load game:', err);
      return false;
    }
  },

  /**
   * Defends against a v1 save (completedLevels was a flat ['mercury-1']
   * array) or a hand-edited/corrupted payload — always returns the Phase 2
   * per-planet-array shape.
   */
  _normalizeCompletedLevels(raw) {
    if (!raw) return { mercury: [] };

    if (Array.isArray(raw)) {
      // v1 shape: ['mercury-1', 'mercury-2'] -> { mercury: [1, 2] }
      const byPlanet = {};
      for (const key of raw) {
        const [planetId, levelStr] = String(key).split('-');
        const levelNumber = Number(levelStr);
        if (!planetId || Number.isNaN(levelNumber)) continue;
        byPlanet[planetId] = byPlanet[planetId] ?? [];
        byPlanet[planetId].push(levelNumber);
      }
      return { mercury: [], ...byPlanet };
    }

    // Already object-shaped — just make sure every value is a numeric array.
    const normalized = {};
    for (const [planetId, levels] of Object.entries(raw)) {
      normalized[planetId] = Array.isArray(levels) ? levels.filter((n) => Number.isFinite(n)) : [];
    }
    return { mercury: [], ...normalized };
  },

  resetSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn('[SaveManager] Failed to reset save:', err);
      return false;
    }
  },

  hasSave() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }
};
