import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/constants.js';

/**
 * Self-contained panel for the GameOverScene. Callers pass in the run's
 * earned coins/xp and callbacks — this class only builds/tears down visuals.
 */
export class GameOverUI {
  constructor(scene, { coinsEarned, xpEarned, onRetry, onLevelMap }) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(DEPTH.HUD);

    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060f, 0.92).setOrigin(0, 0);

    const title = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 220, 'GAME OVER', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ff5566'
      })
      .setOrigin(0.5);

    const coinsLabel = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, `Coins earned\n${coinsEarned}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        color: '#ffe08a',
        align: 'center'
      })
      .setOrigin(0.5);

    const xpLabel = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, `XP earned\n${xpEarned}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        color: '#9fd8ff',
        align: 'center'
      })
      .setOrigin(0.5);

    const retryButton = this._createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140, 'RETRY', 0x37e0ff, onRetry);
    const mapButton = this._createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 240, 'LEVEL MAP', 0x555577, onLevelMap);

    this.container.add([overlay, title, coinsLabel, xpLabel, retryButton, mapButton]);
  }

  _createButton(x, y, label, color, onClick) {
    const width = 360;
    const height = 84;
    const buttonContainer = this.scene.add.container(x, y);

    const bg = this.scene.add
      .rectangle(0, 0, width, height, color, 1)
      .setStrokeStyle(2, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });

    const text = this.scene.add
      .text(0, 0, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#05060f'
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => onClick && onClick());
    bg.on('pointerover', () => bg.setAlpha(0.85));
    bg.on('pointerout', () => bg.setAlpha(1));

    buttonContainer.add([bg, text]);
    return buttonContainer;
  }

  destroy() {
    this.container.destroy(true);
  }
}
