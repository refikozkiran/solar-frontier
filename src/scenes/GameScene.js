import Phaser from 'phaser';
import { SCENE_KEYS, TEXTURE_KEYS, DEPTH, LAYOUT, GAME_WIDTH, GAME_HEIGHT, EVENTS } from '../config/constants.js';
import { PlayerShip } from '../entities/PlayerShip.js';
import { BasicEnemy } from '../entities/BasicEnemy.js';
import { getEnemyConfig } from '../data/enemies.js';
import { getBossConfig } from '../data/mercuryBosses.js';
import { WeaponManager } from '../systems/WeaponManager.js';
import { WaveManager } from '../systems/WaveManager.js';
import { LevelManager } from '../systems/LevelManager.js';
import { BossManager } from '../systems/BossManager.js';
import { PowerUpManager } from '../systems/PowerUpManager.js';
import { CurrencyManager } from '../systems/CurrencyManager.js';
import { XPManager } from '../systems/XPManager.js';
import { GameState } from '../systems/GameState.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { EventBus } from '../utils/EventBus.js';
import { HUD } from '../ui/HUD.js';
import { BossHealthBar } from '../ui/BossHealthBar.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME);
  }

  /**
   * Level selection comes from MercuryLevelMapScene (`{ planetId, levelNumber }`).
   * Falls back to GameState.progression so RETRY / a direct scene.start()
   * with no data still replays whatever level was last active.
   */
  init(data) {
    this.selectedPlanetId = data?.planetId ?? GameState.progression.currentPlanet;
    this.selectedLevelNumber = data?.levelNumber ?? GameState.progression.currentLevel;
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
    this.bossManager = new BossManager(this, (minionType, x, y) => this._spawnMinion(minionType, x, y));
    this.powerUpManager = new PowerUpManager(this, this.weaponManager, this.player);
    this._createCollisions();
    this._createInput();

    this.hud = new HUD(this);
    this.bossHealthBar = new BossHealthBar(this);
    this._bindGameEvents();

    // Phaser doesn't auto-call a `shutdown()` method — it must be bound to
    // the scene's shutdown event explicitly, or listeners/timers leak
    // across scene restarts (e.g. RETRY).
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._teardown, this);

    const started = this.levelManager.startLevel(this.selectedPlanetId, this.selectedLevelNumber);
    if (!started) {
      // Locked/invalid level somehow reached GameScene directly — bounce
      // back to the map rather than soft-locking on an empty level.
      this.scene.start(SCENE_KEYS.MERCURY_MAP);
    }
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

    this._onWaveStarted = (payload) => {
      if (payload.isBossWave) {
        this._startBossEncounter(payload.bossId);
      }
    };

    this._onLevelCompleted = (payload) => {
      this.scene.start(SCENE_KEYS.LEVEL_COMPLETE, {
        planetId: payload.planetId,
        levelNumber: payload.levelNumber,
        isBoss: payload.isBoss,
        stoneAcquired: payload.stoneAcquired,
        planetComplete: payload.planetComplete,
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

    this._onBossDefeated = (payload) => {
      this._handleBossDefeated(payload);
    };

    EventBus.on(EVENTS.ENEMY_KILLED, this._onEnemyKilled);
    EventBus.on(EVENTS.WAVE_COMPLETED, this._onWaveCompleted);
    EventBus.on(EVENTS.WAVE_STARTED, this._onWaveStarted);
    EventBus.on(EVENTS.LEVEL_COMPLETED, this._onLevelCompleted);
    EventBus.on(EVENTS.PLAYER_DIED, this._onPlayerDied);
    EventBus.on(EVENTS.BOSS_DEFEATED, this._onBossDefeated);
  }

  // ---------------------------------------------------------------------
  // Boss encounter
  // ---------------------------------------------------------------------

  _startBossEncounter(bossId) {
    const config = getBossConfig(bossId);
    if (!config) {
      console.error(`[GameScene] Missing boss config for "${bossId}"`);
      this.waveManager.notifyBossDefeated();
      return;
    }

    // Freeze the wave-driven HUD text on "WAVE 5 / 5" and show a short
    // (~1.5s) intro before the boss actually appears (spec section 11).
    this._showBossIntro(config, () => {
      this.bossManager.spawnBoss(bossId);
    });
  }

  _showBossIntro(config, onComplete) {
    const overlay = this.add.container(0, 0).setDepth(DEPTH.HUD + 1);

    const bg = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060f, 0.85).setOrigin(0, 0);
    const warning = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'BOSS INCOMING', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#ff5566'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const name = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, config.name.toUpperCase(), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    overlay.add([bg, warning, name]);

    this.tweens.add({
      targets: [warning, name],
      alpha: 1,
      duration: 250,
      ease: 'Cubic.Out'
    });

    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          overlay.destroy(true);
          onComplete();
        }
      });
    });
  }

  _spawnMinion(minionType, x, y) {
    const config = getEnemyConfig(minionType);
    if (!config) return;
    const enemy = this.enemyPool.acquire(x, y, config);
    // Minions still count toward WaveManager's alive-count bookkeeping only
    // for normal waves; during a boss wave that counter is unused, so they
    // simply behave like any other enemy for collision/damage purposes.
    return enemy;
  }

  _handleBossDefeated({ bossName, rewards }) {
    if (rewards) {
      CurrencyManager.addCoins(rewards.coins);
      XPManager.addXP(rewards.xp);
    }

    this._spawnDeathEffect(this.bossManager.activeBoss.x, this.bossManager.activeBoss.y, true);

    const label = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, `${bossName.toUpperCase()}\nDEFEATED`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#37e0ff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.HUD + 1)
      .setAlpha(0);

    this.tweens.add({ targets: label, alpha: 1, duration: 200 });

    // Wait ~1s before advancing (spec section 13), then release the boss
    // and let WaveManager's normal WAVE_COMPLETED -> completeLevel() path
    // take over — this is what LEVEL_COMPLETED (with any stone reward)
    // ultimately fires from.
    this.time.delayedCall(1000, () => {
      label.destroy();
      this.bossManager.clear();
      this.waveManager.notifyBossDefeated();
    });
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

  _onProjectileHitBoss(projectile, boss) {
    if (!projectile.active || !boss.active) return;

    const { amount } = this.weaponManager.currentWeapon.applyDamage(
      projectile.damage,
      this.player.criticalChance,
      this.player.criticalMultiplier
    );

    this.weaponManager.releaseProjectile(projectile);
    const finalAmount = boss.weakPoint ? Math.round(amount * boss.weakPoint.damageMultiplier) : amount;
    boss.takeDamage(finalAmount);
  }

  _onPlayerHitBoss(player, boss) {
    if (!boss.active) return;
    player.takeDamage(boss.contactDamage ?? 1);
  }

  _onPlayerHitPowerUp(player, pickup) {
    this.powerUpManager.collect(pickup);
  }

  _spawnDeathEffect(x, y, big = false) {
    const particles = this.add.particles(x, y, TEXTURE_KEYS.PARTICLE_SPARK, {
      speed: { min: 60, max: big ? 320 : 180 },
      lifespan: big ? 500 : 300,
      scale: { start: big ? 2 : 1, end: 0 },
      quantity: big ? 28 : 8,
      blendMode: 'ADD'
    });
    particles.setDepth(DEPTH.EFFECTS);
    this.time.delayedCall(big ? 520 : 320, () => particles.destroy());
  }

  // ---------------------------------------------------------------------
  // Update loop
  // ---------------------------------------------------------------------

  update(time, delta) {
    this.player.updateMovement(delta);
    this.weaponManager.update(delta, this.player);
    this.waveManager.update(delta);
    this.bossManager.update(delta);
    this.bossHealthBar.update();

    this._updateProjectiles(delta);
    this._updateEnemies(delta);
    this._updateBossCollisions();
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

  /**
   * Boss overlaps are set up per-spawn (rather than once in
   * _createCollisions like enemies) since the boss sprite doesn't exist
   * until a boss wave starts. Cheap to re-register each frame the boss is
   * present; Arcade Physics overlap checks are inexpensive at this scale.
   */
  _updateBossCollisions() {
    const boss = this.bossManager.activeBoss;
    if (!boss || !boss.active) return;

    this.physics.overlap(this.weaponManager.projectilePool.pool, boss, this._onProjectileHitBoss, undefined, this);
    this.physics.overlap(this.player, boss, this._onPlayerHitBoss, undefined, this);
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
    EventBus.off(EVENTS.WAVE_STARTED, this._onWaveStarted);
    EventBus.off(EVENTS.LEVEL_COMPLETED, this._onLevelCompleted);
    EventBus.off(EVENTS.PLAYER_DIED, this._onPlayerDied);
    EventBus.off(EVENTS.BOSS_DEFEATED, this._onBossDefeated);
    this.hud?.destroy();
    this.bossHealthBar?.destroy();
    this.bossManager?.clear();
    this.powerUpManager?.destroy();
  }
}
