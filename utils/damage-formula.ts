/**
 * Pokemon Damage Calculation Formula
 * Based on Generation 9 (Scarlet/Violet) damage formula
 */

export interface DamageCalculationInput {
  // Attacker
  level: number
  attack: number // Attacker's Attack or Sp. Atk stat
  attackStages: number // -6 to +6

  // Defender
  defense: number // Defender's Defense or Sp. Def stat
  defenseStages: number // -6 to +6

  // Move
  power: number
  moveType: string
  damageClass: 'physical' | 'special' | 'status'

  // Pokemon
  attackerTypes: string[]
  defenderTypes: string[]

  // Modifiers
  isCritical?: boolean
  effectiveness?: number // Type effectiveness multiplier
  weather?: 'sun' | 'rain' | 'sand' | 'snow' | null
  terrain?: 'electric' | 'grassy' | 'misty' | 'psychic' | null
  burn?: boolean // Attacker is burned (halves physical damage)
  screens?: boolean // Light Screen or Reflect active
  multiTarget?: boolean // Move hits multiple targets (0.75x)
  otherModifiers?: number // Product of other modifiers
}

export interface DamageResult {
  minDamage: number
  maxDamage: number
  minPercent: number
  maxPercent: number
  koChance: string
  isCritical: boolean
  effectiveness: number
  description: string[]
}

/**
 * Stage multipliers for stat changes
 */
const STAGE_MULTIPLIERS: Record<number, number> = {
  '-6': 2/8, '-5': 2/7, '-4': 2/6, '-3': 2/5, '-2': 2/4, '-1': 2/3,
  '0': 1,
  '1': 3/2, '2': 4/2, '3': 5/2, '4': 6/2, '5': 7/2, '6': 8/2
}

/**
 * Type effectiveness chart
 */
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

/**
 * Calculate type effectiveness
 */
export function calculateTypeEffectiveness(moveType: string, defenderTypes: string[]): number {
  let multiplier = 1

  for (const defenderType of defenderTypes) {
    const matchups = TYPE_CHART[moveType.toLowerCase()]
    if (matchups && matchups[defenderType.toLowerCase()] !== undefined) {
      multiplier *= matchups[defenderType.toLowerCase()]
    }
  }

  return multiplier
}

/**
 * Check if move gets STAB (Same Type Attack Bonus)
 */
export function hasSTAB(moveType: string, attackerTypes: string[]): boolean {
  return attackerTypes.some(type => type.toLowerCase() === moveType.toLowerCase())
}

/**
 * Calculate stat with stage modifiers
 */
function applyStages(stat: number, stages: number): number {
  const multiplier = STAGE_MULTIPLIERS[stages] || 1
  return Math.floor(stat * multiplier)
}

/**
 * Main damage calculation function
 */
export function calculateDamage(input: DamageCalculationInput, targetMaxHP: number): DamageResult {
  const {
    level,
    attack: baseAttack,
    defense: baseDefense,
    attackStages = 0,
    defenseStages = 0,
    power,
    moveType,
    damageClass,
    attackerTypes,
    defenderTypes,
    isCritical = false,
    effectiveness,
    weather = null,
    terrain = null,
    burn = false,
    screens = false,
    multiTarget = false,
    otherModifiers = 1,
  } = input

  const description: string[] = []

  // Status moves don't deal damage
  if (damageClass === 'status' || power === 0) {
    return {
      minDamage: 0,
      maxDamage: 0,
      minPercent: 0,
      maxPercent: 0,
      koChance: '0%',
      isCritical: false,
      effectiveness: 0,
      description: ['Status move - no damage dealt']
    }
  }

  // Apply stat stages (critical hits ignore defense boosts and attack drops)
  const attack = isCritical
    ? (attackStages < 0 ? baseAttack : applyStages(baseAttack, attackStages))
    : applyStages(baseAttack, attackStages)

  const defense = isCritical
    ? (defenseStages > 0 ? baseDefense : applyStages(baseDefense, defenseStages))
    : applyStages(baseDefense, defenseStages)

  // Base damage: ((2 * Level / 5 + 2) * Power * Attack / Defense) / 50 + 2
  let baseDamage = Math.floor(Math.floor(Math.floor((2 * level / 5 + 2) * power * attack / defense) / 50) + 2)

  // Modifiers
  let modifiers = 1

  // STAB (Same Type Attack Bonus): 1.5x
  if (hasSTAB(moveType, attackerTypes)) {
    modifiers *= 1.5
    description.push('STAB: 1.5x')
  }

  // Type effectiveness
  const effectivenessMultiplier = effectiveness !== undefined
    ? effectiveness
    : calculateTypeEffectiveness(moveType, defenderTypes)

  modifiers *= effectivenessMultiplier

  if (effectivenessMultiplier === 0) description.push('No effect')
  else if (effectivenessMultiplier < 1) description.push(`Not very effective (${effectivenessMultiplier}x)`)
  else if (effectivenessMultiplier > 1) description.push(`Super effective (${effectivenessMultiplier}x)`)

  // Critical hit: 1.5x
  if (isCritical) {
    modifiers *= 1.5
    description.push('Critical hit: 1.5x')
  }

  // Weather
  if (weather === 'sun' && moveType === 'fire') {
    modifiers *= 1.5
    description.push('Sun boost: 1.5x')
  } else if (weather === 'rain' && moveType === 'water') {
    modifiers *= 1.5
    description.push('Rain boost: 1.5x')
  } else if (weather === 'sun' && moveType === 'water') {
    modifiers *= 0.5
    description.push('Sun penalty: 0.5x')
  } else if (weather === 'rain' && moveType === 'fire') {
    modifiers *= 0.5
    description.push('Rain penalty: 0.5x')
  }

  // Burn (halves physical damage)
  if (burn && damageClass === 'physical') {
    modifiers *= 0.5
    description.push('Burn penalty: 0.5x')
  }

  // Screens (Reflect for physical, Light Screen for special)
  if (screens) {
    modifiers *= multiTarget ? 0.66 : 0.5
    description.push(`Screen active: ${multiTarget ? '0.66x' : '0.5x'}`)
  }

  // Multi-target moves
  if (multiTarget) {
    modifiers *= 0.75
    description.push('Multi-target: 0.75x')
  }

  // Other modifiers
  modifiers *= otherModifiers

  // Apply all modifiers
  baseDamage = Math.floor(baseDamage * modifiers)

  // Random factor: 0.85 to 1.00 (15 possible values)
  const minDamage = Math.floor(baseDamage * 0.85)
  const maxDamage = baseDamage

  // Calculate percentages
  const minPercent = Math.round((minDamage / targetMaxHP) * 1000) / 10
  const maxPercent = Math.round((maxDamage / targetMaxHP) * 1000) / 10

  // Calculate KO chance
  let koChance = '0%'
  if (minDamage >= targetMaxHP) {
    koChance = '100% (guaranteed KO)'
  } else if (maxDamage >= targetMaxHP) {
    // Calculate how many of the 16 rolls result in KO
    let koRolls = 0
    for (let i = 85; i <= 100; i++) {
      const damage = Math.floor(baseDamage * (i / 100))
      if (damage >= targetMaxHP) koRolls++
    }
    koChance = `${Math.round((koRolls / 16) * 100)}% (${koRolls}/16)`
  }

  return {
    minDamage,
    maxDamage,
    minPercent,
    maxPercent,
    koChance,
    isCritical,
    effectiveness: effectivenessMultiplier,
    description
  }
}

/**
 * Get effectiveness description
 */
export function getEffectivenessText(multiplier: number): string {
  if (multiplier === 0) return 'No effect'
  if (multiplier === 0.25) return 'Extremely not very effective'
  if (multiplier === 0.5) return 'Not very effective'
  if (multiplier === 1) return 'Normal effectiveness'
  if (multiplier === 2) return 'Super effective'
  if (multiplier === 4) return 'Extremely super effective'
  return `${multiplier}x effectiveness`
}
