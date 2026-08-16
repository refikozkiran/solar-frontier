import { GameState } from './GameState.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Owns all coin mutations. Enemies/UI never touch GameState.player.coins
 * directly — they call through here so every change is observable via
 * EVENTS.COINS_CHANGED (HUD listens to this).
 */
export const CurrencyManager = {
  earned: 0, // coins earned this run, used for the Level Complete / Game Over summary

  addCoins(amount) {
    if (amount <= 0) return;
    GameState.player.coins += amount;
    this.earned += amount;
    EventBus.emit(EVENTS.COINS_CHANGED, GameState.player.coins);
  },

  spendCoins(amount) {
    if (amount > GameState.player.coins) return false;
    GameState.player.coins -= amount;
    EventBus.emit(EVENTS.COINS_CHANGED, GameState.player.coins);
    return true;
  },

  resetRunTotals() {
    this.earned = 0;
  }
};
