import type { Pokemon, PokemonSpecies } from './pokemon'

// App-specific types (not from API)

export interface PokemonWithSpecies {
  pokemon: Pokemon
  species: PokemonSpecies | null
}

export interface FavoritePokemon {
  id: number
  addedAt: number
}

export interface Collection {
  id: string
  name: string
  pokemonIds: number[]
  createdAt: number
  updatedAt: number
}

export interface RecentlyViewed {
  id: number
  viewedAt: number
}

export interface TypeEffectiveness {
  doubleDamageTo: string[]
  halfDamageTo: string[]
  noDamageTo: string[]
  doubleDamageFrom: string[]
  halfDamageFrom: string[]
  noDamageFrom: string[]
}

export interface StatComparison {
  pokemonId: number
  stats: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
    total: number
  }
}

export interface SearchSuggestion {
  id: number
  name: string
  types: string[]
  sprite: string
}

export interface LoadingState {
  pokemons: boolean
  detail: boolean
  evolution: boolean
  species: boolean
}

export interface ErrorState {
  pokemons: string | null
  detail: string | null
  evolution: string | null
  species: string | null
}

// UI State
export interface UIState {
  theme: 'light' | 'dark'
  gridView: 'grid' | 'list'
  showShiny: boolean
  compactMode: boolean
  sidebarOpen: boolean
  filtersPanelOpen: boolean
}

// Toast/Notification
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
