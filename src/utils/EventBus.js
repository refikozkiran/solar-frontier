import Phaser from 'phaser';

// A single shared emitter. Systems (WaveManager, XPManager, etc.) publish
// events here instead of calling into the Scene or each other directly.
// The Scene/UI subscribes to render results. This is what keeps e.g.
// XPManager totally ignorant of how/whether a HUD exists.
export const EventBus = new Phaser.Events.EventEmitter();
