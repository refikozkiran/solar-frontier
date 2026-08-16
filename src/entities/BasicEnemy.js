import { Enemy } from './Enemy.js';
import { TEXTURE_KEYS, LAYOUT } from '../config/constants.js';

/**
 * Straight-down movement enemy. This is the only enemy type implemented in
 * Phase 1. ChaserEnemy/ShooterEnemy/TankEnemy/EliteEnemy will follow the
 * same pattern: extend Enemy, override updateMovement().
 */
export class BasicEnemy extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, TEXTURE_KEYS.ENEMY_BASIC);
  }

  spawnAt(x, y, config) {
    super.spawnAt(x, y, config);
    if (this.body) {
      this.body.setVelocity(0, this.speed);
    }
  }

  updateMovement(deltaMs) {
    // Velocity is set once on spawn; Arcade Physics handles the rest.
    // Returns true when the enemy has left the play area unfought, so the
    // caller (GameScene) can release it back to the pool without counting
    // it as a "kill" for wave-completion tracking.
    return this.y > LAYOUT.DESPAWN_Y;
  }
}
