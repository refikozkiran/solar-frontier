import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// Only the Phaser-engine-level configuration lives here. Scene list is
// injected in main.js so this file has no knowledge of scene classes.
export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#05060f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true
  },
  input: {
    activePointers: 2
  }
};
