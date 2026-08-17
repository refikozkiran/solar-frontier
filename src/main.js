import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { LevelCompleteScene } from './scenes/LevelCompleteScene.js';
import { MercuryLevelMapScene } from './scenes/MercuryLevelMapScene.js';
import { SaveManager } from './systems/SaveManager.js';

// Restore any prior progression (level/xp/coins/upgrades) before the first
// scene boots, so GameState is accurate from frame one.
SaveManager.loadGame();

new Phaser.Game({
  ...gameConfig,
  scene: [BootScene, PreloadScene, MercuryLevelMapScene, GameScene, GameOverScene, LevelCompleteScene]
});
