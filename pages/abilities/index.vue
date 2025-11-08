<script setup lang="ts">
useSeoMeta({
  title: 'Ability Database - All Pokemon Abilities',
  description: 'Complete database of Pokemon abilities with detailed descriptions and effects. Search through 300+ abilities.',
})

const search = ref('')

const { data: abilitiesData } = await useAsyncData('abilities-list', () =>
  $fetch('https://pokeapi.co/api/v2/ability?limit=400')
)

const abilities = ref<any[]>([])
const loading = ref(true)

// Load ability details in batches
onMounted(async () => {
  if (!abilitiesData.value?.results) return

  loading.value = true
  const abilityPromises = abilitiesData.value.results.slice(0, 150).map((ability: any) =>
    $fetch(ability.url).catch(() => null)
  )

  abilities.value = (await Promise.all(abilityPromises)).filter(Boolean)
  loading.value = false
})

const filteredAbilities = computed(() => {
  let result = abilities.value

  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(ability =>
      ability.name.toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
})

const getEnglishEffect = (ability: any) => {
  const englishEntry = ability.effect_entries?.find((entry: any) => entry.language.name === 'en')
  return englishEntry?.effect || englishEntry?.short_effect || 'No description available'
}

const getEnglishFlavorText = (ability: any) => {
  const englishEntry = ability.flavor_text_entries?.find((entry: any) => entry.language.name === 'en')
  return englishEntry?.flavor_text?.replace(/\n/g, ' ') || ''
}
</script>

<template>
  <div class="page abilities-page">
    <div class="container">
      <div class="page__header">
        <h1 class="page__title">
          <Icon name="mdi:shield-star" />
          Ability Database
        </h1>
        <p class="page__description">
          Browse all Pokemon abilities with detailed information
        </p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          v-model="search"
          type="text"
          placeholder="Search abilities..."
          class="search-input"
        />

        <div class="results-count">
          {{ filteredAbilities.length }} abilities
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <LoadingSpinner message="Loading abilities..." />
      </div>

      <!-- Abilities List -->
      <div v-else class="abilities-list">
        <div v-for="ability in filteredAbilities" :key="ability.id" class="ability-card">
          <div class="ability-card__header">
            <h3 class="ability-name">{{ ability.name.replace(/-/g, ' ') }}</h3>
            <span v-if="ability.is_main_series === false" class="badge badge--special">
              Non-Main Series
            </span>
          </div>

          <div v-if="getEnglishFlavorText(ability)" class="ability-card__flavor">
            {{ getEnglishFlavorText(ability) }}
          </div>

          <div class="ability-card__effect">
            <strong>Effect:</strong> {{ getEnglishEffect(ability) }}
          </div>

          <!-- Pokemon with this ability (if available) -->
          <div v-if="ability.pokemon?.length > 0" class="ability-card__pokemon">
            <strong>Found on:</strong>
            <span class="pokemon-count">{{ ability.pokemon.length }} Pokémon</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredAbilities.length === 0" class="empty-state">
        <Icon name="mdi:magnify" />
        <p>No abilities found matching "{{ search }}"</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.abilities-page {
  padding: $spacing-8 0;
}

.filters {
  display: flex;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: $spacing-3;
  border: 2px solid $gray-300;
  border-radius: $radius-md;
  font-size: $font-size-base;
  background: $white;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.2);
    color: $dark-text-primary;
  }

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.results-count {
  margin-left: auto;
  padding: $spacing-2 $spacing-3;
  background: $primary;
  color: $white;
  border-radius: $radius-md;
  font-weight: $font-weight-semibold;
  font-size: $font-size-sm;
}

.loading {
  display: flex;
  justify-content: center;
  padding: $spacing-12;
}

.abilities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.ability-card {
  background: $white;
  border-radius: $radius-lg;
  padding: $spacing-4;
  border: 2px solid $gray-200;
  transition: all $transition-base;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: $primary;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-3;
    gap: $spacing-2;
  }

  &__flavor {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-style: italic;
    margin-bottom: $spacing-3;
    padding: $spacing-2 $spacing-3;
    background: $gray-50;
    border-radius: $radius-md;
    border-left: 3px solid $primary;

    @at-root .dark & {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &__effect {
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.6;
    margin-bottom: $spacing-3;

    strong {
      color: $primary;
      display: block;
      margin-bottom: $spacing-1;
    }
  }

  &__pokemon {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding-top: $spacing-3;
    border-top: 1px solid $gray-200;
    font-size: $font-size-sm;

    @at-root .dark & {
      border-color: rgba(255, 255, 255, 0.1);
    }

    strong {
      color: $text-secondary;
    }

    .pokemon-count {
      padding: 2px $spacing-2;
      background: rgba($primary, 0.1);
      color: $primary;
      border-radius: $radius-sm;
      font-weight: $font-weight-semibold;
      font-size: $font-size-xs;
    }
  }
}

.ability-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  text-transform: capitalize;
  margin: 0;
  color: $text-primary;
}

.badge {
  padding: 4px $spacing-2;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &--special {
    background: rgba($warning, 0.2);
    color: $warning;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-12;
  gap: $spacing-4;
  color: $text-secondary;

  svg {
    font-size: 64px;
    opacity: 0.3;
  }

  p {
    font-size: $font-size-lg;
    margin: 0;
  }
}
</style>
