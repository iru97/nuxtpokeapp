<script setup lang="ts">
const collectionStore = useCollectionStore()
const achievementsStore = useAchievementsStore()

useSeoMeta({
  title: 'Pokédex Checklist - Track Your Collection',
  description: 'Track your Pokemon collection progress with interactive checklists for each generation, shiny Pokemon, and more.'
})

onMounted(() => {
  collectionStore.init()
  achievementsStore.init()
})

const activeList = ref('national')

const lists = computed(() => [
  collectionStore.nationalDex,
  ...collectionStore.generationChecklists,
  collectionStore.shinyDex
])

const currentList = computed(() => {
  return lists.value.find(l => l.id === activeList.value) || lists.value[0]
})

const filterMode = ref<'all' | 'caught' | 'missing'>('all')

const filteredPokemon = computed(() => {
  const ids = currentList.value.pokemonIds

  if (filterMode.value === 'caught') {
    return ids.filter(id => collectionStore.isOwned(id))
  } else if (filterMode.value === 'missing') {
    return ids.filter(id => !collectionStore.isOwned(id))
  }

  return ids
})

// Check achievements whenever collection changes
watch(() => collectionStore.totalOwned, () => {
  const kantoOwned = collectionStore.generationChecklists[0].caught
  achievementsStore.checkCollectionAchievements(
    collectionStore.totalOwned,
    collectionStore.totalShinies,
    kantoOwned
  )
})

watch(() => collectionStore.dailyStreak, () => {
  achievementsStore.checkDailyStreak(collectionStore.dailyStreak)
})
</script>

<template>
  <div class="page checklist-page">
    <div class="container">
      <div class="page__header">
        <h1 class="page__title">
          <Icon name="mdi:checkbox-marked-circle-outline" />
          Pokédex Checklist
        </h1>
        <p class="page__description">
          Track your Pokemon collection progress
        </p>
      </div>

      <!-- Overall Progress -->
      <div class="progress-card">
        <div class="progress-stats">
          <div class="stat">
            <div class="stat__value">{{ collectionStore.totalOwned }}</div>
            <div class="stat__label">Pokemon Owned</div>
          </div>
          <div class="stat">
            <div class="stat__value">{{ collectionStore.completionPercent }}%</div>
            <div class="stat__label">National Dex</div>
          </div>
          <div class="stat">
            <div class="stat__value">{{ collectionStore.totalShinies }}</div>
            <div class="stat__label">Shinies</div>
          </div>
          <div class="stat">
            <div class="stat__value">{{ collectionStore.dailyStreak }}</div>
            <div class="stat__label">Day Streak</div>
          </div>
        </div>

        <div class="progress-bar">
          <div
            class="progress-bar__fill"
            :style="{ width: `${collectionStore.completionPercent}%` }"
          />
        </div>
      </div>

      <!-- Checklist Tabs -->
      <div class="checklist-tabs">
        <button
          v-for="list in lists"
          :key="list.id"
          class="tab"
          :class="{ active: activeList === list.id }"
          @click="activeList = list.id"
        >
          <span class="tab__name">{{ list.name }}</span>
          <span class="tab__progress">{{ list.caught }}/{{ list.total }}</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="checklist-filters">
        <div class="filter-buttons">
          <button
            class="filter-btn"
            :class="{ active: filterMode === 'all' }"
            @click="filterMode = 'all'"
          >
            All ({{ currentList.pokemonIds.length }})
          </button>
          <button
            class="filter-btn"
            :class="{ active: filterMode === 'caught' }"
            @click="filterMode = 'caught'"
          >
            Caught ({{ currentList.caught }})
          </button>
          <button
            class="filter-btn"
            :class="{ active: filterMode === 'missing' }"
            @click="filterMode = 'missing'"
          >
            Missing ({{ currentList.total - currentList.caught }})
          </button>
        </div>

        <div class="actions">
          <button class="btn btn--secondary" @click="collectionStore.exportCollection()">
            <Icon name="mdi:download" /> Export
          </button>
        </div>
      </div>

      <!-- Pokemon Grid -->
      <div class="checklist-grid">
        <div
          v-for="id in filteredPokemon"
          :key="id"
          class="checklist-item"
          :class="{
            owned: collectionStore.isOwned(id),
            shiny: collectionStore.hasShiny(id)
          }"
          @click="collectionStore.toggleOwned(id)"
        >
          <div class="item__checkbox">
            <Icon
              :name="collectionStore.isOwned(id) ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'"
            />
          </div>
          <div class="item__number">#{{ String(id).padStart(3, '0') }}</div>
          <button
            class="item__shiny"
            :class="{ active: collectionStore.hasShiny(id) }"
            @click.stop="collectionStore.toggleShiny(id)"
          >
            <Icon name="mdi:star" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checklist-page {
  padding: $spacing-8 0;
}

.progress-card {
  background: linear-gradient(135deg, $primary, $secondary);
  color: $white;
  padding: $spacing-6;
  border-radius: $radius-xl;
  margin-bottom: $spacing-6;
  box-shadow: $shadow-xl;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-4;
}

.stat {
  text-align: center;

  &__value {
    font-size: 2.5rem;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
  }

  &__label {
    font-size: $font-size-sm;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.progress-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: $radius-full;
  overflow: hidden;

  &__fill {
    height: 100%;
    background: $white;
    border-radius: $radius-full;
    transition: width 0.5s ease;
  }
}

.checklist-tabs {
  display: flex;
  gap: $spacing-2;
  overflow-x: auto;
  margin-bottom: $spacing-6;
  padding-bottom: $spacing-2;

  .tab {
    @include reset-button;
    @include spring-bounce;
    padding: $spacing-3 $spacing-4;
    background: $gray-100;
    border-radius: $radius-lg;
    white-space: nowrap;
    transition: all $transition-base;

    @at-root .dark & {
      background: $dark-surface;
    }

    &:hover {
      background: $gray-200;
    }

    &.active {
      background: $primary;
      color: $white;
    }

    &__name {
      display: block;
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-1;
    }

    &__progress {
      display: block;
      font-size: $font-size-sm;
      font-family: $font-family-mono;
      opacity: 0.8;
    }
  }
}

.checklist-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-6;
  flex-wrap: wrap;
  gap: $spacing-4;
}

.filter-buttons {
  display: flex;
  gap: $spacing-2;
}

.filter-btn {
  @include reset-button;
  @include spring-bounce;
  padding: $spacing-2 $spacing-4;
  background: $gray-100;
  border-radius: $radius-md;
  font-weight: $font-weight-semibold;
  transition: all $transition-base;

  @at-root .dark & {
    background: $dark-surface;
  }

  &:hover {
    background: $gray-200;
  }

  &.active {
    background: $primary;
    color: $white;
  }
}

.checklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: $spacing-3;
}

.checklist-item {
  aspect-ratio: 1;
  background: $white;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  padding: $spacing-2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-base;
  position: relative;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: $primary;
  }

  &.owned {
    background: rgba($success, 0.1);
    border-color: $success;

    .item__checkbox {
      color: $success;
    }
  }

  &.shiny {
    background: linear-gradient(135deg, rgba($warning, 0.2), rgba($error, 0.2));
  }

  &__checkbox {
    font-size: 24px;
    color: $gray-400;
    margin-bottom: $spacing-1;
  }

  &__number {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
    color: $text-primary;
  }

  &__shiny {
    @include reset-button;
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 16px;
    color: $gray-300;
    transition: color $transition-base;

    &:hover,
    &.active {
      color: $warning;
    }
  }
}
</style>
