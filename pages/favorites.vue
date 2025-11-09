<script setup lang="ts">
import type { Pokemon } from '~/types'

const favoritesStore = useFavoritesStore()
const pokemonStore = usePokemonStore()

// SEO Meta tags
useHead({
  title: 'My Favorites - PokéApp',
  meta: [
    { name: 'description', content: 'Your favorite Pokémon collection. Manage and explore your saved Pokémon.' },
    { property: 'og:title', content: 'My Favorites - PokéApp' },
    { property: 'og:description', content: 'Your favorite Pokémon collection' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' }
  ]
})

const loading = ref(true)
const favoritePokemon = ref<Pokemon[]>([])
const selectedCollection = ref<string | null>(null)

// Load favorite Pokemon
onMounted(async () => {
  try {
    loading.value = true

    // Get favorite IDs
    const favoriteIds = favoritesStore.favorites.map(f => f.id)

    if (favoriteIds.length === 0) {
      loading.value = false
      return
    }

    // Fetch Pokemon data for favorites
    const pokemonData = await Promise.all(
      favoriteIds.map(async (id) => {
        try {
          const { data } = await useFetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
          return data.value
        } catch (err) {
          console.error(`Failed to load Pokemon ${id}:`, err)
          return null
        }
      })
    )

    favoritePokemon.value = pokemonData.filter(p => p !== null) as Pokemon[]
  } catch (err) {
    console.error('Error loading favorites:', err)
  } finally {
    loading.value = false
  }
})

// Filter Pokemon by collection
const displayedPokemon = computed(() => {
  if (!selectedCollection.value) {
    return favoritePokemon.value
  }

  const collection = favoritesStore.collections.find(c => c.id === selectedCollection.value)
  if (!collection) return favoritePokemon.value

  return favoritePokemon.value.filter(p => collection.pokemonIds.includes(p.id))
})

// Recently viewed Pokemon
const recentlyViewedPokemon = ref<Pokemon[]>([])
const loadingRecent = ref(false)

const loadRecentlyViewed = async () => {
  loadingRecent.value = true
  try {
    const recentIds = favoritesStore.recentlyViewed.slice(0, 6).map(r => r.id)

    const pokemonData = await Promise.all(
      recentIds.map(async (id) => {
        try {
          const { data } = await useFetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
          return data.value
        } catch (err) {
          return null
        }
      })
    )

    recentlyViewedPokemon.value = pokemonData.filter(p => p !== null) as Pokemon[]
  } finally {
    loadingRecent.value = false
  }
}

onMounted(() => {
  if (favoritesStore.recentlyViewed.length > 0) {
    loadRecentlyViewed()
  }
})

// Export favorites
const exportFavorites = () => {
  const data = favoritesStore.exportFavorites()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pokemon-favorites.json'
  link.click()
  URL.revokeObjectURL(url)
}

// Clear all favorites
const confirmClear = ref(false)
const clearAllFavorites = () => {
  if (!confirmClear.value) {
    confirmClear.value = true
    setTimeout(() => {
      confirmClear.value = false
    }, 3000)
    return
  }

  favoritesStore.clearFavorites()
  favoritePokemon.value = []
  confirmClear.value = false
}
</script>

<template>
  <div class="favorites-page">
    <div class="favorites-page__container">
      <!-- Header -->
      <div class="favorites-page__header">
        <div class="favorites-page__header-content">
          <Icon name="mdi:heart" class="favorites-page__header-icon" />
          <div>
            <h1 class="favorites-page__title">My Favorites</h1>
            <p class="favorites-page__subtitle">
              {{ favoritesStore.favorites.length }} Pokémon saved
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="favorites-page__actions">
          <button
            v-if="favoritesStore.favorites.length > 0"
            class="favorites-page__action-btn"
            @click="exportFavorites"
          >
            <Icon name="mdi:download" />
            <span>Export</span>
          </button>

          <button
            v-if="favoritesStore.favorites.length > 0"
            class="favorites-page__action-btn favorites-page__action-btn--danger"
            @click="clearAllFavorites"
          >
            <Icon name="mdi:delete" />
            <span>{{ confirmClear ? 'Click again to confirm' : 'Clear All' }}</span>
          </button>
        </div>
      </div>

      <!-- Collections Filter -->
      <div v-if="favoritesStore.collections.length > 0" class="favorites-page__collections">
        <h3 class="favorites-page__collections-title">Collections</h3>
        <div class="favorites-page__collections-list">
          <button
            class="favorites-page__collection-btn"
            :class="{ 'favorites-page__collection-btn--active': selectedCollection === null }"
            @click="selectedCollection = null"
          >
            <Icon name="mdi:view-grid" />
            <span>All ({{ favoritePokemon.length }})</span>
          </button>

          <button
            v-for="collection in favoritesStore.collections"
            :key="collection.id"
            class="favorites-page__collection-btn"
            :class="{ 'favorites-page__collection-btn--active': selectedCollection === collection.id }"
            @click="selectedCollection = collection.id"
          >
            <Icon name="mdi:folder" />
            <span>{{ collection.name }} ({{ collection.pokemonIds.length }})</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="favorites-page__loading">
        <LoadingSpinner size="lg" message="Loading your favorites..." />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="favoritePokemon.length === 0"
        icon="mdi:heart-outline"
        title="No Favorites Yet"
        description="Start adding Pokémon to your favorites by clicking the heart icon on any Pokémon card"
        action-text="Browse Pokémon"
        action-icon="mdi:pokeball"
        @action="navigateTo('/pokemons')"
      />

      <!-- Pokemon Grid -->
      <div v-else class="favorites-page__grid">
        <PokemonCard
          v-for="pokemon in displayedPokemon"
          :key="pokemon.id"
          :pokemon="pokemon"
        />
      </div>

      <!-- Recently Viewed Section -->
      <div v-if="recentlyViewedPokemon.length > 0" class="favorites-page__recent">
        <h2 class="favorites-page__section-title">
          <Icon name="mdi:history" />
          Recently Viewed
        </h2>

        <div v-if="loadingRecent" class="favorites-page__loading">
          <LoadingSpinner size="md" />
        </div>

        <div v-else class="favorites-page__recent-grid">
          <PokemonCard
            v-for="pokemon in recentlyViewedPokemon"
            :key="pokemon.id"
            :pokemon="pokemon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.favorites-page {
  min-height: 100vh;
  padding: $spacing-6 0;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    @include flex-between;
    flex-wrap: wrap;
    gap: $spacing-4;
    margin-bottom: $spacing-8;
  }

  &__header-content {
    @include flex-center;
    gap: $spacing-4;
  }

  &__header-icon {
    font-size: 64px;
    color: $error;
    animation: pulse 2s ease-in-out infinite;
  }

  &__title {
    margin: 0;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-4xl;
    }
  }

  &__subtitle {
    margin: $spacing-1 0 0;
    font-size: $font-size-lg;
    color: $text-secondary;
  }

  &__actions {
    @include flex-center;
    gap: $spacing-3;
    flex-wrap: wrap;
  }

  &__action-btn {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-5;
    background: $white;
    color: $text-primary;
    border: 2px solid $gray-300;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover {
      background: $gray-50;
      border-color: $primary;
      color: $primary;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &--danger {
      &:hover {
        background: rgba($error, 0.1);
        border-color: $error;
        color: $error;
      }
    }

    svg {
      font-size: 20px;
    }
  }

  &__collections {
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    margin-bottom: $spacing-6;
  }

  &__collections-title {
    margin: 0 0 $spacing-4;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__collections-list {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__collection-btn {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: $gray-50;
    color: $text-secondary;
    border: 2px solid $gray-200;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    transition: all $transition-fast;

    &:hover:not(&--active) {
      background: $gray-100;
      border-color: $gray-300;
    }

    &--active {
      background: $primary;
      color: $white;
      border-color: $primary;
    }

    svg {
      font-size: 18px;
    }
  }

  &__loading {
    @include flex-center;
    padding: $spacing-12 0;
  }

  &__grid {
    display: grid;
    gap: $spacing-6;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    margin-bottom: $spacing-8;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }

  &__recent {
    margin-top: $spacing-12;
    padding-top: $spacing-8;
    border-top: 2px solid $gray-200;
  }

  &__section-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-6;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-secondary;

    svg {
      font-size: 32px;
      color: $primary;
    }
  }

  &__recent-grid {
    display: grid;
    gap: $spacing-6;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
