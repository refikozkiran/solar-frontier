import { DEPTH } from '../config/constants.js';

export const NODE_STATE = {
  LOCKED: 'locked',
  CURRENT: 'current',
  COMPLETED: 'completed'
};

export const NORMAL_RADIUS = 42;
export const BOSS_RADIUS = 60;

/**
 * A single tappable node on MercuryLevelMapScene. Purely presentational +
 * hit-testing — MercuryLevelMapScene owns tap-vs-drag detection and calls
 * `containsPoint()` / `select()` itself, so this class has no pointer
 * listeners of its own (keeps drag-to-scroll and tap-to-select from ever
 * fighting over the same input event).
 *
 * Procedural Phaser Graphics only, per spec section 18/19 — structured so
 * a later pass can swap `_drawBase()` for a sprite without touching
 * anything that reads node state.
 */
export class LevelNode {
  constructor(scene, { level, x, y, isBoss, state }) {
    this.scene = scene;
    this.level = level;
    this.x = x;
    this.y = y;
    this.isBoss = isBoss;
    this.state = state;
    this.radius = isBoss ? BOSS_RADIUS : NORMAL_RADIUS;

    this.container = scene.add.container(x, y).setDepth(DEPTH.MAP_NODES);
    this._build();

    if (state === NODE_STATE.CURRENT) {
      this._playCurrentPulse();
    }
  }

  _build() {
    const g = this.scene.add.graphics();
    this.graphics = g;

    const palette = this._palette();

    if (this.isBoss) {
      // Outer warning ring, drawn slightly larger than the node itself.
      g.lineStyle(4, 0xff3355, this.state === NODE_STATE.LOCKED ? 0.25 : 0.9);
      g.strokeCircle(0, 0, this.radius + 10);
    }

    g.fillStyle(palette.fill, 1);
    g.fillCircle(0, 0, this.radius);
    g.lineStyle(this.isBoss ? 5 : 3, palette.stroke, 1);
    g.strokeCircle(0, 0, this.radius);

    this.container.add(g);

    if (this.state === NODE_STATE.LOCKED) {
      this._addLockIcon();
    } else {
      this._addLevelLabel(palette.text);
    }

    if (this.state === NODE_STATE.COMPLETED) {
      this._addCheckmark();
    }

    if (this.isBoss) {
      this._addBossIcon();
    }

    if (this.state === NODE_STATE.CURRENT) {
      this._addPlayIndicator(palette.text);
    }
  }

  _palette() {
    switch (this.state) {
      case NODE_STATE.LOCKED:
        return { fill: 0x14100c, stroke: 0x342a1e, text: '#5a5040' };
      case NODE_STATE.COMPLETED:
        return { fill: 0x123324, stroke: 0x6cff8f, text: '#d9ffe6' };
      case NODE_STATE.CURRENT:
      default:
        return this.isBoss
          ? { fill: 0x3a0f0a, stroke: 0xff8a3d, text: '#ffe9d6' }
          : { fill: 0x0a2b33, stroke: 0x37e0ff, text: '#eafcff' };
    }
  }

  _addLevelLabel(colorHex) {
    const fontSize = this.isBoss ? '30px' : '26px';
    const label = this.scene.add
      .text(0, this.isBoss ? 10 : 0, String(this.level), {
        fontFamily: 'Arial, sans-serif',
        fontSize,
        fontStyle: 'bold',
        color: colorHex
      })
      .setOrigin(0.5);
    this.container.add(label);
  }

  _addLockIcon() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x5a5040, 1);
    // Simple padlock: body rect + shackle arc, drawn procedurally so it
    // matches the "no external assets yet" constraint.
    g.fillRoundedRect(-10, -2, 20, 16, 3);
    g.lineStyle(4, 0x5a5040, 1);
    g.beginPath();
    g.arc(0, -6, 9, Math.PI, 0, false);
    g.strokePath();
    this.container.add(g);
  }

  _addCheckmark() {
    const g = this.scene.add.graphics();
    g.lineStyle(5, 0x6cff8f, 1);
    g.beginPath();
    g.moveTo(-this.radius * 0.42, this.radius * 0.55);
    g.lineTo(-this.radius * 0.1, this.radius * 0.82);
    g.lineTo(this.radius * 0.5, this.radius * 0.1);
    g.strokePath();
    this.container.add(g);
  }

  _addBossIcon() {
    const icon = this.scene.add
      .text(0, -this.radius - 26, '\u2620', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#ff5566'
      })
      .setOrigin(0.5);
    this.container.add(icon);
  }

  _addPlayIndicator(colorHex) {
    const label = this.scene.add
      .text(0, this.radius + 22, 'PLAY', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: colorHex
      })
      .setOrigin(0.5);
    this.container.add(label);
  }

  _playCurrentPulse() {
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1, to: 1.08 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });
  }

  /** World-space hit test used by the scene's tap handler. */
  containsPoint(worldX, worldY) {
    const dx = worldX - this.x;
    const dy = worldY - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  /** Brief shake to signal "locked, can't select" (spec section 3). */
  playLockedFeedback() {
    this.scene.tweens.add({
      targets: this.container,
      x: { from: this.x - 6, to: this.x + 6 },
      duration: 60,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.container.setPosition(this.x, this.y)
    });
  }

  destroy() {
    this.container.destroy(true);
  }
}
