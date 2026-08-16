import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/constants.js';

/** First scene: no assets yet, just engine-level setup before Preload. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create() {
    this.scale.refresh();
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}
