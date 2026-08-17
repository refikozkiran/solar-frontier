import Phaser from 'phaser';
import { DEPTH, LAYOUT, GAME_WIDTH } from '../config/constants.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Generic boss entity. Every Mercury boss (Metal Crawler .. Mercury
 * Overlord) is the SAME class driven by a different config object from
 * data/mercuryBosses.js — no boss-specific subclasses or GameScene
 * branching, per spec section 9.
 *
 *   Boss
 *    ├── bossId / hp / maxHP
 *    ├── phases            (hp-threshold driven, e.g. enrage at 50%)
 *    ├── movementPattern    (string -> _updateMovement branch)
 *    ├── weakPoint          (optional damage multiplier)
 *    ├── minionSpawn        (periodic spawns via the callback given at spawn)
 *    └── rewards            (coins/xp on death)
 *
 * Texture is generated procedurally (placeholder art per spec section 10)
 * the first time a given bossId is spawned, then cached on scene.textures.
 */
export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const textureKey = 'tex-boss-placeholder';
    if (!scene.textures.exists(textureKey)) {
      Boss._generatePlaceholderTexture(scene, textureKey);
    }
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.BOSS);
  }

  /**
   * @param {object} config from data/mercuryBosses.js
   * @param {(minionType:string, x:number, y:number) => void} spawnMinionFn
   */
  spawnWith(config, spawnMinionFn) {
    this.config = config;
    this.bossId = config.id;
    this.hp = config.hp;
    this.maxHP = config.maxHP;
    this.contactDamage = config.contactDamage;
    this.movementPattern = config.movementPattern;
    this.weakPoint = config.weakPoint;
    this.rewards = config.rewards;
    this._spawnMinionFn = spawnMinionFn;

    this._phaseIndex = 0;
    this._isDying = false;
    this._movementT = 0;
    this._minionTimerMs = config.minionSpawn?.intervalMs ?? Infinity;

    this.setPosition(GAME_WIDTH / 2, LAYOUT.PLAYABLE_TOP + 40);
    this.setTint(config.color);
    this.setScale(1);
    this.setAlpha(1);

    if (this.body) {
      this.body.enable = true;
      this.body.setVelocity(0, 0);
    }

    EventBus.emit(EVENTS.BOSS_HP_CHANGED, { hp: this.hp, maxHP: this.maxHP, bossName: config.name });
  }

  /** @param {number} deltaMs */
  updateBoss(deltaMs) {
    if (this._isDying) return;

    this._movementT += deltaMs;
    this._updateMovement(deltaMs);
    this._updateMinionSpawn(deltaMs);
  }

  _updateMovement(deltaMs) {
    const speedMult = this.config.phases[this._phaseIndex]?.speedMultiplier ?? 1;
    const left = LAYOUT.PLAYABLE_LEFT + 60;
    const right = LAYOUT.PLAYABLE_RIGHT - 60;
    const centerX = (left + right) / 2;
    const rangeX = (right - left) / 2;
    const t = (this._movementT / 1000) * speedMult;

    switch (this.movementPattern) {
      case 'figure8':
        this.x = centerX + Math.sin(t * 1.1) * rangeX;
        this.y = LAYOUT.PLAYABLE_TOP + 90 + Math.sin(t * 2.2) * 40;
        break;
      case 'stomp':
        this.x = centerX + Math.sin(t * 0.6) * rangeX * 0.6;
        this.y = LAYOUT.PLAYABLE_TOP + 90 + Math.abs(Math.sin(t * 1.6)) * 30;
        break;
      case 'sweep':
      default:
        this.x = centerX + Math.sin(t * 0.8) * rangeX;
        this.y = LAYOUT.PLAYABLE_TOP + 90;
        break;
    }
  }

  _updateMinionSpawn(deltaMs) {
    const cfg = this.config.minionSpawn;
    if (!cfg || !this._spawnMinionFn) return;

    this._minionTimerMs -= deltaMs;
    if (this._minionTimerMs <= 0) {
      this._minionTimerMs = cfg.intervalMs;
      const spawnX = Phaser.Math.Between(LAYOUT.PLAYABLE_LEFT + 40, LAYOUT.PLAYABLE_RIGHT - 40);
      this._spawnMinionFn(cfg.type, spawnX, this.y + 40);
    }
  }

  /** @returns {boolean} true if this hit killed the boss */
  takeDamage(amount) {
    if (this._isDying) return false;

    this.hp = Math.max(0, this.hp - amount);
    this._playHitFlash();

    EventBus.emit(EVENTS.BOSS_HP_CHANGED, { hp: this.hp, maxHP: this.maxHP, bossName: this.config.name });
    this._checkPhaseTransition();

    if (this.hp <= 0) {
      this._die();
      return true;
    }
    return false;
  }

  _checkPhaseTransition() {
    const ratio = this.hp / this.maxHP;
    const nextPhaseIndex = this.config.phases.findIndex((p) => ratio <= p.hpThreshold) ;
    const targetIndex = nextPhaseIndex === -1 ? this.config.phases.length - 1 : nextPhaseIndex;
    if (targetIndex > this._phaseIndex) {
      this._phaseIndex = targetIndex;
      this.setTint(this.config.accentColor ?? this.config.color);
      EventBus.emit(EVENTS.BOSS_PHASE_CHANGED, { phaseIndex: this._phaseIndex, bossName: this.config.name });
    }
  }

  _die() {
    this._isDying = true;
    if (this.body) {
      this.body.setVelocity(0, 0);
      this.body.enable = false;
    }

    EventBus.emit(EVENTS.BOSS_DEFEATED, {
      bossId: this.bossId,
      bossName: this.config.name,
      rewards: this.rewards
    });
  }

  _playHitFlash() {
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active && !this._isDying) {
        this.setTint(this._phaseIndex > 0 ? this.config.accentColor ?? this.config.color : this.config.color);
      }
    });
  }

  static _generatePlaceholderTexture(scene, key) {
    // A single neutral silhouette, tinted per-boss at spawn time via
    // setTint() — keeps this a one-time texture generation regardless of
    // how many of the 10 bosses get spawned across a playthrough.
    const g = scene.add.graphics();
    const size = 140;
    const r = size / 2;

    g.fillStyle(0x1a0a0a, 1);
    g.fillCircle(r, r, r);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r, r, r * 0.74);
    g.fillStyle(0x1a0a0a, 1);
    g.fillCircle(r, r, r * 0.4);
    g.lineStyle(6, 0xffffff, 0.5);
    g.strokeCircle(r, r, r - 4);

    g.generateTexture(key, size, size);
    g.destroy();
  }
}
