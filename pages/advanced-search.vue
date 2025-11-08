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
  <div class="page advanced-search">
    <div class="advanced-search__container">
      <!-- Header -->
      <div class="page__header">
        <Icon name="mdi:filter-cog" class="page__header-icon" />
        <h1 class="page__title">Advanced Search</h1>
        <p class="page__description">
          Find Pokémon using powerful filters for type, stats, generation, and more
        </p>
      </div>

      <div class="advanced-search__layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <div class="filters-sidebar__header">
            <h3 class="filters-sidebar__title">
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

          <div class="filters-sidebar__content">
            <!-- Name Search -->
            <div class="filter-group">
              <label class="filter-label">
                <Icon name="mdi:magnify" />
                <span>Name or Number</span>
              </label>
              <input
                v-model="filters.name"
                type="text"
                placeholder="e.g., Pikachu or 25"
                class="filter-input"
              />
            </div>

            <!-- Type Filter -->
            <div class="filter-group">
              <label class="filter-label">
                <Icon name="mdi:shape" />
                <span>Types{{ filters.types.length > 0 ? ` (${filters.types.length} selected)` : '' }}</span>
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
                  {{ gen }}
                </button>
              </div>
            </div>

            <!-- Stats Filters -->
            <div class="filter-group">
              <label class="filter-label">
                <Icon name="mdi:chart-line" />
                <span>Stats Range</span>
              </label>

              <div class="stat-ranges">
                <div class="stat-range">
                  <div class="stat-range__label">
                    <Icon name="mdi:heart" />
                    <span>HP</span>
                  </div>
                  <div class="stat-range__inputs">
                    <input
                      v-model.number="filters.minHP"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxHP"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>

                <div class="stat-range">
                  <div class="stat-range__label">
                    <Icon name="mdi:sword" />
                    <span>Attack</span>
                  </div>
                  <div class="stat-range__inputs">
                    <input
                      v-model.number="filters.minAttack"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxAttack"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>

                <div class="stat-range">
                  <div class="stat-range__label">
                    <Icon name="mdi:shield" />
                    <span>Defense</span>
                  </div>
                  <div class="stat-range__inputs">
                    <input
                      v-model.number="filters.minDefense"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxDefense"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>

                <div class="stat-range">
                  <div class="stat-range__label">
                    <Icon name="mdi:run-fast" />
                    <span>Speed</span>
                  </div>
                  <div class="stat-range__inputs">
                    <input
                      v-model.number="filters.minSpeed"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxSpeed"
                      type="number"
                      min="0"
                      max="255"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Physical Filters -->
            <div class="filter-group">
              <label class="filter-label">
                <Icon name="mdi:ruler" />
                <span>Physical Attributes</span>
              </label>

              <div class="physical-ranges">
                <div class="physical-range">
                  <span class="physical-range__label">Height (dm)</span>
                  <div class="physical-range__inputs">
                    <input
                      v-model.number="filters.minHeight"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxHeight"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>

                <div class="physical-range">
                  <span class="physical-range__label">Weight (hg)</span>
                  <div class="physical-range__inputs">
                    <input
                      v-model.number="filters.minWeight"
                      type="number"
                      min="0"
                      max="10000"
                      placeholder="Min"
                      class="stat-input"
                    />
                    <span>-</span>
                    <input
                      v-model.number="filters.maxWeight"
                      type="number"
                      min="0"
                      max="10000"
                      placeholder="Max"
                      class="stat-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Search Button -->
            <button class="btn btn--primary btn--lg btn--full" @click="performSearch">
              <Icon name="mdi:magnify" />
              <span>Search Pokémon</span>
            </button>
          </div>
        </aside>

        <!-- Results Section -->
        <main class="results-section">
          <!-- Empty State (before search) -->
          <div v-if="!searchPerformed" class="welcome-state">
            <Icon name="mdi:pokeball" class="welcome-state__icon" />
            <h2 class="welcome-state__title">Ready to Search</h2>
            <p class="welcome-state__description">
              Configure your filters on the left and click "Search Pokémon" to find your perfect match
            </p>
            <div class="welcome-state__features">
              <div class="feature-item">
                <Icon name="mdi:shape" />
                <span>Filter by type combinations</span>
              </div>
              <div class="feature-item">
                <Icon name="mdi:chart-bar" />
                <span>Set min/max stats ranges</span>
              </div>
              <div class="feature-item">
                <Icon name="mdi:earth" />
                <span>Search specific generations</span>
              </div>
            </div>
          </div>

          <!-- Results Header -->
          <div v-else class="results-header">
            <h2 class="results-title">
              <Icon name="mdi:format-list-bulleted" />
              <span>Search Results</span>
              <span class="results-count">{{ filteredPokemon.length }}</span>
            </h2>
          </div>

          <!-- Loading -->
          <div v-if="loading && searchPerformed" class="loading-state">
            <LoadingSpinner size="lg" />
            <p>Searching Pokémon...</p>
          </div>

          <!-- Results Grid -->
          <div v-else-if="searchPerformed && filteredPokemon.length > 0" class="results-grid">
            <PokemonCard
              v-for="pokemon in filteredPokemon"
              :key="pokemon.id"
              :pokemon="pokemon"
            />
          </div>

          <!-- Empty State (no results) -->
          <div v-else-if="searchPerformed && filteredPokemon.length === 0" class="empty-state">
            <Icon name="mdi:pokemon-go" class="empty-state__icon" />
            <h3 class="empty-state__title">No Pokémon Found</h3>
            <p class="empty-state__description">
              Try adjusting your filters to see more results
            </p>
            <button class="btn btn--secondary" @click="resetFilters">
              <Icon name="mdi:refresh" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.advanced-search {
  min-height: 100vh;
  padding: $spacing-8 0;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: $spacing-8;
    align-items: start;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: 1fr;
    }
  }
}

.page__header {
  text-align: center;
  margin-bottom: $spacing-10;

  &-icon {
    font-size: 64px;
    color: $primary;
    margin-bottom: $spacing-4;
  }
}

// Filters Sidebar
.filters-sidebar {
  background: $white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-xl;
  position: sticky;
  top: $spacing-6;
  max-height: calc(100vh - #{$spacing-12});
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: $breakpoint-lg) {
    position: relative;
    top: 0;
    max-height: none;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    padding: $spacing-6 $spacing-6 $spacing-4;
    border-bottom: 1px solid $gray-200;
  }

  &__title {
    display: flex;
    align-items: center;
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

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-6;
    display: flex;
    flex-direction: column;
    gap: $spacing-6;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-300;
      border-radius: $radius-full;
    }
  }
}

.filter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background: rgba($error, 0.1);
  color: $error;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  transition: all $transition-fast;

  &:hover {
    background: rgba($error, 0.2);
  }

  svg {
    font-size: 16px;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $text-primary;

  svg {
    font-size: 18px;
    color: $primary;
  }
}

.filter-input {
  padding: $spacing-3;
  border: 2px solid $gray-300;
  border-radius: $radius-md;
  font-size: $font-size-base;
  transition: all $transition-fast;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }

  &::placeholder {
    color: $text-hint;
  }
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-2;
}

.type-btn {
  @include reset-button;
  padding: $spacing-2;
  background: $gray-50;
  border: 2px solid transparent;
  border-radius: $radius-md;
  transition: all $transition-fast;
  opacity: 0.4;

  &:hover {
    opacity: 0.7;
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
  grid-template-columns: repeat(5, 1fr);
  gap: $spacing-2;
}

.gen-btn {
  @include reset-button;
  padding: $spacing-2;
  background: $gray-100;
  color: $text-secondary;
  border: 2px solid transparent;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  transition: all $transition-fast;

  &:hover:not(&--active) {
    background: $gray-200;
  }

  &--active {
    background: $primary;
    color: $white;
    border-color: $primary;
  }
}

.stat-ranges,
.physical-ranges {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $gray-50;
  border-radius: $radius-lg;
}

.stat-range,
.physical-range {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  &__label {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;

    svg {
      font-size: 16px;
      color: $primary;
    }
  }

  &__inputs {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    span {
      color: $text-secondary;
      font-weight: $font-weight-semibold;
    }
  }
}

.stat-input {
  flex: 1;
  padding: $spacing-2;
  border: 1px solid $gray-300;
  border-radius: $radius-sm;
  font-size: $font-size-sm;
  text-align: center;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.btn--full {
  width: 100%;
}

// Results Section
.results-section {
  min-height: 500px;
}

.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-6;
  padding: $spacing-16 $spacing-8;
  background: $white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-lg;
  text-align: center;

  &__icon {
    font-size: 96px;
    color: $primary;
    animation: float 3s ease-in-out infinite;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  &__description {
    font-size: $font-size-lg;
    color: $text-secondary;
    max-width: 500px;
    margin: 0;
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    margin-top: $spacing-4;
  }
}

.feature-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background: $gray-50;
  border-radius: $radius-lg;
  font-weight: $font-weight-medium;

  svg {
    font-size: 24px;
    color: $primary;
  }
}

.results-header {
  margin-bottom: $spacing-6;
}

.results-title {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin: 0;

  svg {
    font-size: 28px;
    color: $primary;
  }
}

.results-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 32px;
  padding: 0 $spacing-3;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-16;
  color: $text-secondary;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-4;
  padding: $spacing-16 $spacing-8;
  background: $white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-lg;
  text-align: center;

  &__icon {
    font-size: 80px;
    color: $gray-400;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  &__description {
    font-size: $font-size-base;
    color: $text-secondary;
    margin: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
</style>
