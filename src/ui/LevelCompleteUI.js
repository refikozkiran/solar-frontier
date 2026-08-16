import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/constants.js';

/** Self-contained panel for the LevelCompleteScene. */
export class LevelCompleteUI {
  constructor(scene, { coinsEarned, xpEarned, elapsedMs, onContinue }) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(DEPTH.HUD);

    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060f, 0.92).setOrigin(0, 0);

    const title = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 240, 'LEVEL COMPLETE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#37e0ff'
      })
      .setOrigin(0.5);

    const seconds = Math.max(0, Math.round(elapsedMs / 1000));
    const statsText = scene.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 80,
        `Coins earned\n${coinsEarned}\n\nXP earned\n${xpEarned}\n\nTime\n${seconds}s`,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '28px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5, 0);

    const continueButton = this._createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 300, 'CONTINUE', 0x6cff8f, onContinue);

    this.container.add([overlay, title, statsText, continueButton]);
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
