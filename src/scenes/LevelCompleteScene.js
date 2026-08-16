import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/constants.js';
import { LevelCompleteUI } from '../ui/LevelCompleteUI.js';
import { SaveManager } from '../systems/SaveManager.js';

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.LEVEL_COMPLETE);
  }

  init(data) {
    this.coinsEarned = data?.coinsEarned ?? 0;
    this.xpEarned = data?.xpEarned ?? 0;
    this.elapsedMs = data?.elapsedMs ?? 0;
  }

  create() {
    SaveManager.saveGame();

    this.ui = new LevelCompleteUI(this, {
      coinsEarned: this.coinsEarned,
      xpEarned: this.xpEarned,
      elapsedMs: this.elapsedMs,
      // Phase 1 has only one level, so CONTINUE goes to the placeholder
      // map per spec rather than auto-advancing to a nonexistent level 2.
      onContinue: () => this.scene.start(SCENE_KEYS.PLACEHOLDER_MAP)
    });
  }
}
