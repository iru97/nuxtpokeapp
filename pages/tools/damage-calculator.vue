<script setup lang="ts">
import type { Pokemon } from '~/types'
import { calculateDamage, type DamageCalculationInput, type DamageResult } from '~/utils/damage-formula'
import { calculateStat } from '~/utils/stat-calculator'

useSeoMeta({
  title: 'Damage Calculator - NuxtPokeApp',
  description: 'Calculate Pokemon battle damage with our advanced damage calculator. Supports all generations, weather, terrain, and battle conditions.',
  ogTitle: 'Pokemon Damage Calculator',
  ogDescription: 'Advanced Pokemon damage calculator with full Gen 9 support'
})

const achievementsStore = useAchievementsStore()

// Popular Pokemon for quick selection
const popularPokemon = [
  { id: 25, name: 'Pikachu' },
  { id: 6, name: 'Charizard' },
  { id: 150, name: 'Mewtwo' },
  { id: 143, name: 'Snorlax' },
  { id: 448, name: 'Lucario' },
  { id: 445, name: 'Garchomp' },
  { id: 384, name: 'Rayquaza' },
  { id: 249, name: 'Lugia' },
]

// Attacker
const attacker = ref<Pokemon | null>(null)
const attackerLevel = ref(100)
const attackerMove = ref<any>(null)
const attackerStages = ref(0)
const attackerSearch = ref('')
const loadingAttacker = ref(false)
const attackerError = ref('')

// Defender
const defender = ref<Pokemon | null>(null)
const defenderLevel = ref(100)
const defenderStages = ref(0)
const defenderSearch = ref('')
const loadingDefender = ref(false)
const defenderError = ref('')

// Battle conditions
const isCritical = ref(false)
const weather = ref<'sun' | 'rain' | 'sand' | 'snow' | null>(null)
const terrain = ref<'electric' | 'grassy' | 'misty' | 'psychic' | null>(null)
const burn = ref(false)
const screens = ref(false)
const multiTarget = ref(false)

// Results
const result = ref<DamageResult | null>(null)
const showResults = ref(false)

// Search functions
const searchAttacker = async () => {
  if (!attackerSearch.value.trim()) return

  loadingAttacker.value = true
  attackerError.value = ''

  try {
    const query = attackerSearch.value.toLowerCase().trim()
    const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${query}`)
    attacker.value = pokemon
    attackerMove.value = null // Reset move when changing pokemon
  } catch (err) {
    attackerError.value = 'Pokémon not found. Try another name or ID.'
    attacker.value = null
  } finally {
    loadingAttacker.value = false
  }
}

const searchDefender = async () => {
  if (!defenderSearch.value.trim()) return

  loadingDefender.value = true
  defenderError.value = ''

  try {
    const query = defenderSearch.value.toLowerCase().trim()
    const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${query}`)
    defender.value = pokemon
  } catch (err) {
    defenderError.value = 'Pokémon not found. Try another name or ID.'
    defender.value = null
  } finally {
    loadingDefender.value = false
  }
}

// Quick select functions
const selectAttacker = async (id: number) => {
  loadingAttacker.value = true
  attackerError.value = ''

  try {
    const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
    attacker.value = pokemon
    attackerSearch.value = pokemon.name
    attackerMove.value = null
  } catch (err) {
    attackerError.value = 'Error loading Pokémon'
  } finally {
    loadingAttacker.value = false
  }
}

const selectDefender = async (id: number) => {
  loadingDefender.value = true
  defenderError.value = ''

  try {
    const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)
    defender.value = pokemon
    defenderSearch.value = pokemon.name
  } catch (err) {
    defenderError.value = 'Error loading Pokémon'
  } finally {
    loadingDefender.value = false
  }
}

// Calculate damage
const calculate = () => {
  if (!attacker.value || !defender.value || !attackerMove.value) {
    alert('Please select both Pokemon and a move for the attacker')
    return
  }

  const move = attackerMove.value
  const damageClass = move.damage_class?.name || 'physical'

  if (damageClass === 'status') {
    alert('Status moves do not deal damage')
    return
  }

  // Get attacker's attack stat
  const attackStat = damageClass === 'physical' ? 'attack' : 'special-attack'
  const attackBase = attacker.value.stats.find(s => s.stat.name === attackStat)?.base_stat || 0

  const attack = calculateStat({
    base: attackBase,
    level: attackerLevel.value,
    iv: 31,
    ev: 252,
    nature: 1.1
  })

  // Get defender's defense stat
  const defenseStat = damageClass === 'physical' ? 'defense' : 'special-defense'
  const defenseBase = defender.value.stats.find(s => s.stat.name === defenseStat)?.base_stat || 0

  const defense = calculateStat({
    base: defenseBase,
    level: defenderLevel.value,
    iv: 31,
    ev: 252,
    nature: 1.1
  })

  // Get defender's max HP
  const hpBase = defender.value.stats.find(s => s.stat.name === 'hp')?.base_stat || 0

  const maxHP = calculateStat({
    base: hpBase,
    level: defenderLevel.value,
    iv: 31,
    ev: 252,
    nature: 1.0
  }, true)

  const input: DamageCalculationInput = {
    level: attackerLevel.value,
    attack,
    defense,
    attackStages: attackerStages.value,
    defenseStages: defenderStages.value,
    power: move.power || 0,
    moveType: move.type?.name || 'normal',
    damageClass: damageClass as 'physical' | 'special',
    attackerTypes: attacker.value.types.map((t: any) => t.type.name),
    defenderTypes: defender.value.types.map((t: any) => t.type.name),
    isCritical: isCritical.value,
    weather: weather.value,
    terrain: terrain.value,
    burn: burn.value,
    screens: screens.value,
    multiTarget: multiTarget.value
  }

  result.value = calculateDamage(input, maxHP)
  showResults.value = true

  // Track achievement
  achievementsStore.trackCalculatorUse()
}

// Reset
const reset = () => {
  attacker.value = null
  defender.value = null
  attackerMove.value = null
  attackerSearch.value = ''
  defenderSearch.value = ''
  result.value = null
  showResults.value = false
  attackerStages.value = 0
  defenderStages.value = 0
  attackerLevel.value = 100
  defenderLevel.value = 100
  isCritical.value = false
  weather.value = null
  terrain.value = null
  burn.value = false
  screens.value = false
  multiTarget.value = false
}
</script>

<template>
  <div class="page damage-calculator">
    <div class="container">
      <div class="page__header">
        <Icon name="mdi:calculator-variant" class="page__header-icon" />
        <h1 class="page__title">Damage Calculator</h1>
        <p class="page__description">
          Calculate battle damage between two Pokémon with advanced modifiers
        </p>
      </div>

      <div class="calculator">
        <!-- Pokemon Selection -->
        <div class="calculator__pokemon-selection">
          <!-- Attacker -->
          <div class="pokemon-select-card pokemon-select-card--attacker">
            <div class="pokemon-select-card__header">
              <Icon name="mdi:sword" />
              <h2>Attacker</h2>
            </div>

            <div class="pokemon-select-card__search">
              <input
                v-model="attackerSearch"
                type="text"
                placeholder="Enter name or ID (e.g., Pikachu or 25)"
                class="search-input"
                @keyup.enter="searchAttacker"
              />
              <button class="search-btn" @click="searchAttacker">
                <Icon name="mdi:magnify" />
              </button>
            </div>

            <div v-if="attackerError" class="error-message">
              <Icon name="mdi:alert-circle" />
              {{ attackerError }}
            </div>

            <div v-if="loadingAttacker" class="loading-state">
              <LoadingSpinner size="md" />
              <p>Loading Pokémon...</p>
            </div>

            <div v-if="attacker && !loadingAttacker" class="pokemon-display">
              <NuxtImg
                :src="attacker.sprites.other['official-artwork']?.front_default || attacker.sprites.front_default"
                :alt="attacker.name"
                width="150"
                height="150"
                class="pokemon-display__image"
              />
              <div class="pokemon-display__info">
                <span class="pokemon-display__id">#{{ String(attacker.id).padStart(3, '0') }}</span>
                <h3 class="pokemon-display__name">{{ attacker.name }}</h3>
                <div class="pokemon-display__types">
                  <TypeBadge
                    v-for="t in attacker.types"
                    :key="t.type.name"
                    :type="t.type.name"
                  />
                </div>
              </div>

              <div class="moves-selection">
                <label>Select Move:</label>
                <div class="moves-grid">
                  <button
                    v-for="move in attacker.moves.slice(0, 12)"
                    :key="move.move.name"
                    class="move-btn"
                    :class="{ 'move-btn--active': attackerMove?.name === move.move.name }"
                    @click="async () => {
                      const moveData = await $fetch(`https://pokeapi.co/api/v2/move/${move.move.name}`)
                      attackerMove = moveData
                    }"
                  >
                    {{ move.move.name.replace('-', ' ') }}
                  </button>
                </div>
              </div>

              <div class="level-control">
                <label>Level: {{ attackerLevel }}</label>
                <input v-model.number="attackerLevel" type="range" min="1" max="100" class="slider" />
              </div>

              <div class="stages-control">
                <label>Attack Stages: {{ attackerStages > 0 ? '+' : '' }}{{ attackerStages }}</label>
                <input v-model.number="attackerStages" type="range" min="-6" max="6" class="slider" />
              </div>
            </div>

            <div v-if="!attacker && !loadingAttacker" class="quick-select">
              <p class="quick-select__label">Quick Select:</p>
              <div class="quick-select__grid">
                <button
                  v-for="poke in popularPokemon.slice(0, 4)"
                  :key="poke.id"
                  class="quick-select__btn"
                  @click="selectAttacker(poke.id)"
                >
                  {{ poke.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="calculator__vs">
            <Icon name="mdi:sword-cross" />
            <span>VS</span>
          </div>

          <!-- Defender -->
          <div class="pokemon-select-card pokemon-select-card--defender">
            <div class="pokemon-select-card__header">
              <Icon name="mdi:shield" />
              <h2>Defender</h2>
            </div>

            <div class="pokemon-select-card__search">
              <input
                v-model="defenderSearch"
                type="text"
                placeholder="Enter name or ID (e.g., Charizard or 6)"
                class="search-input"
                @keyup.enter="searchDefender"
              />
              <button class="search-btn" @click="searchDefender">
                <Icon name="mdi:magnify" />
              </button>
            </div>

            <div v-if="defenderError" class="error-message">
              <Icon name="mdi:alert-circle" />
              {{ defenderError }}
            </div>

            <div v-if="loadingDefender" class="loading-state">
              <LoadingSpinner size="md" />
              <p>Loading Pokémon...</p>
            </div>

            <div v-if="defender && !loadingDefender" class="pokemon-display">
              <NuxtImg
                :src="defender.sprites.other['official-artwork']?.front_default || defender.sprites.front_default"
                :alt="defender.name"
                width="150"
                height="150"
                class="pokemon-display__image"
              />
              <div class="pokemon-display__info">
                <span class="pokemon-display__id">#{{ String(defender.id).padStart(3, '0') }}</span>
                <h3 class="pokemon-display__name">{{ defender.name }}</h3>
                <div class="pokemon-display__types">
                  <TypeBadge
                    v-for="t in defender.types"
                    :key="t.type.name"
                    :type="t.type.name"
                  />
                </div>
              </div>

              <div class="level-control">
                <label>Level: {{ defenderLevel }}</label>
                <input v-model.number="defenderLevel" type="range" min="1" max="100" class="slider" />
              </div>

              <div class="stages-control">
                <label>Defense Stages: {{ defenderStages > 0 ? '+' : '' }}{{ defenderStages }}</label>
                <input v-model.number="defenderStages" type="range" min="-6" max="6" class="slider" />
              </div>
            </div>

            <div v-if="!defender && !loadingDefender" class="quick-select">
              <p class="quick-select__label">Quick Select:</p>
              <div class="quick-select__grid">
                <button
                  v-for="poke in popularPokemon.slice(4, 8)"
                  :key="poke.id"
                  class="quick-select__btn"
                  @click="selectDefender(poke.id)"
                >
                  {{ poke.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Battle Conditions -->
        <div class="battle-conditions">
          <h3 class="battle-conditions__title">
            <Icon name="mdi:weather-partly-cloudy" />
            Battle Conditions
          </h3>

          <div class="battle-conditions__grid">
            <div class="condition-group">
              <label class="condition-checkbox">
                <input v-model="isCritical" type="checkbox" />
                <span>Critical Hit</span>
              </label>
              <label class="condition-checkbox">
                <input v-model="burn" type="checkbox" />
                <span>Attacker Burned</span>
              </label>
              <label class="condition-checkbox">
                <input v-model="screens" type="checkbox" />
                <span>Light Screen / Reflect Active</span>
              </label>
              <label class="condition-checkbox">
                <input v-model="multiTarget" type="checkbox" />
                <span>Multi-Target Move</span>
              </label>
            </div>

            <div class="condition-select-group">
              <div class="condition-select">
                <label>Weather:</label>
                <select v-model="weather">
                  <option :value="null">None</option>
                  <option value="sun">Sunny ☀️</option>
                  <option value="rain">Rain 🌧️</option>
                  <option value="sand">Sandstorm 🌪️</option>
                  <option value="snow">Snow ❄️</option>
                </select>
              </div>

              <div class="condition-select">
                <label>Terrain:</label>
                <select v-model="terrain">
                  <option :value="null">None</option>
                  <option value="electric">Electric ⚡</option>
                  <option value="grassy">Grassy 🌱</option>
                  <option value="misty">Misty 🌫️</option>
                  <option value="psychic">Psychic 🔮</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="calculator__actions">
          <button class="btn btn--primary btn--lg" @click="calculate">
            <Icon name="mdi:calculator" />
            Calculate Damage
          </button>
          <button class="btn btn--secondary btn--lg" @click="reset">
            <Icon name="mdi:refresh" />
            Reset All
          </button>
        </div>

        <!-- Results -->
        <Transition name="fade">
          <div v-if="showResults && result" class="results-panel">
            <h2 class="results-panel__title">
              <Icon name="mdi:chart-line" />
              Damage Calculation Results
            </h2>

            <div class="results-panel__main">
              <div class="damage-display">
                <div class="damage-display__label">Damage Range</div>
                <div class="damage-display__numbers">
                  {{ result.minDamage }} - {{ result.maxDamage }}
                </div>
                <div class="damage-display__percent">
                  {{ result.minPercent.toFixed(1) }}% - {{ result.maxPercent.toFixed(1) }}%
                </div>
              </div>

              <div class="ko-display" :class="{
                'ko-display--guaranteed': result.koChance.includes('100%'),
                'ko-display--possible': result.koChance.includes('%') && !result.koChance.includes('0%') && !result.koChance.includes('100%'),
                'ko-display--unlikely': result.koChance.includes('0%')
              }">
                <Icon name="mdi:skull-crossbones" />
                <div>
                  <div class="ko-display__label">KO Chance</div>
                  <div class="ko-display__value">{{ result.koChance }}</div>
                </div>
              </div>
            </div>

            <div class="results-panel__modifiers">
              <h3>Active Modifiers:</h3>
              <ul>
                <li v-for="desc in result.description" :key="desc">
                  <Icon name="mdi:check-circle" />
                  {{ desc }}
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.damage-calculator {
  padding: $spacing-8 0;
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);
}

.page__header {
  text-align: center;
  margin-bottom: $spacing-8;

  &-icon {
    font-size: 64px;
    color: $primary;
    margin-bottom: $spacing-4;
  }
}

.calculator {
  max-width: 1400px;
  margin: 0 auto;

  &__pokemon-selection {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: $spacing-6;
    margin-bottom: $spacing-8;
    align-items: start;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: 1fr;
    }
  }

  &__vs {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-4;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $primary;

    @media (max-width: $breakpoint-lg) {
      flex-direction: row;
      justify-content: center;
    }

    svg {
      font-size: 48px;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    margin-top: $spacing-8;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
    }
  }
}

.pokemon-select-card {
  background: $white;
  border-radius: $radius-2xl;
  padding: $spacing-6;
  box-shadow: $shadow-xl;

  &--attacker {
    border-top: 4px solid $error;
  }

  &--defender {
    border-top: 4px solid $info;
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
    }
  }

  &__search {
    display: flex;
    gap: $spacing-2;
    margin-bottom: $spacing-4;
  }
}

.search-input {
  flex: 1;
  padding: $spacing-3 $spacing-4;
  border: 2px solid $gray-300;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  transition: all $transition-base;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}

.search-btn {
  @include reset-button;
  padding: $spacing-3 $spacing-5;
  background: $primary;
  color: $white;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  transition: all $transition-base;

  &:hover {
    background: $primary-dark;
    transform: translateY(-2px);
  }

  svg {
    font-size: 20px;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3;
  background: rgba($error, 0.1);
  color: $error;
  border-radius: $radius-md;
  margin-bottom: $spacing-4;
  font-size: $font-size-sm;

  svg {
    font-size: 20px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-8;
  color: $text-secondary;
}

.pokemon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;

  &__image {
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
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
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    text-transform: capitalize;
    margin: $spacing-1 0;
  }

  &__types {
    display: flex;
    gap: $spacing-2;
    justify-content: center;
  }
}

.moves-selection {
  width: 100%;

  label {
    display: block;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-2;
    color: $text-primary;
  }
}

.moves-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-2;
  max-height: 200px;
  overflow-y: auto;
  padding: $spacing-2;
  background: $gray-50;
  border-radius: $radius-md;
}

.move-btn {
  @include reset-button;
  padding: $spacing-2 $spacing-3;
  background: $white;
  border: 2px solid $gray-300;
  border-radius: $radius-md;
  text-transform: capitalize;
  font-size: $font-size-sm;
  transition: all $transition-fast;
  cursor: pointer;

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &--active {
    background: $primary;
    color: $white;
    border-color: $primary;
    font-weight: $font-weight-semibold;
  }
}

.level-control,
.stages-control {
  width: 100%;

  label {
    display: block;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-2;
    color: $text-primary;
  }

  .slider {
    width: 100%;
    cursor: pointer;
  }
}

.quick-select {
  &__label {
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-3;
    color: $text-secondary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-2;
  }

  &__btn {
    @include reset-button;
    padding: $spacing-3;
    background: $gray-100;
    border-radius: $radius-lg;
    font-weight: $font-weight-medium;
    transition: all $transition-base;

    &:hover {
      background: $primary;
      color: $white;
      transform: translateY(-2px);
    }
  }
}

.battle-conditions {
  background: $white;
  border-radius: $radius-2xl;
  padding: $spacing-6;
  box-shadow: $shadow-lg;
  margin-bottom: $spacing-6;

  &__title {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-4;

    svg {
      font-size: 28px;
      color: $primary;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-6;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }
}

.condition-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.condition-checkbox {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  span {
    font-weight: $font-weight-medium;
  }
}

.condition-select-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.condition-select {
  label {
    display: block;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-2;
  }

  select {
    width: 100%;
    padding: $spacing-3;
    border: 2px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-base;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }
}

.results-panel {
  background: linear-gradient(135deg, rgba($primary, 0.1), rgba($info, 0.1));
  border-radius: $radius-2xl;
  padding: $spacing-8;
  box-shadow: $shadow-2xl;
  border: 2px solid $primary;

  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-3;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-6;
    color: $primary;

    svg {
      font-size: 36px;
    }
  }

  &__main {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: $spacing-6;
    margin-bottom: $spacing-6;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__modifiers {
    background: $white;
    padding: $spacing-4;
    border-radius: $radius-lg;

    h3 {
      font-size: $font-size-lg;
      margin-bottom: $spacing-3;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: center;
        gap: $spacing-2;
        padding: $spacing-2 0;
        border-bottom: 1px solid $gray-200;

        &:last-child {
          border-bottom: none;
        }

        svg {
          color: $success;
          font-size: 18px;
        }
      }
    }
  }
}

.damage-display {
  background: $white;
  padding: $spacing-6;
  border-radius: $radius-lg;
  text-align: center;

  &__label {
    font-size: $font-size-sm;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: $spacing-2;
  }

  &__numbers {
    font-size: 3.5rem;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
    color: $primary;
    line-height: 1;
    margin-bottom: $spacing-2;
  }

  &__percent {
    font-size: $font-size-xl;
    color: $text-secondary;
    font-weight: $font-weight-semibold;
  }
}

.ko-display {
  background: $gray-100;
  padding: $spacing-4;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  gap: $spacing-3;

  svg {
    font-size: 48px;
    color: $text-secondary;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &__value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-mono;
  }

  &--possible {
    background: rgba($warning, 0.2);
    border: 2px solid $warning;

    svg {
      color: $warning;
    }
  }

  &--guaranteed {
    background: rgba($error, 0.2);
    border: 2px solid $error;

    svg {
      color: $error;
    }

    .ko-display__value {
      color: $error;
    }
  }

  &--unlikely {
    background: rgba($success, 0.1);
    border: 2px solid $success;

    svg {
      color: $success;
    }
  }
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
