<script setup lang="ts">
import { TYPE_COLORS, POKEMON_TYPES, GENERATIONS } from '~/constants/pokemon'
import type { SortOption } from '~/types'

const filtersStore = useFiltersStore()

// Local state for UI
const showTypeDropdown = ref(false)
const showGenerationDropdown = ref(false)
const showSortDropdown = ref(false)

// Sort options
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'id', label: 'Pokédex Number' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'height', label: 'Height' },
  { value: 'weight', label: 'Weight' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'special-attack', label: 'Sp. Attack' },
  { value: 'special-defense', label: 'Sp. Defense' },
  { value: 'speed', label: 'Speed' },
]

const selectedSortOption = computed(() => {
  return sortOptions.find(opt => opt.value === filtersStore.sortBy)?.label || 'Sort By'
})

const toggleType = (type: string) => {
  const index = filtersStore.types.indexOf(type)
  if (index > -1) {
    filtersStore.removeType(type)
  } else {
    filtersStore.addType(type)
  }
}

const selectGeneration = (genId: number | null) => {
  filtersStore.setGeneration(genId)
  showGenerationDropdown.value = false
}

const setSortBy = (sortBy: SortOption) => {
  filtersStore.setSortBy(sortBy)
  showSortDropdown.value = false
}

const toggleSortOrder = () => {
  filtersStore.setSortOrder(filtersStore.sortOrder === 'asc' ? 'desc' : 'asc')
}

const activeFiltersCount = computed(() => {
  let count = 0
  if (filtersStore.search) count++
  if (filtersStore.types.length > 0) count += filtersStore.types.length
  if (filtersStore.generation !== null) count++
  if (filtersStore.legendary !== null) count++
  if (filtersStore.mythical !== null) count++
  return count
})

// Close dropdowns when clicking outside
const typeDropdownRef = ref<HTMLElement>()
const generationDropdownRef = ref<HTMLElement>()
const sortDropdownRef = ref<HTMLElement>()

onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (typeDropdownRef.value && !typeDropdownRef.value.contains(event.target as Node)) {
      showTypeDropdown.value = false
    }
    if (generationDropdownRef.value && !generationDropdownRef.value.contains(event.target as Node)) {
      showGenerationDropdown.value = false
    }
    if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
      showSortDropdown.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<template>
  <div class="pokemon-filters">
    <!-- Search Bar -->
    <div class="pokemon-filters__search">
      <Icon name="mdi:magnify" class="pokemon-filters__search-icon" />
      <input
        v-model="filtersStore.search"
        type="text"
        placeholder="Search Pokémon by name or number..."
        class="pokemon-filters__search-input"
      />
      <button
        v-if="filtersStore.search"
        class="pokemon-filters__search-clear"
        @click="filtersStore.setSearch('')"
      >
        <Icon name="mdi:close" />
      </button>
    </div>

    <!-- Filter Controls -->
    <div class="pokemon-filters__controls">
      <!-- Type Filter -->
      <div ref="typeDropdownRef" class="pokemon-filters__dropdown">
        <button
          class="pokemon-filters__dropdown-trigger"
          :class="{ 'pokemon-filters__dropdown-trigger--active': filtersStore.types.length > 0 }"
          @click="showTypeDropdown = !showTypeDropdown"
        >
          <Icon name="mdi:shape" />
          <span>Types</span>
          <span v-if="filtersStore.types.length > 0" class="pokemon-filters__badge">
            {{ filtersStore.types.length }}
          </span>
          <Icon
            name="mdi:chevron-down"
            :class="{ 'rotate-180': showTypeDropdown }"
          />
        </button>

        <div v-if="showTypeDropdown" class="pokemon-filters__dropdown-menu pokemon-filters__types-grid">
          <button
            v-for="type in POKEMON_TYPES"
            :key="type"
            class="pokemon-filters__type-option"
            :class="{ 'pokemon-filters__type-option--selected': filtersStore.types.includes(type) }"
            :style="{ '--type-color': TYPE_COLORS[type] }"
            @click="toggleType(type)"
          >
            <span class="pokemon-filters__type-check">
              <Icon v-if="filtersStore.types.includes(type)" name="mdi:check" />
            </span>
            {{ type }}
          </button>
        </div>
      </div>

      <!-- Generation Filter -->
      <div ref="generationDropdownRef" class="pokemon-filters__dropdown">
        <button
          class="pokemon-filters__dropdown-trigger"
          :class="{ 'pokemon-filters__dropdown-trigger--active': filtersStore.generation !== null }"
          @click="showGenerationDropdown = !showGenerationDropdown"
        >
          <Icon name="mdi:pokeball" />
          <span>{{ filtersStore.generation ? `Gen ${filtersStore.generation}` : 'Generation' }}</span>
          <Icon
            name="mdi:chevron-down"
            :class="{ 'rotate-180': showGenerationDropdown }"
          />
        </button>

        <div v-if="showGenerationDropdown" class="pokemon-filters__dropdown-menu">
          <button
            class="pokemon-filters__dropdown-item"
            :class="{ 'pokemon-filters__dropdown-item--selected': filtersStore.generation === null }"
            @click="selectGeneration(null)"
          >
            All Generations
          </button>
          <button
            v-for="gen in GENERATIONS"
            :key="gen.id"
            class="pokemon-filters__dropdown-item"
            :class="{ 'pokemon-filters__dropdown-item--selected': filtersStore.generation === gen.id }"
            @click="selectGeneration(gen.id)"
          >
            <div class="pokemon-filters__gen-info">
              <span class="pokemon-filters__gen-name">{{ gen.name }}</span>
              <span class="pokemon-filters__gen-region">{{ gen.region }}</span>
            </div>
            <span class="pokemon-filters__gen-range">#{{ gen.range[0] }}-{{ gen.range[1] }}</span>
          </button>
        </div>
      </div>

      <!-- Sort -->
      <div ref="sortDropdownRef" class="pokemon-filters__dropdown">
        <button
          class="pokemon-filters__dropdown-trigger"
          @click="showSortDropdown = !showSortDropdown"
        >
          <Icon name="mdi:sort" />
          <span>{{ selectedSortOption }}</span>
          <Icon
            name="mdi:chevron-down"
            :class="{ 'rotate-180': showSortDropdown }"
          />
        </button>

        <div v-if="showSortDropdown" class="pokemon-filters__dropdown-menu">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="pokemon-filters__dropdown-item"
            :class="{ 'pokemon-filters__dropdown-item--selected': filtersStore.sortBy === option.value }"
            @click="setSortBy(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Sort Order -->
      <button
        class="pokemon-filters__sort-order"
        :title="filtersStore.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
        @click="toggleSortOrder"
      >
        <Icon :name="filtersStore.sortOrder === 'asc' ? 'mdi:sort-ascending' : 'mdi:sort-descending'" />
      </button>

      <!-- Clear Filters -->
      <button
        v-if="activeFiltersCount > 0"
        class="pokemon-filters__clear"
        @click="filtersStore.clearFilters()"
      >
        <Icon name="mdi:filter-remove" />
        <span>Clear ({{ activeFiltersCount }})</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-filters {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  margin-bottom: $spacing-6;

  &__search {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__search-icon {
    position: absolute;
    left: $spacing-4;
    font-size: 24px;
    color: $text-secondary;
    pointer-events: none;
  }

  &__search-input {
    width: 100%;
    padding: $spacing-4 $spacing-12;
    padding-left: $spacing-12;
    border: 2px solid $gray-300;
    border-radius: $radius-full;
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

  &__search-clear {
    @include reset-button;
    @include flex-center;
    position: absolute;
    right: $spacing-4;
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    color: $text-secondary;
    transition: all $transition-fast;

    &:hover {
      background-color: $gray-100;
      color: $text-primary;
    }
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-3;
    align-items: center;
  }

  &__dropdown {
    position: relative;
  }

  &__dropdown-trigger {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    transition: all $transition-fast;
    white-space: nowrap;

    &:hover {
      background: $gray-100;
      border-color: $gray-300;
    }

    &--active {
      background: rgba($primary, 0.1);
      border-color: $primary;
      color: $primary;
    }

    svg {
      transition: transform $transition-fast;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  }

  &__badge {
    @include flex-center;
    width: 20px;
    height: 20px;
    background: $primary;
    color: $white;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
  }

  &__dropdown-menu {
    position: absolute;
    top: calc(100% + $spacing-2);
    left: 0;
    min-width: 200px;
    max-height: 400px;
    overflow-y: auto;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-xl;
    z-index: $z-index-dropdown;
    @include custom-scrollbar();
    animation: dropdownSlideIn 0.2s ease-out;
  }

  &__dropdown-item {
    @include reset-button;
    @include flex-between;
    width: 100%;
    padding: $spacing-3 $spacing-4;
    text-align: left;
    font-size: $font-size-sm;
    transition: all $transition-fast;

    &:hover {
      background: $gray-50;
    }

    &--selected {
      background: rgba($primary, 0.1);
      color: $primary;
      font-weight: $font-weight-semibold;
    }

    &:first-child {
      border-radius: $radius-lg $radius-lg 0 0;
    }

    &:last-child {
      border-radius: 0 0 $radius-lg $radius-lg;
    }
  }

  &__gen-info {
    @include flex-column;
    gap: $spacing-1;
  }

  &__gen-name {
    font-weight: $font-weight-semibold;
  }

  &__gen-region {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  &__gen-range {
    font-size: $font-size-xs;
    font-family: $font-family-mono;
    color: $text-secondary;
  }

  &__types-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-2;
    padding: $spacing-3;
    min-width: 300px;
  }

  &__type-option {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: var(--type-color);
    color: $white;
    border-radius: $radius-md;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all $transition-fast;
    opacity: 0.6;

    &:hover {
      opacity: 1;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &--selected {
      opacity: 1;
      box-shadow: 0 0 0 2px $white, 0 0 0 4px var(--type-color);
    }
  }

  &__type-check {
    @include flex-center;
    width: 16px;
    height: 16px;
    background: rgba($white, 0.3);
    border-radius: $radius-sm;
  }

  &__sort-order {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $gray-100;
      border-color: $gray-300;
    }

    svg {
      font-size: 24px;
    }
  }

  &__clear {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: rgba($error, 0.1);
    color: $error;
    border: 2px solid rgba($error, 0.2);
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;

    &:hover {
      background: rgba($error, 0.2);
      border-color: $error;
    }
  }
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: $breakpoint-sm) {
  .pokemon-filters {
    &__controls {
      flex-direction: column;
      width: 100%;
    }

    &__dropdown-trigger,
    &__clear {
      width: 100%;
      justify-content: center;
    }

    &__dropdown-menu {
      left: 0;
      right: 0;
      width: 100%;
    }

    &__types-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
