import Phaser from 'phaser';
import { TEXTURE_KEYS, DEPTH, LAYOUT } from '../config/constants.js';

/**
 * A single pooled projectile. Supports any straight-line direction so the
 * same class serves Double/Triple Shot later (different angles), not just
 * Basic Blaster. Laser/Missile/Plasma/Nova will likely need their own
 * entity or a `projectileType`-driven update() branch — deliberately not
 * built yet per spec.
 */
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TEXTURE_KEYS.PROJECTILE_BASIC);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.PROJECTILES);

    this.damage = 0;
    this.speed = 0;
    this.direction = { x: 0, y: -1 };
    this.lifetimeMs = 2000;
    this.projectileType = 'basic';
    this._ageMs = 0;
  }

  /**
   * Re-initializes a pooled instance. Called by ObjectPool.acquire().
   * @param {number} x
   * @param {number} y
   * @param {{damage:number, speed:number, direction:{x:number,y:number}, lifetimeMs:number, projectileType:string}} params
   */
  fireFrom(x, y, params) {
    this.setPosition(x, y);
    this.damage = params.damage;
    this.speed = params.speed;
    this.direction = params.direction;
    this.lifetimeMs = params.lifetimeMs ?? 2000;
    this.projectileType = params.projectileType ?? 'basic';
    this._ageMs = 0;

    this.setRotation(Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2);

    if (this.body) {
      this.body.enable = true;
      this.body.setVelocity(this.direction.x * this.speed, this.direction.y * this.speed);
    }
  }

  /** @param {number} deltaMs */
  updateProjectile(deltaMs) {
    this._ageMs += deltaMs;

    const offScreen =
      this.y < LAYOUT.SPAWN_Y - 100 ||
      this.y > LAYOUT.DESPAWN_Y ||
      this.x < -100 ||
      this.x > this.scene.scale.width + 100;

    if (this._ageMs >= this.lifetimeMs || offScreen) {
      return true; // signal: ready to be released back to pool
    }
    return false;
  }
}
