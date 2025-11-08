<script setup lang="ts">
import type { Pokemon } from '~/types'
import { TYPE_EFFECTIVENESS } from '~/constants/pokemon'

interface Props {
  pokemon: Pokemon[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: [id: number]
}>()

// All Pokemon types for effectiveness table
const allTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

// Calculate type effectiveness
const calculateEffectiveness = (pokemonTypes: string[], attackType: string): number => {
  let effectiveness = 1

  pokemonTypes.forEach(defenseType => {
    const typeData = TYPE_EFFECTIVENESS[attackType as keyof typeof TYPE_EFFECTIVENESS]
    if (!typeData) return

    if (typeData.strong?.includes(defenseType)) {
      effectiveness *= 2
    } else if (typeData.weak?.includes(defenseType)) {
      effectiveness *= 0.5
    } else if (typeData.immune?.includes(defenseType)) {
      effectiveness *= 0
    }
  })

  return effectiveness
}

// Get effectiveness class
const getEffectivenessClass = (effectiveness: number): string => {
  if (effectiveness === 0) return 'immune'
  if (effectiveness >= 4) return 'super-effective-4x'
  if (effectiveness >= 2) return 'super-effective'
  if (effectiveness <= 0.25) return 'not-effective-4x'
  if (effectiveness <= 0.5) return 'not-effective'
  return 'normal'
}

// Get effectiveness label
const getEffectivenessLabel = (effectiveness: number): string => {
  if (effectiveness === 0) return '0×'
  if (effectiveness === 4) return '4×'
  if (effectiveness === 2) return '2×'
  if (effectiveness === 1) return '1×'
  if (effectiveness === 0.5) return '½×'
  if (effectiveness === 0.25) return '¼×'
  return `${effectiveness}×`
}

// Get Pokemon types as array of strings
const getPokemonTypes = (pokemon: Pokemon): string[] => {
  return pokemon.types.map(t => t.type.name)
}
</script>

<template>
  <div class="comparison-types">
    <!-- Pokemon Headers -->
    <div class="comparison-types__headers">
      <div class="comparison-types__type-column">
        <h4>Attacking Type</h4>
      </div>

      <div
        v-for="p in pokemon"
        :key="p.id"
        class="comparison-types__pokemon-header"
      >
        <button
          class="comparison-types__remove"
          @click="emit('remove', p.id)"
        >
          <Icon name="mdi:close" />
        </button>

        <img
          :src="p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default"
          :alt="p.name"
          class="comparison-types__pokemon-image"
        />
        <h3 class="comparison-types__pokemon-name">{{ p.name }}</h3>
        <div class="comparison-types__pokemon-types">
          <TypeBadge
            v-for="type in p.types"
            :key="type.slot"
            :type="type.type.name"
          />
        </div>
      </div>
    </div>

    <!-- Effectiveness Table -->
    <div class="comparison-types__table">
      <div
        v-for="attackType in allTypes"
        :key="attackType"
        class="comparison-types__row"
      >
        <!-- Type Name -->
        <div class="comparison-types__type-cell">
          <TypeBadge :type="attackType" />
        </div>

        <!-- Effectiveness for each Pokemon -->
        <div
          v-for="p in pokemon"
          :key="p.id"
          class="comparison-types__effectiveness-cell"
        >
          <div
            class="comparison-types__effectiveness-badge"
            :class="`comparison-types__effectiveness-badge--${getEffectivenessClass(calculateEffectiveness(getPokemonTypes(p), attackType))}`"
          >
            {{ getEffectivenessLabel(calculateEffectiveness(getPokemonTypes(p), attackType)) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="comparison-types__legend">
      <h4 class="comparison-types__legend-title">Legend</h4>
      <div class="comparison-types__legend-items">
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--immune">0×</div>
          <span>Immune</span>
        </div>
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--not-effective-4x">¼×</div>
          <span>Very Weak</span>
        </div>
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--not-effective">½×</div>
          <span>Not Very Effective</span>
        </div>
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--normal">1×</div>
          <span>Normal</span>
        </div>
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--super-effective">2×</div>
          <span>Super Effective</span>
        </div>
        <div class="comparison-types__legend-item">
          <div class="comparison-types__legend-badge comparison-types__legend-badge--super-effective-4x">4×</div>
          <span>Very Effective</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comparison-types {
  @include flex-column;
  gap: $spacing-6;

  &__headers {
    display: grid;
    grid-template-columns: 150px repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__type-column {
    @include flex-center;
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;

    h4 {
      margin: 0;
      font-size: $font-size-base;
      font-weight: $font-weight-bold;
      color: $text-primary;
      text-align: center;
    }
  }

  &__pokemon-header {
    position: relative;
    @include flex-column;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
  }

  &__remove {
    @include reset-button;
    position: absolute;
    top: $spacing-2;
    right: $spacing-2;
    width: 32px;
    height: 32px;
    @include flex-center;
    background: rgba($error, 0.1);
    color: $error;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $error;
      color: $white;
    }

    svg {
      font-size: 18px;
    }
  }

  &__pokemon-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  &__pokemon-name {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__pokemon-types {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__table {
    @include flex-column;
    gap: $spacing-2;
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__row {
    display: grid;
    grid-template-columns: 150px repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
    align-items: center;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 100px 1fr;

      .comparison-types__effectiveness-cell {
        grid-column: 2;
      }
    }
  }

  &__type-cell {
    @include flex-center;
  }

  &__effectiveness-cell {
    @include flex-center;
  }

  &__effectiveness-badge {
    padding: $spacing-2 $spacing-3;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    text-align: center;
    min-width: 40px;

    &--immune {
      background: $gray-400;
      color: $white;
    }

    &--not-effective-4x {
      background: rgba($error, 0.3);
      color: darken($error, 10%);
    }

    &--not-effective {
      background: rgba($error, 0.15);
      color: $error;
    }

    &--normal {
      background: $gray-200;
      color: $text-secondary;
    }

    &--super-effective {
      background: rgba($success, 0.15);
      color: $success;
    }

    &--super-effective-4x {
      background: rgba($success, 0.3);
      color: darken($success, 10%);
    }
  }

  &__legend {
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__legend-title {
    margin: 0 0 $spacing-3;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__legend-items {
    display: flex;
    gap: $spacing-4;
    flex-wrap: wrap;
  }

  &__legend-item {
    @include flex-center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &__legend-badge {
    padding: $spacing-1 $spacing-2;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    min-width: 32px;
    text-align: center;

    &--immune {
      background: $gray-400;
      color: $white;
    }

    &--not-effective-4x {
      background: rgba($error, 0.3);
      color: darken($error, 10%);
    }

    &--not-effective {
      background: rgba($error, 0.15);
      color: $error;
    }

    &--normal {
      background: $gray-200;
      color: $text-secondary;
    }

    &--super-effective {
      background: rgba($success, 0.15);
      color: $success;
    }

    &--super-effective-4x {
      background: rgba($success, 0.3);
      color: darken($success, 10%);
    }
  }
}
</style>
