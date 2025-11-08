<script setup lang="ts">
const pokemonStore = usePokemonStore()
const filtersStore = useFiltersStore()

// SEO Meta tags
useHead({
  title: 'Pokédex - Explore All Pokémon | PokéApp',
  meta: [
    { name: 'description', content: 'Explore the complete list of Pokémon with their stats, types, and abilities. Discover detailed information about each Pokémon.' },
    { property: 'og:title', content: 'Pokédex - Explore All Pokémon | PokéApp' },
    { property: 'og:description', content: 'Explore the complete list of Pokémon with detailed information.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
})

// Computed properties
const isLoading = computed(() => pokemonStore.loading.list)
const pokemons = computed(() => pokemonStore.pokemons)
const hasMore = computed(() => {
  const { page, limit, total } = pokemonStore.pagination
  return (page + 1) * limit < total
})

// Load more pokemons
const loadMore = async () => {
  if (!isLoading.value && hasMore.value) {
    await pokemonStore.fetchPokemons(pokemonStore.pagination.page + 1)
  }
}

// Initial load
onMounted(async () => {
  // Only fetch if we don't have pokemons yet
  if (pokemons.value.length === 0) {
    await pokemonStore.fetchPokemons(0)
  }
})
</script>

<template>
  <div class="pokemons-page">
    <div class="pokemons-page__container">
      <!-- Header -->
      <div class="pokemons-page__header">
        <div class="pokemons-page__header-content">
          <Icon name="mdi:pokeball" class="pokemons-page__header-icon" />
          <div>
            <h1 class="pokemons-page__title">Pokédex</h1>
            <p class="pokemons-page__subtitle">
              Explore all {{ pokemonStore.pagination.total }} Pokémon
            </p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <PokemonFilters />

      <!-- Pokemon List -->
      <PokemonList
        :pokemons="pokemons"
        :loading="isLoading"
        :has-more="hasMore"
        :show-load-more="true"
        @load-more="loadMore"
      />

      <!-- Error State -->
      <ErrorState
        v-if="pokemonStore.error.list"
        :message="pokemonStore.error.list"
        @retry="pokemonStore.fetchPokemons(0)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemons-page {
  min-height: 100vh;
  padding: $spacing-6 0;

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
  }

  &__header-icon {
    font-size: 64px;
    color: $primary;
    animation: float 3s ease-in-out infinite;
  }

  &__title {
    margin: 0;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-4xl;
    }
  }

  &__subtitle {
    margin: $spacing-1 0 0;
    font-size: $font-size-lg;
    color: $text-secondary;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-base;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
