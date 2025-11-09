<script setup lang="ts">
import type { Pokemon } from '~/types'

const comparisonStore = useComparisonStore()
const router = useRouter()

// SEO Meta tags
useHead({
  title: 'Compare Pokémon - PokéApp',
  meta: [
    { name: 'description', content: 'Compare up to 3 Pokémon side-by-side. Analyze stats, types, abilities, and moves to make informed decisions.' },
    { property: 'og:title', content: 'Compare Pokémon - PokéApp' },
    { property: 'og:description', content: 'Compare Pokémon stats, abilities, and more' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' }
  ]
})

// Initialize store
onMounted(() => {
  comparisonStore.init()
})

const loading = ref(true)
const pokemonData = ref<Pokemon[]>([])

// Load Pokemon data
const loadPokemonData = async () => {
  loading.value = true
  try {
    const ids = comparisonStore.getSelectedIds()

    if (ids.length === 0) {
      loading.value = false
      return
    }

    const data = await Promise.all(
      ids.map(async (id) => {
        try {
          return await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
        } catch (err) {
          console.error(`Failed to load Pokemon ${id}:`, err)
          return null
        }
      })
    )

    pokemonData.value = data.filter(p => p !== null) as Pokemon[]
  } catch (err) {
    console.error('Error loading Pokemon data:', err)
  } finally {
    loading.value = false
  }
}

// Watch for changes in comparison store
watch(() => comparisonStore.count, () => {
  loadPokemonData()
}, { immediate: true })

// Remove Pokemon from comparison
const removePokemon = (id: number) => {
  comparisonStore.removePokemon(id)
}

// Clear all comparison
const clearAll = () => {
  comparisonStore.clearComparison()
}

// Add more Pokemon
const addMore = () => {
  router.push('/pokemons')
}

// Active comparison view
const activeView = ref<'stats' | 'types' | 'abilities' | 'moves'>('stats')

const viewOptions = [
  { id: 'stats', label: 'Stats', icon: 'mdi:chart-bar' },
  { id: 'types', label: 'Type Effectiveness', icon: 'mdi:shield-half-full' },
  { id: 'abilities', label: 'Abilities', icon: 'mdi:shield-star' },
  { id: 'moves', label: 'Moves', icon: 'mdi:sword-cross' },
]
</script>

<template>
  <div class="compare-page">
    <div class="compare-page__container">
      <!-- Header -->
      <div class="compare-page__header">
        <div class="compare-page__header-content">
          <Icon name="mdi:compare" class="compare-page__header-icon" />
          <div>
            <h1 class="compare-page__title">Compare Pokémon</h1>
            <p class="compare-page__subtitle">
              {{ comparisonStore.count }} of {{ comparisonStore.maxComparison }} Pokémon selected
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="compare-page__actions">
          <button
            v-if="!comparisonStore.isFull"
            class="compare-page__action-btn"
            @click="addMore"
          >
            <Icon name="mdi:plus" />
            <span>Add Pokémon</span>
          </button>

          <button
            v-if="comparisonStore.count > 0"
            class="compare-page__action-btn compare-page__action-btn--danger"
            @click="clearAll"
          >
            <Icon name="mdi:delete" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="compare-page__loading">
        <LoadingSpinner size="lg" message="Loading Pokémon data..." />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="comparisonStore.count === 0"
        icon="mdi:compare"
        title="No Pokémon Selected"
        description="Select 2-3 Pokémon from the Pokédex to compare their stats, abilities, and moves"
        action-text="Browse Pokémon"
        action-icon="mdi:pokeball"
        @action="navigateTo('/pokemons')"
      />

      <!-- Not Enough State -->
      <EmptyState
        v-else-if="!comparisonStore.isReady"
        icon="mdi:alert-circle"
        title="Need More Pokémon"
        description="Add at least one more Pokémon to start comparing"
        action-text="Add More"
        action-icon="mdi:plus"
        @action="addMore"
      />

      <!-- Comparison Content -->
      <div v-else class="compare-page__content">
        <!-- View Selector -->
        <div class="compare-page__view-selector">
          <button
            v-for="view in viewOptions"
            :key="view.id"
            class="compare-page__view-btn"
            :class="{ 'compare-page__view-btn--active': activeView === view.id }"
            @click="activeView = view.id as any"
          >
            <Icon :name="view.icon" />
            <span>{{ view.label }}</span>
          </button>
        </div>

        <!-- Comparison Grid -->
        <div class="compare-page__grid">
          <!-- Stats Comparison -->
          <ComparisonStats
            v-if="activeView === 'stats'"
            :pokemon="pokemonData"
            @remove="removePokemon"
          />

          <!-- Type Effectiveness -->
          <ComparisonTypes
            v-if="activeView === 'types'"
            :pokemon="pokemonData"
            @remove="removePokemon"
          />

          <!-- Abilities Comparison -->
          <ComparisonAbilities
            v-if="activeView === 'abilities'"
            :pokemon="pokemonData"
            @remove="removePokemon"
          />

          <!-- Moves Comparison -->
          <ComparisonMoves
            v-if="activeView === 'moves'"
            :pokemon="pokemonData"
            @remove="removePokemon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.compare-page {
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
    color: $primary;
    animation: rotate 3s linear infinite;
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

  &__loading {
    @include flex-center;
    padding: $spacing-12 0;
  }

  &__content {
    @include flex-column;
    gap: $spacing-6;
  }

  &__view-selector {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__view-btn {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-5;
    background: $gray-50;
    color: $text-secondary;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;
    flex: 1;
    min-width: 150px;

    @media (max-width: $breakpoint-sm) {
      min-width: 120px;
      padding: $spacing-2 $spacing-3;
      font-size: $font-size-sm;
    }

    &:hover:not(&--active) {
      background: $gray-100;
      border-color: $gray-300;
    }

    &--active {
      background: $primary;
      color: $white;
      border-color: $primary;
      box-shadow: $shadow-md;
    }

    svg {
      font-size: 20px;
    }
  }

  &__grid {
    animation: fadeIn 0.3s ease-out;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
