<script setup lang="ts">
useSeoMeta({
  title: 'Move Database - All Pokemon Moves',
  description: 'Complete database of Pokemon moves with power, accuracy, PP, type, and effects. Search and filter through 900+ moves.',
})

const search = ref('')
const typeFilter = ref<string | null>(null)
const categoryFilter = ref<string | null>(null)

const { data: movesData } = await useAsyncData('moves-list', () =>
  $fetch('https://pokeapi.co/api/v2/move?limit=900')
)

const moves = ref<any[]>([])
const loading = ref(true)

// Load move details in batches
onMounted(async () => {
  if (!movesData.value?.results) return

  loading.value = true
  const movePromises = movesData.value.results.slice(0, 100).map((move: any) =>
    $fetch(move.url).catch(() => null)
  )

  moves.value = (await Promise.all(movePromises)).filter(Boolean)
  loading.value = false
})

const filteredMoves = computed(() => {
  let result = moves.value

  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(move =>
      move.name.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value) {
    result = result.filter(move => move.type?.name === typeFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(move => move.damage_class?.name === categoryFilter.value)
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
})

const types = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

const categories = ['physical', 'special', 'status']
</script>

<template>
  <div class="page moves-page">
    <div class="container">
      <div class="page__header">
        <h1 class="page__title">
          <Icon name="mdi:sword-cross" />
          Move Database
        </h1>
        <p class="page__description">
          Browse all Pokemon moves with detailed information
        </p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <input
          v-model="search"
          type="text"
          placeholder="Search moves..."
          class="search-input"
        />

        <select v-model="typeFilter" class="filter-select">
          <option :value="null">All Types</option>
          <option v-for="type in types" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <select v-model="categoryFilter" class="filter-select">
          <option :value="null">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <div class="results-count">
          {{ filteredMoves.length }} moves
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <LoadingSpinner message="Loading moves..." />
      </div>

      <!-- Moves List -->
      <div v-else class="moves-list">
        <div v-for="move in filteredMoves" :key="move.id" class="move-card">
          <div class="move-card__header">
            <h3 class="move-name">{{ move.name.replace(/-/g, ' ') }}</h3>
            <TypeBadge :type="move.type?.name" size="sm" />
          </div>

          <div class="move-card__stats">
            <div class="stat">
              <Icon name="mdi:shape" class="stat__icon" />
              <div class="stat__content">
                <span class="stat__label">Category</span>
                <span class="stat__value damage-class" :class="move.damage_class?.name">
                  {{ move.damage_class?.name || 'N/A' }}
                </span>
              </div>
            </div>
            <div class="stat">
              <Icon name="mdi:flash" class="stat__icon" />
              <div class="stat__content">
                <span class="stat__label">Power</span>
                <span class="stat__value">{{ move.power || '—' }}</span>
              </div>
            </div>
            <div class="stat">
              <Icon name="mdi:target" class="stat__icon" />
              <div class="stat__content">
                <span class="stat__label">Accuracy</span>
                <span class="stat__value">{{ move.accuracy ? `${move.accuracy}%` : '—' }}</span>
              </div>
            </div>
            <div class="stat">
              <Icon name="mdi:repeat" class="stat__icon" />
              <div class="stat__content">
                <span class="stat__label">PP</span>
                <span class="stat__value">{{ move.pp || '—' }}</span>
              </div>
            </div>
          </div>

          <div v-if="move.effect_entries?.[0]" class="move-card__effect">
            {{ move.effect_entries[0].short_effect || move.effect_entries[0].effect }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.moves-page {
  padding: $spacing-8 0;
}

.filters {
  display: flex;
  gap: $spacing-3;
  margin-bottom: $spacing-6;
  flex-wrap: wrap;
  align-items: center;
}

.search-input,
.filter-select {
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

.search-input {
  flex: 1;
  min-width: 250px;
}

.filter-select {
  min-width: 150px;
  text-transform: capitalize;
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

.moves-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.move-card {
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
    align-items: center;
    margin-bottom: $spacing-3;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-3;
    margin-bottom: $spacing-3;
    padding-bottom: $spacing-3;
    border-bottom: 1px solid $gray-200;

    @at-root .dark & {
      border-color: rgba(255, 255, 255, 0.1);
    }
  }

  &__effect {
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.5;
  }
}

.move-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  text-transform: capitalize;
  margin: 0;
  color: $text-primary;
}

.stat {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  &__icon {
    font-size: 24px;
    color: $primary;
    flex-shrink: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__value {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    font-family: $font-family-mono;
    color: $text-primary;

    &.damage-class {
      text-transform: capitalize;
      padding: 2px $spacing-2;
      border-radius: $radius-sm;
      display: inline-block;
      font-size: $font-size-xs;
      font-weight: $font-weight-bold;
      width: fit-content;

      &.physical {
        background: rgba($error, 0.2);
        color: $error;
      }

      &.special {
        background: rgba($primary, 0.2);
        color: $primary;
      }

      &.status {
        background: rgba($gray-500, 0.2);
        color: $gray-700;
      }
    }
  }
}
</style>
