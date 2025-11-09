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
      const api = usePokemonApi()

      if (page !== undefined) {
        this.pagination.page = page
        this.pagination.offset = page * this.pagination.limit
      }

      this.loading.list = true
      this.error.list = null

      try {
        const { data, error } = await api.getPokemonList(
          this.pagination.limit,
          this.pagination.offset
        )

        if (error.value) {
          this.error.list = error.value.message || 'Failed to fetch Pokemon'
          return
        }

        if (!data.value) {
          this.error.list = 'No data received'
          return
        }

        // Fetch detailed data for each Pokemon
        const pokemonUrls = data.value.results.map((p) => p.url)
        const pokemonIds = pokemonUrls.map((url) => {
          const parts = url.split('/')
          return parts[parts.length - 2]
        })

        const { data: detailedPokemons, error: batchError } =
          await api.getPokemonBatch(pokemonIds)

        if (batchError) {
          this.error.list = 'Failed to fetch Pokemon details'
          return
        }

        if (detailedPokemons) {
          // Append to existing list
          this.pokemons.push(...detailedPokemons)
          this.pagination.page++
          this.pagination.offset += this.pagination.limit
        }
      } catch (err: any) {
        this.error.list = err.message || 'Unknown error occurred'
      } finally {
        this.loading.list = false
      }
    },

    /**
     * Fetch a single Pokemon by ID
     */
    async fetchPokemonById(id: number | string) {
      const api = usePokemonApi()

      this.loading.detail = true
      this.error.detail = null
      this.currentPokemon = null

      try {
        const { data, error } = await api.getPokemon(id)

        if (error.value) {
          this.error.detail = error.value.message || 'Failed to fetch Pokemon'
          return
        }

        if (data.value) {
          this.currentPokemon = data.value

          // Also add to list if not already there
          const exists = this.pokemons.find((p) => p.id === data.value!.id)
          if (!exists) {
            this.pokemons.push(data.value)
          }
        }
      } catch (err: any) {
        this.error.detail = err.message || 'Unknown error occurred'
      } finally {
        this.loading.detail = false
      }
    },

    /**
     * Fetch Pokemon species data
     */
    async fetchPokemonSpecies(id: number | string) {
      const api = usePokemonApi()

      this.loading.species = true
      this.error.species = null
      this.currentSpecies = null

      try {
        const { data, error } = await api.getPokemonSpecies(id)

        if (error.value) {
          this.error.species =
            error.value.message || 'Failed to fetch species data'
          return
        }

        if (data.value) {
          this.currentSpecies = data.value
        }
      } catch (err: any) {
        this.error.species = err.message || 'Unknown error occurred'
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
