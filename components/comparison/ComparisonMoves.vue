<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: [id: number]
}>()

// Move learning method filter
const selectedMethod = ref<string>('level-up')

const learningMethods = [
  { value: 'level-up', label: 'Level Up' },
  { value: 'machine', label: 'TM/HM' },
  { value: 'egg', label: 'Egg Moves' },
  { value: 'tutor', label: 'Tutor' },
]

// Get filtered moves for a Pokemon
const getFilteredMoves = (pokemon: Pokemon) => {
  return pokemon.moves
    .filter(m => {
      return m.version_group_details.some(v =>
        v.move_learn_method.name === selectedMethod.value
      )
    })
    .sort((a, b) => {
      const aLevel = a.version_group_details.find(v => v.move_learn_method.name === selectedMethod.value)?.level_learned_at || 0
      const bLevel = b.version_group_details.find(v => v.move_learn_method.name === selectedMethod.value)?.level_learned_at || 0
      return aLevel - bLevel
    })
    .slice(0, 20) // Limit to 20 moves for performance
}

// Get level learned for a move
const getLevelLearned = (pokemon: Pokemon, moveName: string) => {
  const move = pokemon.moves.find(m => m.move.name === moveName)
  if (!move) return null

  const detail = move.version_group_details.find(v => v.move_learn_method.name === selectedMethod.value)
  return detail?.level_learned_at || null
}

// Check if Pokemon has a specific move
const hasMove = (pokemon: Pokemon, moveName: string): boolean => {
  return pokemon.moves.some(m =>
    m.move.name === moveName &&
    m.version_group_details.some(v => v.move_learn_method.name === selectedMethod.value)
  )
}

// Get all unique moves across all Pokemon
const allUniqueMoves = computed(() => {
  const moveSet = new Set<string>()

  props.pokemon.forEach(p => {
    getFilteredMoves(p).forEach(m => {
      moveSet.add(m.move.name)
    })
  })

  return Array.from(moveSet)
})
</script>

<template>
  <div class="comparison-moves">
    <!-- Learning Method Filter -->
    <div class="comparison-moves__filter">
      <h4 class="comparison-moves__filter-title">Learning Method</h4>
      <div class="comparison-moves__filter-buttons">
        <button
          v-for="method in learningMethods"
          :key="method.value"
          class="comparison-moves__filter-btn"
          :class="{ 'comparison-moves__filter-btn--active': selectedMethod === method.value }"
          @click="selectedMethod = method.value"
        >
          {{ method.label }}
        </button>
      </div>
    </div>

    <!-- Comparison Grid -->
    <div class="comparison-moves__grid">
      <div
        v-for="p in pokemon"
        :key="p.id"
        class="comparison-moves__card"
      >
        <!-- Remove Button -->
        <button
          class="comparison-moves__remove"
          @click="emit('remove', p.id)"
        >
          <Icon name="mdi:close" />
        </button>

        <!-- Pokemon Header -->
        <div class="comparison-moves__header">
          <img
            :src="p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default"
            :alt="p.name"
            class="comparison-moves__image"
          />
          <h3 class="comparison-moves__name">{{ p.name }}</h3>
          <div class="comparison-moves__types">
            <TypeBadge
              v-for="type in p.types"
              :key="type.slot"
              :type="type.type.name"
            />
          </div>
        </div>

        <!-- Moves Count -->
        <div class="comparison-moves__count">
          <Icon name="mdi:sword-cross" />
          <span>{{ getFilteredMoves(p).length }} moves</span>
        </div>

        <!-- Moves List -->
        <div class="comparison-moves__list">
          <div
            v-for="move in getFilteredMoves(p)"
            :key="move.move.name"
            class="comparison-moves__move"
          >
            <span class="comparison-moves__move-name">
              {{ move.move.name }}
            </span>
            <span
              v-if="selectedMethod === 'level-up' && getLevelLearned(p, move.move.name)"
              class="comparison-moves__move-level"
            >
              Lv. {{ getLevelLearned(p, move.move.name) }}
            </span>
          </div>

          <!-- Empty state -->
          <div
            v-if="getFilteredMoves(p).length === 0"
            class="comparison-moves__empty"
          >
            <Icon name="mdi:sword-off" />
            <span>No {{ learningMethods.find(m => m.value === selectedMethod)?.label }} moves</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Shared Moves Analysis -->
    <div v-if="allUniqueMoves.length > 0" class="comparison-moves__analysis">
      <h3 class="comparison-moves__analysis-title">
        <Icon name="mdi:chart-box" />
        Move Analysis
      </h3>

      <div class="comparison-moves__stats">
        <div class="comparison-moves__stat-card">
          <div class="comparison-moves__stat-value">{{ allUniqueMoves.length }}</div>
          <div class="comparison-moves__stat-label">Total Unique Moves</div>
        </div>

        <div class="comparison-moves__stat-card">
          <div class="comparison-moves__stat-value">
            {{ allUniqueMoves.filter(move => pokemon.every(p => hasMove(p, move))).length }}
          </div>
          <div class="comparison-moves__stat-label">Shared by All</div>
        </div>

        <div
          v-for="p in pokemon"
          :key="`stat-${p.id}`"
          class="comparison-moves__stat-card"
        >
          <div class="comparison-moves__stat-value">{{ getFilteredMoves(p).length }}</div>
          <div class="comparison-moves__stat-label">{{ p.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comparison-moves {
  @include flex-column;
  gap: $spacing-6;

  &__filter {
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__filter-title {
    margin: 0 0 $spacing-3;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__filter-buttons {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__filter-btn {
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
      background: $primary;
      color: $white;
      border-color: $primary;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    position: relative;
    @include flex-column;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border: 2px solid $gray-200;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    max-height: 600px;
    overflow: hidden;
  }

  &__remove {
    @include reset-button;
    position: absolute;
    top: $spacing-3;
    right: $spacing-3;
    width: 36px;
    height: 36px;
    @include flex-center;
    background: rgba($error, 0.1);
    color: $error;
    border-radius: $radius-full;
    transition: all $transition-fast;
    z-index: 10;

    &:hover {
      background: $error;
      color: $white;
      transform: scale(1.1);
    }

    svg {
      font-size: 20px;
    }
  }

  &__header {
    @include flex-column;
    align-items: center;
    gap: $spacing-3;
    padding-bottom: $spacing-4;
    border-bottom: 2px solid $gray-200;
  }

  &__image {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }

  &__name {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__types {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__count {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2;
    background: $gray-50;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;

    svg {
      font-size: 20px;
      color: $primary;
    }
  }

  &__list {
    @include flex-column;
    gap: $spacing-2;
    overflow-y: auto;
    @include custom-scrollbar(6px, $gray-300, $primary);
    padding-right: $spacing-2;
  }

  &__move {
    @include flex-between;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: $gray-50;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
      background: $gray-100;
      transform: translateX(4px);
    }
  }

  &__move-name {
    font-size: $font-size-sm;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__move-level {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: $primary;
    padding: $spacing-1 $spacing-2;
    background: rgba($primary, 0.1);
    border-radius: $radius-sm;
  }

  &__empty {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-6;
    color: $text-secondary;
    font-size: $font-size-sm;

    svg {
      font-size: 24px;
    }
  }

  &__analysis {
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__analysis-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-4;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    svg {
      font-size: 28px;
      color: $primary;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: $spacing-4;
  }

  &__stat-card {
    @include flex-column;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;
    border: 2px solid $gray-200;
  }

  &__stat-value {
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    color: $primary;
    font-family: $font-family-secondary;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    text-align: center;
    text-transform: capitalize;
  }
}
</style>
