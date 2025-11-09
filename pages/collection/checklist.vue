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
          <div class="item__sprite">
            <img
              :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`"
              :alt="`Pokemon ${id}`"
              loading="lazy"
              class="sprite-image"
              :class="{ grayscale: !collectionStore.isOwned(id) }"
            />
            <div v-if="collectionStore.isOwned(id)" class="check-badge">
              <Icon name="mdi:check-circle" />
            </div>
          </div>
          <div class="item__number">#{{ String(id).padStart(3, '0') }}</div>
          <button
            v-if="collectionStore.isOwned(id)"
            class="item__shiny"
            :class="{ active: collectionStore.hasShiny(id) }"
            @click.stop="collectionStore.toggleShiny(id)"
            title="Mark as shiny"
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

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-3;
  }
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

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;
  }
}

.filter-buttons {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-sm) {
    width: 100%;

    .filter-btn {
      flex: 1;
    }
  }
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: $spacing-3;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: $spacing-2;
  }
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
  overflow: hidden;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: $shadow-lg;
    border-color: $primary;

    .sprite-image.grayscale {
      filter: grayscale(0.5); // Preview color on hover
    }
  }

  &.owned {
    background: rgba($success, 0.05);
    border-color: $success;
  }

  &.shiny {
    background: linear-gradient(135deg, rgba($warning, 0.15), rgba($error, 0.15));
    border-color: $warning;

    &::after {
      content: '✨';
      position: absolute;
      top: 2px;
      left: 2px;
      font-size: 16px;
      animation: sparkle 2s ease-in-out infinite;
    }
  }

  &__sprite {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-1;

    .sprite-image {
      width: 64px;
      height: 64px;
      object-fit: contain;
      transition: all $transition-base;

      &.grayscale {
        filter: grayscale(1);
        opacity: 0.4;
      }

      @media (max-width: $breakpoint-sm) {
        width: 56px;
        height: 56px;
      }
    }

    .check-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: $success;
      color: $white;
      border-radius: $radius-full;
      width: 24px;
      height: 24px;
      @include flex-center;
      box-shadow: $shadow-md;
      animation: bounceIn 0.3s ease-out;

      svg {
        font-size: 16px;
      }
    }
  }

  &__number {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
    color: $text-secondary;
    margin-top: auto;
  }

  &__shiny {
    @include reset-button;
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 18px;
    color: $gray-300;
    transition: all $transition-base;
    z-index: 1;
    width: 28px;
    height: 28px;
    border-radius: $radius-full;
    @include flex-center;
    background: rgba($white, 0.9);

    &:hover {
      color: $warning;
      transform: scale(1.1);
      background: $white;
    }

    &.active {
      color: $warning;
      animation: pulse 1s ease-in-out infinite;
    }
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
