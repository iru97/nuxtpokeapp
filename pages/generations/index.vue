<script setup lang="ts">
import { GENERATIONS } from '~/constants/pokemon'

// SEO Meta tags
useHead({
  title: 'Browse by Generation - PokéApp',
  meta: [
    { name: 'description', content: 'Explore Pokémon across all 9 generations from Kanto to Paldea. Discover regional Pokédexes and iconic Pokémon from each era.' },
    { property: 'og:title', content: 'Browse by Generation - PokéApp' },
    { property: 'og:description', content: 'Explore Pokémon across all 9 generations' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})

// Generation colors and gradients
const generationColors: Record<number, { primary: string; gradient: string }> = {
  1: { primary: '#ee1515', gradient: 'linear-gradient(135deg, #ee1515 0%, #ff6b6b 100%)' },
  2: { primary: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' },
  3: { primary: '#0080ff', gradient: 'linear-gradient(135deg, #0080ff 0%, #4da6ff 100%)' },
  4: { primary: '#9b59b6', gradient: 'linear-gradient(135deg, #9b59b6 0%, #bb79d6 100%)' },
  5: { primary: '#34495e', gradient: 'linear-gradient(135deg, #34495e 0%, #5d6d7e 100%)' },
  6: { primary: '#e74c3c', gradient: 'linear-gradient(135deg, #e74c3c 0%, #ff6b6b 100%)' },
  7: { primary: '#f39c12', gradient: 'linear-gradient(135deg, #f39c12 0%, #f5b041 100%)' },
  8: { primary: '#3498db', gradient: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)' },
  9: { primary: '#e91e63', gradient: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)' }
}

// Get generation color
const getGenColor = (genId: number) => {
  return generationColors[genId] || generationColors[1]
}

// Get Pokemon count for generation
const getPokemonCount = (range: number[]) => {
  return range[1] - range[0] + 1
}

// Navigate to generation detail
const navigateToGeneration = (genId: number) => {
  navigateTo(`/generations/${genId}`)
}
</script>

<template>
  <div class="generations-page">
    <div class="generations-page__container">
      <!-- Header -->
      <div class="generations-page__header">
        <div class="generations-page__header-content">
          <Icon name="mdi:earth" class="generations-page__header-icon" />
          <div>
            <h1 class="generations-page__title">Pokémon Generations</h1>
            <p class="generations-page__subtitle">
              Explore all 9 generations of Pokémon from Kanto to Paldea
            </p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="generations-page__stats">
        <div class="generations-page__stat-card">
          <Icon name="mdi:pokeball" class="generations-page__stat-icon" />
          <div class="generations-page__stat-content">
            <span class="generations-page__stat-value">1,025</span>
            <span class="generations-page__stat-label">Total Pokémon</span>
          </div>
        </div>
        <div class="generations-page__stat-card">
          <Icon name="mdi:map-marker" class="generations-page__stat-icon" />
          <div class="generations-page__stat-content">
            <span class="generations-page__stat-value">9</span>
            <span class="generations-page__stat-label">Regions</span>
          </div>
        </div>
        <div class="generations-page__stat-card">
          <Icon name="mdi:calendar" class="generations-page__stat-icon" />
          <div class="generations-page__stat-content">
            <span class="generations-page__stat-value">27+</span>
            <span class="generations-page__stat-label">Years</span>
          </div>
        </div>
      </div>

      <!-- Generations Grid -->
      <div class="generations-page__grid">
        <div
          v-for="gen in GENERATIONS"
          :key="gen.id"
          class="generation-card"
          :style="{
            '--gen-color': getGenColor(gen.id).primary,
            '--gen-gradient': getGenColor(gen.id).gradient
          }"
          @click="navigateToGeneration(gen.id)"
        >
          <!-- Badge -->
          <div class="generation-card__badge">
            Gen {{ gen.id }}
          </div>

          <!-- Header -->
          <div class="generation-card__header">
            <h2 class="generation-card__title">{{ gen.name }}</h2>
            <div class="generation-card__region">
              <Icon name="mdi:map-marker" />
              <span>{{ gen.region }}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="generation-card__content">
            <div class="generation-card__range">
              <Icon name="mdi:pokeball" />
              <span>#{{ String(gen.range[0]).padStart(4, '0') }} - #{{ String(gen.range[1]).padStart(4, '0') }}</span>
            </div>
            <div class="generation-card__count">
              <span class="generation-card__count-value">{{ getPokemonCount(gen.range) }}</span>
              <span class="generation-card__count-label">Pokémon</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="generation-card__footer">
            <button class="generation-card__button">
              <span>Explore Region</span>
              <Icon name="mdi:arrow-right" />
            </button>
          </div>

          <!-- Decorative elements -->
          <div class="generation-card__decoration generation-card__decoration--1" />
          <div class="generation-card__decoration generation-card__decoration--2" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.generations-page {
  min-height: 100vh;
  padding: $spacing-6 0;
  background: linear-gradient(180deg, $gray-50 0%, $white 100%);

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    margin-bottom: $spacing-8;
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
    font-size: 80px;
    color: $primary;
    animation: rotate 20s linear infinite;
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
    margin: $spacing-2 0 0;
    font-size: $font-size-lg;
    color: $text-secondary;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
    margin-bottom: $spacing-8;
  }

  &__stat-card {
    @include flex-center;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    border: 2px solid $gray-200;
    transition: all $transition-base;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
      border-color: $primary;
    }
  }

  &__stat-icon {
    font-size: 48px;
    color: $primary;
  }

  &__stat-content {
    @include flex-column;
    gap: $spacing-1;
  }

  &__stat-value {
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-secondary;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
}

.generation-card {
  position: relative;
  @include flex-column;
  gap: $spacing-4;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-md;
  cursor: pointer;
  overflow: hidden;
  transition: all $transition-base;
  border: 2px solid transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: var(--gen-gradient);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-xl;
    border-color: var(--gen-color);

    .generation-card__button {
      background: var(--gen-color);
      color: $white;
    }

    .generation-card__decoration {
      opacity: 0.15;
    }
  }

  &__badge {
    position: absolute;
    top: $spacing-4;
    right: $spacing-4;
    padding: $spacing-2 $spacing-4;
    background: var(--gen-gradient);
    color: $white;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    z-index: 2;
  }

  &__header {
    @include flex-column;
    gap: $spacing-2;
    position: relative;
    z-index: 2;
  }

  &__title {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
  }

  &__region {
    @include flex-center;
    gap: $spacing-2;
    font-size: $font-size-lg;
    color: var(--gen-color);
    font-weight: $font-weight-semibold;

    svg {
      font-size: 20px;
    }
  }

  &__content {
    @include flex-column;
    gap: $spacing-4;
    position: relative;
    z-index: 2;
  }

  &__range {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    font-family: $font-family-mono;

    svg {
      font-size: 20px;
      color: var(--gen-color);
    }
  }

  &__count {
    @include flex-column;
    align-items: center;
    gap: $spacing-1;
    padding: $spacing-4;
    background: linear-gradient(135deg, rgba(var(--gen-color), 0.1) 0%, rgba(var(--gen-color), 0.05) 100%);
    border-radius: $radius-lg;
  }

  &__count-value {
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    color: var(--gen-color);
    font-family: $font-family-secondary;
  }

  &__count-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__footer {
    position: relative;
    z-index: 2;
  }

  &__button {
    @include reset-button;
    @include flex-center;
    justify-content: center;
    gap: $spacing-2;
    width: 100%;
    padding: $spacing-3 $spacing-5;
    background: $gray-100;
    color: $text-primary;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;

    svg {
      font-size: 20px;
      transition: transform $transition-fast;
    }

    &:hover svg {
      transform: translateX(4px);
    }
  }

  &__decoration {
    position: absolute;
    border-radius: $radius-full;
    background: var(--gen-gradient);
    opacity: 0.05;
    transition: opacity $transition-base;

    &--1 {
      width: 200px;
      height: 200px;
      top: -50px;
      right: -50px;
    }

    &--2 {
      width: 150px;
      height: 150px;
      bottom: -30px;
      left: -30px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
