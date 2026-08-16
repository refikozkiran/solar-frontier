// Default stats for the starting ship. PlayerShip reads from this; nothing
// in entities/PlayerShip.js should ever contain a raw balance number.
export const SHIPS = {
  explorer_mk1: {
    id: 'explorer_mk1',
    name: 'Explorer MK-I',
    maxHP: 3,
    speed: 900, // px/sec, used for drag-follow smoothing ceiling
    damage: 1, // base multiplier applied on top of weapon damage
    fireRate: 1, // multiplier applied on top of weapon fireRate
    projectileSpeed: 1, // multiplier applied on top of weapon projectileSpeed
    energy: 100,
    maxEnergy: 100,
    shield: 0,
    criticalChance: 0.05,
    criticalMultiplier: 2,
    startingWeapon: 'basic_blaster',
    invulnerabilityDurationMs: 1200,
    dragSmoothing: 0.22 // 0-1, higher = snappier follow
  }
};

export const DEFAULT_SHIP_ID = 'explorer_mk1';

export function getShipConfig(shipId = DEFAULT_SHIP_ID) {
  return SHIPS[shipId] ?? SHIPS[DEFAULT_SHIP_ID];
}
