import Phaser from 'phaser';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS, LAYOUT } from '../config/constants.js';
import { getEnemyConfig } from '../data/enemies.js';

/**
 * Drives spawning for the current level's waves, purely from data (see
 * data/levels.js). GameScene supplies a spawnEnemyFn so this manager has
 * zero knowledge of Phaser scenes/pools/physics — it only decides *when*
 * and *what* to spawn, and tracks how many are still alive.
 */
export class WaveManager {
  /**
   * @param {{spawnEnemyFn: (type:string, x:number, y:number) => object}} deps
   */
  constructor({ spawnEnemyFn }) {
    this.spawnEnemyFn = spawnEnemyFn;
    this.levelData = null;
    this.currentWaveIndex = -1;
    this.totalWaves = 0;

    this._spawnQueue = []; // remaining {type} entries to spawn this wave
    this._spawnTimerMs = 0;
    this._spawnIntervalMs = 600;
    this._aliveCount = 0;
    this._isWaveActive = false;
  }

  /** @param {object} levelData shape from data/levels.js */
  loadLevel(levelData) {
    this.levelData = levelData;
    this.totalWaves = levelData.waves.length;
    this.currentWaveIndex = -1;
  }

  startNextWave() {
    this.currentWaveIndex += 1;
    if (this.currentWaveIndex >= this.totalWaves) {
      return false; // no more waves — level is complete
    }

    const wave = this.levelData.waves[this.currentWaveIndex];
    this._spawnIntervalMs = wave.spawnIntervalMs ?? 600;
    this._spawnTimerMs = 0;
    this._aliveCount = 0;
    this._isWaveActive = true;

    // Flatten { type, count } groups into a flat spawn queue.
    this._spawnQueue = [];
    for (const group of wave.enemies) {
      for (let i = 0; i < group.count; i++) {
        this._spawnQueue.push(group.type);
      }
    }

    EventBus.emit(EVENTS.WAVE_STARTED, {
      waveNumber: this.currentWaveIndex + 1,
      totalWaves: this.totalWaves
    });

    return true;
  }

  /** @param {number} deltaMs */
  update(deltaMs) {
    if (!this._isWaveActive) return;

    if (this._spawnQueue.length > 0) {
      this._spawnTimerMs -= deltaMs;
      if (this._spawnTimerMs <= 0) {
        this._spawnTimerMs = this._spawnIntervalMs;
        const enemyType = this._spawnQueue.shift();
        this._spawnOne(enemyType);
      }
    } else if (this._aliveCount <= 0) {
      // All enemies for this wave spawned and resolved (killed or despawned).
      this._isWaveActive = false;
      EventBus.emit(EVENTS.WAVE_COMPLETED, { waveNumber: this.currentWaveIndex + 1 });
    }
  }

  _spawnOne(enemyType) {
    const config = getEnemyConfig(enemyType);
    if (!config) {
      console.warn(`[WaveManager] Unknown enemy type "${enemyType}"`);
      return;
    }

    const x = Phaser.Math.Between(LAYOUT.PLAYABLE_LEFT + 30, LAYOUT.PLAYABLE_RIGHT - 30);

    this.spawnEnemyFn(enemyType, x, LAYOUT.SPAWN_Y);
    this._aliveCount += 1;
    EventBus.emit(EVENTS.ENEMY_SPAWNED, { enemyType, x });
  }

  /** Called by GameScene whenever a spawned enemy dies OR despawns unfought. */
  notifyEnemyResolved() {
    this._aliveCount = Math.max(0, this._aliveCount - 1);
  }

  isLevelComplete() {
    return this.currentWaveIndex >= this.totalWaves - 1 && !this._isWaveActive && this._spawnQueue.length === 0;
  }

  get currentWaveNumber() {
    return this.currentWaveIndex + 1;
  }
}
