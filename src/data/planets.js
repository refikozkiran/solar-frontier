// Data for all 8 planets. Only Mercury has playable levels right now
// (see data/levels.js). The rest exist so LevelManager / a future map
// screen can already iterate over the full solar system.
export const PLANETS = [
  {
    id: 'mercury',
    name: 'mercury',
    displayName: 'Mercury',
    theme: { primary: 0xff8a3d, secondary: 0x2b1607, background: 0x120a05 },
    background: 'starfield_scorched',
    stone: 'stone_of_flame',
    enemies: ['basic', 'chaser'],
    bosses: [],
    specialMechanic: null,
    unlocked: true,
    levelCount: 1 // grows toward 400 as levels are authored
  },
  {
    id: 'venus',
    name: 'venus',
    displayName: 'Venus',
    theme: { primary: 0xffd27d, secondary: 0x2b230a, background: 0x11100a },
    background: 'starfield_toxic',
    stone: 'stone_of_storms',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'earth',
    name: 'earth',
    displayName: 'Earth',
    theme: { primary: 0x4da6ff, secondary: 0x0a1f2b, background: 0x050e14 },
    background: 'starfield_home',
    stone: 'stone_of_life',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'mars',
    name: 'mars',
    displayName: 'Mars',
    theme: { primary: 0xff5544, secondary: 0x2b0a0a, background: 0x140505 },
    background: 'starfield_red',
    stone: 'stone_of_war',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'jupiter',
    name: 'jupiter',
    displayName: 'Jupiter',
    theme: { primary: 0xd9a066, secondary: 0x241a0a, background: 0x120d05 },
    background: 'starfield_giant',
    stone: 'stone_of_gravity',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'saturn',
    name: 'saturn',
    displayName: 'Saturn',
    theme: { primary: 0xf0d9a0, secondary: 0x2b240a, background: 0x141005 },
    background: 'starfield_rings',
    stone: 'stone_of_time',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'uranus',
    name: 'uranus',
    displayName: 'Uranus',
    theme: { primary: 0x7de0ff, secondary: 0x0a222b, background: 0x05121a },
    background: 'starfield_ice',
    stone: 'stone_of_frost',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  },
  {
    id: 'neptune',
    name: 'neptune',
    displayName: 'Neptune',
    theme: { primary: 0x5566ff, secondary: 0x0a0a2b, background: 0x050514 },
    background: 'starfield_void',
    stone: 'stone_of_the_void',
    enemies: [],
    bosses: [],
    specialMechanic: null,
    unlocked: false,
    levelCount: 0
  }
];

export function getPlanet(planetId) {
  return PLANETS.find((p) => p.id === planetId);
}
