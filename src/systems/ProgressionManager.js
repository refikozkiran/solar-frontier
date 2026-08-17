import { GameState } from './GameState.js';
import { getPlanet } from '../data/planets.js';

/**
 * Pure read/derive layer over GameState.progression. The unlocked level is
 * NEVER stored — it's always computed from completedLevels, per spec
 * section 4 ("do not hardcode level2Unlocked = true").
 */
export const ProgressionManager = {
  getCompletedLevels(planetId) {
    return GameState.progression.completedLevels[planetId] ?? [];
  },

  isLevelCompleted(planetId, levelNumber) {
    return this.getCompletedLevels(planetId).includes(levelNumber);
  },

  /** Highest level the player may currently play (level 1 if nothing completed yet). */
  getUnlockedLevel(planetId) {
    const completed = this.getCompletedLevels(planetId);
    const totalLevels = getPlanet(planetId)?.totalLevels ?? 50;

    if (completed.length === 0) return 1;

    // Highest *contiguous* run starting at 1 — a save with gaps (shouldn't
    // happen via normal play, but defends against corrupted/edited saves)
    // never unlocks past the first gap.
    let unlocked = 1;
    while (completed.includes(unlocked) && unlocked < totalLevels) {
      unlocked += 1;
    }
    return Math.min(unlocked, totalLevels);
  },

  isLevelUnlocked(planetId, levelNumber) {
    return levelNumber <= this.getUnlockedLevel(planetId);
  },

  isLevelSelectable(planetId, levelNumber) {
    return this.isLevelUnlocked(planetId, levelNumber);
  },

  /** Marks a level completed (idempotent) and returns whether it was new. */
  markLevelCompleted(planetId, levelNumber) {
    if (!GameState.progression.completedLevels[planetId]) {
      GameState.progression.completedLevels[planetId] = [];
    }
    const list = GameState.progression.completedLevels[planetId];
    if (list.includes(levelNumber)) return false;
    list.push(levelNumber);
    list.sort((a, b) => a - b);
    return true;
  },

  isPlanetComplete(planetId) {
    const totalLevels = getPlanet(planetId)?.totalLevels ?? 50;
    return this.getCompletedLevels(planetId).length >= totalLevels;
  }
};
