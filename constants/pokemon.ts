// Pokemon Constants

export const TOTAL_POKEMON = 1025 // As of Gen 9

export const POKEMON_PER_PAGE = 25

export const TYPE_COLORS: Record<string, string> = {
  normal: '#aab09f',
  fire: '#ee8130',
  fighting: '#cb5f48',
  water: '#6390f0',
  poison: '#a33ea1',
  electric: '#f7d02c',
  ground: '#e2bf65',
  grass: '#7ac74c',
  flying: '#7da6de',
  ice: '#96d9d6',
  bug: '#a6b91a',
  psychic: '#f95587',
  rock: '#b6a136',
  dragon: '#6a7baf',
  ghost: '#735797',
  dark: '#736c75',
  steel: '#89a1b0',
  fairy: '#d685ad',
}

export const TYPE_GRADIENTS: Record<string, string> = {
  normal: 'linear-gradient(135deg, #aab09f 0%, #9099a3 100%)',
  fire: 'linear-gradient(135deg, #ee8130 0%, #f96854 100%)',
  fighting: 'linear-gradient(135deg, #cb5f48 0%, #d97853 100%)',
  water: 'linear-gradient(135deg, #6390f0 0%, #4e8ddd 100%)',
  poison: 'linear-gradient(135deg, #a33ea1 0%, #b658b3 100%)',
  electric: 'linear-gradient(135deg, #f7d02c 0%, #f9e055 100%)',
  ground: 'linear-gradient(135deg, #e2bf65 0%, #e8cf8f 100%)',
  grass: 'linear-gradient(135deg, #7ac74c 0%, #91d76f 100%)',
  flying: 'linear-gradient(135deg, #7da6de 0%, #98b9e8 100%)',
  ice: 'linear-gradient(135deg, #96d9d6 0%, #b3e4e2 100%)',
  bug: 'linear-gradient(135deg, #a6b91a 0%, #b8ca44 100%)',
  psychic: 'linear-gradient(135deg, #f95587 0%, #fa77a1 100%)',
  rock: 'linear-gradient(135deg, #b6a136 0%, #c7b65d 100%)',
  dragon: 'linear-gradient(135deg, #6a7baf 0%, #8594c4 100%)',
  ghost: 'linear-gradient(135deg, #735797 0%, #8f78ad 100%)',
  dark: 'linear-gradient(135deg, #736c75 0%, #8f888f 100%)',
  steel: 'linear-gradient(135deg, #89a1b0 0%, #a1b7c4 100%)',
  fairy: 'linear-gradient(135deg, #d685ad 0%, #e1a1c3 100%)',
}

export const GENERATIONS = [
  { id: 1, name: 'Generation I', region: 'Kanto', range: [1, 151] },
  { id: 2, name: 'Generation II', region: 'Johto', range: [152, 251] },
  { id: 3, name: 'Generation III', region: 'Hoenn', range: [252, 386] },
  { id: 4, name: 'Generation IV', region: 'Sinnoh', range: [387, 493] },
  { id: 5, name: 'Generation V', region: 'Unova', range: [494, 649] },
  { id: 6, name: 'Generation VI', region: 'Kalos', range: [650, 721] },
  { id: 7, name: 'Generation VII', region: 'Alola', range: [722, 809] },
  { id: 8, name: 'Generation VIII', region: 'Galar', range: [810, 905] },
  { id: 9, name: 'Generation IX', region: 'Paldea', range: [906, 1025] },
]

export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
}

export const STAT_COLORS: Record<string, string> = {
  hp: '#ff5959',
  attack: '#f08030',
  defense: '#f8d030',
  'special-attack': '#6890f0',
  'special-defense': '#78c850',
  speed: '#f85888',
}

export const CACHE_TTL = {
  POKEMON: 1000 * 60 * 60 * 24, // 24 hours
  POKEMON_LIST: 1000 * 60 * 30, // 30 minutes
  SPECIES: 1000 * 60 * 60 * 24, // 24 hours
  EVOLUTION: 1000 * 60 * 60 * 24, // 24 hours
  TYPE: 1000 * 60 * 60 * 24 * 7, // 7 days
  ABILITY: 1000 * 60 * 60 * 24 * 7, // 7 days
  MOVE: 1000 * 60 * 60 * 24 * 7, // 7 days
}

export const API_ENDPOINTS = {
  POKEMON: '/pokemon',
  POKEMON_SPECIES: '/pokemon-species',
  EVOLUTION_CHAIN: '/evolution-chain',
  TYPE: '/type',
  ABILITY: '/ability',
  MOVE: '/move',
  GENERATION: '/generation',
} as const

export const SORT_OPTIONS = [
  { value: 'id', label: 'Pokédex Number' },
  { value: 'name', label: 'Name' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'special-attack', label: 'Sp. Attack' },
  { value: 'special-defense', label: 'Sp. Defense' },
  { value: 'speed', label: 'Speed' },
] as const
