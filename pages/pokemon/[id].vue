<script setup lang="ts">
import type { Pokemon, PokemonSpecies } from '~/types'

const route = useRoute()
const pokemonId = route.params.id as string

// Active tab state
const activeTab = ref('stats')

// Fetch Pokemon data
const { data: pokemon, error: pokemonError } = await useAsyncData<Pokemon>(
  `pokemon-${pokemonId}`,
  () => $fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
)

// Fetch Pokemon species data
const { data: species, error: speciesError } = await useAsyncData<PokemonSpecies>(
  `pokemon-species-${pokemonId}`,
  async () => {
    if (!pokemon.value) return null
    return $fetch(pokemon.value.species.url)
  }
)

// SEO Meta tags
useHead({
  title: pokemon.value ? `${pokemon.value.name} - Pokédex | PokéApp` : `Pokémon #${pokemonId}`,
  meta: [
    {
      name: 'description',
      content: pokemon.value
        ? `Complete information about ${pokemon.value.name}, including stats, abilities, moves, and evolution chain. Types: ${pokemon.value.types.map(t => t.type.name).join(', ')}.`
        : 'Pokemon information'
    },
    {
      property: 'og:title',
      content: pokemon.value ? `${pokemon.value.name} - Pokédex | PokéApp` : `Pokémon #${pokemonId}`
    },
    {
      property: 'og:description',
      content: pokemon.value
        ? `Discover ${pokemon.value.name}, a ${pokemon.value.types.map(t => t.type.name).join('/')} type Pokémon with ${pokemon.value.stats.reduce((sum, s) => sum + s.base_stat, 0)} total base stats.`
        : 'Pokemon information'
    },
    {
      property: 'og:image',
      content: pokemon.value?.sprites?.other?.['official-artwork']?.front_default || ''
    },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      name: 'twitter:title',
      content: pokemon.value ? `${pokemon.value.name} - Pokédex` : `Pokémon #${pokemonId}`
    },
    {
      name: 'twitter:description',
      content: pokemon.value
        ? `Stats, abilities, and moves for ${pokemon.value.name}`
        : 'Pokemon information'
    },
    {
      name: 'twitter:image',
      content: pokemon.value?.sprites?.other?.['official-artwork']?.front_default || ''
    }
  ]
})

// Shiny toggle state
const showShiny = ref(false)

const toggleShiny = () => {
  showShiny.value = !showShiny.value
}

// Tab configuration
const tabs = [
  { id: 'stats', label: 'Stats', icon: 'mdi:chart-bar' },
  { id: 'evolution', label: 'Evolution', icon: 'mdi:transit-connection-variant' },
  { id: 'moves', label: 'Moves', icon: 'mdi:sword-cross' },
  { id: 'abilities', label: 'Abilities', icon: 'mdi:shield-star' },
  { id: 'pokedex', label: 'Pokédex', icon: 'mdi:book-open-page-variant' },
  { id: 'size', label: 'Size', icon: 'mdi:ruler' },
  { id: 'sprites', label: 'Sprites', icon: 'mdi:image-multiple' },
]

// Evolution chain URL
const evolutionChainUrl = computed(() => {
  if (!species.value?.evolution_chain?.url) return undefined
  return species.value.evolution_chain.url
})

// Track recently viewed
const favoritesStore = useFavoritesStore()
onMounted(() => {
  if (pokemon.value) {
    favoritesStore.addToRecentlyViewed(pokemon.value.id)
  }
})
</script>

<template>
  <div class="pokemon-detail">
    <!-- Error State -->
    <div v-if="pokemonError" class="pokemon-detail__error">
      <ErrorState
        title="Pokémon Not Found"
        :message="`Could not load Pokémon #${pokemonId}. It might not exist or there was a network error.`"
        @retry="navigateTo('/pokemons')"
      />
    </div>

    <!-- Loading State -->
    <div v-else-if="!pokemon" class="pokemon-detail__loading">
      <LoadingSpinner size="xl" message="Loading Pokémon details..." />
    </div>

    <!-- Detail Content -->
    <div v-else class="pokemon-detail__container">
      <!-- Header -->
      <DetailPokemonDetailHeader
        :pokemon="pokemon"
        :species="species"
        :show-shiny="showShiny"
        @toggle-shiny="toggleShiny"
      />

      <!-- Tabbed Content -->
      <div class="pokemon-detail__content">
        <Tabs v-model="activeTab" :tabs="tabs">
          <!-- Stats Tab -->
          <div v-if="activeTab === 'stats'">
            <DetailPokemonStats :pokemon="pokemon" />

            <!-- Pokemon Cries Audio -->
            <div v-if="pokemon.cries" style="margin-top: 2rem;">
              <PokemonCries
                :cries="pokemon.cries"
                :pokemon-name="pokemon.name"
              />
            </div>
          </div>

          <!-- Evolution Tab -->
          <div v-if="activeTab === 'evolution'">
            <DetailPokemonEvolution :evolution-chain-url="evolutionChainUrl" />
          </div>

          <!-- Moves Tab -->
          <div v-if="activeTab === 'moves'">
            <DetailPokemonMoves :pokemon="pokemon" />
          </div>

          <!-- Abilities Tab -->
          <div v-if="activeTab === 'abilities'">
            <DetailPokemonAbilities :pokemon="pokemon" />
          </div>

          <!-- Pokedex Tab (Flavor Texts) -->
          <div v-if="activeTab === 'pokedex'">
            <PokemonFlavorTexts
              v-if="species?.flavor_text_entries"
              :flavor-text-entries="species.flavor_text_entries"
            />
            <div v-else class="empty-state">
              <p>No Pokédex entries available</p>
            </div>
          </div>

          <!-- Size Tab -->
          <div v-if="activeTab === 'size'">
            <PokemonSizeComparison
              :height="pokemon.height"
              :weight="pokemon.weight"
              :name="pokemon.name"
              :sprite="pokemon.sprites.other?.['official-artwork']?.front_default"
            />
          </div>

          <!-- Sprites Tab -->
          <div v-if="activeTab === 'sprites'">
            <DetailPokemonSprites :pokemon="pokemon" />
          </div>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-detail {
  min-height: 100vh;
  background: $bg-secondary;

  &__error,
  &__loading {
    @include flex-center;
    min-height: 80vh;
    padding: $spacing-6;
  }

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
  }

  &__content {
    padding: $spacing-6;

    @media (max-width: $breakpoint-md) {
      padding: $spacing-4;
    }

    @media (max-width: $breakpoint-sm) {
      padding: $spacing-3;
    }
  }
}
</style>
