<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: [id: number]
}>()

interface AbilityDetails {
  name: string
  isHidden: boolean
  description: string | null
  loading: boolean
}

// Store ability details for each Pokemon
const pokemonAbilities = ref<Record<number, AbilityDetails[]>>({})

// Load ability descriptions
const loadAbilities = async () => {
  for (const p of props.pokemon) {
    const abilities: AbilityDetails[] = []

    for (const ability of p.abilities) {
      const abilityDetail: AbilityDetails = {
        name: ability.ability.name,
        isHidden: ability.is_hidden,
        description: null,
        loading: true
      }

      abilities.push(abilityDetail)

      // Fetch ability description
      try {
        const data = await $fetch<any>(ability.ability.url)
        const englishEntry = data.effect_entries?.find((e: any) => e.language.name === 'en')
        abilityDetail.description = englishEntry?.short_effect || englishEntry?.effect || 'No description available'
      } catch (err) {
        abilityDetail.description = 'Failed to load description'
      } finally {
        abilityDetail.loading = false
      }
    }

    pokemonAbilities.value[p.id] = abilities
  }
}

// Load abilities on mount
onMounted(() => {
  loadAbilities()
})

// Watch for Pokemon changes
watch(() => props.pokemon, () => {
  loadAbilities()
}, { deep: true })
</script>

<template>
  <div class="comparison-abilities">
    <div class="comparison-abilities__grid">
      <div
        v-for="p in pokemon"
        :key="p.id"
        class="comparison-abilities__card"
      >
        <!-- Remove Button -->
        <button
          class="comparison-abilities__remove"
          @click="emit('remove', p.id)"
        >
          <Icon name="mdi:close" />
        </button>

        <!-- Pokemon Header -->
        <div class="comparison-abilities__header">
          <img
            :src="p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default"
            :alt="p.name"
            class="comparison-abilities__image"
          />
          <h3 class="comparison-abilities__name">{{ p.name }}</h3>
          <div class="comparison-abilities__types">
            <TypeBadge
              v-for="type in p.types"
              :key="type.slot"
              :type="type.type.name"
            />
          </div>
        </div>

        <!-- Abilities List -->
        <div class="comparison-abilities__list">
          <div
            v-for="(ability, index) in pokemonAbilities[p.id] || []"
            :key="index"
            class="comparison-abilities__ability"
          >
            <div class="comparison-abilities__ability-header">
              <h4 class="comparison-abilities__ability-name">
                {{ ability.name }}
              </h4>
              <span
                v-if="ability.isHidden"
                class="comparison-abilities__hidden-badge"
              >
                <Icon name="mdi:eye-off" />
                Hidden
              </span>
            </div>

            <div v-if="ability.loading" class="comparison-abilities__loading">
              <LoadingSpinner size="sm" />
            </div>

            <p
              v-else
              class="comparison-abilities__description"
            >
              {{ ability.description }}
            </p>
          </div>

          <!-- Empty state -->
          <div
            v-if="!pokemonAbilities[p.id] || pokemonAbilities[p.id].length === 0"
            class="comparison-abilities__empty"
          >
            <Icon name="mdi:shield-off" />
            <span>No abilities available</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comparison-abilities {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    position: relative;
    @include flex-column;
    gap: $spacing-4;
    padding: $spacing-6;
    background: $white;
    border: 2px solid $gray-200;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;
  }

  &__remove {
    @include reset-button;
    position: absolute;
    top: $spacing-3;
    right: $spacing-3;
    width: 36px;
    height: 36px;
    @include flex-center;
    background: rgba($error, 0.1);
    color: $error;
    border-radius: $radius-full;
    transition: all $transition-fast;
    z-index: 10;

    &:hover {
      background: $error;
      color: $white;
      transform: scale(1.1);
    }

    svg {
      font-size: 20px;
    }
  }

  &__header {
    @include flex-column;
    align-items: center;
    gap: $spacing-3;
    padding-bottom: $spacing-4;
    border-bottom: 2px solid $gray-200;
  }

  &__image {
    width: 120px;
    height: 120px;
    object-fit: contain;
  }

  &__name {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__types {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__list {
    @include flex-column;
    gap: $spacing-4;
  }

  &__ability {
    @include flex-column;
    gap: $spacing-2;
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;
    border: 2px solid $gray-200;
    transition: all $transition-fast;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-sm;
    }
  }

  &__ability-header {
    @include flex-between;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__ability-name {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-transform: capitalize;
  }

  &__hidden-badge {
    @include flex-center;
    gap: $spacing-1;
    padding: $spacing-1 $spacing-2;
    background: rgba($warning, 0.15);
    color: darken($warning, 15%);
    border-radius: $radius-md;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;

    svg {
      font-size: 14px;
    }
  }

  &__loading {
    @include flex-center;
    padding: $spacing-3;
  }

  &__description {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: 1.6;
  }

  &__empty {
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-6;
    color: $text-secondary;
    font-size: $font-size-sm;

    svg {
      font-size: 24px;
    }
  }
}
</style>
