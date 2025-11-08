<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: [id: number]
}>()

// Stat names mapping
const statNames: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed'
}

// Get all unique stats
const allStats = computed(() => {
  if (props.pokemon.length === 0) return []
  return props.pokemon[0].stats.map(s => s.stat.name)
})

// Get stat value for a Pokemon
const getStatValue = (pokemon: Pokemon, statName: string) => {
  const stat = pokemon.stats.find(s => s.stat.name === statName)
  return stat?.base_stat || 0
}

// Get total stats for a Pokemon
const getTotalStats = (pokemon: Pokemon) => {
  return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
}

// Get max stat value for highlighting
const getMaxStatValue = (statName: string) => {
  return Math.max(...props.pokemon.map(p => getStatValue(p, statName)))
}

// Check if this is the max value
const isMaxStat = (pokemon: Pokemon, statName: string) => {
  const value = getStatValue(pokemon, statName)
  const maxValue = getMaxStatValue(statName)
  return value === maxValue && value > 0
}

// Get percentage for progress bar
const getStatPercentage = (value: number, statName: string) => {
  const maxInComparison = getMaxStatValue(statName)
  return maxInComparison > 0 ? (value / maxInComparison) * 100 : 0
}

// Format height (decimeters to meters)
const formatHeight = (height: number) => {
  return `${(height / 10).toFixed(1)} m`
}

// Format weight (hectograms to kg)
const formatWeight = (weight: number) => {
  return `${(weight / 10).toFixed(1)} kg`
}
</script>

<template>
  <div class="comparison-stats">
    <!-- Pokemon Cards Grid -->
    <div class="comparison-stats__grid">
      <div
        v-for="p in pokemon"
        :key="p.id"
        class="comparison-stats__card"
      >
        <!-- Remove Button -->
        <button
          class="comparison-stats__remove"
          @click="emit('remove', p.id)"
        >
          <Icon name="mdi:close" />
        </button>

        <!-- Pokemon Image -->
        <div class="comparison-stats__image-container">
          <NuxtLink :to="`/pokemon/${p.id}`" class="comparison-stats__link">
            <img
              :src="p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default"
              :alt="p.name"
              class="comparison-stats__image"
            />
          </NuxtLink>
        </div>

        <!-- Pokemon Info -->
        <div class="comparison-stats__info">
          <NuxtLink :to="`/pokemon/${p.id}`" class="comparison-stats__name-link">
            <h3 class="comparison-stats__name">{{ p.name }}</h3>
          </NuxtLink>
          <p class="comparison-stats__number">#{{ String(p.id).padStart(4, '0') }}</p>

          <!-- Types -->
          <div class="comparison-stats__types">
            <TypeBadge
              v-for="type in p.types"
              :key="type.slot"
              :type="type.type.name"
            />
          </div>
        </div>

        <!-- Physical Stats -->
        <div class="comparison-stats__physical">
          <div class="comparison-stats__physical-item">
            <Icon name="mdi:arrow-expand-vertical" />
            <span>{{ formatHeight(p.height) }}</span>
          </div>
          <div class="comparison-stats__physical-item">
            <Icon name="mdi:weight" />
            <span>{{ formatWeight(p.weight) }}</span>
          </div>
        </div>

        <!-- Base Stats -->
        <div class="comparison-stats__stats">
          <h4 class="comparison-stats__stats-title">Base Stats</h4>

          <div class="comparison-stats__stat-list">
            <div
              v-for="statName in allStats"
              :key="statName"
              class="comparison-stats__stat-row"
            >
              <span class="comparison-stats__stat-name">
                {{ statNames[statName] || statName }}
              </span>
              <span
                class="comparison-stats__stat-value"
                :class="{ 'comparison-stats__stat-value--max': isMaxStat(p, statName) }"
              >
                {{ getStatValue(p, statName) }}
              </span>
              <div class="comparison-stats__stat-bar">
                <div
                  class="comparison-stats__stat-bar-fill"
                  :class="{ 'comparison-stats__stat-bar-fill--max': isMaxStat(p, statName) }"
                  :style="{ width: `${getStatPercentage(getStatValue(p, statName), statName)}%` }"
                />
              </div>
            </div>

            <!-- Total -->
            <div class="comparison-stats__stat-row comparison-stats__stat-row--total">
              <span class="comparison-stats__stat-name">Total</span>
              <span
                class="comparison-stats__stat-value"
                :class="{ 'comparison-stats__stat-value--max': getTotalStats(p) === Math.max(...pokemon.map(getTotalStats)) }"
              >
                {{ getTotalStats(p) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comparison-stats {
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
    transition: all $transition-base;

    &:hover {
      box-shadow: $shadow-lg;
      transform: translateY(-4px);
    }
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

  &__image-container {
    @include flex-center;
    padding: $spacing-4;
    background: radial-gradient(circle, $gray-50 0%, $white 100%);
    border-radius: $radius-lg;
  }

  &__link {
    @include flex-center;
    text-decoration: none;
  }

  &__image {
    width: 100%;
    max-width: 200px;
    height: auto;
    transition: transform $transition-base;

    &:hover {
      transform: scale(1.1);
    }
  }

  &__info {
    @include flex-column;
    align-items: center;
    gap: $spacing-2;
    text-align: center;
  }

  &__name-link {
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: $primary;
    }
  }

  &__name {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    text-transform: capitalize;
    transition: color $transition-fast;

    .comparison-stats__name-link:hover & {
      color: $primary;
    }
  }

  &__number {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-semibold;
  }

  &__types {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__physical {
    @include flex-center;
    gap: $spacing-4;
    padding: $spacing-3;
    background: $gray-50;
    border-radius: $radius-md;
  }

  &__physical-item {
    @include flex-center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-secondary;

    svg {
      font-size: 20px;
      color: $primary;
    }
  }

  &__stats {
    @include flex-column;
    gap: $spacing-3;
  }

  &__stats-title {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
  }

  &__stat-list {
    @include flex-column;
    gap: $spacing-2;
  }

  &__stat-row {
    display: grid;
    grid-template-columns: 100px 50px 1fr;
    gap: $spacing-3;
    align-items: center;

    &--total {
      margin-top: $spacing-2;
      padding-top: $spacing-3;
      border-top: 2px solid $gray-300;

      .comparison-stats__stat-name {
        font-weight: $font-weight-bold;
        color: $text-primary;
      }

      .comparison-stats__stat-value {
        font-size: $font-size-lg;
      }
    }
  }

  &__stat-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
  }

  &__stat-value {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: right;

    &--max {
      color: $success;
    }
  }

  &__stat-bar {
    height: 8px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__stat-bar-fill {
    height: 100%;
    background: $primary;
    border-radius: $radius-full;
    transition: width 0.5s ease-out;

    &--max {
      background: $success;
    }
  }
}
</style>
