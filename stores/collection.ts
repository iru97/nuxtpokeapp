/**
 * Collection Store
 * Manages Pokemon collection progress, checklists, and completion tracking
 */

import { defineStore } from 'pinia'

export interface PokemonCollectionStatus {
  id: number
  owned: boolean
  shiny: boolean
  dateObtained?: string
}

export interface Checklist {
  id: string
  name: string
  description: string
  total: number
  caught: number
  pokemonIds: number[]
}

interface CollectionState {
  collection: Record<number, PokemonCollectionStatus>
  dailyStreak: number
  lastVisitDate: string | null
}

export const useCollectionStore = defineStore('collection', {
  state: (): CollectionState => ({
    collection: {},
    dailyStreak: 0,
    lastVisitDate: null
  }),

  getters: {
    /**
     * Get status of a specific Pokemon
     */
    getPokemonStatus: (state) => (id: number): PokemonCollectionStatus => {
      return state.collection[id] || {
        id,
        owned: false,
        shiny: false
      }
    },

    /**
     * Check if Pokemon is owned
     */
    isOwned: (state) => (id: number): boolean => {
      return state.collection[id]?.owned || false
    },

    /**
     * Check if shiny is owned
     */
    hasShiny: (state) => (id: number): boolean => {
      return state.collection[id]?.shiny || false
    },

    /**
     * Total Pokemon owned
     */
    totalOwned: (state): number => {
      return Object.values(state.collection).filter(p => p.owned).length
    },

    /**
     * Total shinies owned
     */
    totalShinies: (state): number => {
      return Object.values(state.collection).filter(p => p.shiny).length
    },

    /**
     * Completion percentage
     */
    completionPercent(): number {
      return Math.round((this.totalOwned / 1025) * 100 * 10) / 10
    },

    /**
     * Shiny dex completion
     */
    shinyPercent(): number {
      return Math.round((this.totalShinies / 1025) * 100 * 10) / 10
    },

    /**
     * Get National Dex checklist
     */
    nationalDex(): Checklist {
      const allPokemon = Array.from({ length: 1025 }, (_, i) => i + 1)
      const caught = allPokemon.filter(id => this.isOwned(id)).length

      return {
        id: 'national',
        name: 'National Pokédex',
        description: 'Catch all 1,025 Pokemon',
        total: 1025,
        caught,
        pokemonIds: allPokemon
      }
    },

    /**
     * Get generation-specific checklists
     */
    generationChecklists(): Checklist[] {
      const generations = [
        { gen: 1, name: 'Kanto Dex', range: [1, 151] },
        { gen: 2, name: 'Johto Dex', range: [152, 251] },
        { gen: 3, name: 'Hoenn Dex', range: [252, 386] },
        { gen: 4, name: 'Sinnoh Dex', range: [387, 493] },
        { gen: 5, name: 'Unova Dex', range: [494, 649] },
        { gen: 6, name: 'Kalos Dex', range: [650, 721] },
        { gen: 7, name: 'Alola Dex', range: [722, 809] },
        { gen: 8, name: 'Galar Dex', range: [810, 905] },
        { gen: 9, name: 'Paldea Dex', range: [906, 1025] }
      ]

      return generations.map(({ gen, name, range }) => {
        const [start, end] = range
        const pokemonIds = Array.from({ length: end - start + 1 }, (_, i) => start + i)
        const caught = pokemonIds.filter(id => this.isOwned(id)).length

        return {
          id: `gen-${gen}`,
          name,
          description: `Generation ${gen} (${start}-${end})`,
          total: pokemonIds.length,
          caught,
          pokemonIds
        }
      })
    },

    /**
     * Get shiny dex checklist
     */
    shinyDex(): Checklist {
      const allPokemon = Array.from({ length: 1025 }, (_, i) => i + 1)
      const caught = allPokemon.filter(id => this.hasShiny(id)).length

      return {
        id: 'shiny',
        name: 'Shiny Pokédex',
        description: 'Collect all shiny forms',
        total: 1025,
        caught,
        pokemonIds: allPokemon
      }
    }
  },

  actions: {
    /**
     * Mark Pokemon as owned
     */
    markOwned(id: number) {
      if (!this.collection[id]) {
        this.collection[id] = { id, owned: false, shiny: false }
      }

      this.collection[id].owned = true
      this.collection[id].dateObtained = new Date().toISOString()
      this.save()
    },

    /**
     * Mark Pokemon as not owned
     */
    markNotOwned(id: number) {
      if (this.collection[id]) {
        this.collection[id].owned = false
        this.collection[id].dateObtained = undefined
        this.save()
      }
    },

    /**
     * Toggle owned status
     */
    toggleOwned(id: number) {
      if (this.isOwned(id)) {
        this.markNotOwned(id)
      } else {
        this.markOwned(id)
      }
    },

    /**
     * Mark shiny as owned
     */
    markShiny(id: number) {
      if (!this.collection[id]) {
        this.collection[id] = { id, owned: false, shiny: false }
      }

      this.collection[id].shiny = true
      this.save()
    },

    /**
     * Toggle shiny status
     */
    toggleShiny(id: number) {
      if (!this.collection[id]) {
        this.collection[id] = { id, owned: false, shiny: false }
      }

      this.collection[id].shiny = !this.collection[id].shiny
      this.save()
    },

    /**
     * Clear all collection data
     */
    clearCollection() {
      if (confirm('Are you sure you want to clear your entire collection? This cannot be undone.')) {
        this.collection = {}
        this.save()
      }
    },

    /**
     * Update daily streak
     */
    updateDailyStreak() {
      const today = new Date().toISOString().split('T')[0]

      if (this.lastVisitDate === today) {
        return // Already visited today
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (this.lastVisitDate === yesterdayStr) {
        this.dailyStreak++
      } else {
        this.dailyStreak = 1
      }

      this.lastVisitDate = today
      this.save()
    },

    /**
     * Export collection to JSON
     */
    exportCollection() {
      const data = {
        collection: this.collection,
        dailyStreak: this.dailyStreak,
        lastVisitDate: this.lastVisitDate,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pokemon-collection-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    },

    /**
     * Import collection from JSON
     */
    importCollection(jsonString: string) {
      try {
        const data = JSON.parse(jsonString)

        if (data.collection) {
          this.collection = data.collection
        }

        if (data.dailyStreak !== undefined) {
          this.dailyStreak = data.dailyStreak
        }

        if (data.lastVisitDate) {
          this.lastVisitDate = data.lastVisitDate
        }

        this.save()
        return { success: true }
      } catch (error) {
        console.error('Failed to import collection:', error)
        return { success: false, error: 'Invalid JSON format' }
      }
    },

    /**
     * Save to localStorage
     */
    save() {
      if (import.meta.client) {
        localStorage.setItem('pokemon-collection', JSON.stringify({
          collection: this.collection,
          dailyStreak: this.dailyStreak,
          lastVisitDate: this.lastVisitDate
        }))
      }
    },

    /**
     * Load from localStorage
     */
    load() {
      if (import.meta.client) {
        const saved = localStorage.getItem('pokemon-collection')
        if (saved) {
          const data = JSON.parse(saved)
          this.collection = data.collection || {}
          this.dailyStreak = data.dailyStreak || 0
          this.lastVisitDate = data.lastVisitDate || null
        }
      }
    },

    /**
     * Initialize store
     */
    init() {
      this.load()
      this.updateDailyStreak()
    }
  }
})
