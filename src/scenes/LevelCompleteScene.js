import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/constants.js';
import { LevelCompleteUI } from '../ui/LevelCompleteUI.js';
import { SaveManager } from '../systems/SaveManager.js';
import { ProgressionManager } from '../systems/ProgressionManager.js';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.LEVEL_COMPLETE);
  }

  init(data) {
    this.planetId = data?.planetId ?? 'mercury';
    this.levelNumber = data?.levelNumber ?? 1;
    this.coinsEarned = data?.coinsEarned ?? 0;
    this.xpEarned = data?.xpEarned ?? 0;
    this.elapsedMs = data?.elapsedMs ?? 0;
    this.isBoss = data?.isBoss ?? false;
    this.planetComplete = data?.planetComplete ?? false;
  }

  create() {
    SaveManager.saveGame();

    const nextLevelNumber = this.levelNumber + 1;
    const nextLevelUnlocked = ProgressionManager.isLevelUnlocked(this.planetId, nextLevelNumber);

    this.ui = new LevelCompleteUI(this, {
      coinsEarned: this.coinsEarned,
      xpEarned: this.xpEarned,
      elapsedMs: this.elapsedMs,
      isBoss: this.isBoss,
      planetComplete: this.planetComplete,
      onNext: () => {
        if (!nextLevelUnlocked) {
          this.scene.start(SCENE_KEYS.MERCURY_MAP);
          return;
        }
        this.scene.start(SCENE_KEYS.GAME, { planetId: this.planetId, levelNumber: nextLevelNumber });
      },
      onMap: () => this.scene.start(SCENE_KEYS.MERCURY_MAP),
      // Mercury-complete layout only shows CONTINUE, which for this phase
      // returns to the Mercury map placeholder — the future Solar System
      // map slots in here once it exists (spec section 16).
      onContinue: () => this.scene.start(SCENE_KEYS.MERCURY_MAP)
    });
  }
}
