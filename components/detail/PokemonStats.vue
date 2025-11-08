<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon
}

const props = defineProps<Props>()

const statColors: Record<string, string> = {
  hp: '#ff5959',
  attack: '#f5ac78',
  defense: '#fae078',
  'special-attack': '#9db7f5',
  'special-defense': '#a7db8d',
  speed: '#fa92b2',
}

const statLabels: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
}

const stats = computed(() => {
  return props.pokemon.stats.map(stat => ({
    name: stat.stat.name,
    label: statLabels[stat.stat.name] || stat.stat.name,
    value: stat.base_stat,
    color: statColors[stat.stat.name] || '#9e9e9e',
    percentage: (stat.base_stat / 255) * 100,
    effort: stat.effort
  }))
})

const totalStats = computed(() => {
  return props.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
})

const averageStat = computed(() => {
  return Math.round(totalStats.value / props.pokemon.stats.length)
})

const highestStat = computed(() => {
  return stats.value.reduce((max, stat) =>
    stat.value > max.value ? stat : max
  , stats.value[0])
})

const lowestStat = computed(() => {
  return stats.value.reduce((min, stat) =>
    stat.value < min.value ? stat : min
  , stats.value[0])
})

// Radar chart points calculation
const radarPoints = computed(() => {
  const centerX = 150
  const centerY = 150
  const maxRadius = 120
  const angleStep = (Math.PI * 2) / 6

  return stats.value.map((stat, index) => {
    const angle = angleStep * index - Math.PI / 2
    const radius = (stat.value / 255) * maxRadius
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
})

const radarBackgroundPoints = computed(() => {
  const centerX = 150
  const centerY = 150
  const maxRadius = 120
  const angleStep = (Math.PI * 2) / 6

  return Array.from({ length: 6 }, (_, index) => {
    const angle = angleStep * index - Math.PI / 2
    const x = centerX + maxRadius * Math.cos(angle)
    const y = centerY + maxRadius * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
})

// Stat rank determination
const getStatRank = (value: number) => {
  if (value >= 150) return 'legendary'
  if (value >= 120) return 'excellent'
  if (value >= 90) return 'great'
  if (value >= 60) return 'good'
  if (value >= 30) return 'average'
  return 'poor'
}

const totalRank = computed(() => {
  if (totalStats.value >= 600) return 'legendary'
  if (totalStats.value >= 530) return 'excellent'
  if (totalStats.value >= 480) return 'great'
  if (totalStats.value >= 420) return 'good'
  if (totalStats.value >= 350) return 'average'
  return 'poor'
})

const rankColors: Record<string, string> = {
  legendary: '#ffd700',
  excellent: '#e040fb',
  great: '#00e676',
  good: '#00bcd4',
  average: '#ff9800',
  poor: '#9e9e9e',
}
</script>

<template>
  <div class="pokemon-stats">
    <!-- Summary Cards -->
    <div class="pokemon-stats__summary">
      <div class="pokemon-stats__card">
        <Icon name="mdi:sigma" class="pokemon-stats__card-icon" />
        <div>
          <span class="pokemon-stats__card-label">Total Stats</span>
          <span
            class="pokemon-stats__card-value"
            :style="{ color: rankColors[totalRank] }"
          >
            {{ totalStats }}
          </span>
        </div>
      </div>

      <div class="pokemon-stats__card">
        <Icon name="mdi:chart-bar" class="pokemon-stats__card-icon" />
        <div>
          <span class="pokemon-stats__card-label">Average</span>
          <span class="pokemon-stats__card-value">{{ averageStat }}</span>
        </div>
      </div>

      <div class="pokemon-stats__card">
        <Icon name="mdi:arrow-up-bold" class="pokemon-stats__card-icon" :style="{ color: highestStat.color }" />
        <div>
          <span class="pokemon-stats__card-label">Highest</span>
          <span
            class="pokemon-stats__card-value"
            :style="{ color: highestStat.color }"
          >
            {{ highestStat.label }} ({{ highestStat.value }})
          </span>
        </div>
      </div>

      <div class="pokemon-stats__card">
        <Icon name="mdi:arrow-down-bold" class="pokemon-stats__card-icon" :style="{ color: lowestStat.color }" />
        <div>
          <span class="pokemon-stats__card-label">Lowest</span>
          <span
            class="pokemon-stats__card-value"
            :style="{ color: lowestStat.color }"
          >
            {{ lowestStat.label }} ({{ lowestStat.value }})
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="pokemon-stats__grid">
      <!-- Stat Bars -->
      <div class="pokemon-stats__bars">
        <h3 class="pokemon-stats__section-title">
          <Icon name="mdi:chart-bar" />
          Base Stats
        </h3>

        <div class="pokemon-stats__bars-list">
          <div
            v-for="stat in stats"
            :key="stat.name"
            class="pokemon-stats__stat"
          >
            <div class="pokemon-stats__stat-header">
              <span class="pokemon-stats__stat-label">{{ stat.label }}</span>
              <span class="pokemon-stats__stat-value">{{ stat.value }}</span>
            </div>

            <div class="pokemon-stats__stat-bar-container">
              <div
                class="pokemon-stats__stat-bar"
                :style="{
                  width: `${stat.percentage}%`,
                  backgroundColor: stat.color
                }"
              />
            </div>

            <div class="pokemon-stats__stat-footer">
              <span
                class="pokemon-stats__stat-rank"
                :style="{ color: rankColors[getStatRank(stat.value)] }"
              >
                {{ getStatRank(stat.value) }}
              </span>
              <span v-if="stat.effort > 0" class="pokemon-stats__stat-ev">
                +{{ stat.effort }} EV
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Radar Chart -->
      <div class="pokemon-stats__chart">
        <h3 class="pokemon-stats__section-title">
          <Icon name="mdi:radar" />
          Stat Distribution
        </h3>

        <svg
          viewBox="0 0 300 300"
          class="pokemon-stats__radar"
        >
          <!-- Background grid -->
          <g class="pokemon-stats__radar-grid">
            <polygon
              v-for="level in [0.2, 0.4, 0.6, 0.8, 1.0]"
              :key="level"
              :points="radarBackgroundPoints"
              :style="{
                transform: `translate(150px, 150px) scale(${level}) translate(-150px, -150px)`,
                opacity: 0.1
              }"
              stroke="#9e9e9e"
              stroke-width="1"
              fill="none"
            />

            <!-- Grid lines -->
            <line
              v-for="i in 6"
              :key="`line-${i}`"
              x1="150"
              y1="150"
              :x2="150 + 120 * Math.cos((Math.PI * 2 / 6) * (i - 1) - Math.PI / 2)"
              :y2="150 + 120 * Math.sin((Math.PI * 2 / 6) * (i - 1) - Math.PI / 2)"
              stroke="#e0e0e0"
              stroke-width="1"
            />
          </g>

          <!-- Data polygon -->
          <polygon
            :points="radarPoints"
            class="pokemon-stats__radar-fill"
            fill="url(#radarGradient)"
            stroke="#ef5350"
            stroke-width="3"
          />

          <!-- Data points -->
          <circle
            v-for="(stat, index) in stats"
            :key="`point-${stat.name}`"
            :cx="150 + (stat.value / 255 * 120) * Math.cos((Math.PI * 2 / 6) * index - Math.PI / 2)"
            :cy="150 + (stat.value / 255 * 120) * Math.sin((Math.PI * 2 / 6) * index - Math.PI / 2)"
            r="5"
            :fill="stat.color"
            stroke="white"
            stroke-width="2"
          />

          <!-- Labels -->
          <text
            v-for="(stat, index) in stats"
            :key="`label-${stat.name}`"
            :x="150 + 140 * Math.cos((Math.PI * 2 / 6) * index - Math.PI / 2)"
            :y="150 + 140 * Math.sin((Math.PI * 2 / 6) * index - Math.PI / 2)"
            text-anchor="middle"
            dominant-baseline="middle"
            class="pokemon-stats__radar-label"
            :fill="stat.color"
          >
            {{ stat.label }}
          </text>

          <!-- Gradient definition -->
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ef5350" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#ef5350" stop-opacity="0.1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-stats {
  @include flex-column;
  gap: $spacing-6;

  &__summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
  }

  &__card {
    @include flex-center;
    gap: $spacing-3;
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;

    > div {
      @include flex-column;
      gap: $spacing-1;
    }
  }

  &__card-icon {
    font-size: 32px;
    color: $primary;
  }

  &__card-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__card-value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-mono;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-6;

    @media (min-width: $breakpoint-lg) {
      grid-template-columns: 1.5fr 1fr;
    }
  }

  &__bars,
  &__chart {
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__section-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-6;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    svg {
      font-size: 28px;
      color: $primary;
    }
  }

  &__bars-list {
    @include flex-column;
    gap: $spacing-5;
  }

  &__stat {
    @include flex-column;
    gap: $spacing-2;
  }

  &__stat-header {
    @include flex-between;
  }

  &__stat-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  &__stat-value {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-mono;
  }

  &__stat-bar-container {
    position: relative;
    height: 10px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__stat-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: $radius-full;
    transition: width 1s ease-out;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  &__stat-footer {
    @include flex-between;
  }

  &__stat-rank {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
  }

  &__stat-ev {
    font-size: $font-size-xs;
    color: $success;
    font-weight: $font-weight-semibold;
    font-family: $font-family-mono;
  }

  &__chart {
    @include flex-center;
    @include flex-column;
  }

  &__radar {
    width: 100%;
    max-width: 400px;
    height: auto;
  }

  &__radar-fill {
    transition: all 0.5s ease-out;
  }

  &__radar-label {
    font-size: 12px;
    font-weight: $font-weight-bold;
    font-family: $font-family-primary;
  }
}
</style>
