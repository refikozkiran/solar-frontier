import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { PLANETS } from '../data/planets.js';
import { GameState } from '../systems/GameState.js';

/**
 * Stub screen — intentionally minimal per spec ("do not implement actual
 * level map functionality yet"). Shows progression is being tracked and
 * gives a way back into the only playable level.
 */
export class PlaceholderMapScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PLACEHOLDER_MAP);
  }

  create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x05060f).setOrigin(0, 0);

    this.add
      .text(GAME_WIDTH / 2, 160, 'SOLAR FRONTIER', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#37e0ff'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 215, 'The Eight Stones', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#9fd8ff'
      })
      .setOrigin(0.5);

    const unlockedCount = PLANETS.filter((p) => p.unlocked).length;
    this.add
      .text(GAME_WIDTH / 2, 300, `Planets unlocked: ${unlockedCount} / ${PLANETS.length}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        360,
        `Level: ${GameState.progression.currentPlanet} ${GameState.progression.currentLevel}\nCompleted: ${GameState.progression.completedLevels.length}`,
        {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: '#9fd8ff',
          align: 'center'
        }
      )
      .setOrigin(0.5, 0);

    const playButton = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 320, 84, 0x37e0ff)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'PLAY MERCURY 1', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#05060f'
      })
      .setOrigin(0.5);

    playButton.on('pointerdown', () => this.scene.start(SCENE_KEYS.GAME));

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, 'Full level map coming in a future phase', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#666a80'
      })
      .setOrigin(0.5);
  }
}
