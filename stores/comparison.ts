import { defineStore } from 'pinia'

interface ComparisonPokemon {
  id: number
  name: string
  addedAt: number
}

export const useComparisonStore = defineStore('comparison', {
  state: () => ({
    selectedPokemon: [] as ComparisonPokemon[],
    maxComparison: 3,
  }),

  getters: {
    /**
     * Get all selected Pokemon for comparison
     */
    getSelectedPokemon: (state) => state.selectedPokemon,

    /**
     * Get count of selected Pokemon
     */
    count: (state) => state.selectedPokemon.length,

    /**
     * Check if a Pokemon is selected for comparison
     */
    isSelected: (state) => (id: number) => {
      return state.selectedPokemon.some(p => p.id === id)
    },

    /**
     * Check if comparison is full
     */
    isFull: (state) => state.selectedPokemon.length >= state.maxComparison,

    /**
     * Check if comparison is ready (at least 2 Pokemon)
     */
    isReady: (state) => state.selectedPokemon.length >= 2,
  },

  actions: {
    /**
     * Add a Pokemon to comparison
     */
    addPokemon(id: number, name: string) {
      // Check if already selected
      if (this.isSelected(id)) {
        console.warn(`Pokemon ${name} is already in comparison`)
        return false
      }

      // Check if comparison is full
      if (this.isFull) {
        console.warn('Comparison is full. Maximum 3 Pokemon allowed.')
        return false
      }

      this.selectedPokemon.push({
        id,
        name,
        addedAt: Date.now(),
      })

      this.persistToLocalStorage()
      return true
    },

    /**
     * Remove a Pokemon from comparison
     */
    removePokemon(id: number) {
      const index = this.selectedPokemon.findIndex(p => p.id === id)
      if (index !== -1) {
        this.selectedPokemon.splice(index, 1)
        this.persistToLocalStorage()
        return true
      }
      return false
    },

    /**
     * Toggle Pokemon in comparison
     */
    togglePokemon(id: number, name: string) {
      if (this.isSelected(id)) {
        return this.removePokemon(id)
      } else {
        return this.addPokemon(id, name)
      }
    },

    /**
     * Clear all Pokemon from comparison
     */
    clearComparison() {
      this.selectedPokemon = []
      this.persistToLocalStorage()
    },

    /**
     * Get selected Pokemon IDs
     */
    getSelectedIds() {
      return this.selectedPokemon.map(p => p.id)
    },

    /**
     * Persist to localStorage
     */
    persistToLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nuxt-pokemon-comparison', JSON.stringify({
            selectedPokemon: this.selectedPokemon,
          }))
        } catch (err) {
          console.error('Failed to persist comparison to localStorage:', err)
        }
      }
    },

    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('nuxt-pokemon-comparison')
          if (stored) {
            const data = JSON.parse(stored)
            this.selectedPokemon = data.selectedPokemon || []
          }
        } catch (err) {
          console.error('Failed to load comparison from localStorage:', err)
        }
      }
    },

    /**
     * Initialize store
     */
    init() {
      this.loadFromLocalStorage()
    },
  },
})
