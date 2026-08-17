import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/constants.js';

/**
 * Self-contained panel for the LevelCompleteScene. Three layouts depending
 * on what was just completed (spec section 17):
 *  - normal level  -> NEXT LEVEL / LEVEL MAP
 *  - boss level    -> same, but with a "BOSS DEFEATED" heading
 *  - Mercury final (level 50 + stone acquired) -> MERCURY COMPLETE / stone / CONTINUE only
 */
export class LevelCompleteUI {
  constructor(scene, { coinsEarned, xpEarned, elapsedMs, isBoss, planetComplete, nextLevelLabel, onNext, onMap, onContinue }) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(DEPTH.HUD);

    const overlay = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060f, 0.92).setOrigin(0, 0);
    this.container.add(overlay);

    if (planetComplete) {
      this._buildPlanetCompleteLayout(coinsEarned, xpEarned, onContinue);
    } else {
      this._buildNormalLayout(coinsEarned, xpEarned, elapsedMs, isBoss, nextLevelLabel, onNext, onMap);
    }
  }

  _buildNormalLayout(coinsEarned, xpEarned, elapsedMs, isBoss, nextLevelLabel, onNext, onMap) {
    const titleText = isBoss ? 'BOSS DEFEATED' : 'LEVEL COMPLETE';
    const titleColor = isBoss ? '#ff8a3d' : '#37e0ff';

    const title = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 260, titleText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: titleColor
      })
      .setOrigin(0.5);

    const seconds = Math.max(0, Math.round(elapsedMs / 1000));
    const statsText = this.scene.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 130,
        `Coins earned\n${coinsEarned}\n\nXP earned\n${xpEarned}\n\nTime\n${seconds}s`,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '26px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5, 0);

    const nextButton = this._createButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 260,
      nextLevelLabel ?? 'NEXT LEVEL',
      0x6cff8f,
      onNext
    );
    const mapButton = this._createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 360, 'LEVEL MAP', 0x555577, onMap);

    this.container.add([title, statsText, nextButton, mapButton]);
  }

  _buildPlanetCompleteLayout(coinsEarned, xpEarned, onContinue) {
    const title = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 280, 'MERCURY COMPLETE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#ff8a3d'
      })
      .setOrigin(0.5);

    const stoneGlow = this.scene.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 60, 0xff8a3d, 0.25);
    const stone = this.scene.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, 36, 0xffcc66, 1).setStrokeStyle(3, 0xffffff, 0.8);

    this.scene.tweens.add({
      targets: stoneGlow,
      scale: 1.3,
      alpha: 0.05,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    const stoneLabel = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'MERCURY STONE ACQUIRED', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffcc66'
      })
      .setOrigin(0.5);

    const statsText = this.scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, `Coins earned\n${coinsEarned}\n\nXP earned\n${xpEarned}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5, 0);

    const continueButton = this._createButton(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 300, 'CONTINUE', 0xffcc66, onContinue);

    this.container.add([title, stoneGlow, stone, stoneLabel, statsText, continueButton]);
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
        fontSize: '28px',
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
