<script setup lang="ts">
import { TYPE_EFFECTIVENESS } from '~/constants/pokemon'
import type { Pokemon } from '~/types'

const teamStore = useTeamStore()
const router = useRouter()

// SEO Meta tags
useHead({
  title: 'Team Builder - PokéApp',
  meta: [
    { name: 'description', content: 'Build and analyze your perfect Pokémon team. Check type coverage, weaknesses, and save your favorite teams.' },
    { property: 'og:title', content: 'Team Builder - PokéApp' },
    { property: 'og:description', content: 'Build your perfect Pokémon team' },
  ]
})

// Initialize store
onMounted(() => {
  teamStore.init()
})

// Team name editing
const editingTeamName = ref(false)
const tempTeamName = ref('')

const startEditingName = () => {
  tempTeamName.value = teamStore.currentTeamName
  editingTeamName.value = true
}

const saveTeamName = () => {
  if (tempTeamName.value.trim()) {
    teamStore.updateTeamName(tempTeamName.value.trim())
  }
  editingTeamName.value = false
}

// Pokemon selection
const showPokemonSelector = ref(false)
const selectedSlot = ref<number | null>(null)

const openPokemonSelector = (slot: number) => {
  selectedSlot.value = slot
  showPokemonSelector.value = true
}

const closePokemonSelector = () => {
  showPokemonSelector.value = false
  selectedSlot.value = null
}

// Remove Pokemon
const removePokemon = (slot: number) => {
  teamStore.removePokemon(slot)
}

// Clear team
const clearTeam = () => {
  if (confirm('Are you sure you want to clear your team?')) {
    teamStore.clearTeam()
  }
}

// Save team dialog
const showSaveDialog = ref(false)
const newTeamName = ref('')

const openSaveDialog = () => {
  newTeamName.value = teamStore.currentTeamName
  showSaveDialog.value = true
}

const saveCurrentTeam = () => {
  if (teamStore.saveTeam(newTeamName.value)) {
    showSaveDialog.value = false
    alert('Team saved successfully!')
  }
}

// Load team
const showLoadDialog = ref(false)

const loadTeam = (teamId: string) => {
  if (teamStore.loadTeam(teamId)) {
    showLoadDialog.value = false
  }
}

const deleteTeam = (teamId: string) => {
  if (confirm('Are you sure you want to delete this team?')) {
    teamStore.deleteTeam(teamId)
  }
}

// Export team
const exportTeam = () => {
  const data = teamStore.exportTeam()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${teamStore.currentTeamName}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Import team
const importTeam = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event: any) => {
        const success = await teamStore.importTeam(event.target.result)
        if (success) {
          alert('Team imported successfully!')
        } else {
          alert('Failed to import team')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// Type coverage analysis
const typeCoverage = computed(() => {
  const coverage: Record<string, number> = {}
  const allTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]

  // Initialize coverage
  allTypes.forEach(type => {
    coverage[type] = 0
  })

  // Calculate coverage based on team's attacking types
  teamStore.currentTeam.forEach(tp => {
    tp.pokemon.types.forEach(pokemonType => {
      const attackingType = pokemonType.type.name
      const effectiveness = TYPE_EFFECTIVENESS[attackingType as keyof typeof TYPE_EFFECTIVENESS]

      if (effectiveness?.strong) {
        effectiveness.strong.forEach(defendingType => {
          coverage[defendingType] = Math.max(coverage[defendingType], 2)
        })
      }
    })
  })

  return coverage
})

// Team weaknesses
const teamWeaknesses = computed(() => {
  const weaknesses: Record<string, number> = {}
  const resistances: Record<string, number> = {}

  teamStore.currentTeam.forEach(tp => {
    const pokemonTypes = tp.pokemon.types.map(t => t.type.name)

    // Check each attacking type against this Pokemon's types
    Object.keys(TYPE_EFFECTIVENESS).forEach(attackType => {
      let effectiveness = 1

      pokemonTypes.forEach(defenseType => {
        const typeData = TYPE_EFFECTIVENESS[attackType as keyof typeof TYPE_EFFECTIVENESS]
        if (typeData?.strong?.includes(defenseType)) {
          effectiveness *= 2
        } else if (typeData?.weak?.includes(defenseType)) {
          effectiveness *= 0.5
        } else if (typeData?.immune?.includes(defenseType)) {
          effectiveness *= 0
        }
      })

      if (effectiveness > 1) {
        weaknesses[attackType] = (weaknesses[attackType] || 0) + 1
      } else if (effectiveness < 1) {
        resistances[attackType] = (resistances[attackType] || 0) + 1
      }
    })
  })

  return { weaknesses, resistances }
})

// Top weaknesses (types that hit multiple team members super effectively)
const topWeaknesses = computed(() => {
  return Object.entries(teamWeaknesses.value.weaknesses)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
})

// Navigate to add Pokemon
const goToPokedex = () => {
  router.push('/pokemons')
}
</script>

<template>
  <div class="team-builder">
    <div class="team-builder__container">
      <!-- Header -->
      <div class="team-builder__header">
        <div class="team-builder__header-content">
          <Icon name="mdi:account-group" class="team-builder__header-icon" />
          <div>
            <div v-if="!editingTeamName" class="team-builder__title-wrapper">
              <h1 class="team-builder__title">{{ teamStore.currentTeamName }}</h1>
              <button class="team-builder__edit-btn" @click="startEditingName">
                <Icon name="mdi:pencil" />
              </button>
            </div>
            <div v-else class="team-builder__title-edit">
              <input
                v-model="tempTeamName"
                type="text"
                class="team-builder__title-input"
                @keyup.enter="saveTeamName"
                @keyup.esc="editingTeamName = false"
                autofocus
              />
              <button class="team-builder__save-btn" @click="saveTeamName">
                <Icon name="mdi:check" />
              </button>
            </div>
            <p class="team-builder__subtitle">
              {{ teamStore.teamSize }} / {{ teamStore.maxTeamSize }} Pokémon
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="team-builder__actions">
          <button
            v-if="teamStore.teamSize > 0"
            class="team-builder__action-btn"
            @click="openSaveDialog"
          >
            <Icon name="mdi:content-save" />
            <span>Save Team</span>
          </button>

          <button
            class="team-builder__action-btn"
            @click="showLoadDialog = true"
          >
            <Icon name="mdi:folder-open" />
            <span>Load Team</span>
          </button>

          <button
            v-if="teamStore.teamSize > 0"
            class="team-builder__action-btn"
            @click="exportTeam"
          >
            <Icon name="mdi:export" />
            <span>Export</span>
          </button>

          <button
            class="team-builder__action-btn"
            @click="importTeam"
          >
            <Icon name="mdi:import" />
            <span>Import</span>
          </button>

          <button
            v-if="teamStore.teamSize > 0"
            class="team-builder__action-btn team-builder__action-btn--danger"
            @click="clearTeam"
          >
            <Icon name="mdi:delete" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <!-- Team Slots -->
      <div class="team-builder__team">
        <h3 class="team-builder__section-title">
          <Icon name="mdi:pokemon-go" />
          <span>Your Team</span>
        </h3>

        <div class="team-builder__slots">
          <div
            v-for="slot in teamStore.maxTeamSize"
            :key="slot - 1"
            class="team-slot"
          >
            <template v-if="teamStore.currentTeam[slot - 1]">
              <div class="team-slot__pokemon">
                <button
                  class="team-slot__remove"
                  @click="removePokemon(slot - 1)"
                >
                  <Icon name="mdi:close" />
                </button>

                <img
                  :src="teamStore.currentTeam[slot - 1].pokemon.sprites.other?.['official-artwork']?.front_default || teamStore.currentTeam[slot - 1].pokemon.sprites.front_default"
                  :alt="teamStore.currentTeam[slot - 1].pokemon.name"
                  class="team-slot__image"
                />

                <h4 class="team-slot__name">
                  {{ teamStore.currentTeam[slot - 1].nickname || teamStore.currentTeam[slot - 1].pokemon.name }}
                </h4>

                <div class="team-slot__types">
                  <TypeBadge
                    v-for="type in teamStore.currentTeam[slot - 1].pokemon.types"
                    :key="type.slot"
                    :type="type.type.name"
                    size="sm"
                  />
                </div>
              </div>
            </template>

            <template v-else>
              <button class="team-slot__empty" @click="goToPokedex">
                <Icon name="mdi:plus" />
                <span>Add Pokémon</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Analysis Section -->
      <div v-if="teamStore.teamSize > 0" class="team-builder__analysis">
        <!-- Type Coverage -->
        <div class="analysis-card">
          <h3 class="analysis-card__title">
            <Icon name="mdi:shield-sword" />
            <span>Offensive Coverage</span>
          </h3>

          <p class="analysis-card__description">
            Types your team can hit super effectively
          </p>

          <div class="analysis-card__types">
            <div
              v-for="(effectiveness, type) in typeCoverage"
              :key="type"
              class="coverage-type"
              :class="{
                'coverage-type--good': effectiveness >= 2,
                'coverage-type--none': effectiveness === 0
              }"
            >
              <TypeBadge :type="type" size="sm" />
            </div>
          </div>
        </div>

        <!-- Weaknesses -->
        <div class="analysis-card">
          <h3 class="analysis-card__title">
            <Icon name="mdi:alert" />
            <span>Team Weaknesses</span>
          </h3>

          <p class="analysis-card__description">
            Types that threaten multiple team members
          </p>

          <div v-if="topWeaknesses.length > 0" class="weakness-list">
            <div
              v-for="[type, count] in topWeaknesses"
              :key="type"
              class="weakness-item"
            >
              <TypeBadge :type="type" size="sm" />
              <div class="weakness-item__bar">
                <div
                  class="weakness-item__fill"
                  :style="{ width: `${(count / teamStore.teamSize) * 100}%` }"
                />
              </div>
              <span class="weakness-item__count">{{ count }}/{{ teamStore.teamSize }}</span>
            </div>
          </div>

          <div v-else class="analysis-card__empty">
            <Icon name="mdi:shield-check" />
            <span>No major weaknesses detected!</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else
        icon="mdi:account-group"
        title="No Pokémon in Team"
        description="Start building your team by adding Pokémon from the Pokédex"
        action-text="Browse Pokémon"
        action-icon="mdi:pokeball"
        @action="goToPokedex"
      />
    </div>

    <!-- Save Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSaveDialog" class="modal-overlay" @click.self="showSaveDialog = false">
          <div class="modal">
            <h3 class="modal__title">Save Team</h3>

            <input
              v-model="newTeamName"
              type="text"
              placeholder="Team name..."
              class="modal__input"
              @keyup.enter="saveCurrentTeam"
            />

            <div class="modal__actions">
              <button class="modal__btn modal__btn--primary" @click="saveCurrentTeam">
                Save
              </button>
              <button class="modal__btn" @click="showSaveDialog = false">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Load Dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showLoadDialog" class="modal-overlay" @click.self="showLoadDialog = false">
          <div class="modal modal--wide">
            <h3 class="modal__title">Load Team</h3>

            <div v-if="teamStore.savedTeamsCount > 0" class="saved-teams">
              <div
                v-for="team in teamStore.getSavedTeams"
                :key="team.id"
                class="saved-team"
              >
                <div class="saved-team__info">
                  <h4 class="saved-team__name">{{ team.name }}</h4>
                  <p class="saved-team__meta">
                    {{ team.pokemon.length }} Pokémon • {{ new Date(team.createdAt).toLocaleDateString() }}
                  </p>
                </div>

                <div class="saved-team__actions">
                  <button class="saved-team__btn" @click="loadTeam(team.id)">
                    <Icon name="mdi:download" />
                  </button>
                  <button class="saved-team__btn saved-team__btn--danger" @click="deleteTeam(team.id)">
                    <Icon name="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="modal__empty">
              <Icon name="mdi:folder-open-outline" />
              <span>No saved teams</span>
            </div>

            <div class="modal__actions">
              <button class="modal__btn" @click="showLoadDialog = false">
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.team-builder {
  min-height: 100vh;
  padding: $spacing-6 0;
  background: $gray-50;

  &__container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    @include flex-between;
    flex-wrap: wrap;
    gap: $spacing-4;
    margin-bottom: $spacing-8;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      align-items: stretch;
      padding: $spacing-4;
    }
  }

  &__header-content {
    @include flex-center;
    gap: $spacing-4;
  }

  &__header-icon {
    font-size: 64px;
    color: $primary;

    @media (max-width: $breakpoint-md) {
      font-size: 48px;
    }
  }

  &__title-wrapper {
    @include flex-center;
    gap: $spacing-2;
  }

  &__title {
    margin: 0;
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    color: $text-primary;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-3xl;
    }
  }

  &__edit-btn {
    @include reset-button;
    @include flex-center;
    width: 32px;
    height: 32px;
    color: $text-secondary;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $gray-100;
      color: $primary;
    }

    svg {
      font-size: 20px;
    }
  }

  &__title-edit {
    @include flex-center;
    gap: $spacing-2;
  }

  &__title-input {
    padding: $spacing-2 $spacing-3;
    border: 2px solid $gray-300;
    border-radius: $radius-md;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    font-family: $font-family-secondary;
    outline: none;

    &:focus {
      border-color: $primary;
    }
  }

  &__save-btn {
    @include reset-button;
    @include flex-center;
    width: 36px;
    height: 36px;
    background: $primary;
    color: $white;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $primary-dark;
    }

    svg {
      font-size: 20px;
    }
  }

  &__subtitle {
    margin: $spacing-1 0 0;
    font-size: $font-size-lg;
    color: $text-secondary;
  }

  &__actions {
    @include flex-center;
    gap: $spacing-2;
    flex-wrap: wrap;

    @media (max-width: $breakpoint-md) {
      justify-content: stretch;

      // Create a grid on medium screens to fit buttons better
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }

    @media (max-width: $breakpoint-sm) {
      // On very small screens, use narrower columns
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__action-btn {
    @include reset-button;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    background: $gray-100;
    color: $text-primary;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;

    &:hover {
      background: $gray-200;
      border-color: $primary;
      color: $primary;
    }

    &--danger:hover {
      background: rgba($error, 0.1);
      border-color: $error;
      color: $error;
    }

    svg {
      font-size: 18px;
    }

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      padding: $spacing-2;
      gap: 4px;
      font-size: $font-size-xs;

      svg {
        font-size: 20px;
      }

      span {
        font-size: 10px;
        line-height: 1;
      }
    }
  }

  &__section-title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-4;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    svg {
      font-size: 28px;
      color: $primary;
    }
  }

  &__team {
    margin-bottom: $spacing-8;
    padding: $spacing-6;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-md;

    @media (max-width: $breakpoint-sm) {
      padding: $spacing-4;
    }
  }

  &__slots {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: $spacing-4;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-3;
    }

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-2;
    }

    @media (max-width: 400px) {
      grid-template-columns: 1fr;
    }
  }

  &__analysis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: $spacing-6;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }
  }
}

.team-slot {
  aspect-ratio: 1;
  min-height: 200px;

  @media (max-width: $breakpoint-sm) {
    min-height: 160px;
  }

  @media (max-width: 400px) {
    min-height: 180px;
  }

  &__pokemon {
    position: relative;
    @include flex-column;
    align-items: center;
    gap: $spacing-3;
    height: 100%;
    padding: $spacing-4;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-xl;
    transition: all $transition-base;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-md;
    }

    @media (max-width: $breakpoint-sm) {
      padding: $spacing-2;
      gap: $spacing-2;
    }
  }

  &__remove {
    @include reset-button;
    position: absolute;
    top: $spacing-2;
    right: $spacing-2;
    width: 28px;
    height: 28px;
    @include flex-center;
    background: rgba($error, 0.1);
    color: $error;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $error;
      color: $white;
    }

    svg {
      font-size: 16px;
    }
  }

  &__image {
    width: 80px;
    height: 80px;
    object-fit: contain;

    @media (max-width: $breakpoint-sm) {
      width: 60px;
      height: 60px;
    }
  }

  &__name {
    margin: 0;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
    text-transform: capitalize;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-sm;
    }
  }

  &__types {
    @include flex-center;
    gap: $spacing-1;
    flex-wrap: wrap;
  }

  &__empty {
    @include reset-button;
    @include flex-column;
    @include flex-center;
    gap: $spacing-2;
    height: 100%;
    background: $gray-50;
    border: 2px dashed $gray-300;
    border-radius: $radius-xl;
    color: $text-secondary;
    font-weight: $font-weight-semibold;
    transition: all $transition-base;

    &:hover {
      background: $gray-100;
      border-color: $primary;
      color: $primary;
    }

    svg {
      font-size: 32px;
    }
  }
}

.analysis-card {
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-4;
  }

  &__title {
    @include flex-center;
    gap: $spacing-2;
    margin: 0 0 $spacing-3;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-lg;
    }

    svg {
      font-size: 24px;
      color: $primary;

      @media (max-width: $breakpoint-sm) {
        font-size: 20px;
      }
    }
  }

  &__description {
    margin: 0 0 $spacing-4;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &__types {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__empty {
    @include flex-column;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-6;
    color: $success;
    font-weight: $font-weight-semibold;

    svg {
      font-size: 48px;
    }
  }
}

.coverage-type {
  opacity: 0.3;
  transition: opacity $transition-fast;

  &--good {
    opacity: 1;
  }

  &--none {
    opacity: 0.15;
  }
}

.weakness-list {
  @include flex-column;
  gap: $spacing-3;
}

.weakness-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: $spacing-3;
  align-items: center;

  &__bar {
    height: 8px;
    background: $gray-200;
    border-radius: $radius-full;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: $error;
    border-radius: $radius-full;
    transition: width 0.5s ease-out;
  }

  &__count {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: $text-secondary;
    min-width: 40px;
    text-align: right;
  }
}

.modal-overlay {
  @include overlay(rgba(0, 0, 0, 0.7), $z-index-modal);
  @include flex-center;
  padding: $spacing-4;
}

.modal {
  @include flex-column;
  gap: $spacing-4;
  width: 100%;
  max-width: 500px;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-2xl;

  &--wide {
    max-width: 700px;
  }

  &__title {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__input {
    padding: $spacing-3;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    outline: none;

    &:focus {
      border-color: $primary;
    }
  }

  &__actions {
    @include flex-center;
    justify-content: flex-end;
    gap: $spacing-2;
  }

  &__btn {
    @include reset-button;
    padding: $spacing-3 $spacing-5;
    background: $gray-100;
    color: $text-primary;
    border-radius: $radius-lg;
    font-weight: $font-weight-semibold;
    transition: all $transition-fast;

    &:hover {
      background: $gray-200;
    }

    &--primary {
      background: $primary;
      color: $white;

      &:hover {
        background: $primary-dark;
      }
    }
  }

  &__empty {
    @include flex-column;
    @include flex-center;
    gap: $spacing-2;
    padding: $spacing-8;
    color: $text-secondary;

    svg {
      font-size: 48px;
    }
  }
}

.saved-teams {
  @include flex-column;
  gap: $spacing-3;
  max-height: 400px;
  overflow-y: auto;
  @include custom-scrollbar(6px, $gray-300, $primary);
}

.saved-team {
  @include flex-between;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $gray-50;
  border: 2px solid $gray-200;
  border-radius: $radius-lg;
  transition: all $transition-fast;

  &:hover {
    border-color: $primary;
  }

  &__info {
    flex: 1;
  }

  &__name {
    margin: 0 0 $spacing-1;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__meta {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  &__actions {
    @include flex-center;
    gap: $spacing-2;
  }

  &__btn {
    @include reset-button;
    @include flex-center;
    width: 36px;
    height: 36px;
    background: $white;
    color: $text-primary;
    border-radius: $radius-full;
    transition: all $transition-fast;

    &:hover {
      background: $primary;
      color: $white;
    }

    &--danger:hover {
      background: $error;
      color: $white;
    }

    svg {
      font-size: 20px;
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
