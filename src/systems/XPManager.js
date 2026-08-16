import { GameState } from './GameState.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

// Simple linear-ish curve for Phase 1: each level requires 20% more XP than
// the last. Tunable in one place without touching leveling logic.
const XP_CURVE_GROWTH = 1.2;

export const XPManager = {
  earned: 0, // xp earned this run

  addXP(amount) {
    if (amount <= 0) return;
    GameState.player.xp += amount;
    this.earned += amount;
    EventBus.emit(EVENTS.XP_CHANGED, {
      xp: GameState.player.xp,
      xpToNextLevel: GameState.player.xpToNextLevel
    });

    this._checkLevelUp();
  },

  _checkLevelUp() {
    while (GameState.player.xp >= GameState.player.xpToNextLevel) {
      GameState.player.xp -= GameState.player.xpToNextLevel;
      GameState.player.level += 1;
      GameState.player.xpToNextLevel = Math.round(GameState.player.xpToNextLevel * XP_CURVE_GROWTH);

      EventBus.emit(EVENTS.PLAYER_LEVEL_UP, GameState.player.level);
      EventBus.emit(EVENTS.XP_CHANGED, {
        xp: GameState.player.xp,
        xpToNextLevel: GameState.player.xpToNextLevel
      });
    }
  },

  resetRunTotals() {
    this.earned = 0;
  }
};
