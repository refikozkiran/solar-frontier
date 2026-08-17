import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/constants.js';
import { getPlanet } from '../data/planets.js';
import { MERCURY_BOSS_LEVELS } from '../data/mercuryLevels.js';
import { ProgressionManager } from '../systems/ProgressionManager.js';
import { LevelNode, NODE_STATE } from '../ui/LevelNode.js';

const PLANET_ID = 'mercury';
const TOTAL_LEVELS = 50;
const NODE_SPACING_Y = 168;
const TOP_PADDING = 220; // room for the "☿ MERCURY" header above level 50
const BOTTOM_PADDING = 260; // room below level 1 so it isn't flush with the screen edge
const PATH_AMPLITUDE = 130;
const DRAG_TAP_THRESHOLD = 10; // px of movement below which a release counts as a tap, not a scroll

/**
 * The main progression screen (spec section 1): Main Menu -> HERE -> Select
 * Level -> Gameplay -> Level Complete -> back HERE. Renders all 50 Mercury
 * levels as a winding vertical path the player scrolls through, built
 * entirely from Phaser Graphics/Text — no HTML buttons, no fixed list.
 *
 * Scrolling uses the main camera's scrollY over a tall world (see
 * `_contentHeight`) rather than a manually-offset container, so per-node
 * hit-testing can just compare against each node's stored world position.
 * HUD elements (title, back button, progress counter) are pinned with
 * `setScrollFactor(0)` so they stay fixed while the map scrolls under them.
 */
export class MercuryLevelMapScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MERCURY_MAP);
  }

  create() {
    this.planet = getPlanet(PLANET_ID);
    this._nodes = [];
    this._isDragging = false;
    this._dragMoved = 0;

    this._contentHeight = TOP_PADDING + (TOTAL_LEVELS - 1) * NODE_SPACING_Y + BOTTOM_PADDING;

    this._createBackground();
    this._createPath();
    this._createNodes();
    this._createHeader();
    this._createBackButton();

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, this._contentHeight);
    this._scrollToCurrentLevel();

    this._bindInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this._teardown, this);
  }

  // ---------------------------------------------------------------------
  // Layout helpers
  // ---------------------------------------------------------------------

  /** World Y for a given level number. Level 1 sits near the bottom, level 50 near the top. */
  _yForLevel(level) {
    return TOP_PADDING + (TOTAL_LEVELS - level) * NODE_SPACING_Y;
  }

  /** Winding horizontal offset so the path isn't a straight vertical line. */
  _xForLevel(level) {
    return GAME_WIDTH / 2 + Math.sin(level * 0.55) * PATH_AMPLITUDE;
  }

  _stateForLevel(level) {
    if (ProgressionManager.isLevelCompleted(PLANET_ID, level)) return NODE_STATE.COMPLETED;
    if (level === ProgressionManager.getUnlockedLevel(PLANET_ID)) return NODE_STATE.CURRENT;
    return NODE_STATE.LOCKED;
  }

  // ---------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------

  _createBackground() {
    this.cameras.main.setBackgroundColor(this.planet?.theme?.background ?? 0x120a05);

    // A handful of static scroll-factor<1 stars for cheap depth — they
    // drift slower than the nodes as the camera pans, unlike GameScene's
    // starfield which just recycles vertically every frame.
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, this._contentHeight),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.6)
      );
      star.setScrollFactor(0.5);
      star.setDepth(DEPTH.BACKGROUND);
    }
  }

  _createPath() {
    const g = this.add.graphics().setDepth(DEPTH.MAP_PATH);

    for (let level = 1; level < TOTAL_LEVELS; level++) {
      const x1 = this._xForLevel(level);
      const y1 = this._yForLevel(level);
      const x2 = this._xForLevel(level + 1);
      const y2 = this._yForLevel(level + 1);

      const bothTraveled =
        ProgressionManager.isLevelCompleted(PLANET_ID, level) &&
        (ProgressionManager.isLevelCompleted(PLANET_ID, level + 1) ||
          level + 1 === ProgressionManager.getUnlockedLevel(PLANET_ID));

      g.lineStyle(10, 0x2a1a10, 1);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokePath();

      if (bothTraveled) {
        g.lineStyle(5, 0x6cff8f, 0.9);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
      }
    }
  }

  _createNodes() {
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      const node = new LevelNode(this, {
        level,
        x: this._xForLevel(level),
        y: this._yForLevel(level),
        isBoss: MERCURY_BOSS_LEVELS.includes(level),
        state: this._stateForLevel(level)
      });
      this._nodes.push(node);
    }
  }

  _createHeader() {
    const headerY = this._yForLevel(TOTAL_LEVELS) - 130;

    const symbol = this.add
      .text(GAME_WIDTH / 2, headerY, this.planet?.mapSymbol ?? '\u263F', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '54px',
        color: '#ff8a3d'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.MAP_NODES);

    const title = this.add
      .text(GAME_WIDTH / 2, headerY + 60, (this.planet?.displayName ?? 'MERCURY').toUpperCase(), {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.MAP_NODES);

    this._headerObjects = [symbol, title];
  }

  _createBackButton() {
    const container = this.add.container(72, 64).setDepth(DEPTH.MAP_HUD).setScrollFactor(0);

    const bg = this.add
      .rectangle(0, 0, 120, 56, 0x1a1006, 0.9)
      .setStrokeStyle(2, 0xff8a3d, 0.8)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(0, 0, 'BACK', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ff8a3d'
      })
      .setOrigin(0.5);

    // There is no Main Menu / Solar System map yet (spec sections 16/22) —
    // this screen currently IS the top-level destination, so BACK previews
    // the future flow instead of navigating nowhere silently.
    bg.on('pointerdown', () => this._showComingSoonToast('SOLAR SYSTEM MAP\nCOMING SOON'));

    container.add([bg, label]);

    // Progress counter, top-right, also screen-fixed.
    const completedCount = ProgressionManager.getCompletedLevels(PLANET_ID).length;
    this.add
      .text(GAME_WIDTH - 32, 64, `${completedCount}/${TOTAL_LEVELS}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH.MAP_HUD)
      .setScrollFactor(0);
  }

  _showComingSoonToast(message) {
    const toast = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 140, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#1a1006',
        padding: { x: 18, y: 12 }
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.MAP_HUD + 1)
      .setScrollFactor(0)
      .setAlpha(0);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 150,
      yoyo: true,
      hold: 900,
      onComplete: () => toast.destroy()
    });
  }

  // ---------------------------------------------------------------------
  // Scroll / selection
  // ---------------------------------------------------------------------

  _scrollToCurrentLevel() {
    const unlockedLevel = ProgressionManager.getUnlockedLevel(PLANET_ID);
    const targetY = this._yForLevel(unlockedLevel) - GAME_HEIGHT / 2;
    const maxScroll = Math.max(0, this._contentHeight - GAME_HEIGHT);
    this.cameras.main.scrollY = Phaser.Math.Clamp(targetY, 0, maxScroll);
  }

  _bindInput() {
    this._onPointerDown = (pointer) => {
      this._isDragging = true;
      this._dragMoved = 0;
      this._dragStartScrollY = this.cameras.main.scrollY;
      this._dragStartPointerY = pointer.y;
    };

    this._onPointerMove = (pointer) => {
      if (!this._isDragging || !pointer.isDown) return;
      const deltaY = pointer.y - this._dragStartPointerY;
      this._dragMoved = Math.max(this._dragMoved, Math.abs(deltaY));

      const maxScroll = Math.max(0, this._contentHeight - GAME_HEIGHT);
      this.cameras.main.scrollY = Phaser.Math.Clamp(this._dragStartScrollY - deltaY, 0, maxScroll);
    };

    this._onPointerUp = (pointer) => {
      this._isDragging = false;

      // A near-stationary press+release is a tap; anything that moved past
      // the threshold was a scroll and must NOT also select a node
      // underneath the finger (spec section 20).
      if (this._dragMoved < DRAG_TAP_THRESHOLD) {
        this._handleTap(pointer);
      }
    };

    this.input.on('pointerdown', this._onPointerDown);
    this.input.on('pointermove', this._onPointerMove);
    this.input.on('pointerup', this._onPointerUp);
    this.input.on('pointerupoutside', this._onPointerUp);
  }

  _handleTap(pointer) {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const node = this._nodes.find((n) => n.containsPoint(world.x, world.y));
    if (!node) return;

    if (node.state === NODE_STATE.LOCKED) {
      node.playLockedFeedback();
      return;
    }

    this.scene.start(SCENE_KEYS.GAME, { planetId: PLANET_ID, levelNumber: node.level });
  }

  _teardown() {
    this.input.off('pointerdown', this._onPointerDown);
    this.input.off('pointermove', this._onPointerMove);
    this.input.off('pointerup', this._onPointerUp);
    this.input.off('pointerupoutside', this._onPointerUp);
    this._nodes.forEach((node) => node.destroy());
    this._nodes = [];
  }
}
