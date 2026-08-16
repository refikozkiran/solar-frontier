import { Projectile } from '../entities/Projectile.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { getWeaponConfig } from '../data/weapons.js';
import { rollDamage } from '../utils/MathUtils.js';

/**
 * Base Weapon class. A weapon knows how to fire itself but nothing about
 * scenes/pools directly — WeaponManager supplies those via the constructor
 * so weapons stay unit-testable and swappable.
 *
 *   Weapon
 *    ├── fire()
 *    ├── createProjectile()
 *    ├── applyDamage()
 *    └── upgrade()
 */
export class Weapon {
  constructor(weaponId, projectilePool) {
    this.config = getWeaponConfig(weaponId);
    this.projectilePool = projectilePool;
    this.level = 1;
  }

  /**
   * Fires the weapon from an origin point. Returns the list of created
   * Projectiles (usually one, more for spread patterns).
   * @param {number} originX
   * @param {number} originY
   * @param {{damageMultiplier:number, projectileSpeedMultiplier:number}} playerMods
   */
  fire(originX, originY, playerMods) {
    return [this.createProjectile(originX, originY, { x: 0, y: -1 }, playerMods)];
  }

  createProjectile(originX, originY, direction, playerMods) {
    const projectile = this.projectilePool.acquire(originX, originY, {
      damage: this.config.damage * playerMods.damageMultiplier,
      speed: this.config.projectileSpeed * playerMods.projectileSpeedMultiplier,
      direction,
      lifetimeMs: 2200,
      projectileType: this.config.projectileType
    });
    return projectile;
  }

  /** Resolves final damage dealt (rolls crit) — called by GameScene on projectile/enemy overlap. */
  applyDamage(baseDamage, criticalChance, criticalMultiplier) {
    return rollDamage(baseDamage, criticalChance, criticalMultiplier);
  }

  upgrade() {
    // Reserved for future phases (per-weapon upgrade trees). Intentionally
    // minimal for now: bumps level, which future damage/fireRate formulas
    // can read.
    this.level += 1;
  }

  get fireRateMs() {
    return this.config.fireRateMs;
  }
}

/** Only behavior implemented in Phase 1. Fires one projectile straight up. */
export class BasicBlaster extends Weapon {
  constructor(projectilePool) {
    super('basic_blaster', projectilePool);
  }
}

/**
 * Drives auto-fire on a timer and owns the projectile object pool. The ship
 * NEVER has a manual fire input — GameScene just calls update() every
 * frame and this decides when to shoot based on elapsed time.
 */
export class WeaponManager {
  constructor(scene) {
    this.scene = scene;
    this.projectilePool = new ObjectPool(
      scene,
      () => new Projectile(scene, -100, -100),
      (proj, x, y, params) => proj.fireFrom(x, y, params),
      120
    );

    this.currentWeapon = new BasicBlaster(this.projectilePool);
    this._cooldownMs = 0;

    // Extra simultaneous projectile streams (e.g. Double Shot power-up).
    // Kept separate from the weapon itself so a power-up doesn't need to
    // mutate weapon state directly.
    this.extraStreamOffsets = []; // array of {x} offsets, in px, from ship center
  }

  /**
   * @param {number} deltaMs
   * @param {PlayerShip} playerShip
   */
  update(deltaMs, playerShip) {
    this._cooldownMs -= deltaMs;
    if (this._cooldownMs > 0) return;

    this._cooldownMs = this.currentWeapon.fireRateMs / Math.max(0.01, playerShip.fireRate);

    const playerMods = {
      damageMultiplier: playerShip.damage,
      projectileSpeedMultiplier: playerShip.projectileSpeed
    };

    this.currentWeapon.fire(playerShip.x, playerShip.y - 30, playerMods);

    for (const offset of this.extraStreamOffsets) {
      this.currentWeapon.fire(playerShip.x + offset.x, playerShip.y - 30, playerMods);
    }
  }

  /** Called by PowerUpManager when Double Shot activates/expires. */
  addExtraStream(offsetX) {
    this.extraStreamOffsets.push({ x: offsetX });
  }

  clearExtraStreams() {
    this.extraStreamOffsets = [];
  }

  getActiveProjectiles() {
    return this.projectilePool.pool.filter((p) => p.active);
  }

  releaseProjectile(projectile) {
    this.projectilePool.release(projectile);
  }
}
