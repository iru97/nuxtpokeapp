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

const pokemonApi = usePokemonApi()
const achievementsStore = useAchievementsStore()

// Attacker
const attacker = ref<Pokemon | null>(null)
const attackerLevel = ref(100)
const attackerMove = ref<any>(null)
const attackerIVs = ref({ attack: 31, 'special-attack': 31 })
const attackerEVs = ref({ attack: 252, 'special-attack': 252 })
const attackerStages = ref(0)
const attackerNature = ref('adamant')

// Defender
const defender = ref<Pokemon | null>(null)
const defenderLevel = ref(100)
const defenderIVs = ref({ defense: 31, 'special-defense': 31, hp: 31 })
const defenderEVs = ref({ defense: 252, 'special-defense': 252, hp: 252 })
const defenderStages = ref(0)
const defenderNature = ref('bold')

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

// Search
const attackerSearch = ref('')
const defenderSearch = ref('')

// Calculate damage
const calculate = () => {
  if (!attacker.value || !defender.value || !attackerMove.value) {
    alert('Please select both Pokemon and a move')
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
  const attackIV = attackerIVs.value[attackStat] || 31
  const attackEV = attackerEVs.value[attackStat] || 0

  const attack = calculateStat({
    base: attackBase,
    level: attackerLevel.value,
    iv: attackIV,
    ev: attackEV,
    nature: attackerNature.value === 'adamant' && attackStat === 'attack' ? 1.1 : 1.0
  })

  // Get defender's defense stat
  const defenseStat = damageClass === 'physical' ? 'defense' : 'special-defense'
  const defenseBase = defender.value.stats.find(s => s.stat.name === defenseStat)?.base_stat || 0
  const defenseIV = defenderIVs.value[defenseStat] || 31
  const defenseEV = defenderEVs.value[defenseStat] || 0

  const defense = calculateStat({
    base: defenseBase,
    level: defenderLevel.value,
    iv: defenseIV,
    ev: defenseEV,
    nature: defenderNature.value === 'bold' && defenseStat === 'defense' ? 1.1 : 1.0
  })

  // Get defender's max HP
  const hpBase = defender.value.stats.find(s => s.stat.name === 'hp')?.base_stat || 0
  const hpIV = defenderIVs.value.hp || 31
  const hpEV = defenderEVs.value.hp || 0

  const maxHP = calculateStat({
    base: hpBase,
    level: defenderLevel.value,
    iv: hpIV,
    ev: hpEV,
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
  result.value = null
  showResults.value = false
  attackerStages.value = 0
  defenderStages.value = 0
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
        <h1 class="page__title">Damage Calculator</h1>
        <p class="page__description">
          Calculate Pokemon battle damage with advanced modifiers and conditions
        </p>
      </div>

      <div class="calculator">
        <div class="calculator__grid">
          <!-- Attacker Section -->
          <div class="calculator__section">
            <h2 class="calculator__section-title">
              <Icon name="mdi:sword" />
              Attacker
            </h2>

            <div class="pokemon-selector">
              <input
                v-model="attackerSearch"
                type="text"
                placeholder="Search Pokemon (e.g., Pikachu or 25)"
                class="pokemon-selector__input"
                @keyup.enter="async () => {
                  const pokemon = await pokemonApi.getPokemon(attackerSearch)
                  if (pokemon) attacker = pokemon
                }"
              />
              <div v-if="attacker" class="pokemon-card-mini">
                <NuxtImg
                  :src="attacker.sprites.front_default"
                  :alt="attacker.name"
                  width="64"
                  height="64"
                />
                <div>
                  <strong>{{ attacker.name }}</strong>
                  <div class="types-mini">
                    <TypeBadge
                      v-for="t in attacker.types"
                      :key="t.type.name"
                      :type="t.type.name"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Level: {{ attackerLevel }}</label>
              <input v-model.number="attackerLevel" type="range" min="1" max="100" />
            </div>

            <div class="form-group">
              <label>Attack Stages: {{ attackerStages > 0 ? '+' : '' }}{{ attackerStages }}</label>
              <input v-model.number="attackerStages" type="range" min="-6" max="6" />
            </div>
          </div>

          <!-- Move Section -->
          <div class="calculator__section">
            <h2 class="calculator__section-title">
              <Icon name="mdi:flash" />
              Move & Conditions
            </h2>

            <div v-if="attacker" class="moves-list">
              <button
                v-for="move in attacker.moves.slice(0, 10)"
                :key="move.move.name"
                class="move-button"
                :class="{ active: attackerMove?.move.name === move.move.name }"
                @click="async () => {
                  const moveData = await $fetch(`https://pokeapi.co/api/v2/move/${move.move.name}`)
                  attackerMove = moveData
                }"
              >
                {{ move.move.name.replace('-', ' ') }}
              </button>
            </div>

            <div class="checkboxes">
              <label><input v-model="isCritical" type="checkbox" /> Critical Hit</label>
              <label><input v-model="burn" type="checkbox" /> Attacker Burned</label>
              <label><input v-model="screens" type="checkbox" /> Screens Active</label>
              <label><input v-model="multiTarget" type="checkbox" /> Multi-Target</label>
            </div>

            <div class="form-group">
              <label>Weather</label>
              <select v-model="weather">
                <option :value="null">None</option>
                <option value="sun">Sun</option>
                <option value="rain">Rain</option>
                <option value="sand">Sandstorm</option>
                <option value="snow">Snow</option>
              </select>
            </div>

            <div class="form-group">
              <label>Terrain</label>
              <select v-model="terrain">
                <option :value="null">None</option>
                <option value="electric">Electric</option>
                <option value="grassy">Grassy</option>
                <option value="misty">Misty</option>
                <option value="psychic">Psychic</option>
              </select>
            </div>
          </div>

          <!-- Defender Section -->
          <div class="calculator__section">
            <h2 class="calculator__section-title">
              <Icon name="mdi:shield" />
              Defender
            </h2>

            <div class="pokemon-selector">
              <input
                v-model="defenderSearch"
                type="text"
                placeholder="Search Pokemon (e.g., Charizard or 6)"
                class="pokemon-selector__input"
                @keyup.enter="async () => {
                  const pokemon = await pokemonApi.getPokemon(defenderSearch)
                  if (pokemon) defender = pokemon
                }"
              />
              <div v-if="defender" class="pokemon-card-mini">
                <NuxtImg
                  :src="defender.sprites.front_default"
                  :alt="defender.name"
                  width="64"
                  height="64"
                />
                <div>
                  <strong>{{ defender.name }}</strong>
                  <div class="types-mini">
                    <TypeBadge
                      v-for="t in defender.types"
                      :key="t.type.name"
                      :type="t.type.name"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Level: {{ defenderLevel }}</label>
              <input v-model.number="defenderLevel" type="range" min="1" max="100" />
            </div>

            <div class="form-group">
              <label>Defense Stages: {{ defenderStages > 0 ? '+' : '' }}{{ defenderStages }}</label>
              <input v-model.number="defenderStages" type="range" min="-6" max="6" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="calculator__actions">
          <button class="btn btn--primary btn--lg" @click="calculate">
            <Icon name="mdi:calculator" />
            Calculate Damage
          </button>
          <button class="btn btn--secondary" @click="reset">
            <Icon name="mdi:refresh" />
            Reset
          </button>
        </div>

        <!-- Results -->
        <div v-if="showResults && result" class="calculator__results">
          <h2 class="results__title">Damage Calculation</h2>

          <div class="results__main">
            <div class="damage-range">
              <div class="damage-number">
                {{ result.minDamage }} - {{ result.maxDamage }}
              </div>
              <div class="damage-percent">
                ({{ result.minPercent.toFixed(1) }}% - {{ result.maxPercent.toFixed(1) }}%)
              </div>
            </div>

            <div class="ko-chance" :class="{
              'ko-guaranteed': result.koChance.includes('100%'),
              'ko-possible': result.koChance.includes('%') && !result.koChance.includes('0%')
            }">
              <Icon name="mdi:skull" />
              <div>
                <div class="ko-label">KO Chance</div>
                <div class="ko-value">{{ result.koChance }}</div>
              </div>
            </div>
          </div>

          <div class="results__modifiers">
            <h3>Modifiers Applied:</h3>
            <ul>
              <li v-for="desc in result.description" :key="desc">
                {{ desc }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.damage-calculator {
  padding: $spacing-8 0;
}

.calculator {
  background: $white;
  border-radius: $radius-xl;
  padding: $spacing-6;
  box-shadow: $shadow-lg;

  @at-root .dark & {
    background: $dark-surface;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;
    margin-bottom: $spacing-6;

    @media (max-width: $breakpoint-lg) {
      grid-template-columns: 1fr;
    }
  }

  &__section {
    padding: $spacing-4;
    background: $gray-50;
    border-radius: $radius-lg;

    @at-root .dark & {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-4;
    color: $primary;

    svg {
      font-size: 24px;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-3;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__results {
    margin-top: $spacing-6;
    padding: $spacing-6;
    background: linear-gradient(135deg, rgba($primary, 0.1), rgba($secondary, 0.1));
    border-radius: $radius-lg;
    border: 2px solid $primary;
  }
}

.pokemon-selector {
  margin-bottom: $spacing-4;

  &__input {
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

.pokemon-card-mini {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  background: $white;
  border-radius: $radius-md;
  margin-top: $spacing-2;

  @at-root .dark & {
    background: $dark-bg-primary;
  }

  strong {
    text-transform: capitalize;
    display: block;
    margin-bottom: $spacing-1;
  }

  .types-mini {
    display: flex;
    gap: $spacing-1;
  }
}

.form-group {
  margin-bottom: $spacing-4;

  label {
    display: block;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-2;
    color: $text-primary;
  }

  input[type="range"],
  select {
    width: 100%;
    padding: $spacing-2;
  }
}

.moves-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-4;
}

.move-button {
  @include reset-button;
  @include spring-bounce;
  padding: $spacing-2 $spacing-3;
  background: $gray-200;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  text-transform: capitalize;
  transition: all $transition-base;

  &:hover {
    background: $gray-300;
  }

  &.active {
    background: $primary;
    color: $white;
  }
}

.checkboxes {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  margin-bottom: $spacing-4;

  label {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    cursor: pointer;

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }
}

.results__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  text-align: center;
  margin-bottom: $spacing-4;
  color: $primary;
}

.results__main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $spacing-4;
  margin-bottom: $spacing-6;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.damage-range {
  text-align: center;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;

  @at-root .dark & {
    background: $dark-surface;
  }
}

.damage-number {
  font-size: 3rem;
  font-weight: $font-weight-bold;
  font-family: $font-family-mono;
  color: $primary;
  margin-bottom: $spacing-2;
}

.damage-percent {
  font-size: $font-size-xl;
  color: $text-secondary;
  font-weight: $font-weight-semibold;
}

.ko-chance {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $gray-100;
  border-radius: $radius-lg;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    font-size: 48px;
    color: $text-secondary;
  }

  &.ko-possible {
    background: rgba($warning, 0.2);

    svg {
      color: $warning;
    }
  }

  &.ko-guaranteed {
    background: rgba($error, 0.2);

    svg {
      color: $error;
    }
  }
}

.ko-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ko-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  font-family: $font-family-mono;
}

.results__modifiers {
  padding: $spacing-4;
  background: $white;
  border-radius: $radius-lg;

  @at-root .dark & {
    background: $dark-surface;
  }

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-3;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: $spacing-2 0;
      border-bottom: 1px solid $gray-200;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
