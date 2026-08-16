import Phaser from 'phaser';
import { getPowerUpConfig } from '../data/powerups.js';
import { TEXTURE_KEYS, DEPTH } from '../config/constants.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Base class for a power-up's runtime effect. Each concrete power-up
 * implements activate()/deactivate() against the WeaponManager/PlayerShip
 * it's given. Only DoubleShot is implemented; Shield/Laser/Missile/Nova
 * are reserved for future phases, following the same shape.
 *
 *   PowerUp
 *    ├── DoubleShot
 *    ├── TripleShot   (reserved)
 *    ├── Shield        (reserved)
 *    ├── Laser         (reserved)
 *    ├── Missile       (reserved)
 *    └── Nova          (reserved)
 */
class PowerUpEffect {
  constructor(config) {
    this.config = config;
  }
  activate(weaponManager, playerShip) {}
  deactivate(weaponManager, playerShip) {}
}

class DoubleShotEffect extends PowerUpEffect {
  activate(weaponManager) {
    weaponManager.addExtraStream(24); // second stream offset to the right of the ship
  }
  deactivate(weaponManager) {
    weaponManager.clearExtraStreams();
  }
}

const EFFECT_REGISTRY = {
  double_shot: DoubleShotEffect
};

/**
 * Manages power-up pickups spawning in the world, collection, and timed
 * activation. GameScene owns the physics group this manager populates.
 */
export class PowerUpManager {
  constructor(scene, weaponManager, playerShip) {
    this.scene = scene;
    this.weaponManager = weaponManager;
    this.playerShip = playerShip;
    this.group = scene.physics.add.group();
    this._activeTimers = new Map(); // powerUpId -> Phaser.Time.TimerEvent
  }

  /** Roll a drop from a defeated enemy's position. Called by GameScene on ENEMY_KILLED. */
  maybeDropAt(x, y) {
    const config = getPowerUpConfig('double_shot');
    if (Math.random() > config.dropChance) return;

    const pickup = this.scene.physics.add.sprite(x, y, TEXTURE_KEYS.POWERUP_DOUBLE);
    pickup.setDepth(DEPTH.POWERUPS);
    pickup.powerUpId = config.id;
    pickup.body.setVelocity(0, 120);
    this.group.add(pickup);

    this.scene.tweens.add({
      targets: pickup,
      angle: 360,
      duration: 1400,
      repeat: -1
    });
  }

  /** Called by GameScene on PowerUp <-> Player overlap. */
  collect(pickup) {
    const powerUpId = pickup.powerUpId;
    pickup.destroy();

    const config = getPowerUpConfig(powerUpId);
    const EffectClass = EFFECT_REGISTRY[powerUpId];
    if (!EffectClass) return;

    const effect = new EffectClass(config);

    // Refresh duration if already active instead of stacking.
    const existingTimer = this._activeTimers.get(powerUpId);
    if (existingTimer) {
      existingTimer.remove();
    } else {
      effect.activate(this.weaponManager, this.playerShip);
    }

    const timer = this.scene.time.delayedCall(config.durationMs, () => {
      effect.deactivate(this.weaponManager, this.playerShip);
      this._activeTimers.delete(powerUpId);
      EventBus.emit(EVENTS.POWERUP_EXPIRED, powerUpId);
    });

    this._activeTimers.set(powerUpId, timer);
    EventBus.emit(EVENTS.POWERUP_COLLECTED, powerUpId);
  }

  cleanupOffscreen() {
    this.group.getChildren().forEach((pickup) => {
      if (pickup.y > this.scene.scale.height + 80) {
        pickup.destroy();
      }
    });
  }

  destroy() {
    this._activeTimers.forEach((timer) => timer.remove());
    this._activeTimers.clear();
  }
}
