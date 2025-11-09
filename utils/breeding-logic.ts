/**
 * Pokemon Breeding Logic
 * Probability calculations for breeding perfect Pokemon
 */

export interface BreedingInput {
  desiredIVs: number // Number of perfect IVs desired (0-6)
  parent1PerfectIVs: number // Number of perfect IVs on parent 1
  parent2PerfectIVs: number // Number of perfect IVs on parent 2
  hasDestinyKnot: boolean // Destiny Knot passes 5 IVs instead of 3
  hasEverstone: boolean // Everstone guarantees nature
  hasPowerItem: boolean // Power item guarantees specific IV
  shinyCharm: boolean // For shiny calculations
  masudaMethod: boolean // Breeding Pokemon from different regions
}

export interface BreedingResult {
  probability: number // 0-1
  odds: string // "1/X" format
  expectedEggs: number // Average eggs needed
  description: string[]
}

/**
 * Calculate probability of getting desired IV spread
 */
export function calculateIVProbability(input: BreedingInput): BreedingResult {
  const {
    desiredIVs,
    parent1PerfectIVs,
    parent2PerfectIVs,
    hasDestinyKnot,
    hasEverstone,
    hasPowerItem
  } = input

  const description: string[] = []

  // Total perfect IVs available from both parents (max 6)
  const totalPerfectIVs = Math.min(parent1PerfectIVs + parent2PerfectIVs, 6)

  if (desiredIVs > totalPerfectIVs) {
    description.push(`Impossible: Parents only have ${totalPerfectIVs} perfect IVs total`)
    return {
      probability: 0,
      odds: 'Impossible',
      expectedEggs: Infinity,
      description
    }
  }

  // With Destiny Knot: 5 IVs passed down, 1 random
  // Without: 3 IVs passed down, 3 random
  const inheritedIVs = hasDestinyKnot ? 5 : 3
  const randomIVs = 6 - inheritedIVs

  description.push(`${hasDestinyKnot ? 'Destiny Knot' : 'No Destiny Knot'}: ${inheritedIVs} IVs inherited, ${randomIVs} random`)

  if (hasEverstone) {
    description.push('Everstone: Nature guaranteed')
  }

  if (hasPowerItem) {
    description.push('Power Item: One specific IV guaranteed')
  }

  // Simplified calculation (actual breeding is complex)
  // Base probability for inheriting perfect IVs
  let probability = 1

  // Each inherited IV has a chance to be perfect
  for (let i = 0; i < desiredIVs; i++) {
    if (i < inheritedIVs) {
      // Inherited IV: depends on parent IVs
      const chanceFromParents = totalPerfectIVs / 6
      probability *= chanceFromParents
    } else {
      // Random IV: 1/32 chance of being perfect
      probability *= 1 / 32
    }
  }

  // With 6 perfect IV parents and Destiny Knot
  if (parent1PerfectIVs === 6 && parent2PerfectIVs === 6 && hasDestinyKnot) {
    if (desiredIVs === 6) {
      probability = 1 / 32 // Only 1 random IV needs to be perfect
      description.push('Both parents 6IV + Destiny Knot: Only need 1 random perfect IV')
    } else if (desiredIVs === 5) {
      probability = 1 // Guaranteed 5IV
      description.push('Both parents 6IV + Destiny Knot: 5IV guaranteed!')
    }
  }

  const odds = probability > 0 ? `1/${Math.round(1 / probability)}` : 'Impossible'
  const expectedEggs = probability > 0 ? Math.round(1 / probability) : Infinity

  return {
    probability,
    odds,
    expectedEggs,
    description
  }
}

/**
 * Calculate shiny probability
 */
export function calculateShinyProbability(input: BreedingInput): BreedingResult {
  const { masudaMethod, shinyCharm } = input
  const description: string[] = []

  let odds = 1 / 4096 // Base shiny odds in Gen 6+

  if (masudaMethod) {
    odds = 1 / 683 // Masuda Method
    description.push('Masuda Method (different regions): 1/683')
  }

  if (shinyCharm) {
    if (masudaMethod) {
      odds = 1 / 512 // Masuda + Charm
      description.push('+ Shiny Charm: 1/512')
    } else {
      odds = 1 / 1365 // Charm only
      description.push('Shiny Charm: 1/1365')
    }
  }

  if (!masudaMethod && !shinyCharm) {
    description.push('Base odds: 1/4096')
  }

  return {
    probability: odds,
    odds: `1/${Math.round(1 / odds)}`,
    expectedEggs: Math.round(1 / odds),
    description
  }
}

/**
 * Egg groups for breeding compatibility
 */
export const EGG_GROUPS = [
  'monster',
  'water1',
  'water2',
  'water3',
  'bug',
  'flying',
  'field',
  'fairy',
  'grass',
  'human-like',
  'mineral',
  'amorphous',
  'dragon',
  'ditto',
  'undiscovered'
]

/**
 * Check if two Pokemon can breed
 */
export function canBreed(
  pokemon1EggGroups: string[],
  pokemon2EggGroups: string[],
  pokemon1Gender: string | null,
  pokemon2Gender: string | null
): { compatible: boolean; reason?: string } {
  // Ditto can breed with anything except Undiscovered
  if (pokemon1EggGroups.includes('ditto')) {
    if (pokemon2EggGroups.includes('undiscovered')) {
      return { compatible: false, reason: 'Cannot breed with Undiscovered egg group' }
    }
    return { compatible: true }
  }

  if (pokemon2EggGroups.includes('ditto')) {
    if (pokemon1EggGroups.includes('undiscovered')) {
      return { compatible: false, reason: 'Cannot breed with Undiscovered egg group' }
    }
    return { compatible: true }
  }

  // Undiscovered cannot breed
  if (pokemon1EggGroups.includes('undiscovered') || pokemon2EggGroups.includes('undiscovered')) {
    return { compatible: false, reason: 'Pokemon in Undiscovered egg group cannot breed' }
  }

  // Must share at least one egg group
  const sharedGroups = pokemon1EggGroups.filter(group => pokemon2EggGroups.includes(group))
  if (sharedGroups.length === 0) {
    return { compatible: false, reason: 'No shared egg groups' }
  }

  // Must have compatible genders (one male, one female)
  if (pokemon1Gender && pokemon2Gender) {
    if (pokemon1Gender === pokemon2Gender) {
      return { compatible: false, reason: 'Same gender - cannot breed' }
    }
  }

  // Genderless can only breed with Ditto
  if (!pokemon1Gender || !pokemon2Gender) {
    return { compatible: false, reason: 'Genderless Pokemon can only breed with Ditto' }
  }

  return { compatible: true }
}

/**
 * Calculate steps needed to hatch an egg
 */
export function calculateHatchSteps(eggCycles: number, hasFlameBody: boolean): number {
  const baseSteps = eggCycles * 257 // Each cycle is 257 steps in Gen 9

  if (hasFlameBody) {
    return Math.floor(baseSteps / 2) // Flame Body halves steps
  }

  return baseSteps
}

/**
 * Recommended breeding path for perfect Pokemon
 */
export function getBreedingPath(targetPerfectIVs: number): string[] {
  const path: string[] = []

  if (targetPerfectIVs <= 3) {
    path.push('1. Catch or breed two Pokemon with at least 1-2 perfect IVs each')
    path.push('2. Give Destiny Knot to one parent')
    path.push('3. Breed until you get a Pokemon with 3 perfect IVs')
    path.push('4. Replace worst parent and continue breeding')
  } else if (targetPerfectIVs <= 5) {
    path.push('1. Start with two 3IV parents (from previous step or caught)')
    path.push('2. Give Destiny Knot to one parent, Everstone (for nature) to other')
    path.push('3. Breed until you get 4IV offspring')
    path.push('4. Replace a parent with the 4IV offspring')
    path.push('5. Breed until you get 5IV Pokemon')
  } else {
    path.push('1. Start with two 5IV parents')
    path.push('2. Give Destiny Knot to one parent, Everstone to other')
    path.push('3. Breed ~30 eggs (average) to get 6IV Pokemon')
    path.push('4. Patience is key! 6IV has ~1/32 odds with perfect parents')
  }

  return path
}
