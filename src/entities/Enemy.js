import Phaser from 'phaser';
import { DEPTH } from '../config/constants.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Shared base for all enemy types. Subclasses (BasicEnemy, and future
 * ChaserEnemy/ShooterEnemy/TankEnemy/EliteEnemy) only need to override
 * updateMovement() to get a different movement behavior — everything else
 * (damage intake, death, rewards) is inherited.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.ENEMIES);

    this.hp = 1;
    this.maxHP = 1;
    this.speed = 0;
    this.damage = 0;
    this.score = 0;
    this.coinReward = 0;
    this.xpReward = 0;
    this.enemyType = 'base';
  }

  /**
   * Re-initializes a pooled instance with config values. Subclasses call
   * this via super.spawnAt() and then set up their own movement state.
   */
  spawnAt(x, y, config) {
    this.setPosition(x, y);
    this.hp = config.hp;
    this.maxHP = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.score = config.score;
    this.coinReward = config.coinReward;
    this.xpReward = config.xpReward;
    this.enemyType = config.id;
    this.setAlpha(1);
    this.setScale(config.scale ?? 1);

    // Remembered so the post-hit white flash (below) restores the right
    // color instead of clearing back to the texture's default red.
    this._baseTint = config.color ?? null;
    if (this._baseTint) {
      this.setTint(this._baseTint);
    } else {
      this.clearTint();
    }

    if (this.body) {
      this.body.enable = true;
      this.body.setVelocity(0, 0);
    }
  }

  /**
   * Override in subclasses to implement movement patterns.
   * @param {number} deltaMs
   */
  updateMovement(deltaMs) {
    // BasicEnemy overrides this; base class is intentionally a no-op.
  }

  /** @returns {boolean} true if this hit killed the enemy */
  takeDamage(amount) {
    this.hp -= amount;
    this._playHitFlash();

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    EventBus.emit(EVENTS.ENEMY_KILLED, {
      x: this.x,
      y: this.y,
      score: this.score,
      coinReward: this.coinReward,
      xpReward: this.xpReward,
      enemyType: this.enemyType
    });
  }

  _playHitFlash() {
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (!this.active) return;
      if (this._baseTint) {
        this.setTint(this._baseTint);
      } else {
        this.clearTint();
      }
    });
  }
}
