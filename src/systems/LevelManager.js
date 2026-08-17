import { getLevelData } from '../data/levels.js';
import { getPlanet } from '../data/planets.js';
import { getStoneIdForPlanet } from '../data/stones.js';
import { GameState } from './GameState.js';
import { ProgressionManager } from './ProgressionManager.js';
import { EventBus } from '../utils/EventBus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Orchestrates "what level are we playing and did we win/lose it". Wraps a
 * WaveManager instance (waves are level-internal detail) and syncs
 * completion into GameState.progression. Adding level 401 never touches
 * this file — only data/mercuryLevels.js (or a future planet's equivalent).
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

    if (!ProgressionManager.isLevelUnlocked(planetId, levelNumber)) {
      console.warn(`[LevelManager] Refusing to start locked level ${planetId} ${levelNumber}`);
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

    EventBus.emit(EVENTS.LEVEL_STARTED, {
      planetId,
      levelNumber,
      isBoss: levelData.isBoss,
      bossId: levelData.bossId,
      totalWaves: levelData.waves.length
    });
    return true;
  }

  /** Called by GameScene when WaveManager reports a wave finished (or a boss died). */
  advanceWave() {
    if (this.waveManager.isLevelComplete()) {
      this.completeLevel();
      return;
    }
    this.waveManager.startNextWave();
  }

  completeLevel() {
    const isNewlyCompleted = ProgressionManager.markLevelCompleted(this.currentPlanet, this.currentLevel);
    const planet = getPlanet(this.currentPlanet);

    let stoneAcquired = false;
    let stoneId = null;
    if (this.currentLevel === planet?.totalLevels && ProgressionManager.isPlanetComplete(this.currentPlanet)) {
      stoneId = getStoneIdForPlanet(this.currentPlanet);
      if (stoneId) {
        GameState.stones[this.currentPlanet] = true;
        stoneAcquired = true;
      }
    }

    const elapsedMs = Date.now() - this._startedAtMs;
    EventBus.emit(EVENTS.LEVEL_COMPLETED, {
      planetId: this.currentPlanet,
      levelNumber: this.currentLevel,
      isNewlyCompleted,
      isBoss: this.levelData?.isBoss ?? false,
      elapsedMs,
      stoneAcquired,
      stoneId,
      planetComplete: stoneAcquired,
      nextLevelUnlocked: ProgressionManager.getUnlockedLevel(this.currentPlanet)
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
