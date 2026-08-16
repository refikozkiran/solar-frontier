export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/** Rolls a critical hit against a 0-1 chance and returns the (possibly boosted) damage. */
export function rollDamage(baseDamage, criticalChance, criticalMultiplier) {
  const isCritical = Math.random() < criticalChance;
  return {
    amount: isCritical ? Math.round(baseDamage * criticalMultiplier) : baseDamage,
    isCritical
  };
}
