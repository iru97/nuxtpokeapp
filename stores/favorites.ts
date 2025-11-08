import { defineStore } from 'pinia'
import type { FavoritePokemon, Collection, RecentlyViewed } from '~/types'

interface FavoritesState {
  favorites: FavoritePokemon[]
  recentlyViewed: RecentlyViewed[]
  collections: Collection[]
}

export const useFavoritesStore = defineStore('favorites', {
  state: (): FavoritesState => ({
    favorites: [],
    recentlyViewed: [],
    collections: [],
  }),

  getters: {
    /**
     * Get favorite Pokemon IDs
     */
    favoriteIds: (state) => {
      return state.favorites.map((f) => f.id)
    },

    /**
     * Check if Pokemon is favorited
     */
    isFavorite: (state) => (id: number) => {
      return state.favorites.some((f) => f.id === id)
    },

    /**
     * Get recently viewed Pokemon IDs
     */
    recentlyViewedIds: (state) => {
      return state.recentlyViewed
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .map((r) => r.id)
    },

    /**
     * Get favorites count
     */
    favoritesCount: (state) => {
      return state.favorites.length
    },

    /**
     * Get collections count
     */
    collectionsCount: (state) => {
      return state.collections.length
    },

    /**
     * Get collection by ID
     */
    getCollectionById: (state) => (id: string) => {
      return state.collections.find((c) => c.id === id)
    },
  },

  actions: {
    /**
     * Toggle favorite status
     */
    toggleFavorite(id: number) {
      const index = this.favorites.findIndex((f) => f.id === id)

      if (index > -1) {
        // Remove from favorites
        this.favorites.splice(index, 1)
      } else {
        // Add to favorites
        this.favorites.push({
          id,
          addedAt: Date.now(),
        })
      }
    },

    /**
     * Add to favorites
     */
    addFavorite(id: number) {
      if (!this.isFavorite(id)) {
        this.favorites.push({
          id,
          addedAt: Date.now(),
        })
      }
    },

    /**
     * Remove from favorites
     */
    removeFavorite(id: number) {
      const index = this.favorites.findIndex((f) => f.id === id)
      if (index > -1) {
        this.favorites.splice(index, 1)
      }
    },

    /**
     * Clear all favorites
     */
    clearFavorites() {
      this.favorites = []
    },

    /**
     * Add to recently viewed
     */
    addToRecentlyViewed(id: number) {
      // Remove if already exists
      const index = this.recentlyViewed.findIndex((r) => r.id === id)
      if (index > -1) {
        this.recentlyViewed.splice(index, 1)
      }

      // Add to beginning
      this.recentlyViewed.unshift({
        id,
        viewedAt: Date.now(),
      })

      // Keep only last 20
      if (this.recentlyViewed.length > 20) {
        this.recentlyViewed = this.recentlyViewed.slice(0, 20)
      }
    },

    /**
     * Clear recently viewed
     */
    clearRecentlyViewed() {
      this.recentlyViewed = []
    },

    /**
     * Create a new collection
     */
    createCollection(name: string, pokemonIds: number[] = []) {
      const collection: Collection = {
        id: `collection-${Date.now()}`,
        name,
        pokemonIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      this.collections.push(collection)
      return collection
    },

    /**
     * Update collection
     */
    updateCollection(id: string, updates: Partial<Collection>) {
      const collection = this.getCollectionById(id)
      if (collection) {
        Object.assign(collection, {
          ...updates,
          updatedAt: Date.now(),
        })
      }
    },

    /**
     * Delete collection
     */
    deleteCollection(id: string) {
      const index = this.collections.findIndex((c) => c.id === id)
      if (index > -1) {
        this.collections.splice(index, 1)
      }
    },

    /**
     * Add Pokemon to collection
     */
    addToCollection(collectionId: string, pokemonId: number) {
      const collection = this.getCollectionById(collectionId)
      if (collection && !collection.pokemonIds.includes(pokemonId)) {
        collection.pokemonIds.push(pokemonId)
        collection.updatedAt = Date.now()
      }
    },

    /**
     * Remove Pokemon from collection
     */
    removeFromCollection(collectionId: string, pokemonId: number) {
      const collection = this.getCollectionById(collectionId)
      if (collection) {
        const index = collection.pokemonIds.indexOf(pokemonId)
        if (index > -1) {
          collection.pokemonIds.splice(index, 1)
          collection.updatedAt = Date.now()
        }
      }
    },

    /**
     * Export favorites as JSON
     */
    exportFavorites() {
      return JSON.stringify({
        favorites: this.favorites,
        collections: this.collections,
        exportedAt: Date.now(),
      })
    },

    /**
     * Import favorites from JSON
     */
    importFavorites(jsonData: string) {
      try {
        const data = JSON.parse(jsonData)

        if (data.favorites) {
          this.favorites = data.favorites
        }

        if (data.collections) {
          this.collections = data.collections
        }

        return { success: true, message: 'Favorites imported successfully' }
      } catch (error) {
        return { success: false, message: 'Failed to import favorites' }
      }
    },
  },

  persist: {
    key: 'pokemon-favorites',
    storage: persistedState.localStorage,
  },
})
