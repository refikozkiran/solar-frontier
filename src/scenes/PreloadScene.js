import Phaser from 'phaser';
import { SCENE_KEYS, TEXTURE_KEYS } from '../config/constants.js';

/**
 * Generates every texture used by Phase 1 with Phaser Graphics, per spec
 * ("do not download random images from the internet"). Shapes are simple
 * silhouettes that already respect the target direction (clean shapes,
 * bright energy accents, dark space palette) so swapping in final art
 * later is a drop-in texture replacement, not an architecture change.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  preload() {
    this._generatePlayerShip();
    this._generateEnemyBasic();
    this._generateProjectileBasic();
    this._generateStar(TEXTURE_KEYS.STAR_SMALL, 3, 0xffffff, 0.7);
    this._generateStar(TEXTURE_KEYS.STAR_LARGE, 5, 0xbfe6ff, 1);
    this._generatePowerUpDouble();
    this._generateParticleSpark();
  }

  create() {
    // Phase 2: Preload -> Level Map (not straight into gameplay), per spec
    // section 1's Main Menu -> Map -> Select Level -> Gameplay flow. There
    // is no Main Menu scene yet, so the map is the current entry point.
    this.scene.start(SCENE_KEYS.MERCURY_MAP);
  }

  _generatePlayerShip() {
    const g = this.add.graphics();
    const w = 64;
    const h = 72;

    g.fillStyle(0x1c2b4a, 1);
    g.fillTriangle(w / 2, 0, 0, h, w, h);

    g.fillStyle(0x37e0ff, 1);
    g.fillTriangle(w / 2, 8, w * 0.28, h * 0.78, w * 0.72, h * 0.78);

    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(w / 2, h * 0.42, 5);

    g.generateTexture(TEXTURE_KEYS.PLAYER_SHIP, w, h);
    g.destroy();
  }

  _generateEnemyBasic() {
    const g = this.add.graphics();
    const size = 56;
    const r = size / 2;

    g.fillStyle(0x3a0f14, 1);
    g.fillCircle(r, r, r);

    g.fillStyle(0xff5566, 1);
    g.fillCircle(r, r, r * 0.72);

    g.fillStyle(0x2b0a0a, 1);
    g.fillCircle(r, r, r * 0.28);

    g.generateTexture(TEXTURE_KEYS.ENEMY_BASIC, size, size);
    g.destroy();
  }

  _generateProjectileBasic() {
    const g = this.add.graphics();
    const w = 10;
    const h = 26;

    g.fillStyle(0x9ff2ff, 1);
    g.fillRoundedRect(0, 0, w, h, w / 2);

    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(w * 0.3, h * 0.1, w * 0.4, h * 0.35, 2);

    g.generateTexture(TEXTURE_KEYS.PROJECTILE_BASIC, w, h);
    g.destroy();
  }

  _generateStar(key, size, color, alpha) {
    const g = this.add.graphics();
    g.fillStyle(color, alpha);
    g.fillCircle(size, size, size);
    g.generateTexture(key, size * 2, size * 2);
    g.destroy();
  }

  _generatePowerUpDouble() {
    const g = this.add.graphics();
    const size = 44;
    const r = size / 2;

    g.fillStyle(0x0a2b33, 1);
    g.fillCircle(r, r, r);
    g.lineStyle(3, 0x37e0ff, 1);
    g.strokeCircle(r, r, r - 2);

    g.fillStyle(0x37e0ff, 1);
    g.fillTriangle(r - 10, r + 6, r - 2, r - 8, r + 6, r + 6);
    g.fillTriangle(r, r + 6, r + 8, r - 8, r + 16, r + 6);

    g.generateTexture(TEXTURE_KEYS.POWERUP_DOUBLE, size, size);
    g.destroy();
  }

  _generateParticleSpark() {
    const g = this.add.graphics();
    const size = 8;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size, size, size);
    g.generateTexture(TEXTURE_KEYS.PARTICLE_SPARK, size * 2, size * 2);
    g.destroy();
  }
}
