<script setup lang="ts">
import type { Pokemon } from '~/types'
import { TYPE_COLORS } from '~/constants/pokemon'

interface Props {
  pokemon?: Pokemon
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const favoritesStore = useFavoritesStore()
const comparisonStore = useComparisonStore()
const router = useRouter()

const isFavorite = computed(() => {
  if (!props.pokemon) return false
  return favoritesStore.isFavorite(props.pokemon.id)
})

const isInComparison = computed(() => {
  if (!props.pokemon) return false
  return comparisonStore.isSelected(props.pokemon.id)
})

const primaryType = computed(() => {
  if (!props.pokemon?.types.length) return 'normal'
  return props.pokemon.types[0].type.name
})

const typeColor = computed(() => {
  return TYPE_COLORS[primaryType.value] || TYPE_COLORS.normal
})

const totalStats = computed(() => {
  if (!props.pokemon) return 0
  return props.pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
})

const toggleFavorite = (event: Event) => {
  event.stopPropagation()
  if (props.pokemon) {
    favoritesStore.toggleFavorite(props.pokemon.id)
  }
}

const toggleComparison = (event: Event) => {
  event.stopPropagation()
  if (props.pokemon) {
    const success = comparisonStore.togglePokemon(props.pokemon.id, props.pokemon.name)
    if (!success && !comparisonStore.isSelected(props.pokemon.id)) {
      // Comparison is full
      alert('Comparison is full. Maximum 3 Pokémon allowed.')
    }
  }
}

const goToDetail = () => {
  if (props.pokemon) {
    router.push(`/pokemon/${props.pokemon.id}`)
  }
}
</script>

<template>
  <div
    v-if="loading"
    class="pokemon-card pokemon-card--loading"
  >
    <div class="pokemon-card__header">
      <SkeletonLoader width="60px" height="20px" />
      <SkeletonLoader variant="circular" height="32px" />
    </div>
    <div class="pokemon-card__image">
      <SkeletonLoader width="100%" height="180px" border-radius="12px" />
    </div>
    <div class="pokemon-card__content">
      <SkeletonLoader width="70%" height="24px" />
      <div class="flex gap-2 mt-2">
        <SkeletonLoader width="60px" height="20px" border-radius="16px" />
        <SkeletonLoader width="60px" height="20px" border-radius="16px" />
      </div>
      <div class="pokemon-card__stats">
        <SkeletonLoader width="100%" height="8px" />
        <SkeletonLoader width="100%" height="8px" />
        <SkeletonLoader width="100%" height="8px" />
      </div>
    </div>
  </div>

  <div
    v-else-if="pokemon"
    class="pokemon-card"
    :style="{ '--type-color': typeColor }"
    @click="goToDetail"
  >
    <div class="pokemon-card__header">
      <span class="pokemon-card__id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
      <div class="pokemon-card__actions">
        <button
          class="pokemon-card__action"
          :class="{ 'pokemon-card__action--active': isInComparison }"
          @click="toggleComparison"
          title="Add to comparison"
        >
          <Icon :name="isInComparison ? 'mdi:compare' : 'mdi:compare'" />
        </button>
        <button
          class="pokemon-card__action pokemon-card__favorite"
          :class="{ 'pokemon-card__action--active': isFavorite }"
          @click="toggleFavorite"
          title="Add to favorites"
        >
          <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
        </button>
      </div>
    </div>

    <div class="pokemon-card__image">
      <NuxtImg
        :src="pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default"
        :alt="pokemon.name"
        loading="lazy"
        width="180"
        height="180"
        class="pokemon-card__img"
      />
    </div>

    <div class="pokemon-card__content">
      <h3 class="pokemon-card__name">{{ pokemon.name }}</h3>

      <div class="pokemon-card__types">
        <TypeBadge
          v-for="typeInfo in pokemon.types"
          :key="typeInfo.type.name"
          :type="typeInfo.type.name"
          size="sm"
        />
      </div>

      <div class="pokemon-card__stats">
        <div
          v-for="stat in pokemon.stats.slice(0, 3)"
          :key="stat.stat.name"
          class="pokemon-card__stat"
        >
          <span class="pokemon-card__stat-name">{{ stat.stat.name.replace('-', ' ') }}</span>
          <div class="pokemon-card__stat-bar">
            <div
              class="pokemon-card__stat-fill"
              :style="{ width: `${(stat.base_stat / 255) * 100}%` }"
            />
          </div>
          <span class="pokemon-card__stat-value">{{ stat.base_stat }}</span>
        </div>
      </div>

      <div class="pokemon-card__footer">
        <div class="pokemon-card__info">
          <div class="pokemon-card__info-item">
            <Icon name="mdi:weight" />
            <span>{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
          </div>
          <div class="pokemon-card__info-item">
            <Icon name="mdi:ruler" />
            <span>{{ (pokemon.height / 10).toFixed(1) }} m</span>
          </div>
        </div>
        <div class="pokemon-card__total">
          <span class="pokemon-card__total-label">Total</span>
          <span class="pokemon-card__total-value">{{ totalStats }}</span>
        </div>
      </div>
    </div>

    <div class="pokemon-card__shine" />
  </div>
</template>

<style scoped lang="scss">
.pokemon-card {
  position: relative;
  background: $white;
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: $shadow-md;
  cursor: pointer;
  transition: all $transition-base;
  overflow: hidden;
  border: 2px solid transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--type-color);
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-xl;
    border-color: var(--type-color);

    .pokemon-card__img {
      transform: scale(1.1);
    }

    .pokemon-card__shine {
      left: 100%;
    }
  }

  &--loading {
    cursor: default;
    pointer-events: none;

    &:hover {
      transform: none;
      box-shadow: $shadow-md;
    }
  }

  &__header {
    @include flex-between;
    margin-bottom: $spacing-3;
  }

  &__id {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__actions {
    display: flex;
    gap: $spacing-2;
  }

  &__action {
    @include reset-button;
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: $radius-full;
    color: $gray-400;
    background-color: $gray-100;
    transition: all $transition-fast;

    &:hover {
      background-color: $gray-200;
      transform: scale(1.1);
    }

    &--active {
      background-color: rgba($primary, 0.1);

      &:hover {
        background-color: rgba($primary, 0.2);
      }
    }
  }

  &__favorite {
    &:hover {
      color: $error;
    }

    &.pokemon-card__action--active {
      color: $error;
      background-color: rgba($error, 0.1);

      &:hover {
        background-color: rgba($error, 0.2);
      }
    }
  }

  &__image {
    @include flex-center;
    height: 180px;
    margin-bottom: $spacing-3;
    background: linear-gradient(135deg, rgba(var(--type-color), 0.05) 0%, rgba(var(--type-color), 0.1) 100%);
    border-radius: $radius-lg;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform $transition-slow;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__name {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-transform: capitalize;
    margin: 0 0 $spacing-2;
    font-family: $font-family-secondary;
  }

  &__types {
    display: flex;
    gap: $spacing-2;
    margin-bottom: $spacing-4;
    flex-wrap: wrap;
  }

  &__stats {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    margin-bottom: $spacing-3;
    padding: $spacing-3;
    background-color: $gray-50;
    border-radius: $radius-md;
  }

  &__stat {
    display: grid;
    grid-template-columns: 80px 1fr 40px;
    align-items: center;
    gap: $spacing-2;
  }

  &__stat-name {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: capitalize;
  }

  &__stat-bar {
    position: relative;
    height: 6px;
    background-color: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__stat-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, var(--type-color), lighten(var(--type-color), 20%));
    border-radius: $radius-full;
    transition: width $transition-slow;
  }

  &__stat-value {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: right;
    font-family: $font-family-mono;
  }

  &__footer {
    @include flex-between;
    padding-top: $spacing-3;
    border-top: 1px solid $gray-200;
  }

  &__info {
    display: flex;
    gap: $spacing-4;
  }

  &__info-item {
    @include flex-center;
    gap: $spacing-1;
    font-size: $font-size-xs;
    color: $text-secondary;

    svg {
      font-size: 16px;
    }
  }

  &__total {
    @include flex-center;
    @include flex-column;
    gap: 0;
  }

  &__total-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__total-value {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--type-color);
    font-family: $font-family-mono;
  }

  &__shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left $transition-slow;
    pointer-events: none;
  }
}

// Animation on mount
.pokemon-card {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
