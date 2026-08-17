import { EventBus } from '../utils/EventBus.js';
import { EVENTS, DEPTH, GAME_WIDTH } from '../config/constants.js';

/**
 * Self-contained boss health bar. Sits below the normal WAVE X/Y text
 * (spec section 12) and animates smoothly toward new HP values rather than
 * snapping.
 */
export class BossHealthBar {
  constructor(scene) {
    this.scene = scene;
    this._currentWidthRatio = 1;
    this._targetWidthRatio = 1;

    const barWidth = 480;
    const barHeight = 22;
    const y = 78;

    this.container = scene.add.container(GAME_WIDTH / 2, y).setDepth(DEPTH.HUD).setVisible(false);

    this.nameText = scene.add
      .text(0, -22, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ff8a3d'
      })
      .setOrigin(0.5);

    this.bg = scene.add
      .rectangle(0, 0, barWidth, barHeight, 0x1a0a0a, 0.9)
      .setStrokeStyle(2, 0xff8a3d, 0.8);

    this.fillWidth = barWidth - 6;
    this.fillHeight = barHeight - 6;
    this.fill = scene.add
      .rectangle(-this.fillWidth / 2, 0, this.fillWidth, this.fillHeight, 0xff5566, 1)
      .setOrigin(0, 0.5);

    this.container.add([this.bg, this.fill, this.nameText]);

    this._onHpChanged = ({ hp, maxHP, bossName }) => {
      this.container.setVisible(true);
      this.nameText.setText(bossName?.toUpperCase() ?? '');
      this._targetWidthRatio = Math.max(0, hp / maxHP);
    };
    this._onDefeated = () => {
      this.container.setVisible(false);
    };

    EventBus.on(EVENTS.BOSS_HP_CHANGED, this._onHpChanged);
    EventBus.on(EVENTS.BOSS_DEFEATED, this._onDefeated);
  }

  update() {
    if (Math.abs(this._currentWidthRatio - this._targetWidthRatio) < 0.001) return;
    this._currentWidthRatio += (this._targetWidthRatio - this._currentWidthRatio) * 0.15;
    this.fill.width = this.fillWidth * this._currentWidthRatio;
    this.fill.fillColor = this._currentWidthRatio > 0.3 ? 0xff5566 : 0xffcc33;
  }

  destroy() {
    EventBus.off(EVENTS.BOSS_HP_CHANGED, this._onHpChanged);
    EventBus.off(EVENTS.BOSS_DEFEATED, this._onDefeated);
    this.container.destroy(true);
  }
}
