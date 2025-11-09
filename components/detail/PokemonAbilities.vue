<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon
}

const props = defineProps<Props>()

interface AbilityDetails {
  name: string
  isHidden: boolean
  description: string
  effect: string
}

const abilitiesDetails = ref<AbilityDetails[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const details = await Promise.all(
      props.pokemon.abilities.map(async (ability) => {
        const data = await $fetch<any>(ability.ability.url)
        const effectEntry = data.effect_entries.find((e: any) => e.language.name === 'en')
        const flavorEntry = data.flavor_text_entries.find((e: any) => e.language.name === 'en')

        return {
          name: ability.ability.name,
          isHidden: ability.is_hidden,
          description: flavorEntry?.flavor_text || 'No description available',
          effect: effectEntry?.effect || effectEntry?.short_effect || ''
        }
      })
    )
    abilitiesDetails.value = details
  } catch (err) {
    console.error('Error loading abilities:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="pokemon-abilities">
    <LoadingSpinner v-if="loading" message="Loading abilities..." />

    <div v-else class="pokemon-abilities__list">
      <div
        v-for="ability in abilitiesDetails"
        :key="ability.name"
        class="pokemon-abilities__card"
        :class="{ 'pokemon-abilities__card--hidden': ability.isHidden }"
      >
        <div class="pokemon-abilities__header">
          <h3 class="pokemon-abilities__name">
            {{ ability.name.replace('-', ' ') }}
          </h3>
          <span v-if="ability.isHidden" class="pokemon-abilities__badge">
            <Icon name="mdi:eye-off" />
            Hidden Ability
          </span>
        </div>

        <p class="pokemon-abilities__description">
          {{ ability.description }}
        </p>

        <div v-if="ability.effect" class="pokemon-abilities__effect">
          <Icon name="mdi:information" />
          <span>{{ ability.effect }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-abilities {
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  &__list {
    @include flex-column;
    gap: $spacing-4;
  }

  &__card {
    padding: $spacing-5;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    transition: all $transition-base;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-md;
    }

    &--hidden {
      background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.1) 100%);
      border-color: rgba($primary, 0.3);

      .pokemon-abilities__name {
        color: $primary;
      }
    }
  }

  &__header {
    @include flex-between;
    align-items: flex-start;
    margin-bottom: $spacing-3;
  }

  &__name {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-transform: capitalize;
    font-family: $font-family-secondary;
  }

  &__badge {
    @include flex-center;
    gap: $spacing-1;
    padding: $spacing-1 $spacing-3;
    background: $primary;
    color: $white;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    white-space: nowrap;

    svg {
      font-size: 16px;
    }
  }

  &__description {
    margin: 0 0 $spacing-3;
    font-size: $font-size-base;
    color: $text-primary;
    line-height: $line-height-relaxed;
  }

  &__effect {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-3;
    background: rgba($info, 0.05);
    border-left: 3px solid $info;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-relaxed;

    svg {
      font-size: 20px;
      color: $info;
      flex-shrink: 0;
    }
  }
}
</style>
