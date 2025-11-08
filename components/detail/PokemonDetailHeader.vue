<script setup lang="ts">
import type { Pokemon, PokemonSpecies } from '~/types'
import { TYPE_COLORS } from '~/constants/pokemon'

interface Props {
  pokemon: Pokemon
  species?: PokemonSpecies | null
  showShiny?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'toggle-shiny': []
}>()

const router = useRouter()
const favoritesStore = useFavoritesStore()

const isFavorite = computed(() => favoritesStore.isFavorite(props.pokemon.id))

const toggleShiny = () => {
  emit('toggle-shiny')
}

// Get current sprite based on shiny state
const currentSprite = computed(() => {
  if (props.showShiny) {
    return props.pokemon.sprites.other?.['official-artwork']?.front_shiny ||
           props.pokemon.sprites.front_shiny ||
           props.pokemon.sprites.other?.['official-artwork']?.front_default ||
           props.pokemon.sprites.front_default
  }
  return props.pokemon.sprites.other?.['official-artwork']?.front_default ||
         props.pokemon.sprites.front_default
})

const primaryType = computed(() => {
  return props.pokemon.types[0]?.type.name || 'normal'
})

const typeColor = computed(() => {
  return TYPE_COLORS[primaryType.value] || TYPE_COLORS.normal
})

const generation = computed(() => {
  if (!props.species) return null
  const genNumber = props.species.generation.url.split('/').filter(Boolean).pop()
  return genNumber ? `Generation ${genNumber}` : null
})

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.pokemon.id)
}

const goBack = () => {
  router.back()
}

const goToPrevious = () => {
  if (props.pokemon.id > 1) {
    router.push(`/pokemon/${props.pokemon.id - 1}`)
  }
}

const goToNext = () => {
  if (props.pokemon.id < 1025) {
    router.push(`/pokemon/${props.pokemon.id + 1}`)
  }
}

const canGoPrevious = computed(() => props.pokemon.id > 1)
const canGoNext = computed(() => props.pokemon.id < 1025)
</script>

<template>
  <div class="detail-header" :style="{ '--type-color': typeColor }">
    <div class="detail-header__background" />

    <div class="detail-header__container">
      <!-- Navigation Controls -->
      <div class="detail-header__nav">
        <button
          class="detail-header__back"
          @click="goBack"
        >
          <Icon name="mdi:arrow-left" />
          <span>Back</span>
        </button>

        <div class="detail-header__pagination">
          <button
            class="detail-header__nav-btn"
            :class="{ 'detail-header__nav-btn--disabled': !canGoPrevious }"
            :disabled="!canGoPrevious"
            @click="goToPrevious"
          >
            <Icon name="mdi:chevron-left" />
          </button>
          <span class="detail-header__number">#{{ String(pokemon.id).padStart(3, '0') }}</span>
          <button
            class="detail-header__nav-btn"
            :class="{ 'detail-header__nav-btn--disabled': !canGoNext }"
            :disabled="!canGoNext"
            @click="goToNext"
          >
            <Icon name="mdi:chevron-right" />
          </button>
        </div>

        <div class="detail-header__actions">
          <button
            class="detail-header__action detail-header__shiny"
            :class="{ 'detail-header__action--active': showShiny }"
            @click="toggleShiny"
            title="Toggle Shiny"
          >
            <Icon name="mdi:sparkles" />
          </button>

          <button
            class="detail-header__action detail-header__favorite"
            :class="{ 'detail-header__action--active': isFavorite }"
            @click="toggleFavorite"
            title="Add to Favorites"
          >
            <Icon :name="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" />
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="detail-header__content">
        <!-- Image -->
        <div class="detail-header__image-container">
          <div class="detail-header__image-bg" />
          <div v-if="showShiny" class="detail-header__shiny-badge">
            <Icon name="mdi:sparkles" />
            <span>Shiny</span>
          </div>
          <NuxtImg
            :src="currentSprite"
            :alt="pokemon.name"
            class="detail-header__image"
            width="400"
            height="400"
          />
        </div>

        <!-- Info -->
        <div class="detail-header__info">
          <h1 class="detail-header__name">{{ pokemon.name }}</h1>

          <div class="detail-header__types">
            <TypeBadge
              v-for="type in pokemon.types"
              :key="type.type.name"
              :type="type.type.name"
              size="lg"
            />
          </div>

          <div class="detail-header__specs">
            <div class="detail-header__spec">
              <Icon name="mdi:weight" />
              <div>
                <span class="detail-header__spec-label">Weight</span>
                <span class="detail-header__spec-value">{{ (pokemon.weight / 10).toFixed(1) }} kg</span>
              </div>
            </div>

            <div class="detail-header__spec">
              <Icon name="mdi:ruler" />
              <div>
                <span class="detail-header__spec-label">Height</span>
                <span class="detail-header__spec-value">{{ (pokemon.height / 10).toFixed(1) }} m</span>
              </div>
            </div>

            <div v-if="generation" class="detail-header__spec">
              <Icon name="mdi:pokeball" />
              <div>
                <span class="detail-header__spec-label">Generation</span>
                <span class="detail-header__spec-value">{{ generation }}</span>
              </div>
            </div>

            <div class="detail-header__spec">
              <Icon name="mdi:star" />
              <div>
                <span class="detail-header__spec-label">Base Experience</span>
                <span class="detail-header__spec-value">{{ pokemon.base_experience || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Abilities -->
          <div class="detail-header__abilities">
            <h3 class="detail-header__abilities-title">Abilities</h3>
            <div class="detail-header__abilities-list">
              <span
                v-for="ability in pokemon.abilities"
                :key="ability.ability.name"
                class="detail-header__ability"
                :class="{ 'detail-header__ability--hidden': ability.is_hidden }"
              >
                {{ ability.ability.name }}
                <span v-if="ability.is_hidden" class="detail-header__ability-badge">Hidden</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-header {
  position: relative;
  overflow: hidden;

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(135deg, var(--type-color) 0%, darken(var(--type-color), 15%) 100%);
    opacity: 0.1;
  }

  &__container {
    position: relative;
    max-width: $container-xl;
    margin: 0 auto;
    padding: $spacing-6;
  }

  &__nav {
    @include flex-between;
    margin-bottom: $spacing-6;
  }

  &__back {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: $white;
    color: $text-primary;
    border-radius: $radius-lg;
    font-weight: $font-weight-medium;
    box-shadow: $shadow-sm;
    transition: all $transition-fast;

    &:hover {
      box-shadow: $shadow-md;
      transform: translateX(-4px);
    }

    svg {
      font-size: 20px;
    }
  }

  &__pagination {
    @include flex-center;
    gap: $spacing-3;
  }

  &__number {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
    color: $text-primary;
    min-width: 60px;
    text-align: center;
  }

  &__nav-btn {
    @include reset-button;
    @include flex-center;
    width: 40px;
    height: 40px;
    background: $white;
    color: $text-primary;
    border-radius: $radius-full;
    box-shadow: $shadow-sm;
    transition: all $transition-fast;

    &:hover:not(&--disabled) {
      box-shadow: $shadow-md;
      transform: scale(1.1);
    }

    &--disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    svg {
      font-size: 24px;
    }
  }

  &__actions {
    @include flex-center;
    gap: $spacing-2;
  }

  &__action {
    @include reset-button;
    @include flex-center;
    width: 48px;
    height: 48px;
    background: $white;
    color: $gray-400;
    border-radius: $radius-full;
    box-shadow: $shadow-sm;
    transition: all $transition-fast;

    &:hover {
      box-shadow: $shadow-md;
      transform: scale(1.1);
    }

    &--active {
      background: rgba($primary, 0.1);
    }

    svg {
      font-size: 28px;
    }
  }

  &__shiny {
    &:hover {
      color: $warning;
    }

    &.detail-header__action--active {
      color: $warning;
      background: rgba($warning, 0.1);
      animation: sparkle 1s ease-in-out infinite;
    }
  }

  &__favorite {
    &:hover {
      color: $error;
    }

    &.detail-header__action--active {
      color: $error;
      background: rgba($error, 0.1);
    }
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-8;
    align-items: center;

    @media (min-width: $breakpoint-md) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__image-container {
    position: relative;
    @include flex-center;
  }

  &__image-bg {
    position: absolute;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, var(--type-color) 0%, transparent 70%);
    opacity: 0.2;
    border-radius: $radius-full;
    animation: pulse 3s ease-in-out infinite;
  }

  &__image {
    position: relative;
    width: 100%;
    max-width: 400px;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));
    animation: float 6s ease-in-out infinite;
  }

  &__shiny-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: linear-gradient(135deg, $warning 0%, darken($warning, 10%) 100%);
    color: $white;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    box-shadow: $shadow-lg;
    z-index: 10;
    animation: sparkle 1s ease-in-out infinite;

    svg {
      font-size: 20px;
    }
  }

  &__info {
    @include flex-column;
    gap: $spacing-4;
  }

  &__name {
    margin: 0;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    text-transform: capitalize;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-4xl;
    }
  }

  &__types {
    display: flex;
    gap: $spacing-3;
    flex-wrap: wrap;
  }

  &__specs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: $spacing-4;
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__spec {
    @include flex-center;
    gap: $spacing-2;

    svg {
      font-size: 24px;
      color: var(--type-color);
    }

    > div {
      @include flex-column;
      gap: 0;
    }
  }

  &__spec-label {
    font-size: $font-size-xs;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__spec-value {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__abilities {
    padding: $spacing-4;
    background: $white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
  }

  &__abilities-title {
    margin: 0 0 $spacing-3;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  &__abilities-list {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__ability {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    background: $gray-100;
    color: $text-primary;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-transform: capitalize;

    &--hidden {
      background: linear-gradient(135deg, rgba(var(--type-color), 0.2) 0%, rgba(var(--type-color), 0.3) 100%);
      color: var(--type-color);
    }
  }

  &__ability-badge {
    padding: 2px $spacing-2;
    background: rgba(var(--type-color), 0.3);
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
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

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>
