/**
 * Random Pokemon Generators
 * For creating random teams, challenges, and fun generators
 */

export interface RandomFilters {
  generation?: number
  types?: string[]
  legendary?: boolean
  minStats?: number
  maxStats?: number
}

/**
 * Generate random Pokemon ID within constraints
 */
export function getRandomPokemonId(filters: RandomFilters = {}): number {
  const { generation, minStats, maxStats } = filters

  let min = 1
  let max = 1025 // Total Pokemon as of Gen 9

  // Generation ranges
  if (generation) {
    const ranges: Record<number, [number, number]> = {
      1: [1, 151],
      2: [152, 251],
      3: [252, 386],
      4: [387, 493],
      5: [494, 649],
      6: [650, 721],
      7: [722, 809],
      8: [810, 905],
      9: [906, 1025]
    }
    if (ranges[generation]) {
      [min, max] = ranges[generation]
    }
  }

  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random team of 6 Pokemon
 */
export function generateRandomTeam(count: number = 6, filters: RandomFilters = {}): number[] {
  const team: Set<number> = new Set()

  while (team.size < count) {
    const id = getRandomPokemonId(filters)
    team.add(id)
  }

  return Array.from(team)
}

/**
 * Generate Nuzlocke rules for a run
 */
export interface NuzlockeRules {
  permadeath: boolean // Fainted Pokemon are considered "dead"
  onePerRoute: boolean // Can only catch first Pokemon on each route
  nickname: boolean // Must nickname all Pokemon
  dupeClause: boolean // Can skip duplicate species
  noItems: boolean // No items in battle
  levelCap: boolean // Can't level past next gym leader
  shinyClause: boolean // Can catch shinies even if not first
}

export function getDefaultNuzlockeRules(): NuzlockeRules {
  return {
    permadeath: true,
    onePerRoute: true,
    nickname: true,
    dupeClause: false,
    noItems: false,
    levelCap: false,
    shinyClause: true
  }
}

/**
 * Generate Monotype challenge
 */
export function generateMonotypeChallenge(): string {
  const types = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]

  return types[Math.floor(Math.random() * types.length)]
}

/**
 * Generate stat-limited challenge
 */
export interface StatChallenge {
  type: 'total' | 'individual'
  stat?: string
  limit: number
  description: string
}

export function generateStatChallenge(): StatChallenge {
  const challenges: StatChallenge[] = [
    {
      type: 'total',
      limit: 2400,
      description: 'Build a team with total base stats under 2400 (avg 400 per Pokemon)'
    },
    {
      type: 'total',
      limit: 3000,
      description: 'Build a team with total base stats under 3000 (avg 500 per Pokemon)'
    },
    {
      type: 'individual',
      stat: 'hp',
      limit: 80,
      description: 'Build a team where no Pokemon has HP over 80'
    },
    {
      type: 'individual',
      stat: 'speed',
      limit: 60,
      description: 'Slow team: No Pokemon with Speed over 60'
    },
    {
      type: 'individual',
      stat: 'attack',
      limit: 70,
      description: 'Low power: No Pokemon with Attack over 70'
    }
  ]

  return challenges[Math.floor(Math.random() * challenges.length)]
}

/**
 * Generate generation-limited challenge
 */
export function generateGenerationChallenge(): { generation: number; description: string } {
  const gen = Math.floor(Math.random() * 9) + 1

  const regions: Record<number, string> = {
    1: 'Kanto',
    2: 'Johto',
    3: 'Hoenn',
    4: 'Sinnoh',
    5: 'Unova',
    6: 'Kalos',
    7: 'Alola',
    8: 'Galar',
    9: 'Paldea'
  }

  return {
    generation: gen,
    description: `Build a team using only Generation ${gen} Pokemon (${regions[gen]})`
  }
}

/**
 * Generate color-based challenge
 */
export function generateColorChallenge(): { color: string; description: string } {
  const colors = ['red', 'blue', 'yellow', 'green', 'black', 'white', 'purple', 'pink', 'brown']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    color,
    description: `Build a team of ${color}-colored Pokemon`
  }
}

/**
 * Generate fully random challenge
 */
export interface RandomChallenge {
  type: string
  description: string
  teamSize?: number
  filters?: RandomFilters
  rules?: Partial<NuzlockeRules>
}

export function generateRandomChallenge(): RandomChallenge {
  const challengeTypes = [
    'monotype',
    'generation',
    'stat-limit',
    'color',
    'random-team',
    'nuzlocke'
  ]

  const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]

  switch (type) {
    case 'monotype':
      return {
        type: 'monotype',
        description: `Monotype Challenge: ${generateMonotypeChallenge().toUpperCase()}`
      }
    case 'generation':
      const genChallenge = generateGenerationChallenge()
      return {
        type: 'generation',
        description: genChallenge.description,
        filters: { generation: genChallenge.generation }
      }
    case 'stat-limit':
      const statChallenge = generateStatChallenge()
      return {
        type: 'stat-limit',
        description: statChallenge.description
      }
    case 'color':
      const colorChallenge = generateColorChallenge()
      return {
        type: 'color',
        description: colorChallenge.description
      }
    case 'random-team':
      return {
        type: 'random-team',
        description: 'Build a completely random team of 6 Pokemon',
        teamSize: 6
      }
    case 'nuzlocke':
      return {
        type: 'nuzlocke',
        description: 'Nuzlocke Challenge: Permadeath + One Pokemon per route',
        rules: getDefaultNuzlockeRules()
      }
    default:
      return {
        type: 'random-team',
        description: 'Random team challenge',
        teamSize: 6
      }
  }
}

/**
 * Get daily Pokemon (deterministic based on date)
 */
export function getDailyPokemonId(): number {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

  // Use day of year as seed for consistent daily Pokemon
  return (dayOfYear % 1025) + 1
}

/**
 * Get Pokemon of the day with trivia
 */
export interface PokemonOfTheDay {
  id: number
  date: string
  streak: number
}

export function getTodaysPokemon(): PokemonOfTheDay {
  const today = new Date().toISOString().split('T')[0]

  return {
    id: getDailyPokemonId(),
    date: today,
    streak: 0 // Will be set by store
  }
}
