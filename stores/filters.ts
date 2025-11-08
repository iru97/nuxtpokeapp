import { defineStore } from 'pinia'
import type { PokemonFilters, SortOption } from '~/types'

interface FiltersState extends PokemonFilters {
  activeFiltersCount: number
}

export const useFiltersStore = defineStore('filters', {
  state: (): FiltersState => ({
    search: '',
    types: [],
    generation: null,
    legendary: null,
    mythical: null,
    sortBy: 'id' as SortOption,
    sortOrder: 'asc',
    activeFiltersCount: 0,
  }),

  getters: {
    /**
     * Check if any filter is active
     */
    hasActiveFilters: (state) => {
      return (
        state.search.length > 0 ||
        state.types.length > 0 ||
        state.generation !== null ||
        state.legendary !== null ||
        state.mythical !== null
      )
    },

    /**
     * Get filter summary for display
     */
    filterSummary: (state) => {
      const summary: string[] = []

      if (state.search) {
        summary.push(`Search: "${state.search}"`)
      }

      if (state.types.length > 0) {
        summary.push(`Types: ${state.types.join(', ')}`)
      }

      if (state.generation !== null) {
        summary.push(`Gen ${state.generation}`)
      }

      if (state.legendary) {
        summary.push('Legendary')
      }

      if (state.mythical) {
        summary.push('Mythical')
      }

      return summary
    },

    /**
     * Get serialized filters for URL params
     */
    toURLParams: (state) => {
      const params = new URLSearchParams()

      if (state.search) params.set('q', state.search)
      if (state.types.length > 0) params.set('types', state.types.join(','))
      if (state.generation) params.set('gen', state.generation.toString())
      if (state.legendary) params.set('legendary', '1')
      if (state.mythical) params.set('mythical', '1')
      if (state.sortBy !== 'id') params.set('sort', state.sortBy)
      if (state.sortOrder !== 'asc') params.set('order', state.sortOrder)

      return params.toString()
    },
  },

  actions: {
    /**
     * Set search query
     */
    setSearch(query: string) {
      this.search = query
      this.updateActiveCount()
    },

    /**
     * Toggle type filter
     */
    toggleType(type: string) {
      const index = this.types.indexOf(type)
      if (index > -1) {
        this.types.splice(index, 1)
      } else {
        this.types.push(type)
      }
      this.updateActiveCount()
    },

    /**
     * Set type filters
     */
    setTypes(types: string[]) {
      this.types = types
      this.updateActiveCount()
    },

    /**
     * Set generation filter
     */
    setGeneration(gen: number | null) {
      this.generation = gen
      this.updateActiveCount()
    },

    /**
     * Set legendary filter
     */
    setLegendary(value: boolean | null) {
      this.legendary = value
      this.updateActiveCount()
    },

    /**
     * Set mythical filter
     */
    setMythical(value: boolean | null) {
      this.mythical = value
      this.updateActiveCount()
    },

    /**
     * Set sort options
     */
    setSort(sortBy: SortOption, sortOrder: 'asc' | 'desc' = 'asc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    /**
     * Toggle sort order
     */
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    },

    /**
     * Clear all filters
     */
    clearFilters() {
      this.search = ''
      this.types = []
      this.generation = null
      this.legendary = null
      this.mythical = null
      this.activeFiltersCount = 0
    },

    /**
     * Load filters from URL params
     */
    loadFromURLParams(params: URLSearchParams) {
      const search = params.get('q')
      if (search) this.search = search

      const types = params.get('types')
      if (types) this.types = types.split(',')

      const gen = params.get('gen')
      if (gen) this.generation = parseInt(gen)

      if (params.get('legendary')) this.legendary = true
      if (params.get('mythical')) this.mythical = true

      const sort = params.get('sort') as SortOption
      if (sort) this.sortBy = sort

      const order = params.get('order') as 'asc' | 'desc'
      if (order) this.sortOrder = order

      this.updateActiveCount()
    },

    /**
     * Update active filters count
     */
    updateActiveCount() {
      let count = 0

      if (this.search.length > 0) count++
      if (this.types.length > 0) count++
      if (this.generation !== null) count++
      if (this.legendary !== null) count++
      if (this.mythical !== null) count++

      this.activeFiltersCount = count
    },
  },

  persist: {
    key: 'pokemon-filters',
    storage: persistedState.localStorage,
  },
})
