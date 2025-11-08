<script setup lang="ts">
import type { Pokemon } from '~/types'
import { GENERATIONS } from '~/constants/pokemon'

// SEO Meta tags
useHead({
  title: 'Pokémon Statistics - PokéApp',
  meta: [
    { name: 'description', content: 'Explore comprehensive Pokemon statistics including type distribution, strongest Pokemon, average stats, and more.' },
    { property: 'og:title', content: 'Pokémon Statistics - PokéApp' },
    { property: 'og:description', content: 'Comprehensive Pokemon statistics and insights' },
  ]
})

const loading = ref(true)
const pokemonData = ref<Pokemon[]>([])

// Load Pokemon data (first 151 for performance)
const loadPokemon = async () => {
  loading.value = true
  try {
    const promises: Promise<Pokemon>[] = []

    for (let i = 1; i <= 151; i++) {
      promises.push(
        $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${i}`)
      )
    }

    pokemonData.value = await Promise.all(promises)
  } catch (err) {
    console.error('Error loading Pokemon:', err)
  } finally {
    loading.value = false
  }
}

// Type distribution
const typeDistribution = computed(() => {
  const distribution: Record<string, number> = {}

  pokemonData.value.forEach(p => {
    p.types.forEach(t => {
      const typeName = t.type.name
      distribution[typeName] = (distribution[typeName] || 0) + 1
    })
  })

  return Object.entries(distribution)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
})

// Average stats
const averageStats = computed(() => {
  if (pokemonData.value.length === 0) return null

  const totals = {
    hp: 0,
    attack: 0,
    defense: 0,
    'special-attack': 0,
    'special-defense': 0,
    speed: 0,
  }

  pokemonData.value.forEach(p => {
    p.stats.forEach(s => {
      if (s.stat.name in totals) {
        totals[s.stat.name as keyof typeof totals] += s.base_stat
      }
    })
  })

  const count = pokemonData.value.length

  return {
    hp: Math.round(totals.hp / count),
    attack: Math.round(totals.attack / count),
    defense: Math.round(totals.defense / count),
    'special-attack': Math.round(totals['special-attack'] / count),
    'special-defense': Math.round(totals['special-defense'] / count),
    speed: Math.round(totals.speed / count),
  }
})

// Strongest Pokemon by stat
const strongestPokemon = computed(() => {
  if (pokemonData.value.length === 0) return null

  const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
  const strongest: Record<string, Pokemon> = {}

  stats.forEach(statName => {
    let maxPokemon = pokemonData.value[0]
    let maxValue = 0

    pokemonData.value.forEach(p => {
      const stat = p.stats.find(s => s.stat.name === statName)
      if (stat && stat.base_stat > maxValue) {
        maxValue = stat.base_stat
        maxPokemon = p
      }
    })

    strongest[statName] = maxPokemon
  })

  return strongest
})

// Highest total stats
const highestTotalStats = computed(() => {
  return [...pokemonData.value]
    .sort((a, b) => {
      const totalA = a.stats.reduce((sum, s) => sum + s.base_stat, 0)
      const totalB = b.stats.reduce((sum, s) => sum + s.base_stat, 0)
      return totalB - totalA
    })
    .slice(0, 10)
})

// Physical stats
const physicalStats = computed(() => {
  if (pokemonData.value.length === 0) return null

  const heights = pokemonData.value.map(p => p.height)
  const weights = pokemonData.value.map(p => p.weight)

  return {
    tallest: pokemonData.value.reduce((prev, curr) =>
      curr.height > prev.height ? curr : prev
    ),
    shortest: pokemonData.value.reduce((prev, curr) =>
      curr.height < prev.height ? curr : prev
    ),
    heaviest: pokemonData.value.reduce((prev, curr) =>
      curr.weight > prev.weight ? curr : prev
    ),
    lightest: pokemonData.value.reduce((prev, curr) =>
      curr.weight < prev.weight ? curr : prev
    ),
    avgHeight: (heights.reduce((a, b) => a + b, 0) / heights.length).toFixed(1),
    avgWeight: (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1),
  }
})

// Load on mount
onMounted(() => {
  loadPokemon()
})

// Format stat names
const statLabels: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Attack',
  'special-defense': 'Sp. Defense',
  speed: 'Speed',
}

// Get stat value
const getStatValue = (pokemon: Pokemon, statName: string) => {
  return pokemon.stats.find(s => s.stat.name === statName)?.base_stat || 0
}

// Get total stats
const getTotalStats = (pokemon: Pokemon) => {
  return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
}
</script>

<template>
  <div class="stats-page">
    <div class="stats-page__container">
      <!-- Header -->
      <div class="stats-page__header">
        <Icon name="mdi:chart-box-outline" class="stats-page__header-icon" />
        <div>
          <h1 class="stats-page__title">Pokémon Statistics</h1>
          <p class="stats-page__subtitle">
            Comprehensive insights from Generation I (Kanto Region)
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="stats-page__loading">
        <LoadingSpinner size="lg" message="Analyzing Pokémon data..." />
      </div>

      <!-- Stats Content -->
      <div v-else class="stats-page__content">
        <!-- Type Distribution -->
        <div class="stat-card">
          <h2 class="stat-card__title">
            <Icon name="mdi:shape" />
            <span>Type Distribution</span>
          </h2>

          <div class="type-distribution">
            <div
              v-for="{ type, count } in typeDistribution"
              :key="type"
              class="type-dist-item"
            >
              <TypeBadge :type="type" />
              <div class="type-dist-bar">
                <div
                  class="type-dist-fill"
                  :style="{ width: `${(count / pokemonData.length) * 100}%` }"
                />
              </div>
              <span class="type-dist-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Average Stats -->
        <div class="stat-card">
          <h2 class="stat-card__title">
            <Icon name="mdi:chart-bar" />
            <span>Average Base Stats</span>
          </h2>

          <div v-if="averageStats" class="avg-stats">
            <div
              v-for="(value, stat) in averageStats"
              :key="stat"
              class="avg-stat-item"
            >
              <span class="avg-stat-name">{{ statLabels[stat] }}</span>
              <div class="avg-stat-bar">
                <div
                  class="avg-stat-fill"
                  :style="{ width: `${(value / 255) * 100}%` }"
                />
              </div>
              <span class="avg-stat-value">{{ value }}</span>
            </div>
          </div>
        </div>

        <!-- Strongest by Stat -->
        <div class="stat-card stat-card--full">
          <h2 class="stat-card__title">
            <Icon name="mdi:trophy" />
            <span>Strongest Pokémon by Stat</span>
          </h2>

          <div v-if="strongestPokemon" class="strongest-grid">
            <div
              v-for="(pokemon, stat) in strongestPokemon"
              :key="stat"
              class="strongest-item"
            >
              <div class="strongest-stat-label">{{ statLabels[stat] }}</div>
              <NuxtLink :to="`/pokemon/${pokemon.id}`" class="strongest-pokemon">
                <img
                  :src="pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default"
                  :alt="pokemon.name"
                  class="strongest-image"
                />
                <div class="strongest-info">
                  <h4 class="strongest-name">{{ pokemon.name }}</h4>
                  <div class="strongest-types">
                    <TypeBadge
                      v-for="type in pokemon.types"
                      :key="type.slot"
                      :type="type.type.name"
                      size="sm"
                    />
                  </div>
                  <div class="strongest-value">{{ getStatValue(pokemon, stat) }}</div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Top 10 Total Stats -->
        <div class="stat-card stat-card--full">
          <h2 class="stat-card__title">
            <Icon name="mdi:podium" />
            <span>Top 10 - Highest Total Stats</span>
          </h2>

          <div class="top-list">
            <div
              v-for="(pokemon, index) in highestTotalStats"
              :key="pokemon.id"
              class="top-item"
            >
              <div class="top-rank">{{ index + 1 }}</div>
              <NuxtLink :to="`/pokemon/${pokemon.id}`" class="top-pokemon">
                <img
                  :src="pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default"
                  :alt="pokemon.name"
                  class="top-image"
                />
                <div class="top-info">
                  <h4 class="top-name">{{ pokemon.name }}</h4>
                  <div class="top-types">
                    <TypeBadge
                      v-for="type in pokemon.types"
                      :key="type.slot"
                      :type="type.type.name"
                      size="sm"
                    />
                  </div>
                </div>
                <div class="top-total">
                  <span class="top-total-label">Total</span>
                  <span class="top-total-value">{{ getTotalStats(pokemon) }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Physical Stats -->
        <div class="stat-card stat-card--full">
          <h2 class="stat-card__title">
            <Icon name="mdi:ruler-square" />
            <span>Physical Statistics</span>
          </h2>

          <div v-if="physicalStats" class="physical-grid">
            <NuxtLink
              :to="`/pokemon/${physicalStats.tallest.id}`"
              class="physical-card"
            >
              <Icon name="mdi:arrow-expand-vertical" class="physical-icon" />
              <h4 class="physical-label">Tallest</h4>
              <img
                :src="physicalStats.tallest.sprites.other?.['official-artwork']?.front_default || physicalStats.tallest.sprites.front_default"
                :alt="physicalStats.tallest.name"
                class="physical-image"
              />
              <p class="physical-name">{{ physicalStats.tallest.name }}</p>
              <p class="physical-value">{{ (physicalStats.tallest.height / 10).toFixed(1) }} m</p>
            </NuxtLink>

            <NuxtLink
              :to="`/pokemon/${physicalStats.shortest.id}`"
              class="physical-card"
            >
              <Icon name="mdi:arrow-collapse-vertical" class="physical-icon" />
              <h4 class="physical-label">Shortest</h4>
              <img
                :src="physicalStats.shortest.sprites.other?.['official-artwork']?.front_default || physicalStats.shortest.sprites.front_default"
                :alt="physicalStats.shortest.name"
                class="physical-image"
              />
              <p class="physical-name">{{ physicalStats.shortest.name }}</p>
              <p class="physical-value">{{ (physicalStats.shortest.height / 10).toFixed(1) }} m</p>
            </NuxtLink>

            <NuxtLink
              :to="`/pokemon/${physicalStats.heaviest.id}`"
              class="physical-card"
            >
              <Icon name="mdi:weight" class="physical-icon" />
              <h4 class="physical-label">Heaviest</h4>
              <img
                :src="physicalStats.heaviest.sprites.other?.['official-artwork']?.front_default || physicalStats.heaviest.sprites.front_default"
                :alt="physicalStats.heaviest.name"
                class="physical-image"
              />
              <p class="physical-name">{{ physicalStats.heaviest.name }}</p>
              <p class="physical-value">{{ (physicalStats.heaviest.weight / 10).toFixed(1) }} kg</p>
            </NuxtLink>

            <NuxtLink
              :to="`/pokemon/${physicalStats.lightest.id}`"
              class="physical-card"
            >
              <Icon name="mdi:feather" class="physical-icon" />
              <h4 class="physical-label">Lightest</h4>
              <img
                :src="physicalStats.lightest.sprites.other?.['official-artwork']?.front_default || physicalStats.lightest.sprites.front_default"
                :alt="physicalStats.lightest.name"
                class="physical-image"
              />
              <p class="physical-name">{{ physicalStats.lightest.name }}</p>
              <p class="physical-value">{{ (physicalStats.lightest.weight / 10).toFixed(1) }} kg</p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stats-page {
  min-height: 100vh;
  padding: $spacing-6 0;
  background: $gray-50;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    @include flex-center;
    gap: $spacing-4;
    margin-bottom: $spacing-8;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      text-align: center;
    }
  }

  &__header-icon {
    font-size: 80px;
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

  &__loading {
    @include flex-center;
    padding: $spacing-12 0;
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-6;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: 1fr;
    }
  }
}

.stat-card {
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  &--full {
    grid-column: 1 / -1;
  }

  &__title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-6;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    svg {
      font-size: 28px;
      color: $primary;
    }
  }
}

.type-distribution {
  @include flex-column;
  gap: $spacing-3;
}

.type-dist-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: $spacing-3;
  align-items: center;
}

.type-dist-bar {
  height: 8px;
  background: $gray-200;
  border-radius: $radius-full;
  overflow: hidden;
}

.type-dist-fill {
  height: 100%;
  background: $primary;
  border-radius: $radius-full;
  transition: width 0.5s ease-out;
}

.type-dist-count {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $text-secondary;
  min-width: 30px;
  text-align: right;
}

.avg-stats {
  @include flex-column;
  gap: $spacing-3;
}

.avg-stat-item {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  gap: $spacing-3;
  align-items: center;
}

.avg-stat-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-secondary;
}

.avg-stat-bar {
  height: 8px;
  background: $gray-200;
  border-radius: $radius-full;
  overflow: hidden;
}

.avg-stat-fill {
  height: 100%;
  background: $success;
  border-radius: $radius-full;
  transition: width 0.5s ease-out;
}

.avg-stat-value {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-align: right;
}

.strongest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-4;
}

.strongest-item {
  @include flex-column;
  gap: $spacing-2;
}

.strongest-stat-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $primary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.strongest-pokemon {
  @include flex-column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  background: $gray-50;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  text-decoration: none;
  transition: all $transition-base;

  &:hover {
    border-color: $primary;
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }
}

.strongest-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.strongest-info {
  @include flex-column;
  align-items: center;
  gap: $spacing-2;
  text-align: center;
}

.strongest-name {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-transform: capitalize;
}

.strongest-types {
  @include flex-center;
  gap: $spacing-1;
}

.strongest-value {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $primary;
  font-family: $font-family-mono;
}

.top-list {
  @include flex-column;
  gap: $spacing-3;
}

.top-item {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: $spacing-3;
  align-items: center;
}

.top-rank {
  @include flex-center;
  width: 50px;
  height: 50px;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  font-family: $font-family-secondary;
}

.top-pokemon {
  @include flex-between;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $gray-50;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  text-decoration: none;
  transition: all $transition-base;

  &:hover {
    border-color: $primary;
    box-shadow: $shadow-md;
  }
}

.top-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.top-info {
  flex: 1;
  @include flex-column;
  gap: $spacing-2;
}

.top-name {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-transform: capitalize;
}

.top-types {
  @include flex-center;
  gap: $spacing-1;
}

.top-total {
  @include flex-column;
  align-items: center;
  gap: $spacing-1;
}

.top-total-label {
  font-size: $font-size-xs;
  color: $text-secondary;
  text-transform: uppercase;
}

.top-total-value {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $primary;
  font-family: $font-family-mono;
}

.physical-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-4;
}

.physical-card {
  @include flex-column;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-5;
  background: $gray-50;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  text-decoration: none;
  transition: all $transition-base;

  &:hover {
    border-color: $primary;
    box-shadow: $shadow-md;
    transform: translateY(-4px);
  }
}

.physical-icon {
  font-size: 32px;
  color: $primary;
}

.physical-label {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $text-secondary;
  text-transform: uppercase;
}

.physical-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.physical-name {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  text-transform: capitalize;
}

.physical-value {
  margin: 0;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $primary;
  font-family: $font-family-mono;
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
