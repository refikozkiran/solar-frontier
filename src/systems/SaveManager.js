import { GameState } from './GameState.js';
import { STORAGE_KEY } from '../config/constants.js';

/**
 * Thin persistence interface over localStorage. Phase 1 only persists
 * progression-relevant fields (not live HP, which is per-run). A future
 * backend-backed save can implement the same saveGame/loadGame/resetSave
 * contract without changing any caller.
 */
export const SaveManager = {
  saveGame() {
    const payload = {
      version: 1,
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
      }
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
        completedLevels: data.progression?.completedLevels ?? GameState.progression.completedLevels
      });

      Object.assign(GameState.inventory, {
        stones: data.inventory?.stones ?? GameState.inventory.stones
      });

      return true;
    } catch (err) {
      console.warn('[SaveManager] Failed to load game:', err);
      return false;
    }
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
