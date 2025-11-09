import { defineStore } from 'pinia'
import type { Pokemon, PokemonSpecies } from '~/types'

interface PokemonState {
  pokemons: Pokemon[]
  currentPokemon: Pokemon | null
  currentSpecies: PokemonSpecies | null
  loading: {
    list: boolean
    detail: boolean
    species: boolean
  }
  error: {
    list: string | null
    detail: string | null
    species: string | null
  }
  pagination: {
    page: number
    limit: number
    total: number
    offset: number
  }
}

export const usePokemonStore = defineStore('pokemon', {
  state: (): PokemonState => ({
    pokemons: [],
    currentPokemon: null,
    currentSpecies: null,
    loading: {
      list: false,
      detail: false,
      species: false,
    },
    error: {
      list: null,
      detail: null,
      species: null,
    },
    pagination: {
      page: 0,
      limit: 25,
      total: 1025,
      offset: 0,
    },
  }),

  getters: {
    /**
     * Get Pokemon by ID
     */
    getPokemonById: (state) => (id: number) => {
      return state.pokemons.find((p) => p.id === id)
    },

    /**
     * Get Pokemon by name
     */
    getPokemonByName: (state) => (name: string) => {
      return state.pokemons.find((p) => p.name === name)
    },

    /**
     * Check if has more Pokemon to load
     */
    hasMore: (state) => {
      return state.pagination.offset < state.pagination.total
    },

    /**
     * Get total loaded Pokemon
     */
    totalLoaded: (state) => {
      return state.pokemons.length
    },

    /**
     * Check if any loading is in progress
     */
    isLoading: (state) => {
      return (
        state.loading.list || state.loading.detail || state.loading.species
      )
    },
  },

  actions: {
    /**
     * Fetch Pokemon list with pagination
     */
    async fetchPokemons(page?: number) {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase as string

      if (page !== undefined) {
        this.pagination.page = page
        this.pagination.offset = page * this.pagination.limit
      }

      this.loading.list = true
      this.error.list = null

      try {
        // Fetch Pokemon list
        const listData = await $fetch<any>(
          `${baseURL}/pokemon`,
          {
            params: {
              limit: this.pagination.limit,
              offset: this.pagination.offset,
            },
          }
        )

        if (!listData || !listData.results) {
          this.error.list = 'No data received'
          return
        }

        // Extract Pokemon IDs
        const pokemonIds = listData.results.map((p: any) => {
          const parts = p.url.split('/')
          return parts[parts.length - 2]
        })

        // Fetch detailed data for each Pokemon
        const pokemonPromises = pokemonIds.map((id: string) =>
          $fetch<Pokemon>(`${baseURL}/pokemon/${id}`)
        )

        const detailedPokemons = await Promise.all(pokemonPromises)

        if (detailedPokemons) {
          // Append to existing list
          this.pokemons.push(...detailedPokemons)
          this.pagination.page++
          this.pagination.offset += this.pagination.limit
        }
      } catch (err: any) {
        this.error.list = err.message || 'Failed to fetch Pokemon'
      } finally {
        this.loading.list = false
      }
    },

    /**
     * Fetch a single Pokemon by ID
     */
    async fetchPokemonById(id: number | string) {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase as string

      this.loading.detail = true
      this.error.detail = null
      this.currentPokemon = null

      try {
        const pokemon = await $fetch<Pokemon>(`${baseURL}/pokemon/${id}`)

        if (pokemon) {
          this.currentPokemon = pokemon

          // Also add to list if not already there
          const exists = this.pokemons.find((p) => p.id === pokemon.id)
          if (!exists) {
            this.pokemons.push(pokemon)
          }
        }
      } catch (err: any) {
        this.error.detail = err.message || 'Failed to fetch Pokemon'
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * Fetch Pokemon species data
     */
    async fetchPokemonSpecies(id: number | string) {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBase as string

      this.loading.species = true
      this.error.species = null
      this.currentSpecies = null

      try {
        const species = await $fetch<PokemonSpecies>(`${baseURL}/pokemon-species/${id}`)

        if (species) {
          this.currentSpecies = species
        }
      } catch (err: any) {
        this.error.species = err.message || 'Failed to fetch species data'
      } finally {
        this.loading.species = false
      }
    },

    /**
     * Clear current Pokemon data
     */
    clearCurrent() {
      this.currentPokemon = null
      this.currentSpecies = null
      this.error.detail = null
      this.error.species = null
    },

    /**
     * Reset Pokemon list
     */
    resetList() {
      this.pokemons = []
      this.pagination.page = 0
      this.pagination.offset = 0
      this.error.list = null
    },

    /**
     * Reset all state
     */
    resetAll() {
      this.$reset()
    },
  },
})
