/**
 * Stat Calculation Utilities
 * Formulas for calculating Pokemon stats, IVs, and EVs
 */

export interface StatCalculationInput {
  base: number
  level: number
  iv: number
  ev: number
  nature: number // 0.9, 1.0, or 1.1
}

export interface IVCalculationInput {
  base: number
  level: number
  stat: number
  ev: number
  nature: number
}

export interface Nature {
  name: string
  increased?: string
  decreased?: string
}

/**
 * Calculate a Pokemon's stat using the standard formula
 * HP uses a different formula than other stats
 */
export function calculateStat(input: StatCalculationInput, isHP = false): number {
  const { base, level, iv, ev, nature } = input

  if (isHP) {
    // HP Formula: ((2 * Base + IV + (EV/4)) * Level / 100) + Level + 10
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
  } else {
    // Other Stats: (((2 * Base + IV + (EV/4)) * Level / 100) + 5) * Nature
    return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature)
  }
}

/**
 * Calculate IV range from observed stat
 * Returns [minIV, maxIV]
 */
export function calculateIVRange(input: IVCalculationInput, isHP = false): [number, number] {
  const { base, level, stat, ev, nature } = input
  const ivResults: number[] = []

  // Try all possible IVs (0-31)
  for (let iv = 0; iv <= 31; iv++) {
    const calculatedStat = calculateStat({ base, level, iv, ev, nature }, isHP)
    if (calculatedStat === stat) {
      ivResults.push(iv)
    }
  }

  if (ivResults.length === 0) {
    return [0, 31] // No match found, return full range
  }

  return [Math.min(...ivResults), Math.max(...ivResults)]
}

/**
 * Calculate maximum stat with perfect IVs and EVs
 */
export function calculateMaxStat(base: number, level: number, nature: number, isHP = false): number {
  return calculateStat({ base, level, iv: 31, ev: 252, nature }, isHP)
}

/**
 * Calculate minimum stat with zero IVs and EVs
 */
export function calculateMinStat(base: number, level: number, nature: number, isHP = false): number {
  return calculateStat({ base, level, iv: 0, ev: 0, nature }, isHP)
}

/**
 * Pokemon natures and their stat modifiers
 */
export const NATURES: Record<string, Nature> = {
  adamant: { name: 'Adamant', increased: 'attack', decreased: 'special-attack' },
  bashful: { name: 'Bashful' }, // Neutral
  bold: { name: 'Bold', increased: 'defense', decreased: 'attack' },
  brave: { name: 'Brave', increased: 'attack', decreased: 'speed' },
  calm: { name: 'Calm', increased: 'special-defense', decreased: 'attack' },
  careful: { name: 'Careful', increased: 'special-defense', decreased: 'special-attack' },
  docile: { name: 'Docile' }, // Neutral
  gentle: { name: 'Gentle', increased: 'special-defense', decreased: 'defense' },
  hardy: { name: 'Hardy' }, // Neutral
  hasty: { name: 'Hasty', increased: 'speed', decreased: 'defense' },
  impish: { name: 'Impish', increased: 'defense', decreased: 'special-attack' },
  jolly: { name: 'Jolly', increased: 'speed', decreased: 'special-attack' },
  lax: { name: 'Lax', increased: 'defense', decreased: 'special-defense' },
  lonely: { name: 'Lonely', increased: 'attack', decreased: 'defense' },
  mild: { name: 'Mild', increased: 'special-attack', decreased: 'defense' },
  modest: { name: 'Modest', increased: 'special-attack', decreased: 'attack' },
  naive: { name: 'Naive', increased: 'speed', decreased: 'special-defense' },
  naughty: { name: 'Naughty', increased: 'attack', decreased: 'special-defense' },
  quiet: { name: 'Quiet', increased: 'special-attack', decreased: 'speed' },
  quirky: { name: 'Quirky' }, // Neutral
  rash: { name: 'Rash', increased: 'special-attack', decreased: 'special-defense' },
  relaxed: { name: 'Relaxed', increased: 'defense', decreased: 'speed' },
  sassy: { name: 'Sassy', increased: 'special-defense', decreased: 'speed' },
  serious: { name: 'Serious' }, // Neutral
  timid: { name: 'Timid', increased: 'speed', decreased: 'attack' },
}

/**
 * Get nature modifier for a specific stat
 */
export function getNatureModifier(natureName: string, statName: string): number {
  const nature = NATURES[natureName.toLowerCase()]
  if (!nature) return 1.0

  if (nature.increased === statName) return 1.1
  if (nature.decreased === statName) return 0.9
  return 1.0
}

/**
 * Validate EV total (max 510 total, max 252 per stat)
 */
export function validateEVs(evs: Record<string, number>): { valid: boolean; error?: string } {
  const total = Object.values(evs).reduce((sum, ev) => sum + ev, 0)

  if (total > 510) {
    return { valid: false, error: `Total EVs (${total}) exceed maximum of 510` }
  }

  for (const [stat, ev] of Object.entries(evs)) {
    if (ev > 252) {
      return { valid: false, error: `${stat} EVs (${ev}) exceed maximum of 252` }
    }
    if (ev < 0) {
      return { valid: false, error: `${stat} EVs (${ev}) cannot be negative` }
    }
  }

  return { valid: true }
}

/**
 * Calculate all stats for a Pokemon
 */
export function calculateAllStats(
  baseStats: Record<string, number>,
  level: number,
  ivs: Record<string, number>,
  evs: Record<string, number>,
  natureName: string
): Record<string, number> {
  const stats: Record<string, number> = {}

  for (const [statName, base] of Object.entries(baseStats)) {
    const iv = ivs[statName] || 0
    const ev = evs[statName] || 0
    const nature = getNatureModifier(natureName, statName)
    const isHP = statName === 'hp'

    stats[statName] = calculateStat({ base, level, iv, ev, nature }, isHP)
  }

  return stats
}
