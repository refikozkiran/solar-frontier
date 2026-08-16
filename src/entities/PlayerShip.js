import Phaser from 'phaser';
import { TEXTURE_KEYS, DEPTH, LAYOUT } from '../config/constants.js';
import { getShipConfig } from '../data/player.js';
import { clamp, lerp } from '../utils/MathUtils.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';
import { GameState } from '../systems/GameState.js';

/**
 * The player's ship. Movement is drag-follow with smoothing (never an
 * instant snap to the finger/cursor). Combat stats are read from
 * data/player.js + GameState.player so nothing here is a magic number.
 */
export class PlayerShip extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, shipId) {
    super(scene, x, y, TEXTURE_KEYS.PLAYER_SHIP);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.PLAYER);
    this.setCollideWorldBounds(false); // we clamp manually to the playable band, not full canvas

    const config = getShipConfig(shipId);
    this.config = config;

    // Combat-relevant stats. hp/maxHP mirror GameState so a Game Over
    // screen or HUD reading GameState.player stays accurate mid-run.
    this.maxHP = GameState.player.maxHP;
    this.hp = GameState.player.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.projectileSpeed = config.projectileSpeed;
    this.energy = config.energy;
    this.maxEnergy = config.maxEnergy;
    this.shield = config.shield;
    this.criticalChance = config.criticalChance;
    this.criticalMultiplier = config.criticalMultiplier;

    this.dragSmoothing = config.dragSmoothing;
    this.invulnerabilityDurationMs = config.invulnerabilityDurationMs;

    this._targetX = x;
    this._targetY = y;
    this._invulnerableUntil = 0;
    this._isDead = false;
  }

  /** Called by GameScene input handlers on pointerdown/pointermove while dragging. */
  setTargetPosition(x, y) {
    this._targetX = clamp(x, LAYOUT.PLAYABLE_LEFT, LAYOUT.PLAYABLE_RIGHT);
    this._targetY = clamp(y, LAYOUT.PLAYABLE_TOP, LAYOUT.PLAYABLE_BOTTOM);
  }

  /** @param {number} deltaMs */
  updateMovement(deltaMs) {
    // Smoothing factor scaled by delta so movement feels consistent
    // regardless of frame rate (important on lower-end mobile devices).
    const t = 1 - Math.pow(1 - this.dragSmoothing, deltaMs / 16.67);
    const newX = lerp(this.x, this._targetX, t);
    const newY = lerp(this.y, this._targetY, t);
    this.setPosition(newX, newY);
  }

  isInvulnerable() {
    return this.scene.time.now < this._invulnerableUntil;
  }

  /** @returns {boolean} true if this hit killed the player */
  takeDamage(amount) {
    if (this._isDead || this.isInvulnerable()) return false;

    this.hp = Math.max(0, this.hp - amount);
    GameState.player.hp = this.hp;
    this._invulnerableUntil = this.scene.time.now + this.invulnerabilityDurationMs;

    this._playHitFlash();
    EventBus.emit(EVENTS.PLAYER_DAMAGED, { hp: this.hp, maxHP: this.maxHP });

    if (this.hp <= 0) {
      this._isDead = true;
      EventBus.emit(EVENTS.PLAYER_DIED);
      return true;
    }
    return false;
  }

  _playHitFlash() {
    this.scene.tweens.killTweensOf(this);
    this.setTintFill(0xffffff);
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.clearTint();
        this.setAlpha(1);
      }
    });
  }
}
