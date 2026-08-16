// Weapon definitions. Only 'basic_blaster' is wired to a behavior in
// systems/WeaponManager.js right now. The other ids are reserved here so
// future phases add behavior + data without touching this file's shape.
export const WEAPONS = {
  basic_blaster: {
    id: 'basic_blaster',
    name: 'Basic Blaster',
    behavior: 'straight_single', // maps to a firing pattern in WeaponManager
    damage: 1,
    fireRateMs: 350, // ms between shots
    projectileSpeed: 700, // px/sec
    projectileType: 'basic',
    upgradeable: true
  },

  // Reserved for later phases (Double Shot / Triple Shot / Laser / Missile /
  // Plasma / Nova). Intentionally not implemented yet per spec.
  double_shot: { id: 'double_shot', name: 'Double Shot', behavior: 'straight_double' },
  triple_shot: { id: 'triple_shot', name: 'Triple Shot', behavior: 'straight_triple' },
  laser: { id: 'laser', name: 'Laser', behavior: 'beam' },
  missile: { id: 'missile', name: 'Missile', behavior: 'homing' },
  plasma: { id: 'plasma', name: 'Plasma', behavior: 'charged' },
  nova: { id: 'nova', name: 'Nova', behavior: 'radial' }
};

export function getWeaponConfig(weaponId) {
  return WEAPONS[weaponId];
}
