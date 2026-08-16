// Power-up definitions. Only DOUBLE_SHOT is implemented (see
// systems/PowerUpManager.js). Others are reserved placeholders.
export const POWERUPS = {
  double_shot: {
    id: 'double_shot',
    name: 'Double Shot',
    durationMs: 8000,
    dropChance: 0.06, // chance a killed enemy drops this
    color: 0x37e0ff
  },

  // Reserved for future phases.
  triple_shot: { id: 'triple_shot', name: 'Triple Shot' },
  shield: { id: 'shield', name: 'Shield' },
  laser: { id: 'laser', name: 'Laser' },
  missile: { id: 'missile', name: 'Missile' },
  nova: { id: 'nova', name: 'Nova' }
};

export function getPowerUpConfig(powerUpId) {
  return POWERUPS[powerUpId];
}
