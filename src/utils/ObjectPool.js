/**
 * Generic pool built on top of a Phaser Arcade Physics Group.
 *
 * Rather than scene.add / gameObject.destroy() every frame (which causes GC
 * churn on mobile), we keep a fixed group of instances and recycle them.
 * factoryFn creates a brand-new instance (only called until the group hits
 * maxSize); resetFn re-initializes a recycled instance before reuse.
 */
export class ObjectPool {
  /**
   * @param {Phaser.Scene} scene
   * @param {Function} factoryFn () => GameObject, called to create a fresh instance
   * @param {Function} resetFn (instance, ...args) => void, called to reinit a reused instance
   * @param {number} maxSize hard cap on pool size
   */
  constructor(scene, factoryFn, resetFn, maxSize = 200) {
    this.scene = scene;
    this.factoryFn = factoryFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
  }

  /** Acquire an instance, creating one if none are free (and under maxSize). */
  acquire(...args) {
    let instance = this.pool.find((obj) => !obj.active);

    if (!instance) {
      if (this.pool.length >= this.maxSize) {
        // Pool exhausted — reuse the oldest active instance rather than
        // uncontrolled growth. This is a soft cap; visually imperceptible
        // since it only triggers under extreme on-screen counts.
        instance = this.pool[0];
      } else {
        instance = this.factoryFn();
        this.pool.push(instance);
      }
    }

    this.resetFn(instance, ...args);
    instance.setActive(true);
    instance.setVisible(true);
    return instance;
  }

  /** Return an instance to the pool. */
  release(instance) {
    instance.setActive(false);
    instance.setVisible(false);
    instance.setPosition(-200, -200);
    if (instance.body) {
      instance.body.stop();
      instance.body.enable = false;
    }
  }

  releaseAll() {
    this.pool.forEach((obj) => this.release(obj));
  }

  getActiveCount() {
    return this.pool.filter((obj) => obj.active).length;
  }
}
