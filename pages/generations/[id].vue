<script setup lang="ts">
import { GENERATIONS } from '~/constants/pokemon'
import type { Pokemon } from '~/types'

const route = useRoute()
const generationId = computed(() => parseInt(route.params.id as string))

// Find generation data
const generation = computed(() => {
  return GENERATIONS.find(g => g.id === generationId.value)
})

// Redirect if generation not found
if (!generation.value) {
  navigateTo('/generations')
}

// SEO Meta tags
useHead({
  title: computed(() => `${generation.value?.name} - ${generation.value?.region} - PokéApp`),
  meta: [
    { name: 'description', content: computed(() => `Explore all Pokémon from ${generation.value?.name} in the ${generation.value?.region} region. Browse ${generation.value ? generation.value.range[1] - generation.value.range[0] + 1 : 0} Pokémon.`) },
    { property: 'og:title', content: computed(() => `${generation.value?.name} - ${generation.value?.region}`) },
    { property: 'og:description', content: computed(() => `Explore Pokémon from ${generation.value?.region}`) },
  ]
})

// Generation colors
const generationColors: Record<number, { primary: string; gradient: string }> = {
  1: { primary: '#ee1515', gradient: 'linear-gradient(135deg, #ee1515 0%, #ff6b6b 100%)' },
  2: { primary: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
  3: { primary: '#0080ff', gradient: 'linear-gradient(135deg, #0080ff 0%, #4da6ff 100%)' },
  4: { primary: '#9b59b6', gradient: 'linear-gradient(135deg, #9b59b6 0%, #bb79d6 100%)' },
  5: { primary: '#34495e', gradient: 'linear-gradient(135deg, #34495e 0%, #5d6d7e 100%)' },
  6: { primary: '#e74c3c', gradient: 'linear-gradient(135deg, #e74c3c 0%, #ff6b6b 100%)' },
  7: { primary: '#f39c12', gradient: 'linear-gradient(135deg, #f39c12 0%, #f5b041 100%)' },
  8: { primary: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)' },
  9: { primary: '#e91e63', gradient: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)' }
}

const genColor = computed(() => {
  return generationColors[generationId.value] || generationColors[1]
})

// Pokemon data
const loading = ref(true)
const pokemonList = ref<Pokemon[]>([])
const searchQuery = ref('')
const selectedType = ref<string | null>(null)

// Load Pokemon for this generation
const loadGenerationPokemon = async () => {
  if (!generation.value) return

  loading.value = true
  try {
    const [start, end] = generation.value.range
    const promises: Promise<Pokemon>[] = []

    for (let i = start; i <= end; i++) {
      promises.push(
        $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${i}`)
      )
    }

    pokemonList.value = await Promise.all(promises)
  } catch (err) {
    console.error('Error loading generation Pokemon:', err)
  } finally {
    loading.value = false
  }
}

// Filtered Pokemon
const filteredPokemon = computed(() => {
  let filtered = pokemonList.value

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    )
  }

  // Filter by type
  if (selectedType.value) {
    filtered = filtered.filter(p =>
      p.types.some(t => t.type.name === selectedType.value)
    )
  }

  return filtered
})

// Get all unique types in this generation
const availableTypes = computed(() => {
  const types = new Set<string>()
  pokemonList.value.forEach(p => {
    p.types.forEach(t => types.add(t.type.name))
  })
  return Array.from(types).sort()
})

// Stats for generation
const stats = computed(() => {
  if (!pokemonList.value.length) return null

  const totalPokemon = pokemonList.value.length
  const uniqueTypes = availableTypes.value.length
  const averageHeight = pokemonList.value.reduce((sum, p) => sum + p.height, 0) / totalPokemon
  const averageWeight = pokemonList.value.reduce((sum, p) => sum + p.weight, 0) / totalPokemon

  return {
    total: totalPokemon,
    types: uniqueTypes,
    avgHeight: (averageHeight / 10).toFixed(1),
    avgWeight: (averageWeight / 10).toFixed(1)
  }
})

// Load on mount
onMounted(() => {
  loadGenerationPokemon()
})

// Clear filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = null
}

// Navigate back
const goBack = () => {
  navigateTo('/generations')
}
</script>

<template>
  <div
    v-if="generation"
    class="generation-detail"
    :style="{
      '--gen-color': genColor.primary,
      '--gen-gradient': genColor.gradient
    }"
  >
    <!-- Hero Section -->
    <div class="generation-detail__hero">
      <div class="generation-detail__hero-bg" />
      <div class="generation-detail__hero-container">
        <button class="generation-detail__back" @click="goBack">
          <Icon name="mdi:arrow-left" />
          <span>Back to Generations</span>
        </button>

        <div class="generation-detail__hero-content">
          <div class="generation-detail__badge">Gen {{ generation.id }}</div>
          <h1 class="generation-detail__title">{{ generation.name }}</h1>
          <div class="generation-detail__region">
            <Icon name="mdi:map-marker" />
            <span>{{ generation.region }} Region</span>
          </div>
          <p class="generation-detail__range">
            Pokédex: #{{ String(generation.range[0]).padStart(4, '0') }} - #{{ String(generation.range[1]).padStart(4, '0') }}
          </p>
        </div>
      </div>
    </div>

    <div class="generation-detail__container">
      <!-- Stats -->
      <div v-if="stats && !loading" class="generation-detail__stats">
        <div class="generation-detail__stat-card">
          <Icon name="mdi:pokeball" />
          <div>
            <span class="generation-detail__stat-value">{{ stats.total }}</span>
            <span class="generation-detail__stat-label">Pokémon</span>
          </div>
        </div>
        <div class="generation-detail__stat-card">
          <Icon name="mdi:shape" />
          <div>
            <span class="generation-detail__stat-value">{{ stats.types }}</span>
            <span class="generation-detail__stat-label">Types</span>
          </div>
        </div>
        <div class="generation-detail__stat-card">
          <Icon name="mdi:arrow-expand-vertical" />
          <div>
            <span class="generation-detail__stat-value">{{ stats.avgHeight }}m</span>
            <span class="generation-detail__stat-label">Avg Height</span>
          </div>
        </div>
        <div class="generation-detail__stat-card">
          <Icon name="mdi:weight" />
          <div>
            <span class="generation-detail__stat-value">{{ stats.avgWeight }}kg</span>
            <span class="generation-detail__stat-label">Avg Weight</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="generation-detail__filters">
        <h3 class="generation-detail__filters-title">
          <Icon name="mdi:filter" />
          <span>Filters</span>
        </h3>

        <!-- Search -->
        <div class="generation-detail__search">
          <Icon name="mdi:magnify" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Pokémon..."
            class="generation-detail__search-input"
          />
          <button
            v-if="searchQuery"
            class="generation-detail__search-clear"
            @click="searchQuery = ''"
          >
            <Icon name="mdi:close" />
          </button>
        </div>

        <!-- Type Filter -->
        <div class="generation-detail__type-filter">
          <button
            class="generation-detail__type-btn"
            :class="{ 'generation-detail__type-btn--active': !selectedType }"
            @click="selectedType = null"
          >
            All Types
          </button>
          <button
            v-for="type in availableTypes"
            :key="type"
            class="generation-detail__type-btn"
            :class="{ 'generation-detail__type-btn--active': selectedType === type }"
            @click="selectedType = type"
          >
            <TypeBadge :type="type" size="sm" />
          </button>
        </div>

        <!-- Clear Filters -->
        <button
          v-if="searchQuery || selectedType"
          class="generation-detail__clear-filters"
          @click="clearFilters"
        >
          <Icon name="mdi:close-circle" />
          <span>Clear Filters</span>
        </button>
      </div>

      <!-- Results Count -->
      <div v-if="!loading" class="generation-detail__results">
        <p>
          Showing <strong>{{ filteredPokemon.length }}</strong> of <strong>{{ pokemonList.length }}</strong> Pokémon
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="generation-detail__loading">
        <LoadingSpinner size="lg" message="Loading Pokémon..." />
      </div>

      <!-- Pokemon Grid -->
      <div v-else-if="filteredPokemon.length > 0" class="generation-detail__grid">
        <PokemonCard
          v-for="pokemon in filteredPokemon"
          :key="pokemon.id"
          :pokemon="pokemon"
        />
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        icon="mdi:pokemon-go"
        title="No Pokémon Found"
        description="Try adjusting your filters to see more results"
        action-text="Clear Filters"
        action-icon="mdi:close-circle"
        @action="clearFilters"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.generation-detail {
  min-height: 100vh;
  background: $gray-50;

  &__hero {
    position: relative;
    padding: $spacing-12 0 $spacing-8;
    overflow: hidden;
    background: var(--gen-gradient);
  }

  &__hero-bg {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  }

  &__hero-container {
    position: relative;
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
    z-index: 1;
  }

  &__back {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: rgba($white, 0.2);
    color: $white;
    border-radius: $radius-lg;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;
    margin-bottom: $spacing-6;

    &:hover {
      background: rgba($white, 0.3);
    }

    svg {
      font-size: 20px;
    }
  }

  &__hero-content {
    @include flex-column;
    align-items: center;
    gap: $spacing-3;
    text-align: center;
    color: $white;
  }

  &__badge {
    padding: $spacing-2 $spacing-5;
    background: rgba($white, 0.2);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__title {
    margin: 0;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-4xl;
    }
  }

  &__region {
    @include flex-center;
    gap: $spacing-2;
    font-size: $font-size-2xl;
    font-weight: $font-weight-semibold;

    svg {
      font-size: 28px;
    }
  }

  &__range {
    margin: 0;
    font-size: $font-size-lg;
    font-family: $font-family-mono;
    opacity: 0.95;
  }

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: $spacing-8 $spacing-6;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
    margin-bottom: $spacing-8;
  }

  &__stat-card {
    @include flex-center;
    gap: $spacing-4;
    padding: $spacing-5;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    border: 2px solid $gray-200;

    svg {
      font-size: 40px;
      color: var(--gen-color);
    }

    div {
      @include flex-column;
      gap: $spacing-1;
    }
  }

  &__stat-value {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-secondary;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &__filters {
    @include flex-column;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    margin-bottom: $spacing-6;
  }

  &__filters-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    svg {
      font-size: 24px;
      color: var(--gen-color);
    }
  }

  &__search {
    @include flex-center;
    gap: $spacing-3;
    padding: $spacing-3 $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    transition: all $transition-fast;

    &:focus-within {
      border-color: var(--gen-color);
      background: $white;
    }

    svg {
      font-size: 24px;
      color: $text-secondary;
    }
  }

  &__search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: $font-size-base;
    outline: none;

    &::placeholder {
      color: $text-hint;
    }
  }

  &__search-clear {
    @include reset-button;
    @include flex-center;
    width: 24px;
    height: 24px;
    color: $text-secondary;
    transition: color $transition-fast;

    &:hover {
      color: $error;
    }

    svg {
      font-size: 20px;
    }
  }

  &__type-filter {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__type-btn {
    @include reset-button;
    padding: $spacing-2 $spacing-4;
    background: $gray-50;
    color: $text-secondary;
    border: 2px solid $gray-200;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;

    &:hover:not(&--active) {
      background: $gray-100;
      border-color: $gray-300;
    }

    &--active {
      background: var(--gen-color);
      color: $white;
      border-color: var(--gen-color);
    }
  }

  &__clear-filters {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-4;
    background: rgba($error, 0.1);
    color: $error;
    border-radius: $radius-lg;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;
    align-self: flex-start;

    &:hover {
      background: rgba($error, 0.2);
    }

    svg {
      font-size: 20px;
    }
  }

  &__results {
    margin-bottom: $spacing-4;
    text-align: center;
    color: $text-secondary;

    strong {
      color: var(--gen-color);
      font-weight: $font-weight-bold;
    }
  }

  &__loading {
    @include flex-center;
    padding: $spacing-12 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
