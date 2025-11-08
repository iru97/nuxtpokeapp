<script setup lang="ts">
import {
  getRandomPokemonId,
  generateRandomTeam,
  generateMonotypeChallenge,
  generateRandomChallenge,
  type RandomChallenge
} from '~/utils/random-generators'

useSeoMeta({
  title: 'Random Pokemon Generator - Team Builder & Challenges',
  description: 'Generate random Pokemon, teams, and challenges. Perfect for Nuzlocke runs, monotype challenges, and fun randomizers.'
})

const pokemonApi = usePokemonApi()

// Single Pokemon
const randomPokemon = ref<any>(null)
const loadingPokemon = ref(false)

// Random Team
const randomTeam = ref<any[]>([])
const loadingTeam = ref(false)
const teamSize = ref(6)

// Challenge
const currentChallenge = ref<RandomChallenge | null>(null)
const challengeTeam = ref<any[]>([])

const generateSinglePokemon = async () => {
  loadingPokemon.value = true
  const id = getRandomPokemonId()
  randomPokemon.value = await pokemonApi.getPokemon(id.toString())
  loadingPokemon.value = false
}

const generateTeam = async () => {
  loadingTeam.value = true
  const ids = generateRandomTeam(teamSize.value)

  const pokemonPromises = ids.map(id => pokemonApi.getPokemon(id.toString()))
  randomTeam.value = (await Promise.all(pokemonPromises)).filter(Boolean)

  loadingTeam.value = false
}

const generateChallenge = async () => {
  currentChallenge.value = generateRandomChallenge()

  // Generate a team for the challenge
  if (currentChallenge.value.teamSize) {
    const ids = generateRandomTeam(
      currentChallenge.value.teamSize,
      currentChallenge.value.filters
    )
    const pokemonPromises = ids.map(id => pokemonApi.getPokemon(id.toString()))
    challengeTeam.value = (await Promise.all(pokemonPromises)).filter(Boolean)
  }
}

const copyTeamToClipboard = () => {
  const teamText = randomTeam.value
    .map((p, i) => `${i + 1}. ${p.name} (#${p.id})`)
    .join('\n')

  navigator.clipboard.writeText(teamText)
  alert('Team copied to clipboard!')
}

onMounted(() => {
  generateSinglePokemon()
})
</script>

<template>
  <div class="page random-page">
    <div class="container">
      <div class="page__header">
        <h1 class="page__title">
          <Icon name="mdi:dice-multiple" />
          Random Generators
        </h1>
        <p class="page__description">
          Generate random Pokemon, teams, and challenges for fun runs
        </p>
      </div>

      <div class="generators-grid">
        <!-- Single Random Pokemon -->
        <div class="generator-card">
          <div class="generator-card__header">
            <Icon name="mdi:pokeball" />
            <h2>Random Pokemon</h2>
          </div>

          <div class="generator-card__content">
            <div v-if="loadingPokemon" class="loading">
              <LoadingSpinner size="lg" />
            </div>

            <div v-else-if="randomPokemon" class="pokemon-result">
              <NuxtImg
                :src="randomPokemon.sprites.other['official-artwork']?.front_default"
                :alt="randomPokemon.name"
                width="200"
                height="200"
              />
              <h3 class="pokemon-name">#{{ randomPokemon.id }} {{ randomPokemon.name }}</h3>
              <div class="pokemon-types">
                <TypeBadge
                  v-for="t in randomPokemon.types"
                  :key="t.type.name"
                  :type="t.type.name"
                />
              </div>
              <NuxtLink :to="`/pokemon/${randomPokemon.id}`" class="btn btn--secondary btn--sm">
                View Details
              </NuxtLink>
            </div>
          </div>

          <button class="btn btn--primary btn--lg" @click="generateSinglePokemon">
            <Icon name="mdi:refresh" />
            Generate Random Pokemon
          </button>
        </div>

        <!-- Random Team -->
        <div class="generator-card generator-card--wide">
          <div class="generator-card__header">
            <Icon name="mdi:account-group" />
            <h2>Random Team Generator</h2>
          </div>

          <div class="generator-card__controls">
            <label>
              Team Size: {{ teamSize }}
              <input v-model.number="teamSize" type="range" min="1" max="6" />
            </label>
          </div>

          <div class="generator-card__content">
            <div v-if="loadingTeam" class="loading">
              <LoadingSpinner size="lg" message="Generating team..." />
            </div>

            <div v-else-if="randomTeam.length > 0" class="team-grid">
              <div v-for="pokemon in randomTeam" :key="pokemon.id" class="team-member">
                <NuxtImg
                  :src="pokemon.sprites.front_default"
                  :alt="pokemon.name"
                  width="96"
                  height="96"
                />
                <div class="team-member__info">
                  <span class="team-member__id">#{{ pokemon.id }}</span>
                  <span class="team-member__name">{{ pokemon.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="generator-card__actions">
            <button class="btn btn--primary" @click="generateTeam">
              <Icon name="mdi:refresh" />
              Generate Team
            </button>
            <button
              v-if="randomTeam.length > 0"
              class="btn btn--secondary"
              @click="copyTeamToClipboard"
            >
              <Icon name="mdi:content-copy" />
              Copy Team
            </button>
          </div>
        </div>

        <!-- Random Challenge -->
        <div class="generator-card generator-card--challenge">
          <div class="generator-card__header">
            <Icon name="mdi:trophy" />
            <h2>Random Challenge</h2>
          </div>

          <div class="generator-card__content">
            <div v-if="currentChallenge" class="challenge-result">
              <div class="challenge-badge">
                <Icon name="mdi:star" />
                {{ currentChallenge.type }}
              </div>
              <h3 class="challenge-description">{{ currentChallenge.description }}</h3>

              <div v-if="challengeTeam.length > 0" class="challenge-team">
                <h4>Suggested Team:</h4>
                <div class="team-mini-grid">
                  <div v-for="pokemon in challengeTeam" :key="pokemon.id" class="mini-pokemon">
                    <NuxtImg
                      :src="pokemon.sprites.front_default"
                      :alt="pokemon.name"
                      width="64"
                      height="64"
                    />
                    <span>{{ pokemon.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="btn btn--primary btn--lg" @click="generateChallenge">
            <Icon name="mdi:dice-6" />
            Generate Challenge
          </button>
        </div>

        <!-- Quick Generators -->
        <div class="generator-card">
          <div class="generator-card__header">
            <Icon name="mdi:flash" />
            <h2>Quick Generators</h2>
          </div>

          <div class="quick-generators">
            <button class="quick-btn" @click="async () => {
              const type = generateMonotypeChallenge()
              currentChallenge = {
                type: 'monotype',
                description: `Monotype Challenge: Use only ${type.toUpperCase()} type Pokemon!`
              }
            }">
              <Icon name="mdi:shape" />
              Monotype Challenge
            </button>

            <button class="quick-btn" @click="() => {
              const gen = Math.floor(Math.random() * 9) + 1
              currentChallenge = {
                type: 'generation',
                description: `Generation ${gen} Only Challenge!`
              }
            }">
              <Icon name="mdi:earth" />
              Generation Challenge
            </button>

            <button class="quick-btn" @click="() => {
              currentChallenge = {
                type: 'nuzlocke',
                description: 'Nuzlocke Challenge: Fainted = Dead, One per route!'
              }
            }">
              <Icon name="mdi:skull" />
              Nuzlocke Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.random-page {
  padding: $spacing-8 0;
}

.generators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: $spacing-6;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.generator-card {
  background: $white;
  border-radius: $radius-xl;
  padding: $spacing-6;
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;

  @at-root .dark & {
    background: $dark-surface;
  }

  &--wide {
    grid-column: span 2;

    @media (max-width: $breakpoint-lg) {
      grid-column: span 1;
    }
  }

  &--challenge {
    grid-column: span 2;

    @media (max-width: $breakpoint-lg) {
      grid-column: span 1;
    }

    background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.1));
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    margin-bottom: $spacing-4;

    svg {
      font-size: 32px;
      color: $primary;
    }

    h2 {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      margin: 0;
      color: $text-primary;
    }
  }

  &__controls {
    margin-bottom: $spacing-4;

    label {
      display: flex;
      flex-direction: column;
      gap: $spacing-2;
      font-weight: $font-weight-semibold;

      input[type="range"] {
        width: 100%;
      }
    }
  }

  &__content {
    flex: 1;
    margin-bottom: $spacing-4;
  }

  &__actions {
    display: flex;
    gap: $spacing-3;
    flex-wrap: wrap;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.pokemon-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;

  img {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  }
}

.pokemon-name {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  text-transform: capitalize;
  color: $text-primary;
  text-align: center;
}

.pokemon-types {
  display: flex;
  gap: $spacing-2;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: $spacing-4;
}

.team-member {
  background: $gray-50;
  border-radius: $radius-lg;
  padding: $spacing-3;
  text-align: center;
  transition: transform $transition-base;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-4px);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: $spacing-2;
  }

  &__id {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__name {
    font-weight: $font-weight-semibold;
    text-transform: capitalize;
    color: $text-primary;
  }
}

.challenge-result {
  text-align: center;
}

.challenge-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  background: $primary;
  color: $white;
  border-radius: $radius-full;
  font-weight: $font-weight-bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: $spacing-4;

  svg {
    font-size: 20px;
  }
}

.challenge-description {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-6;
}

.challenge-team {
  margin-top: $spacing-6;

  h4 {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-4;
  }
}

.team-mini-grid {
  display: flex;
  justify-content: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.mini-pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;

  span {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    text-transform: capitalize;
  }
}

.quick-generators {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.quick-btn {
  @include reset-button;
  @include spring-bounce;
  @include accessible-focus;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  background: $gray-100;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  text-align: left;
  transition: all $transition-base;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 24px;
    color: $primary;
  }

  &:hover {
    background: $primary;
    color: $white;

    svg {
      color: $white;
    }
  }
}
</style>
