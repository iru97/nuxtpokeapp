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
const loadingChallenge = ref(false)

const generateSinglePokemon = async () => {
  loadingPokemon.value = true
  try {
    const id = getRandomPokemonId()
    randomPokemon.value = await $fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  } catch (err) {
    console.error('Error loading pokemon:', err)
  } finally {
    loadingPokemon.value = false
  }
}

const generateTeam = async () => {
  loadingTeam.value = true
  try {
    const ids = generateRandomTeam(teamSize.value)
    const pokemonPromises = ids.map(id =>
      $fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).catch(() => null)
    )
    randomTeam.value = (await Promise.all(pokemonPromises)).filter(Boolean)
  } catch (err) {
    console.error('Error generating team:', err)
  } finally {
    loadingTeam.value = false
  }
}

const generateChallenge = async () => {
  loadingChallenge.value = true
  try {
    currentChallenge.value = generateRandomChallenge()

    // Generate a team for the challenge
    if (currentChallenge.value.teamSize) {
      const ids = generateRandomTeam(
        currentChallenge.value.teamSize,
        currentChallenge.value.filters
      )
      const pokemonPromises = ids.map(id =>
        $fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).catch(() => null)
      )
      challengeTeam.value = (await Promise.all(pokemonPromises)).filter(Boolean)
    }
  } catch (err) {
    console.error('Error generating challenge:', err)
  } finally {
    loadingChallenge.value = false
  }
}

const copyTeamToClipboard = () => {
  const teamText = randomTeam.value
    .map((p, i) => `${i + 1}. ${p.name} (#${p.id})`)
    .join('\n')

  navigator.clipboard.writeText(teamText)
  alert('Team copied to clipboard!')
}

const generateMonotype = async () => {
  loadingChallenge.value = true
  try {
    const type = generateMonotypeChallenge()
    currentChallenge.value = {
      type: 'Monotype',
      description: `Use only ${type.toUpperCase()} type Pokémon throughout your entire playthrough!`,
      rules: [
        `All team members must be ${type} type`,
        'Can only use Pokémon of this type from the start',
        'Dual-types are allowed if one type matches'
      ]
    }
    challengeTeam.value = []
  } catch (err) {
    console.error('Error generating monotype:', err)
  } finally {
    loadingChallenge.value = false
  }
}

const generateNuzlocke = async () => {
  loadingChallenge.value = true
  try {
    currentChallenge.value = {
      type: 'Nuzlocke',
      description: 'The classic hardcore Pokémon challenge with permadeath rules!',
      rules: [
        'If a Pokémon faints, it is considered "dead" and must be released or boxed forever',
        'You may only catch the first Pokémon encountered in each area/route',
        'You must nickname all your Pokémon (to create emotional bonds)',
        'Optional: Battle style must be set to "Set" mode',
        'Optional: No items in battle'
      ]
    }
    challengeTeam.value = []
  } catch (err) {
    console.error('Error generating nuzlocke:', err)
  } finally {
    loadingChallenge.value = false
  }
}

const generateGenerationRun = async () => {
  loadingChallenge.value = true
  try {
    const gen = Math.floor(Math.random() * 9) + 1
    const genNames = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea']

    currentChallenge.value = {
      type: `Generation ${gen}`,
      description: `Complete your adventure using only Pokémon from the ${genNames[gen - 1]} region!`,
      rules: [
        `Only use Pokémon from Generation ${gen}`,
        'No trading for Pokémon from other generations',
        `Stick to the ${genNames[gen - 1]} Pokédex only`
      ]
    }
    challengeTeam.value = []
  } catch (err) {
    console.error('Error generating generation run:', err)
  } finally {
    loadingChallenge.value = false
  }
}

onMounted(() => {
  generateSinglePokemon()
})
</script>

<template>
  <div class="page random-page">
    <div class="container">
      <div class="page__header">
        <Icon name="mdi:dice-multiple" class="page__header-icon" />
        <h1 class="page__title">Random Pokémon Generators</h1>
        <p class="page__description">
          Generate random Pokémon, build random teams, or create fun challenge runs!
          Perfect for adding variety to your gameplay or starting a new challenge.
        </p>
      </div>

      <!-- Feature Cards -->
      <div class="features-grid">
        <!-- Single Pokemon Generator -->
        <div class="feature-card feature-card--single">
          <div class="feature-card__header">
            <Icon name="mdi:pokeball" />
            <div>
              <h2>Random Pokémon</h2>
              <p class="feature-card__subtitle">Discover a random Pokémon from all 1000+ species</p>
            </div>
          </div>

          <div class="feature-card__content">
            <div v-if="loadingPokemon" class="loading">
              <LoadingSpinner size="lg" />
              <p>Generating random Pokémon...</p>
            </div>

            <div v-else-if="randomPokemon" class="pokemon-result">
              <div class="pokemon-result__image-container">
                <NuxtImg
                  :src="randomPokemon.sprites.other['official-artwork']?.front_default || randomPokemon.sprites.front_default"
                  :alt="randomPokemon.name"
                  width="200"
                  height="200"
                  class="pokemon-result__image"
                />
              </div>
              <div class="pokemon-result__info">
                <span class="pokemon-result__id">#{{ String(randomPokemon.id).padStart(3, '0') }}</span>
                <h3 class="pokemon-result__name">{{ randomPokemon.name }}</h3>
                <div class="pokemon-result__types">
                  <TypeBadge
                    v-for="t in randomPokemon.types"
                    :key="t.type.name"
                    :type="t.type.name"
                  />
                </div>
              </div>
              <NuxtLink :to="`/pokemon/${randomPokemon.id}`" class="btn btn--secondary">
                <Icon name="mdi:eye" />
                View Full Details
              </NuxtLink>
            </div>
          </div>

          <button class="btn btn--primary btn--lg btn--full" @click="generateSinglePokemon">
            <Icon name="mdi:refresh" />
            Generate Random Pokémon
          </button>
        </div>

        <!-- Team Generator -->
        <div class="feature-card feature-card--team">
          <div class="feature-card__header">
            <Icon name="mdi:account-group" />
            <div>
              <h2>Random Team Builder</h2>
              <p class="feature-card__subtitle">Create a random team of 1-6 Pokémon for your adventure</p>
            </div>
          </div>

          <div class="feature-card__controls">
            <label class="slider-control">
              <span>Team Size: <strong>{{ teamSize }}</strong> Pokémon</span>
              <input v-model.number="teamSize" type="range" min="1" max="6" class="slider" />
            </label>
          </div>

          <div class="feature-card__content">
            <div v-if="loadingTeam" class="loading">
              <LoadingSpinner size="lg" />
              <p>Building your random team...</p>
            </div>

            <div v-else-if="randomTeam.length > 0" class="team-grid">
              <div v-for="(pokemon, index) in randomTeam" :key="pokemon.id" class="team-member">
                <span class="team-member__number">{{ index + 1 }}</span>
                <NuxtImg
                  :src="pokemon.sprites.front_default"
                  :alt="pokemon.name"
                  width="96"
                  height="96"
                  class="team-member__sprite"
                />
                <div class="team-member__info">
                  <span class="team-member__id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
                  <span class="team-member__name">{{ pokemon.name }}</span>
                  <div class="team-member__types">
                    <TypeBadge
                      v-for="t in pokemon.types"
                      :key="t.type.name"
                      :type="t.type.name"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <Icon name="mdi:help-circle-outline" />
              <p>Click the button below to generate your random team!</p>
            </div>
          </div>

          <div class="feature-card__actions">
            <button class="btn btn--primary btn--lg" @click="generateTeam">
              <Icon name="mdi:shuffle-variant" />
              Generate Team
            </button>
            <button
              v-if="randomTeam.length > 0"
              class="btn btn--secondary"
              @click="copyTeamToClipboard"
            >
              <Icon name="mdi:content-copy" />
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      <!-- Challenge Generator Section -->
      <div class="challenge-section">
        <div class="challenge-section__header">
          <Icon name="mdi:trophy-variant" />
          <div>
            <h2>Challenge Run Generator</h2>
            <p>Add difficulty and excitement to your playthrough with special rulesets!</p>
          </div>
        </div>

        <div class="challenge-types">
          <button class="challenge-type-btn" @click="generateNuzlocke">
            <Icon name="mdi:skull-crossbones" />
            <div class="challenge-type-btn__content">
              <strong>Nuzlocke</strong>
              <span>Hardcore permadeath rules</span>
            </div>
          </button>

          <button class="challenge-type-btn" @click="generateMonotype">
            <Icon name="mdi:shape" />
            <div class="challenge-type-btn__content">
              <strong>Monotype</strong>
              <span>Single type only</span>
            </div>
          </button>

          <button class="challenge-type-btn" @click="generateGenerationRun">
            <Icon name="mdi:earth" />
            <div class="challenge-type-btn__content">
              <strong>Generation Run</strong>
              <span>One generation only</span>
            </div>
          </button>

          <button class="challenge-type-btn" @click="generateChallenge">
            <Icon name="mdi:dice-6" />
            <div class="challenge-type-btn__content">
              <strong>Random Challenge</strong>
              <span>Surprise rules!</span>
            </div>
          </button>
        </div>

        <!-- Challenge Result -->
        <Transition name="fade">
          <div v-if="currentChallenge" class="challenge-result">
            <div v-if="loadingChallenge" class="loading">
              <LoadingSpinner size="lg" />
              <p>Generating challenge...</p>
            </div>

            <div v-else class="challenge-result__content">
              <div class="challenge-badge">
                <Icon name="mdi:star-four-points" />
                {{ currentChallenge.type }}
              </div>

              <h3 class="challenge-result__description">
                {{ currentChallenge.description }}
              </h3>

              <div v-if="currentChallenge.rules" class="challenge-rules">
                <h4>
                  <Icon name="mdi:format-list-checks" />
                  Challenge Rules:
                </h4>
                <ul>
                  <li v-for="(rule, index) in currentChallenge.rules" :key="index">
                    <Icon name="mdi:check-circle" />
                    {{ rule }}
                  </li>
                </ul>
              </div>

              <div v-if="challengeTeam.length > 0" class="challenge-team">
                <h4>
                  <Icon name="mdi:account-group" />
                  Suggested Starter Team:
                </h4>
                <div class="challenge-team__grid">
                  <div v-for="pokemon in challengeTeam" :key="pokemon.id" class="mini-pokemon">
                    <NuxtImg
                      :src="pokemon.sprites.front_default"
                      :alt="pokemon.name"
                      width="64"
                      height="64"
                    />
                    <span class="mini-pokemon__name">{{ pokemon.name }}</span>
                  </div>
                </div>
              </div>

              <div class="challenge-result__tip">
                <Icon name="mdi:lightbulb-on" />
                <p><strong>Pro Tip:</strong> Screenshot this challenge and share it with friends, or use it as inspiration for your next playthrough!</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.random-page {
  padding: $spacing-8 0;
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);
}

.page__header {
  text-align: center;
  margin-bottom: $spacing-10;

  &-icon {
    font-size: 72px;
    color: $primary;
    margin-bottom: $spacing-4;
    animation: spin 3s linear infinite;
  }

  .page__description {
    max-width: 700px;
    margin: 0 auto;
    font-size: $font-size-lg;
    color: $text-secondary;
    line-height: 1.6;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: $spacing-8;
  margin-bottom: $spacing-12;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: $white;
  border-radius: $radius-2xl;
  padding: $spacing-6;
  box-shadow: $shadow-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-6;

  &--single {
    border-top: 4px solid $primary;
  }

  &--team {
    border-top: 4px solid $info;
  }

  &__header {
    display: flex;
    gap: $spacing-4;
    align-items: start;

    > svg {
      font-size: 48px;
      color: $primary;
      flex-shrink: 0;
    }

    h2 {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-1;
    }
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0;
  }

  &__controls {
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;
  }

  &__content {
    flex: 1;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__actions {
    display: flex;
    gap: $spacing-3;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
    }
  }
}

.slider-control {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  span {
    font-weight: $font-weight-semibold;
    color: $text-primary;

    strong {
      color: $primary;
    }
  }

  .slider {
    width: 100%;
    cursor: pointer;
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
  color: $text-secondary;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  color: $text-secondary;

  svg {
    font-size: 64px;
    opacity: 0.3;
  }

  p {
    text-align: center;
    font-size: $font-size-lg;
  }
}

.pokemon-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
  width: 100%;

  &__image-container {
    position: relative;
    padding: $spacing-4;
    background: radial-gradient(circle, rgba($primary, 0.1) 0%, transparent 70%);
    border-radius: $radius-full;
  }

  &__image {
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
    animation: float 3s ease-in-out infinite;
  }

  &__info {
    text-align: center;
  }

  &__id {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__name {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    margin: $spacing-2 0;
    color: $text-primary;
  }

  &__types {
    display: flex;
    gap: $spacing-2;
    justify-content: center;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: $spacing-4;
  width: 100%;
}

.team-member {
  position: relative;
  background: $gray-50;
  border-radius: $radius-lg;
  padding: $spacing-4;
  text-align: center;
  transition: all $transition-base;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
    border-color: $primary;
  }

  &__number {
    position: absolute;
    top: $spacing-2;
    left: $spacing-2;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary;
    color: $white;
    font-weight: $font-weight-bold;
    border-radius: $radius-full;
    font-size: $font-size-sm;
  }

  &__sprite {
    margin-bottom: $spacing-2;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__id {
    font-size: $font-size-xs;
    color: $text-secondary;
    font-family: $font-family-mono;
  }

  &__name {
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    color: $text-primary;
  }

  &__types {
    display: flex;
    gap: $spacing-1;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.challenge-section {
  background: $white;
  border-radius: $radius-2xl;
  padding: $spacing-8;
  box-shadow: $shadow-2xl;
  border-top: 4px solid $accent;

  &__header {
    display: flex;
    gap: $spacing-4;
    align-items: start;
    margin-bottom: $spacing-8;

    > svg {
      font-size: 56px;
      color: $accent;
      flex-shrink: 0;
    }

    h2 {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      margin: 0 0 $spacing-2;
    }

    p {
      font-size: $font-size-lg;
      color: $text-secondary;
      margin: 0;
    }
  }
}

.challenge-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-8;
}

.challenge-type-btn {
  @include reset-button;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $gray-50;
  border: 2px solid $gray-200;
  border-radius: $radius-xl;
  transition: all $transition-base;
  cursor: pointer;

  &:hover {
    background: $primary;
    border-color: $primary;
    color: $white;
    transform: translateY(-4px);
    box-shadow: $shadow-lg;

    svg {
      color: $white;
    }

    .challenge-type-btn__content span {
      color: rgba(255, 255, 255, 0.9);
    }
  }

  > svg {
    font-size: 32px;
    color: $primary;
    transition: color $transition-base;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 4px;

    strong {
      font-size: $font-size-base;
    }

    span {
      font-size: $font-size-sm;
      color: $text-secondary;
      transition: color $transition-base;
    }
  }
}

.challenge-result {
  background: linear-gradient(135deg, rgba($accent, 0.1), rgba($primary, 0.1));
  border-radius: $radius-xl;
  padding: $spacing-6;
  border: 2px dashed $accent;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
  }

  &__description {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    text-align: center;
    color: $text-primary;
    line-height: 1.4;
  }

  &__tip {
    display: flex;
    gap: $spacing-3;
    padding: $spacing-4;
    background: rgba($info, 0.1);
    border-left: 4px solid $info;
    border-radius: $radius-md;

    svg {
      font-size: 24px;
      color: $info;
      flex-shrink: 0;
    }

    p {
      margin: 0;
      color: $text-primary;
    }
  }
}

.challenge-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-5;
  background: $accent;
  color: $accent-dark;
  border-radius: $radius-full;
  font-weight: $font-weight-bold;
  font-size: $font-size-lg;
  text-transform: uppercase;
  letter-spacing: 1px;
  align-self: center;
  box-shadow: $shadow-md;

  svg {
    font-size: 24px;
  }
}

.challenge-rules {
  background: $white;
  padding: $spacing-5;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;

  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-xl;
    margin-bottom: $spacing-4;

    svg {
      font-size: 24px;
      color: $primary;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  li {
    display: flex;
    align-items: start;
    gap: $spacing-2;
    font-size: $font-size-base;
    line-height: 1.6;

    svg {
      font-size: 20px;
      color: $success;
      flex-shrink: 0;
      margin-top: 2px;
    }
  }
}

.challenge-team {
  background: $white;
  padding: $spacing-5;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;

  h4 {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-xl;
    margin-bottom: $spacing-4;

    svg {
      font-size: 24px;
      color: $primary;
    }
  }

  &__grid {
    display: flex;
    gap: $spacing-4;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.mini-pokemon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3;
  background: $gray-50;
  border-radius: $radius-lg;
  transition: all $transition-base;

  &:hover {
    transform: scale(1.05);
    background: $gray-100;
  }

  &__name {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    text-transform: capitalize;
  }
}

.btn--full {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
