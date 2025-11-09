<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemons?: Pokemon[]
  loading?: boolean
  gridCols?: number
  showLoadMore?: boolean
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pokemons: () => [],
  loading: false,
  gridCols: 4,
  showLoadMore: true,
  hasMore: false
})

const emit = defineEmits<{
  loadMore: []
}>()

const filtersStore = useFiltersStore()

// Calculate number of skeleton loaders to show
const skeletonCount = computed(() => {
  // Show 12 skeleton loaders during initial load
  return props.loading ? 12 : 0
})

// Grid columns based on breakpoints
const gridClasses = computed(() => {
  return 'pokemon-list__grid'
})

const filteredPokemons = computed(() => {
  if (!props.pokemons) return []

  let filtered = [...props.pokemons]

  // Apply search filter
  if (filtersStore.search) {
    const searchLower = filtersStore.search.toLowerCase()
    filtered = filtered.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchLower) ||
      pokemon.id.toString().includes(searchLower)
    )
  }

  // Apply type filter
  if (filtersStore.types.length > 0) {
    filtered = filtered.filter(pokemon =>
      pokemon.types.some(t =>
        filtersStore.types.includes(t.type.name)
      )
    )
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const { sortBy, sortOrder } = filtersStore
    let comparison = 0

    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id
        break
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'height':
        comparison = a.height - b.height
        break
      case 'weight':
        comparison = a.weight - b.weight
        break
      case 'hp':
      case 'attack':
      case 'defense':
      case 'special-attack':
      case 'special-defense':
      case 'speed': {
        const statA = a.stats.find(s => s.stat.name === sortBy)?.base_stat || 0
        const statB = b.stats.find(s => s.stat.name === sortBy)?.base_stat || 0
        comparison = statA - statB
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  return filtered
})

const hasResults = computed(() => {
  return filteredPokemons.value.length > 0 || props.loading
})

const handleLoadMore = () => {
  if (!props.loading && props.hasMore) {
    emit('loadMore')
  }
}
</script>

<template>
  <div class="pokemon-list">
    <div v-if="!hasResults && !loading" class="pokemon-list__empty">
      <EmptyState
        icon="mdi:pokeball"
        title="No Pokémon found"
        description="Try adjusting your filters or search terms"
        action-text="Clear Filters"
        action-icon="mdi:filter-remove"
        @action="filtersStore.clearFilters()"
      />
    </div>

    <div v-else :class="gridClasses">
      <!-- Actual Pokemon Cards -->
      <PokemonCard
        v-for="pokemon in filteredPokemons"
        :key="pokemon.id"
        :pokemon="pokemon"
      />

      <!-- Skeleton Loaders -->
      <PokemonCard
        v-for="n in skeletonCount"
        :key="`skeleton-${n}`"
        loading
      />
    </div>

    <!-- Load More Button -->
    <div v-if="showLoadMore && hasMore && !loading" class="pokemon-list__load-more">
      <button
        class="pokemon-list__load-more-btn"
        @click="handleLoadMore"
      >
        <Icon name="mdi:chevron-down" />
        Load More Pokémon
      </button>
    </div>

    <!-- Loading More Indicator -->
    <div v-if="loading && filteredPokemons.length > 0" class="pokemon-list__loading">
      <LoadingSpinner size="md" message="Loading more Pokémon..." />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-list {
  width: 100%;

  &__grid {
    display: grid;
    gap: $spacing-6;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    margin-bottom: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }

    @media (min-width: $breakpoint-sm) and (max-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $breakpoint-md) and (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__empty {
    padding: $spacing-12 0;
  }

  &__load-more {
    @include flex-center;
    padding: $spacing-8 0;
  }

  &__load-more-btn {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-4 $spacing-8;
    background-color: $primary;
    color: $white;
    border: none;
    border-radius: $radius-full;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all $transition-base;
    box-shadow: $shadow-md;

    &:hover {
      background-color: $primary-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-lg;
    }

    &:active {
      transform: translateY(0);
    }

    svg {
      font-size: 24px;
      animation: bounce 2s infinite;
    }
  }

  &__loading {
    @include flex-center;
    padding: $spacing-8 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}
</style>
