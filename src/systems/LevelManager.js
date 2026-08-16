import { getLevelData } from '../data/levels.js';
import { GameState } from './GameState.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Orchestrates "what level are we playing and did we win/lose it". Wraps a
 * WaveManager instance (waves are level-internal detail) and syncs
 * completion into GameState.progression. Adding level 401 never touches
 * this file — only data/levels.js.
 */
export class LevelManager {
  constructor(waveManager) {
    this.waveManager = waveManager;
    this.currentPlanet = GameState.progression.currentPlanet;
    this.currentLevel = GameState.progression.currentLevel;
    this.levelData = null;
    this._startedAtMs = 0;
  }

  startLevel(planetId = this.currentPlanet, levelNumber = this.currentLevel) {
    const levelData = getLevelData(planetId, levelNumber);
    if (!levelData) {
      console.error(`[LevelManager] No level data for ${planetId} ${levelNumber}`);
      return false;
    }

    this.currentPlanet = planetId;
    this.currentLevel = levelNumber;
    this.levelData = levelData;
    GameState.progression.currentPlanet = planetId;
    GameState.progression.currentLevel = levelNumber;

    this.waveManager.loadLevel(levelData);
    this._startedAtMs = Date.now();
    this.waveManager.startNextWave();

    EventBus.emit(EVENTS.LEVEL_STARTED, { planetId, levelNumber });
    return true;
  }

  /** Called by GameScene when WaveManager reports a wave finished. */
  advanceWave() {
    if (this.waveManager.isLevelComplete()) {
      this.completeLevel();
      return;
    }
    this.waveManager.startNextWave();
  }

  completeLevel() {
    const key = `${this.currentPlanet}-${this.currentLevel}`;
    if (!GameState.progression.completedLevels.includes(key)) {
      GameState.progression.completedLevels.push(key);
    }

    const elapsedMs = Date.now() - this._startedAtMs;
    EventBus.emit(EVENTS.LEVEL_COMPLETED, {
      planetId: this.currentPlanet,
      levelNumber: this.currentLevel,
      elapsedMs
    });
  }

  failLevel() {
    EventBus.emit(EVENTS.LEVEL_FAILED, {
      planetId: this.currentPlanet,
      levelNumber: this.currentLevel
    });
  }

  restartLevel() {
    this.startLevel(this.currentPlanet, this.currentLevel);
  }
}
