import Phaser from 'phaser';
import { SCENE_KEYS, TEXTURE_KEYS, DEPTH, LAYOUT, GAME_WIDTH, GAME_HEIGHT, EVENTS } from '../config/constants.js';
import { PlayerShip } from '../entities/PlayerShip.js';
import { BasicEnemy } from '../entities/BasicEnemy.js';
import { getEnemyConfig } from '../data/enemies.js';
import { WeaponManager } from '../systems/WeaponManager.js';
import { WaveManager } from '../systems/WaveManager.js';
import { LevelManager } from '../systems/LevelManager.js';
import { PowerUpManager } from '../systems/PowerUpManager.js';
import { CurrencyManager } from '../systems/CurrencyManager.js';
import { XPManager } from '../systems/XPManager.js';
import { GameState } from '../systems/GameState.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { EventBus } from '../utils/EventBus.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME);
  }

  create() {
    // Fresh run — HP resets to max even if coins/xp/level persist across runs.
    GameState.player.hp = GameState.player.maxHP;
    CurrencyManager.resetRunTotals();
    XPManager.resetRunTotals();

    this._createBackground();
    this._createPlayer();
    this._createEnemyPool();
    this.weaponManager = new WeaponManager(this);
    this._createWaveAndLevelManagers();
    this.powerUpManager = new PowerUpManager(this, this.weaponManager, this.player);
    this._createCollisions();
    this._createInput();

    this.hud = new HUD(this);
    this._bindGameEvents();

    // Phaser doesn't auto-call a `shutdown()` method — it must be bound to
    // the scene's shutdown event explicitly, or listeners/timers leak
    // across scene restarts (e.g. RETRY).
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._teardown, this);

    this.levelManager.startLevel();
  }

  // ---------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------

  _createBackground() {
    this.cameras.main.setBackgroundColor(0x05060f);

    // Two star layers moving at different speeds for cheap parallax.
    this.starGroupFar = this.add.group();
    this.starGroupNear = this.add.group();

    for (let i = 0; i < 60; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        TEXTURE_KEYS.STAR_SMALL
      );
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
      star.setDepth(DEPTH.STARS);
      this.starGroupFar.add(star);
    }

    for (let i = 0; i < 25; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        TEXTURE_KEYS.STAR_LARGE
      );
      star.setAlpha(Phaser.Math.FloatBetween(0.5, 1));
      star.setDepth(DEPTH.STARS);
      this.starGroupNear.add(star);
    }
  }

  _createPlayer() {
    this.player = new PlayerShip(this, GAME_WIDTH / 2, LAYOUT.PLAYABLE_BOTTOM - 80, GameState.player.shipId);
  }

  _createEnemyPool() {
    this.enemyPool = new ObjectPool(
      this,
      () => new BasicEnemy(this, -100, -100),
      (enemy, x, y, config) => enemy.spawnAt(x, y, config),
      150
    );
  }

  _createWaveAndLevelManagers() {
    this.waveManager = new WaveManager({
      spawnEnemyFn: (enemyType, x, y) => {
        const config = getEnemyConfig(enemyType);
        return this.enemyPool.acquire(x, y, config);
      }
    });
    this.levelManager = new LevelManager(this.waveManager);
  }

  _createCollisions() {
    // Projectile <-> Enemy
    this.physics.add.overlap(
      this.weaponManager.projectilePool.pool,
      this.enemyPool.pool,
      this._onProjectileHitEnemy,
      undefined,
      this
    );

    // Player <-> Enemy
    this.physics.add.overlap(this.player, this.enemyPool.pool, this._onPlayerHitEnemy, undefined, this);

    // PowerUp <-> Player
    this.physics.add.overlap(this.player, this.powerUpManager.group, this._onPlayerHitPowerUp, undefined, this);
  }

  _createInput() {
    this._isDragging = false;

    this.input.on('pointerdown', (pointer) => {
      // Only start a drag if the touch/click begins in the lower portion of
      // the screen, per spec ("drag from anywhere on the lower portion").
      if (pointer.y > GAME_HEIGHT * 0.35) {
        this._isDragging = true;
        this.player.setTargetPosition(pointer.x, pointer.y);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this._isDragging && pointer.isDown) {
        this.player.setTargetPosition(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', () => {
      this._isDragging = false;
    });

    this.input.on('pointerupoutside', () => {
      this._isDragging = false;
    });
  }

  _bindGameEvents() {
    this._onEnemyKilled = ({ x, y, coinReward, xpReward }) => {
      CurrencyManager.addCoins(coinReward);
      XPManager.addXP(xpReward);
      this.powerUpManager.maybeDropAt(x, y);
      this.waveManager.notifyEnemyResolved();
    };

    this._onWaveCompleted = () => {
      this.levelManager.advanceWave();
    };

    this._onLevelCompleted = (payload) => {
      this.scene.start(SCENE_KEYS.LEVEL_COMPLETE, {
        coinsEarned: CurrencyManager.earned,
        xpEarned: XPManager.earned,
        elapsedMs: payload.elapsedMs
      });
    };

    this._onPlayerDied = () => {
      this.levelManager.failLevel();
      this.scene.start(SCENE_KEYS.GAME_OVER, {
        coinsEarned: CurrencyManager.earned,
        xpEarned: XPManager.earned
      });
    };

    EventBus.on(EVENTS.ENEMY_KILLED, this._onEnemyKilled);
    EventBus.on(EVENTS.WAVE_COMPLETED, this._onWaveCompleted);
    EventBus.on(EVENTS.LEVEL_COMPLETED, this._onLevelCompleted);
    EventBus.on(EVENTS.PLAYER_DIED, this._onPlayerDied);
  }

  // ---------------------------------------------------------------------
  // Collision handlers
  // ---------------------------------------------------------------------

  _onProjectileHitEnemy(projectile, enemy) {
    if (!projectile.active || !enemy.active) return;

    const { amount } = this.weaponManager.currentWeapon.applyDamage(
      projectile.damage,
      this.player.criticalChance,
      this.player.criticalMultiplier
    );

    this.weaponManager.releaseProjectile(projectile);
    const killed = enemy.takeDamage(amount);

    if (killed) {
      this._spawnDeathEffect(enemy.x, enemy.y);
      this.enemyPool.release(enemy);
    }
  }

  _onPlayerHitEnemy(player, enemy) {
    if (!enemy.active) return;

    // takeDamage() itself no-ops during the post-hit invulnerability
    // window, which is what stops a single collision frame from draining
    // HP multiple times. The colliding enemy is destroyed either way so a
    // swarm can't get "stuck" occupying the player's position.
    player.takeDamage(enemy.damage);
    this._spawnDeathEffect(enemy.x, enemy.y);
    this.enemyPool.release(enemy);
    this.waveManager.notifyEnemyResolved();
  }

  _onPlayerHitPowerUp(player, pickup) {
    this.powerUpManager.collect(pickup);
  }

  _spawnDeathEffect(x, y) {
    const particles = this.add.particles(x, y, TEXTURE_KEYS.PARTICLE_SPARK, {
      speed: { min: 60, max: 180 },
      lifespan: 300,
      scale: { start: 1, end: 0 },
      quantity: 8,
      blendMode: 'ADD'
    });
    particles.setDepth(DEPTH.EFFECTS);
    this.time.delayedCall(320, () => particles.destroy());
  }

  // ---------------------------------------------------------------------
  // Update loop
  // ---------------------------------------------------------------------

  update(time, delta) {
    this.player.updateMovement(delta);
    this.weaponManager.update(delta, this.player);
    this.waveManager.update(delta);

    this._updateProjectiles(delta);
    this._updateEnemies(delta);
    this._updateStarfield(delta);
    this.powerUpManager.cleanupOffscreen();
  }

  _updateProjectiles(delta) {
    this.weaponManager.getActiveProjectiles().forEach((projectile) => {
      const shouldRelease = projectile.updateProjectile(delta);
      if (shouldRelease) {
        this.weaponManager.releaseProjectile(projectile);
      }
    });
  }

  _updateEnemies(delta) {
    this.enemyPool.pool
      .filter((enemy) => enemy.active)
      .forEach((enemy) => {
        const leftPlayArea = enemy.updateMovement(delta);
        if (leftPlayArea) {
          this.enemyPool.release(enemy);
          this.waveManager.notifyEnemyResolved();
        }
      });
  }

  _updateStarfield(delta) {
    const farSpeed = (60 * delta) / 1000;
    const nearSpeed = (140 * delta) / 1000;

    this.starGroupFar.getChildren().forEach((star) => {
      star.y += farSpeed;
      if (star.y > GAME_HEIGHT) star.y = 0;
    });

    this.starGroupNear.getChildren().forEach((star) => {
      star.y += nearSpeed;
      if (star.y > GAME_HEIGHT) star.y = 0;
    });
  }

  _teardown() {
    EventBus.off(EVENTS.ENEMY_KILLED, this._onEnemyKilled);
    EventBus.off(EVENTS.WAVE_COMPLETED, this._onWaveCompleted);
    EventBus.off(EVENTS.LEVEL_COMPLETED, this._onLevelCompleted);
    EventBus.off(EVENTS.PLAYER_DIED, this._onPlayerDied);
    this.hud?.destroy();
    this.powerUpManager?.destroy();
  }
}
