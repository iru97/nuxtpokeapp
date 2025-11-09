<script setup lang="ts">
/**
 * Pokemon Flavor Texts from Multiple Versions
 * Displays Pokedex entries from all game versions
 */

interface FlavorTextEntry {
  flavor_text: string
  language: {
    name: string
  }
  version: {
    name: string
  }
}

interface Props {
  flavorTextEntries: FlavorTextEntry[]
}

const props = defineProps<Props>()

const selectedLanguage = ref('en')

// Filter to English entries only and group by generation
const englishEntries = computed(() => {
  return props.flavorTextEntries
    .filter(entry => entry.language.name === selectedLanguage.value)
    .map(entry => ({
      ...entry,
      // Clean up text (remove line breaks)
      flavor_text: entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    }))
})

// Generation mapping for game versions
const generationMap: Record<string, number> = {
  'red': 1, 'blue': 1, 'yellow': 1,
  'gold': 2, 'silver': 2, 'crystal': 2,
  'ruby': 3, 'sapphire': 3, 'emerald': 3, 'firered': 3, 'leafgreen': 3,
  'diamond': 4, 'pearl': 4, 'platinum': 4, 'heartgold': 4, 'soulsilver': 4,
  'black': 5, 'white': 5, 'black-2': 5, 'white-2': 5,
  'x': 6, 'y': 6, 'omega-ruby': 6, 'alpha-sapphire': 6,
  'sun': 7, 'moon': 7, 'ultra-sun': 7, 'ultra-moon': 7,
  'sword': 8, 'shield': 8,
  'scarlet': 9, 'violet': 9
}

const groupedByGeneration = computed(() => {
  const groups: Record<number, FlavorTextEntry[]> = {}

  for (const entry of englishEntries.value) {
    const gen = generationMap[entry.version.name] || 0
    if (!groups[gen]) {
      groups[gen] = []
    }
    groups[gen].push(entry)
  }

  return Object.entries(groups)
    .sort(([a], [b]) => Number(b) - Number(a)) // Newest first
    .map(([gen, entries]) => ({ generation: Number(gen), entries }))
})

const expandedGenerations = ref<Set<number>>(new Set([9, 8, 7])) // Expand latest 3 gens by default

const toggleGeneration = (gen: number) => {
  if (expandedGenerations.value.has(gen)) {
    expandedGenerations.value.delete(gen)
  } else {
    expandedGenerations.value.add(gen)
  }
}
</script>

<template>
  <div class="flavor-texts">
    <div class="flavor-texts__header">
      <div>
        <Icon name="mdi:book-open-page-variant" />
        <h3>Pokédex Entries</h3>
      </div>
      <span class="entries-count">{{ englishEntries.length }} entries</span>
    </div>

    <div v-if="groupedByGeneration.length === 0" class="flavor-texts__empty">
      <p>No Pokédex entries available</p>
    </div>

    <div v-else class="flavor-texts__list">
      <div
        v-for="group in groupedByGeneration"
        :key="group.generation"
        class="generation-group"
      >
        <button
          class="generation-header"
          @click="toggleGeneration(group.generation)"
        >
          <div class="generation-title">
            <Icon :name="expandedGenerations.has(group.generation) ? 'mdi:chevron-down' : 'mdi:chevron-right'" />
            <span>Generation {{ group.generation }}</span>
            <span class="badge">{{ group.entries.length }} versions</span>
          </div>
        </button>

        <transition name="expand">
          <div v-if="expandedGenerations.has(group.generation)" class="generation-content">
            <div
              v-for="(entry, index) in group.entries"
              :key="index"
              class="flavor-entry"
            >
              <div class="entry-version">{{ entry.version.name.replace(/-/g, ' ') }}</div>
              <div class="entry-text">{{ entry.flavor_text }}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flavor-texts {
  padding: $spacing-4;
  background: $gray-50;
  border-radius: $radius-lg;
  border: 2px solid $gray-200;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.flavor-texts__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-4;

  > div {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    svg {
      font-size: 24px;
      color: $primary;
    }

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      margin: 0;
    }
  }

  .entries-count {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-semibold;
    padding: 4px $spacing-2;
    background: $gray-200;
    border-radius: $radius-sm;

    @at-root .dark & {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.flavor-texts__empty {
  text-align: center;
  padding: $spacing-6;
  color: $text-secondary;
}

.flavor-texts__list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.generation-group {
  background: $white;
  border-radius: $radius-md;
  overflow: hidden;
  border: 1px solid $gray-200;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.generation-header {
  @include reset-button;
  @include spring-bounce;
  width: 100%;
  padding: $spacing-3 $spacing-4;
  text-align: left;
  cursor: pointer;
  transition: background $transition-base;

  &:hover {
    background: $gray-100;

    @at-root .dark & {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.generation-title {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-weight: $font-weight-semibold;
  font-size: $font-size-base;

  svg {
    font-size: 20px;
    transition: transform $transition-base;
  }

  span:first-of-type {
    text-transform: capitalize;
  }

  .badge {
    margin-left: auto;
    padding: 2px $spacing-2;
    background: $primary;
    color: $white;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
  }
}

.generation-content {
  border-top: 1px solid $gray-200;

  @at-root .dark & {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.flavor-entry {
  padding: $spacing-3 $spacing-4;
  border-bottom: 1px solid $gray-100;

  @at-root .dark & {
    border-color: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
}

.entry-version {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $primary;
  text-transform: capitalize;
  margin-bottom: $spacing-2;
}

.entry-text {
  font-size: $font-size-base;
  line-height: 1.6;
  color: $text-primary;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
