import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/constants.js';
import { GameOverUI } from '../ui/GameOverUI.js';
import { SaveManager } from '../systems/SaveManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.GAME_OVER);
  }

  init(data) {
    this.coinsEarned = data?.coinsEarned ?? 0;
    this.xpEarned = data?.xpEarned ?? 0;
  }

  create() {
    SaveManager.saveGame();

    this.ui = new GameOverUI(this, {
      coinsEarned: this.coinsEarned,
      xpEarned: this.xpEarned,
      onRetry: () => this.scene.start(SCENE_KEYS.GAME),
      onLevelMap: () => this.scene.start(SCENE_KEYS.PLACEHOLDER_MAP)
    });
  }
}
