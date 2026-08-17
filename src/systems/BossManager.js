import { Boss } from '../entities/Boss.js';
import { getBossConfig } from '../data/mercuryBosses.js';

/**
 * Owns the single active Boss instance for a boss-level GameScene. Keeps
 * boss-specific wiring (minion spawning through the scene's enemy pool)
 * out of GameScene itself, per spec section 9 ("GameScene should not
 * contain boss-specific logic").
 */
export class BossManager {
  /**
   * @param {Phaser.Scene} scene
   * @param {(minionType:string, x:number, y:number) => object} spawnMinionFn
   */
  constructor(scene, spawnMinionFn) {
    this.scene = scene;
    this.spawnMinionFn = spawnMinionFn;
    this.activeBoss = null;
  }

  spawnBoss(bossId) {
    const config = getBossConfig(bossId);
    if (!config) {
      console.error(`[BossManager] Unknown bossId "${bossId}"`);
      return null;
    }

    this.activeBoss = new Boss(this.scene, 0, 0);
    this.activeBoss.spawnWith(config, this.spawnMinionFn);
    return this.activeBoss;
  }

  update(deltaMs) {
    this.activeBoss?.updateBoss(deltaMs);
  }

  isBossActive() {
    return !!this.activeBoss?.active;
  }

  /** Applies damage from a projectile hit; returns true if it killed the boss. */
  damageBoss(amount) {
    if (!this.activeBoss) return false;
    return this.activeBoss.takeDamage(amount);
  }

  clear() {
    this.activeBoss?.destroy();
    this.activeBoss = null;
  }
}
