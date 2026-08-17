// Data for all 8 planets. Only Mercury has playable levels right now
// (see data/levels.js). The rest exist so LevelManager / a future map
// screen can already iterate over the full solar system.
export const PLANETS = [
  {
    id: 'mercury',
    name: 'mercury',
    displayName: 'Mercury',
    mapSymbol: '\u263F', // ☿
    theme: { primary: 0xff8a3d, secondary: 0x2b1607, background: 0x120a05 },
    background: 'starfield_scorched',
    stone: 'mercury_stone',
    enemies: ['basic', 'chaser', 'shooter', 'tank', 'elite'],
    bosses: ['metal_crawler', 'mercury_drone', 'solar_beast', 'heat_titan', 'crater_guardian', 'meteor_king', 'plasma_destroyer', 'energy_titan', 'core_guardian', 'mercury_overlord'],
    specialMechanic: null,
    unlocked: true,
    levelCount: 50, // fully authored in data/mercuryLevels.js
    totalLevels: 50
  },
  {
    id: 'venus',
    name: 'venus',
    displayName: 'Venus',
    mapSymbol: '\u2640',
    theme: { primary: 0xffd27d, secondary: 0x2b230a, background: 0x11100a },
    background: 'starfield_toxic',
    stone: 'venus_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'earth',
    name: 'earth',
    displayName: 'Earth',
    mapSymbol: '\u2641',
    theme: { primary: 0x4da6ff, secondary: 0x0a1f2b, background: 0x050e14 },
    background: 'starfield_home',
    stone: 'earth_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'mars',
    name: 'mars',
    displayName: 'Mars',
    mapSymbol: '\u2642',
    theme: { primary: 0xff5544, secondary: 0x2b0a0a, background: 0x140505 },
    background: 'starfield_red',
    stone: 'mars_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'jupiter',
    name: 'jupiter',
    displayName: 'Jupiter',
    mapSymbol: '\u2643',
    theme: { primary: 0xd9a066, secondary: 0x241a0a, background: 0x120d05 },
    background: 'starfield_giant',
    stone: 'jupiter_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'saturn',
    name: 'saturn',
    displayName: 'Saturn',
    mapSymbol: '\u2644',
    theme: { primary: 0xf0d9a0, secondary: 0x2b240a, background: 0x141005 },
    background: 'starfield_rings',
    stone: 'saturn_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'uranus',
    name: 'uranus',
    displayName: 'Uranus',
    mapSymbol: '\u2645',
    theme: { primary: 0x7de0ff, secondary: 0x0a222b, background: 0x05121a },
    background: 'starfield_ice',
    stone: 'uranus_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  },
  {
    id: 'neptune',
    name: 'neptune',
    displayName: 'Neptune',
    mapSymbol: '\u2646',
    theme: { primary: 0x5566ff, secondary: 0x0a0a2b, background: 0x050514 },
    background: 'starfield_void',
    stone: 'neptune_stone',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0,
    totalLevels: 50
  }
];

export function getPlanet(planetId) {
  return PLANETS.find((p) => p.id === planetId);
}
