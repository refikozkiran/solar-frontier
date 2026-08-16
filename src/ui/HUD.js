import { EventBus } from '../utils/EventBus.js';
import { EVENTS, DEPTH, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { GameState } from '../systems/GameState.js';

/**
 * Mobile-first HUD strip. Purely presentational — it only listens to
 * EventBus and reads GameState for its initial values, never mutates
 * gameplay state itself.
 */
export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._buildLayout();
    this._bindEvents();
  }

  _buildLayout() {
    const scene = this.scene;

    // HP (top-left)
    this.hpText = scene.add
      .text(24, 24, `\u2764\uFE0F ${GameState.player.hp}/${GameState.player.maxHP}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff'
      })
      .setDepth(DEPTH.HUD);

    // Wave counter (top-center)
    this.waveText = scene.add
      .text(GAME_WIDTH / 2, 30, 'WAVE 1 / 5', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.HUD);

    // Coins (top-right)
    this.coinsText = scene.add
      .text(GAME_WIDTH - 24, 24, `\uD83E\uDE99 ${GameState.player.coins}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffe08a'
      })
      .setOrigin(1, 0)
      .setDepth(DEPTH.HUD);

    // Player level / XP (bottom-center)
    this.levelText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 36, this._levelLabel(), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#9fd8ff'
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.HUD);
  }

  _levelLabel() {
    return `LV ${GameState.player.level}  \u2022  XP ${GameState.player.xp}/${GameState.player.xpToNextLevel}`;
  }

  _bindEvents() {
    this._onDamaged = ({ hp, maxHP }) => {
      this.hpText.setText(`\u2764\uFE0F ${hp}/${maxHP}`);
    };
    this._onCoinsChanged = (coins) => {
      this.coinsText.setText(`\uD83E\uDE99 ${coins}`);
    };
    this._onXPChanged = () => {
      this.levelText.setText(this._levelLabel());
    };
    this._onLevelUp = () => {
      this.levelText.setText(this._levelLabel());
    };
    this._onWaveStarted = ({ waveNumber, totalWaves }) => {
      this.waveText.setText(`WAVE ${waveNumber} / ${totalWaves}`);
    };

    EventBus.on(EVENTS.PLAYER_DAMAGED, this._onDamaged);
    EventBus.on(EVENTS.COINS_CHANGED, this._onCoinsChanged);
    EventBus.on(EVENTS.XP_CHANGED, this._onXPChanged);
    EventBus.on(EVENTS.PLAYER_LEVEL_UP, this._onLevelUp);
    EventBus.on(EVENTS.WAVE_STARTED, this._onWaveStarted);
  }

  destroy() {
    EventBus.off(EVENTS.PLAYER_DAMAGED, this._onDamaged);
    EventBus.off(EVENTS.COINS_CHANGED, this._onCoinsChanged);
    EventBus.off(EVENTS.XP_CHANGED, this._onXPChanged);
    EventBus.off(EVENTS.PLAYER_LEVEL_UP, this._onLevelUp);
    EventBus.off(EVENTS.WAVE_STARTED, this._onWaveStarted);
  }
}
