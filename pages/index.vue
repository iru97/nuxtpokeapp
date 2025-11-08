<script setup lang="ts">
import type { Pokemon } from '~/types'
import { GENERATIONS } from '~/constants/pokemon'

// SEO Meta tags
useHead({
  title: 'PokéApp - Your Complete Pokémon Guide',
  meta: [
    { name: 'description', content: 'Explore comprehensive information about all Pokémon. Browse stats, types, abilities, evolution chains, and more in PokéApp.' },
    { property: 'og:title', content: 'PokéApp - Your Complete Pokémon Guide' },
    { property: 'og:description', content: 'Your complete Pokémon guide with stats, types, and abilities.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})

// Featured Pokemon
const featuredIds = [25, 6, 150, 448, 384, 445] // Pikachu, Charizard, Mewtwo, Lucario, Rayquaza, Garchomp
const featuredPokemon = ref<Pokemon[]>([])
const loadingFeatured = ref(true)

// Random Pokemon of the day
const pokemonOfTheDay = ref<Pokemon | null>(null)
const loadingPotd = ref(true)

// Scroll animations and parallax
const { parallaxStyle } = useParallax({ speed: 0.3 })

// Stats
const stats = [
  { icon: 'mdi:pokeball', label: 'Total Pokémon', value: '1,025+', color: '#ef5350' },
  { icon: 'mdi:shape', label: 'Types', value: '18', color: '#66bb6a' },
  { icon: 'mdi:star', label: 'Generations', value: '9', color: '#ffa726' },
  { icon: 'mdi:sword-cross', label: 'Moves', value: '900+', color: '#42a5f5' },
]

// Quick links - Top 6 most important
const quickLinks = [
  { to: '/pokemons', icon: 'mdi:pokeball', label: 'Browse All', description: 'Explore all 1,025+ Pokémon', color: '#ef5350', featured: true },
  { to: '/advanced-search', icon: 'mdi:filter-cog', label: 'Advanced Search', description: 'Find with detailed filters', color: '#42a5f5', featured: true },
  { to: '/team-builder', icon: 'mdi:account-group', label: 'Team Builder', description: 'Build your dream team', color: '#66bb6a', featured: true },
  { to: '/compare', icon: 'mdi:compare', label: 'Compare', description: 'Compare Pokémon stats', color: '#ffa726', featured: false },
  { to: '/tools/damage-calculator', icon: 'mdi:calculator', label: 'Damage Calculator', description: 'Calculate battle damage', color: '#9c27b0', featured: true },
  { to: '/tools/random-generators', icon: 'mdi:dice-multiple', label: 'Random Generator', description: 'Generate teams & challenges', color: '#26c6da', featured: true },
  { to: '/favorites', icon: 'mdi:heart', label: 'Favorites', description: 'Your saved Pokémon', color: '#ec407a', featured: false },
  { to: '/stats', icon: 'mdi:chart-box-outline', label: 'Stats & Rankings', description: 'View records & insights', color: '#ff9800', featured: true },
]

// Load featured Pokemon
onMounted(async () => {
  try {
    loadingFeatured.value = true
    const pokemonData = await Promise.all(
      featuredIds.map(id => $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`))
    )
    featuredPokemon.value = pokemonData
  } catch (err) {
    console.error('Error loading featured Pokemon:', err)
  } finally {
    loadingFeatured.value = false
  }
})

// Load Pokemon of the day (random)
onMounted(async () => {
  try {
    loadingPotd.value = true
    const randomId = Math.floor(Math.random() * 1025) + 1
    const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
    pokemonOfTheDay.value = pokemon
  } catch (err) {
    console.error('Error loading Pokemon of the day:', err)
  } finally {
    loadingPotd.value = false
  }
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero" role="banner">
      <div class="hero__background" :style="parallaxStyle" aria-hidden="true" />
      <div class="hero__container">
        <div class="hero__content">
          <h1 class="hero__title">
            Welcome to PokéApp
          </h1>
          <p class="hero__subtitle">
            Your ultimate companion for exploring the world of Pokémon
          </p>
          <div class="hero__actions">
            <NuxtLink to="/pokemons" class="hero__btn hero__btn--primary" aria-label="Explore Pokédex">
              <Icon name="mdi:pokeball" aria-hidden="true" />
              <span>Explore Pokédex</span>
            </NuxtLink>
            <NuxtLink to="/favorites" class="hero__btn hero__btn--secondary" aria-label="View my favorites">
              <Icon name="mdi:heart-outline" aria-hidden="true" />
              <span>My Favorites</span>
            </NuxtLink>
          </div>
        </div>

        <div class="hero__image" aria-hidden="true">
          <Icon name="mdi:pokeball" class="hero__pokeball" />
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stats__container">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="stats__card"
          :style="{ '--stat-color': stat.color }"
        >
          <Icon :name="stat.icon" class="stats__icon" aria-hidden="true" />
          <div class="stats__content">
            <span class="stats__value">{{ stat.value }}</span>
            <span class="stats__label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="quick-links">
      <div class="quick-links__container">
        <div class="quick-links__header">
          <h2 class="section-title">Quick Access</h2>
          <p class="section-subtitle">Jump straight to the most popular features</p>
        </div>
        <div class="quick-links__grid">
          <NuxtLink
            v-for="link in quickLinks.filter(l => l.featured)"
            :key="link.to"
            :to="link.to"
            class="quick-link"
            :style="{ '--link-color': link.color }"
          >
            <div class="quick-link__icon-wrapper">
              <Icon :name="link.icon" class="quick-link__icon" />
            </div>
            <div class="quick-link__content">
              <h3 class="quick-link__title">{{ link.label }}</h3>
              <p class="quick-link__description">{{ link.description }}</p>
            </div>
            <Icon name="mdi:arrow-right" class="quick-link__arrow" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Pokemon of the Day -->
    <section v-if="pokemonOfTheDay" class="potd">
      <div class="potd__container">
        <h2 class="section-title">
          <Icon name="mdi:star" />
          Pokémon of the Day
        </h2>

        <div v-if="loadingPotd" class="potd__loading">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else class="potd__card">
          <NuxtLink :to="`/pokemon/${pokemonOfTheDay.id}`" class="potd__link">
            <div class="potd__image-container">
              <NuxtImg
                :src="pokemonOfTheDay.sprites.other['official-artwork']?.front_default || pokemonOfTheDay.sprites.front_default"
                :alt="pokemonOfTheDay.name"
                class="potd__image"
                width="300"
                height="300"
              />
            </div>

            <div class="potd__info">
              <span class="potd__id">#{{ String(pokemonOfTheDay.id).padStart(3, '0') }}</span>
              <h3 class="potd__name">{{ pokemonOfTheDay.name }}</h3>

              <div class="potd__types">
                <TypeBadge
                  v-for="type in pokemonOfTheDay.types"
                  :key="type.type.name"
                  :type="type.type.name"
                />
              </div>

              <div class="potd__stats">
                <div
                  v-for="stat in pokemonOfTheDay.stats.slice(0, 3)"
                  :key="stat.stat.name"
                  class="potd__stat"
                >
                  <span class="potd__stat-label">{{ stat.stat.name.replace('-', ' ') }}</span>
                  <span class="potd__stat-value">{{ stat.base_stat }}</span>
                </div>
              </div>

              <button class="potd__view-btn">
                View Details
                <Icon name="mdi:arrow-right" />
              </button>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Pokemon -->
    <section class="featured">
      <div class="featured__container">
        <h2 class="section-title">Featured Pokémon</h2>

        <div v-if="loadingFeatured" class="featured__loading">
          <div class="featured__grid">
            <PokemonCard v-for="n in 6" :key="n" loading />
          </div>
        </div>

        <div v-else class="featured__grid featured__grid--bento">
          <PokemonCard
            v-for="pokemon in featuredPokemon"
            :key="pokemon.id"
            :pokemon="pokemon"
          />
        </div>
      </div>
    </section>

    <!-- Generations -->
    <section class="generations">
      <div class="generations__container">
        <h2 class="section-title">Browse by Generation</h2>
        <div class="generations__grid">
          <NuxtLink
            v-for="gen in GENERATIONS.slice(0, 6)"
            :key="gen.id"
            :to="`/generations/${gen.id}`"
            class="generation-card"
          >
            <div class="generation-card__number">Gen {{ gen.id }}</div>
            <h3 class="generation-card__name">{{ gen.name }}</h3>
            <p class="generation-card__region">{{ gen.region }}</p>
            <p class="generation-card__range">#{{ gen.range[0] }} - #{{ gen.range[1] }}</p>
          </NuxtLink>
        </div>

        <div class="generations__view-all">
          <NuxtLink to="/generations" class="btn-view-all">
            <span>View All Generations</span>
            <Icon name="mdi:arrow-right" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.section-title {
  @include flex-center;
  gap: $spacing-2;
  margin: 0 0 $spacing-8;
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  font-family: $font-family-secondary;
  text-align: center;

  svg {
    font-size: 36px;
    color: $primary;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-3xl;
  }
}

// Scroll fade animation
.scroll-fade {
  @include scroll-fade-in;
}

// Hero Section
.hero {
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  color: $white;
  padding: $spacing-12 0 $spacing-10;
  position: relative;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    padding: $spacing-8 0 $spacing-6;
  }

  // Parallax background with pattern
  &__background {
    position: absolute;
    top: -100px;
    left: 0;
    right: 0;
    bottom: -100px;
    background:
      radial-gradient(circle at 20% 50%, rgba($white, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba($white, 0.1) 0%, transparent 50%);
    opacity: 0.3;
    z-index: 0;
  }

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-8;
    align-items: center;
    position: relative;
    z-index: 1;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  &__content {
    @include flex-column;
    gap: $spacing-6;

    @media (max-width: $breakpoint-md) {
      align-items: center;
    }
  }

  &__title {
    margin: 0;
    @include fluid-type(2.5rem, 4.5rem);
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    line-height: $line-height-tight;
  }

  &__subtitle {
    margin: 0;
    font-size: $font-size-xl;
    opacity: 0.9;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-lg;
    }
  }

  &__actions {
    @include flex-center;
    gap: $spacing-4;
    flex-wrap: wrap;
  }

  &__btn {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-4 $spacing-8;
    border-radius: $radius-full;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    text-decoration: none;
    transition: all $transition-base;
    white-space: nowrap;

    svg {
      font-size: 24px;
    }

    &--primary {
      background: $white;
      color: $primary;

      &:hover {
        background: $gray-100;
        transform: translateY(-4px);
        box-shadow: $shadow-xl;
      }
    }

    &--secondary {
      background: rgba($white, 0.1);
      color: $white;
      border: 2px solid $white;

      &:hover {
        background: rgba($white, 0.2);
        transform: translateY(-4px);
      }
    }
  }

  &__image {
    @include flex-center;
    justify-content: flex-end;

    @media (max-width: $breakpoint-md) {
      display: none;
    }
  }

  &__pokeball {
    font-size: 400px;
    opacity: 0.1;
    animation: rotate 20s linear infinite;
  }
}

// Stats Section
.stats {
  padding: $spacing-6 0;
  background: $bg-secondary;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: $spacing-6;
  }

  &__card {
    @include flex-center;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
    transition: all $transition-base;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-xl;
    }
  }

  &__icon {
    font-size: 48px;
    color: var(--stat-color);
  }

  &__content {
    @include flex-column;
    gap: $spacing-1;
  }

  &__value {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--stat-color);
    font-family: $font-family-mono;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
}

// Section subtitle
.section-subtitle {
  text-align: center;
  font-size: $font-size-lg;
  color: $text-secondary;
  margin: -$spacing-6 auto $spacing-8;
  max-width: 600px;
}

// Quick Links
.quick-links {
  padding: $spacing-10 0;
  background: linear-gradient(180deg, $white 0%, $bg-secondary 100%);

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    margin-bottom: $spacing-8;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
}

.quick-link {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  padding: $spacing-6;
  background: $white;
  border: 2px solid transparent;
  border-radius: $radius-xl;
  text-decoration: none;
  transition: all $transition-base;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--link-color);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform $transition-base;
  }

  &:hover {
    border-color: var(--link-color);
    box-shadow: $shadow-xl;
    transform: translateY(-8px);

    &::before {
      transform: scaleX(1);
    }

    .quick-link__icon-wrapper {
      transform: scale(1.1);
      background: var(--link-color);

      .quick-link__icon {
        color: $white;
      }
    }

    .quick-link__arrow {
      transform: translateX(8px);
    }
  }

  &__icon-wrapper {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--link-color), 0.1);
    border-radius: $radius-lg;
    transition: all $transition-base;
  }

  &__icon {
    font-size: 32px;
    color: var(--link-color);
    transition: all $transition-base;
  }

  &__content {
    flex: 1;
  }

  &__title {
    margin: 0 0 $spacing-2;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__description {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
  }

  &__arrow {
    font-size: 20px;
    color: var(--link-color);
    transition: transform $transition-base;
  }
}

// Pokemon of the Day
.potd {
  padding: $spacing-6 0;
  background: $bg-secondary;

  &__container {
    max-width: $container-xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__loading {
    @include flex-center;
    padding: $spacing-12 0;
  }

  &__card {
    padding: $spacing-8;
    background: $white;
    border-radius: $radius-2xl;
    box-shadow: $shadow-xl;
  }

  &__link {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-8;
    align-items: center;
    text-decoration: none;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  &__image-container {
    @include flex-center;
    background: radial-gradient(circle, $gray-100 0%, transparent 70%);
    border-radius: $radius-2xl;
    padding: $spacing-8;
  }

  &__image {
    width: 100%;
    max-width: 300px;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
    animation: float 6s ease-in-out infinite;
  }

  &__info {
    @include flex-column;
    gap: $spacing-4;
  }

  &__id {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__name {
    margin: 0;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-transform: capitalize;
    font-family: $font-family-secondary;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-4xl;
    }
  }

  &__types {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-md) {
      justify-content: center;
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-4;
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;
  }

  &__stat {
    @include flex-column;
    gap: $spacing-1;
  }

  &__stat-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: capitalize;
  }

  &__stat-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-mono;
  }

  &__view-btn {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-4 $spacing-6;
    background: $primary;
    color: $white;
    border: none;
    border-radius: $radius-lg;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background: $primary-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    svg {
      font-size: 24px;
    }
  }
}

// Featured
.featured {
  padding: $spacing-6 0;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__loading {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }

    // Bento grid variant for featured
    &--bento {
      @include bento-grid(3, $spacing-6, 320px);

      @media (min-width: $breakpoint-md) {
        // First card spans 2 columns and 2 rows (Pikachu)
        > :nth-child(1) {
          grid-column: span 2;
          grid-row: span 2;
        }

        // Second card spans 1 column and 2 rows (Charizard)
        > :nth-child(2) {
          grid-row: span 2;
        }

        // Third card normal (Mewtwo)

        // Fourth card spans 2 columns (Lucario)
        > :nth-child(4) {
          grid-column: span 2;
        }

        // Fifth and sixth cards normal
      }
    }
  }
}

// Generations
.generations {
  padding: $spacing-10 0;
  background: linear-gradient(180deg, $bg-secondary 0%, $white 100%);

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }

  &__view-all {
    @include flex-center;
    margin-top: $spacing-8;
  }
}

.btn-view-all {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-4 $spacing-8;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  text-decoration: none;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:hover {
    background: $primary-dark;
    box-shadow: $shadow-lg;
    transform: translateY(-2px);

    svg {
      transform: translateX(4px);
    }
  }

  svg {
    font-size: 24px;
    transition: transform $transition-fast;
  }
}

.generation-card {
  @include flex-column;
  gap: $spacing-3;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  text-decoration: none;
  transition: all $transition-base;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, $primary, $secondary);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform $transition-base;
  }

  &:hover {
    box-shadow: $shadow-xl;
    transform: translateY(-8px);

    &::before {
      transform: scaleX(1);
    }

    .generation-card__number {
      transform: scale(1.15);
      color: $primary;
    }
  }

  &__number {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-mono;
    transition: all $transition-base;
    background: $gray-50;
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-full;
    align-self: flex-start;
  }

  &__name {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__region {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &__range {
    margin: 0;
    font-size: $font-size-xs;
    color: $text-hint;
    font-family: $font-family-mono;
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .hero__pokeball,
  .potd__image {
    animation: none !important;
  }

  .hero__btn,
  .quick-link,
  .stats__card,
  .generation-card,
  .btn-view-all {
    &:hover {
      transform: none !important;
    }
  }
}
</style>
