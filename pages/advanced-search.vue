<script setup lang="ts">
import type { Pokemon } from '~/types'

// SEO Meta tags
useHead({
  title: 'Advanced Search - PokéApp',
  meta: [
    { name: 'description', content: 'Advanced Pokemon search with detailed filters including stats, abilities, moves, height, weight, and more.' },
    { property: 'og:title', content: 'Advanced Search - PokéApp' },
    { property: 'og:description', content: 'Find Pokemon with advanced filters' },
  ]
})

// All Pokemon types
const allTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

// Filters
const filters = ref({
  name: '',
  types: [] as string[],
  minHP: 0,
  maxHP: 255,
  minAttack: 0,
  maxAttack: 255,
  minDefense: 0,
  maxDefense: 255,
  minSpeed: 0,
  maxSpeed: 255,
  minHeight: 0,
  maxHeight: 100,
  minWeight: 0,
  maxWeight: 10000,
  generation: null as number | null,
})

// Pokemon data
const loading = ref(false)
const allPokemon = ref<Pokemon[]>([])
const searchPerformed = ref(false)

// Filtered Pokemon
const filteredPokemon = computed(() => {
  let result = allPokemon.value

  // Filter by name
  if (filters.value.name) {
    const query = filters.value.name.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    )
  }

  // Filter by types
  if (filters.value.types.length > 0) {
    result = result.filter(p =>
      filters.value.types.every(filterType =>
        p.types.some(t => t.type.name === filterType)
      )
    )
  }

  // Filter by HP
  result = result.filter(p => {
    const hp = p.stats.find(s => s.stat.name === 'hp')?.base_stat || 0
    return hp >= filters.value.minHP && hp <= filters.value.maxHP
  })

  // Filter by Attack
  result = result.filter(p => {
    const attack = p.stats.find(s => s.stat.name === 'attack')?.base_stat || 0
    return attack >= filters.value.minAttack && attack <= filters.value.maxAttack
  })

  // Filter by Defense
  result = result.filter(p => {
    const defense = p.stats.find(s => s.stat.name === 'defense')?.base_stat || 0
    return defense >= filters.value.minDefense && defense <= filters.value.maxDefense
  })

  // Filter by Speed
  result = result.filter(p => {
    const speed = p.stats.find(s => s.stat.name === 'speed')?.base_stat || 0
    return speed >= filters.value.minSpeed && speed <= filters.value.maxSpeed
  })

  // Filter by Height
  result = result.filter(p =>
    p.height >= filters.value.minHeight && p.height <= filters.value.maxHeight
  )

  // Filter by Weight
  result = result.filter(p =>
    p.weight >= filters.value.minWeight && p.weight <= filters.value.maxWeight
  )

  // Filter by Generation
  if (filters.value.generation) {
    const genRanges: Record<number, [number, number]> = {
      1: [1, 151],
      2: [152, 251],
      3: [252, 386],
      4: [387, 493],
      5: [494, 649],
      6: [650, 721],
      7: [722, 809],
      8: [810, 905],
      9: [906, 1025],
    }
    const [min, max] = genRanges[filters.value.generation]
    result = result.filter(p => p.id >= min && p.id <= max)
  }

  return result
})

// Load all Pokemon
const loadAllPokemon = async () => {
  loading.value = true
  try {
    const promises: Promise<Pokemon>[] = []

    // Load first 151 Pokemon for faster initial search
    // Users can expand by adjusting filters
    for (let i = 1; i <= 151; i++) {
      promises.push(
        $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${i}`)
      )
    }

    allPokemon.value = await Promise.all(promises)
    searchPerformed.value = true
  } catch (err) {
    console.error('Error loading Pokemon:', err)
  } finally {
    loading.value = false
  }
}

// Toggle type filter
const toggleType = (type: string) => {
  const index = filters.value.types.indexOf(type)
  if (index > -1) {
    filters.value.types.splice(index, 1)
  } else {
    filters.value.types.push(type)
  }
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    name: '',
    types: [],
    minHP: 0,
    maxHP: 255,
    minAttack: 0,
    maxAttack: 255,
    minDefense: 0,
    maxDefense: 255,
    minSpeed: 0,
    maxSpeed: 255,
    minHeight: 0,
    maxHeight: 100,
    minWeight: 0,
    maxWeight: 10000,
    generation: null,
  }
}

// Perform search
const performSearch = () => {
  loadAllPokemon()
}

// Active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.name) count++
  if (filters.value.types.length > 0) count++
  if (filters.value.minHP > 0 || filters.value.maxHP < 255) count++
  if (filters.value.minAttack > 0 || filters.value.maxAttack < 255) count++
  if (filters.value.minDefense > 0 || filters.value.maxDefense < 255) count++
  if (filters.value.minSpeed > 0 || filters.value.maxSpeed < 255) count++
  if (filters.value.minHeight > 0 || filters.value.maxHeight < 100) count++
  if (filters.value.minWeight > 0 || filters.value.maxWeight < 10000) count++
  if (filters.value.generation) count++
  return count
})
</script>

<template>
  <div class="advanced-search">
    <div class="advanced-search__container">
      <!-- Header -->
      <div class="advanced-search__header">
        <div class="advanced-search__header-content">
          <Icon name="mdi:filter-cog" class="advanced-search__header-icon" />
          <div>
            <h1 class="advanced-search__title">Advanced Search</h1>
            <p class="advanced-search__subtitle">
              Find Pokémon with detailed filters
            </p>
          </div>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="advanced-search__filters">
        <div class="advanced-search__filters-header">
          <h3 class="advanced-search__filters-title">
            <Icon name="mdi:tune" />
            <span>Filters</span>
            <span v-if="activeFiltersCount > 0" class="filter-badge">
              {{ activeFiltersCount }}
            </span>
          </h3>

          <button
            v-if="activeFiltersCount > 0"
            class="btn-reset"
            @click="resetFilters"
          >
            <Icon name="mdi:refresh" />
            <span>Reset</span>
          </button>
        </div>

        <!-- Name Search -->
        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:magnify" />
            <span>Name or Number</span>
          </label>
          <input
            v-model="filters.name"
            type="text"
            placeholder="Search by name or number..."
            class="filter-input"
          />
        </div>

        <!-- Type Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:shape" />
            <span>Types</span>
          </label>
          <div class="type-grid">
            <button
              v-for="type in allTypes"
              :key="type"
              class="type-btn"
              :class="{ 'type-btn--active': filters.types.includes(type) }"
              @click="toggleType(type)"
            >
              <TypeBadge :type="type" size="sm" />
            </button>
          </div>
        </div>

        <!-- Generation Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:earth" />
            <span>Generation</span>
          </label>
          <div class="generation-grid">
            <button
              class="gen-btn"
              :class="{ 'gen-btn--active': filters.generation === null }"
              @click="filters.generation = null"
            >
              All
            </button>
            <button
              v-for="gen in 9"
              :key="gen"
              class="gen-btn"
              :class="{ 'gen-btn--active': filters.generation === gen }"
              @click="filters.generation = gen"
            >
              Gen {{ gen }}
            </button>
          </div>
        </div>

        <!-- Stats Filters -->
        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:chart-bar" />
            <span>HP Range</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minHP"
              type="number"
              min="0"
              max="255"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxHP"
              type="number"
              min="0"
              max="255"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:sword" />
            <span>Attack Range</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minAttack"
              type="number"
              min="0"
              max="255"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxAttack"
              type="number"
              min="0"
              max="255"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:shield" />
            <span>Defense Range</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minDefense"
              type="number"
              min="0"
              max="255"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxDefense"
              type="number"
              min="0"
              max="255"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:run-fast" />
            <span>Speed Range</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minSpeed"
              type="number"
              min="0"
              max="255"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxSpeed"
              type="number"
              min="0"
              max="255"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <!-- Physical Filters -->
        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:arrow-expand-vertical" />
            <span>Height Range (dm)</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minHeight"
              type="number"
              min="0"
              max="100"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxHeight"
              type="number"
              min="0"
              max="100"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <Icon name="mdi:weight" />
            <span>Weight Range (hg)</span>
          </label>
          <div class="range-inputs">
            <input
              v-model.number="filters.minWeight"
              type="number"
              min="0"
              max="10000"
              placeholder="Min"
              class="range-input"
            />
            <span>to</span>
            <input
              v-model.number="filters.maxWeight"
              type="number"
              min="0"
              max="10000"
              placeholder="Max"
              class="range-input"
            />
          </div>
        </div>

        <!-- Search Button -->
        <button class="btn-search" @click="performSearch">
          <Icon name="mdi:magnify" />
          <span>Search Pokémon</span>
        </button>
      </div>

      <!-- Results Section -->
      <div v-if="searchPerformed" class="advanced-search__results">
        <!-- Results Header -->
        <div class="results-header">
          <h3 class="results-title">
            Search Results
            <span class="results-count">{{ filteredPokemon.length }}</span>
          </h3>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading">
          <LoadingSpinner size="lg" message="Searching Pokémon..." />
        </div>

        <!-- Results Grid -->
        <div v-else-if="filteredPokemon.length > 0" class="results-grid">
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
          action-text="Reset Filters"
          action-icon="mdi:refresh"
          @action="resetFilters"
        />
      </div>

      <!-- Initial State -->
      <EmptyState
        v-else
        icon="mdi:filter-cog"
        title="Ready to Search"
        description="Configure your filters above and click 'Search Pokémon' to find your perfect match"
        action-text="Search All"
        action-icon="mdi:magnify"
        @action="performSearch"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.advanced-search {
  min-height: 100vh;
  padding: $spacing-6 0;
  background: $gray-50;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    margin-bottom: $spacing-6;
  }

  &__header-content {
    @include flex-center;
    gap: $spacing-4;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      text-align: center;
    }
  }

  &__header-icon {
    font-size: 64px;
    color: $primary;
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

  &__filters {
    @include flex-column;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    margin-bottom: $spacing-6;
  }

  &__filters-header {
    @include flex-between;
    align-items: center;
    gap: $spacing-3;
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
      color: $primary;
    }
  }

  &__results {
    @include flex-column;
    gap: $spacing-6;
  }
}

.filter-badge {
  @include flex-center;
  min-width: 24px;
  height: 24px;
  padding: 0 $spacing-2;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
}

.btn-reset {
  @include reset-button;
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background: rgba($error, 0.1);
  color: $error;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  transition: all $transition-fast;

  &:hover {
    background: rgba($error, 0.2);
  }

  svg {
    font-size: 18px;
  }
}

.filter-group {
  @include flex-column;
  gap: $spacing-2;
}

.filter-label {
  @include flex-center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;

  svg {
    font-size: 18px;
    color: $primary;
  }
}

.filter-input {
  padding: $spacing-3;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  outline: none;
  transition: border-color $transition-fast;

  &:focus {
    border-color: $primary;
  }

  &::placeholder {
    color: $text-hint;
  }
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: $spacing-2;
}

.type-btn {
  @include reset-button;
  padding: $spacing-2;
  background: $white;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  transition: all $transition-fast;
  opacity: 0.5;

  &:hover {
    opacity: 0.8;
    transform: scale(1.05);
  }

  &--active {
    opacity: 1;
    border-color: $primary;
    background: rgba($primary, 0.05);
  }
}

.generation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: $spacing-2;
}

.gen-btn {
  @include reset-button;
  padding: $spacing-2 $spacing-3;
  background: $gray-50;
  color: $text-secondary;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
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
}

.range-inputs {
  @include flex-center;
  gap: $spacing-2;

  span {
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.range-input {
  flex: 1;
  padding: $spacing-2 $spacing-3;
  border: 2px solid $gray-200;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  outline: none;
  transition: border-color $transition-fast;

  &:focus {
    border-color: $primary;
  }
}

.btn-search {
  @include reset-button;
  @include flex-center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-4 $spacing-6;
  background: $primary;
  color: $white;
  border-radius: $radius-lg;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:hover {
    background: $primary-dark;
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }

  svg {
    font-size: 24px;
  }
}

.results-header {
  @include flex-between;
  align-items: center;
}

.results-title {
  @include flex-center;
  gap: $spacing-3;
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.results-count {
  @include flex-center;
  min-width: 40px;
  height: 40px;
  padding: 0 $spacing-3;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  font-size: $font-size-xl;
  font-family: $font-family-mono;
}

.loading {
  @include flex-center;
  padding: $spacing-12 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
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
