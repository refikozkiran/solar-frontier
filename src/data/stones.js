// The Eight Stones — one per planet, collected by clearing that planet's
// final boss level. Only mercury_stone is reachable in this phase; the rest
// exist so GameState.stones / SaveManager already have a stable, complete
// shape before Venus..Neptune are implemented.
export const STONES = {
  mercury_stone: { id: 'mercury_stone', planet: 'mercury', name: 'Mercury Stone', collected: false },
  venus_stone: { id: 'venus_stone', planet: 'venus', name: 'Venus Stone', collected: false },
  earth_stone: { id: 'earth_stone', planet: 'earth', name: 'Earth Stone', collected: false },
  mars_stone: { id: 'mars_stone', planet: 'mars', name: 'Mars Stone', collected: false },
  jupiter_stone: { id: 'jupiter_stone', planet: 'jupiter', name: 'Jupiter Stone', collected: false },
  saturn_stone: { id: 'saturn_stone', planet: 'saturn', name: 'Saturn Stone', collected: false },
  uranus_stone: { id: 'uranus_stone', planet: 'uranus', name: 'Uranus Stone', collected: false },
  neptune_stone: { id: 'neptune_stone', planet: 'neptune', name: 'Neptune Stone', collected: false }
};

export function getStoneConfig(stoneId) {
  return STONES[stoneId];
}

export function getStoneIdForPlanet(planetId) {
  return Object.values(STONES).find((s) => s.planet === planetId)?.id ?? null;
}

/** Default, unsaved shape for GameState.stones / a fresh save payload. */
export function createDefaultStoneState() {
  return Object.fromEntries(Object.keys(STONES).map((id) => [id.replace('_stone', ''), false]));
}
