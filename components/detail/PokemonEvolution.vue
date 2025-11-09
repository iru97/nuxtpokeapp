<script setup lang="ts">
import type { EvolutionChain } from '~/types'

interface Props {
  evolutionChainUrl?: string
}

const props = defineProps<Props>()

interface EvolutionStep {
  id: number
  name: string
  imageUrl: string
  trigger?: string
  minLevel?: number
  item?: string
  condition?: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const evolutionSteps = ref<EvolutionStep[]>([])

const parseEvolutionChain = (chain: any): EvolutionStep[] => {
  const steps: EvolutionStep[] = []

  const extractPokemonId = (url: string): number => {
    const parts = url.split('/').filter(Boolean)
    return parseInt(parts[parts.length - 1])
  }

  const processChain = (current: any) => {
    const id = extractPokemonId(current.species.url)
    const name = current.species.name

    steps.push({
      id,
      name,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    })

    // Process evolutions
    current.evolves_to.forEach((evolution: any) => {
      if (evolution.evolution_details.length > 0) {
        const detail = evolution.evolution_details[0]
        const evolvedId = extractPokemonId(evolution.species.url)

        // Build trigger text
        let trigger = detail.trigger?.name || ''
        let condition = ''

        if (detail.min_level) {
          condition = `Level ${detail.min_level}`
        } else if (detail.item) {
          condition = detail.item.name.replace('-', ' ')
        } else if (detail.min_happiness) {
          condition = `Happiness ${detail.min_happiness}+`
        } else if (detail.min_beauty) {
          condition = `Beauty ${detail.min_beauty}+`
        } else if (detail.known_move) {
          condition = `Learn ${detail.known_move.name}`
        } else if (detail.held_item) {
          condition = `Hold ${detail.held_item.name.replace('-', ' ')}`
        } else if (detail.time_of_day) {
          condition = detail.time_of_day
        }

        steps.push({
          id: evolvedId,
          name: evolution.species.name,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolvedId}.png`,
          trigger,
          condition
        })
      }

      processChain(evolution)
    })
  }

  processChain(chain)
  return steps
}

watchEffect(async () => {
  if (!props.evolutionChainUrl) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    const data = await $fetch<EvolutionChain>(props.evolutionChainUrl)
    evolutionSteps.value = parseEvolutionChain(data.chain)
  } catch (err) {
    error.value = 'Failed to load evolution chain'
    console.error('Evolution chain error:', err)
  } finally {
    loading.value = false
  }
})

const hasEvolutions = computed(() => evolutionSteps.value.length > 1)
</script>

<template>
  <div class="pokemon-evolution">
    <LoadingSpinner v-if="loading" message="Loading evolution chain..." />

    <ErrorState
      v-else-if="error"
      :message="error"
    />

    <EmptyState
      v-else-if="!hasEvolutions"
      icon="mdi:alert-circle-outline"
      title="No Evolutions"
      description="This Pokémon does not evolve"
    />

    <div v-else class="pokemon-evolution__chain">
      <div
        v-for="(step, index) in evolutionSteps"
        :key="step.id"
        class="pokemon-evolution__step-wrapper"
      >
        <!-- Pokemon Card -->
        <NuxtLink
          :to="`/pokemon/${step.id}`"
          class="pokemon-evolution__card"
        >
          <div class="pokemon-evolution__image-container">
            <img
              :src="step.imageUrl"
              :alt="step.name"
              class="pokemon-evolution__image"
              loading="lazy"
            />
          </div>

          <div class="pokemon-evolution__info">
            <span class="pokemon-evolution__id">#{{ String(step.id).padStart(3, '0') }}</span>
            <span class="pokemon-evolution__name">{{ step.name }}</span>
          </div>
        </NuxtLink>

        <!-- Evolution Arrow (if not last) -->
        <div
          v-if="index < evolutionSteps.length - 1"
          class="pokemon-evolution__arrow"
        >
          <div class="pokemon-evolution__arrow-line">
            <Icon name="mdi:chevron-right" class="pokemon-evolution__arrow-icon" />
          </div>

          <div v-if="step.condition" class="pokemon-evolution__condition">
            <Icon
              v-if="step.condition.includes('Level')"
              name="mdi:arrow-up-bold"
              class="pokemon-evolution__condition-icon"
            />
            <Icon
              v-else-if="step.condition.includes('stone') || step.condition.includes('candy')"
              name="mdi:diamond-stone"
              class="pokemon-evolution__condition-icon"
            />
            <Icon
              v-else
              name="mdi:star"
              class="pokemon-evolution__condition-icon"
            />
            <span class="pokemon-evolution__condition-text">{{ step.condition }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Evolution Info -->
    <div v-if="hasEvolutions" class="pokemon-evolution__info-box">
      <h4 class="pokemon-evolution__info-title">
        <Icon name="mdi:information" />
        Evolution Chain
      </h4>
      <p class="pokemon-evolution__info-text">
        This Pokémon has {{ evolutionSteps.length }} stage{{ evolutionSteps.length > 1 ? 's' : '' }} in its evolution chain.
        Click on any Pokémon to view its details.
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-evolution {
  @include flex-column;
  gap: $spacing-6;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  &__chain {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-6;
    background: linear-gradient(135deg, $gray-50 0%, $white 100%);
    border-radius: $radius-lg;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
    }
  }

  &__step-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-4;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      width: 100%;
    }
  }

  &__card {
    @include flex-column;
    align-items: center;
    gap: $spacing-3;
    padding: $spacing-4;
    background: $white;
    border: 2px solid $gray-200;
    border-radius: $radius-xl;
    text-decoration: none;
    transition: all $transition-base;
    min-width: 160px;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-lg;
      transform: translateY(-4px);

      .pokemon-evolution__image {
        transform: scale(1.1);
      }
    }
  }

  &__image-container {
    @include flex-center;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, $gray-100 0%, transparent 70%);
    border-radius: $radius-full;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform $transition-base;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  &__info {
    @include flex-column;
    align-items: center;
    gap: $spacing-1;
  }

  &__id {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__name {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-transform: capitalize;
    font-family: $font-family-secondary;
  }

  &__arrow {
    @include flex-column;
    align-items: center;
    gap: $spacing-2;

    @media (max-width: $breakpoint-md) {
      transform: rotate(90deg);
    }
  }

  &__arrow-line {
    @include flex-center;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, $primary-light 0%, $primary 100%);
    border-radius: $radius-full;
    position: relative;

    @media (max-width: $breakpoint-md) {
      height: 60px;
      width: 4px;
      background: linear-gradient(180deg, $primary-light 0%, $primary 100%);
    }
  }

  &__arrow-icon {
    font-size: 32px;
    color: $primary;
    animation: bounce-horizontal 2s infinite;

    @media (max-width: $breakpoint-md) {
      animation: bounce-vertical 2s infinite;
    }
  }

  &__condition {
    @include flex-center;
    @include flex-column;
    gap: $spacing-1;
    padding: $spacing-2 $spacing-3;
    background: $primary;
    color: $white;
    border-radius: $radius-lg;
    white-space: nowrap;

    @media (max-width: $breakpoint-md) {
      transform: rotate(-90deg);
    }
  }

  &__condition-icon {
    font-size: 20px;
  }

  &__condition-text {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
  }

  &__info-box {
    padding: $spacing-4;
    background: rgba($primary, 0.05);
    border-left: 4px solid $primary;
    border-radius: $radius-md;
  }

  &__info-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-2;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $primary;

    svg {
      font-size: 20px;
    }
  }

  &__info-text {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }
}

@keyframes bounce-horizontal {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(8px);
  }
}

@keyframes bounce-vertical {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}
</style>
