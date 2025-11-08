<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon
}

const props = defineProps<Props>()

const searchQuery = ref('')
const selectedMethod = ref<string>('all')
const sortBy = ref<'name' | 'level'>('level')

const learnMethods = computed(() => {
  const methods = new Set(props.pokemon.moves.map(m => m.version_group_details[0]?.move_learn_method.name))
  return ['all', ...Array.from(methods)]
})

const filteredMoves = computed(() => {
  let moves = props.pokemon.moves.map(move => {
    const details = move.version_group_details[0]
    return {
      name: move.move.name,
      method: details?.move_learn_method.name || 'unknown',
      level: details?.level_learned_at || 0,
      url: move.move.url
    }
  })

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    moves = moves.filter(m => m.name.includes(query))
  }

  // Filter by method
  if (selectedMethod.value !== 'all') {
    moves = moves.filter(m => m.method === selectedMethod.value)
  }

  // Sort
  moves.sort((a, b) => {
    if (sortBy.value === 'level') {
      if (a.level === b.level) return a.name.localeCompare(b.name)
      return a.level - b.level
    }
    return a.name.localeCompare(b.name)
  })

  return moves
})

const methodColors: Record<string, string> = {
  'level-up': '#4caf50',
  'machine': '#2196f3',
  'egg': '#ff9800',
  'tutor': '#9c27b0',
  'unknown': '#9e9e9e',
}
</script>

<template>
  <div class="pokemon-moves">
    <!-- Controls -->
    <div class="pokemon-moves__controls">
      <div class="pokemon-moves__search">
        <Icon name="mdi:magnify" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search moves..."
          class="pokemon-moves__search-input"
        />
      </div>

      <select v-model="selectedMethod" class="pokemon-moves__select">
        <option v-for="method in learnMethods" :key="method" :value="method">
          {{ method === 'all' ? 'All Methods' : method.replace('-', ' ') }}
        </option>
      </select>

      <select v-model="sortBy" class="pokemon-moves__select">
        <option value="level">Sort by Level</option>
        <option value="name">Sort by Name</option>
      </select>
    </div>

    <!-- Moves List -->
    <div class="pokemon-moves__list">
      <div
        v-for="move in filteredMoves"
        :key="move.name"
        class="pokemon-moves__item"
      >
        <div class="pokemon-moves__item-main">
          <span class="pokemon-moves__name">{{ move.name.replace('-', ' ') }}</span>
          <span
            class="pokemon-moves__method"
            :style="{ backgroundColor: methodColors[move.method] || methodColors.unknown }"
          >
            {{ move.method.replace('-', ' ') }}
          </span>
        </div>
        <span v-if="move.level > 0" class="pokemon-moves__level">
          Lv. {{ move.level }}
        </span>
      </div>

      <EmptyState
        v-if="filteredMoves.length === 0"
        icon="mdi:sword-cross"
        title="No moves found"
        description="Try adjusting your filters"
      />
    </div>

    <!-- Summary -->
    <div class="pokemon-moves__summary">
      Showing {{ filteredMoves.length }} of {{ pokemon.moves.length }} moves
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-moves {
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-3;
  }

  &__search {
    @include flex-center;
    flex: 1;
    min-width: 200px;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;

    svg {
      font-size: 20px;
      color: $text-secondary;
    }
  }

  &__search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: $font-size-base;
    outline: none;
  }

  &__select {
    padding: $spacing-2 $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-transform: capitalize;
    cursor: pointer;
    transition: all $transition-fast;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }

  &__list {
    @include flex-column;
    gap: $spacing-2;
    max-height: 500px;
    overflow-y: auto;
    @include custom-scrollbar();
  }

  &__item {
    @include flex-between;
    padding: $spacing-3 $spacing-4;
    background: $gray-50;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
      background: $gray-100;
      transform: translateX(4px);
    }
  }

  &__item-main {
    @include flex-center;
    gap: $spacing-3;
    flex: 1;
  }

  &__name {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__method {
    padding: 2px $spacing-2;
    color: $white;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: capitalize;
  }

  &__level {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__summary {
    padding: $spacing-3;
    text-align: center;
    font-size: $font-size-sm;
    color: $text-secondary;
    border-top: 1px solid $gray-200;
  }
}
</style>
