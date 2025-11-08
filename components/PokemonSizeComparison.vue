<script setup lang="ts">
/**
 * Pokemon Size Comparison Visualizer
 * Compares Pokemon size with human and other references
 */

interface Props {
  height: number // in decimeters
  weight: number // in hectograms
  name: string
  sprite?: string
}

const props = defineProps<Props>()

const HUMAN_HEIGHT = 17 // 1.7 meters = 17 decimeters

const heightInMeters = computed(() => props.height / 10)
const weightInKg = computed(() => props.weight / 10)

const scale = computed(() => {
  // Scale Pokemon relative to human (max 300% to keep visible)
  const ratio = props.height / HUMAN_HEIGHT
  return Math.min(ratio, 3)
})

const comparison = computed(() => {
  const h = heightInMeters.value

  if (h < 0.3) return { text: 'Tiny', color: '#10b981', icon: 'mdi:bug' }
  if (h < 1.0) return { text: 'Small', color: '#3b82f6', icon: 'mdi:emoticon-happy' }
  if (h < 2.0) return { text: 'Medium', color: '#8b5cf6', icon: 'mdi:human' }
  if (h < 5.0) return { text: 'Large', color: '#f59e0b', icon: 'mdi:elephant' }
  if (h < 10.0) return { text: 'Huge', color: '#ef4444', icon: 'mdi:tree' }
  return { text: 'Gigantic', color: '#991b1b', icon: 'mdi:home' }
})

const weightComparison = computed(() => {
  const w = weightInKg.value

  if (w < 10) return 'Lighter than a cat'
  if (w < 50) return 'About the weight of a child'
  if (w < 100) return 'About the weight of an adult human'
  if (w < 500) return 'About the weight of a horse'
  if (w < 1000) return 'About the weight of a car'
  return 'Heavier than a car!'
})

const funFacts = computed(() => {
  const facts = []
  const h = heightInMeters.value
  const w = weightInKg.value

  // Height facts
  if (h > 10) {
    facts.push(`${props.name} is as tall as a 3-story building!`)
  } else if (h > 5) {
    facts.push(`${props.name} is taller than a giraffe!`)
  } else if (h < 0.1) {
    facts.push(`${props.name} could fit in your pocket!`)
  }

  // Weight facts
  if (w > 1000) {
    facts.push(`${props.name} weighs more than a ton!`)
  } else if (w < 0.5) {
    facts.push(`${props.name} is lighter than a smartphone!`)
  }

  // Combinations
  if (h > 5 && w < 50) {
    facts.push(`Despite being tall, ${props.name} is surprisingly light!`)
  } else if (h < 1 && w > 100) {
    facts.push(`Despite being small, ${props.name} is surprisingly heavy!`)
  }

  return facts
})
</script>

<template>
  <div class="size-comparison">
    <div class="size-comparison__header">
      <Icon name="mdi:ruler" />
      <h3>Size Comparison</h3>
    </div>

    <div class="size-comparison__stats">
      <div class="stat-card">
        <Icon name="mdi:human-male-height" />
        <div>
          <div class="stat-value">{{ heightInMeters.toFixed(2) }} m</div>
          <div class="stat-label">Height</div>
        </div>
        <div
          class="stat-badge"
          :style="{ backgroundColor: comparison.color }"
        >
          <Icon :name="comparison.icon" />
          {{ comparison.text }}
        </div>
      </div>

      <div class="stat-card">
        <Icon name="mdi:weight" />
        <div>
          <div class="stat-value">{{ weightInKg.toFixed(1) }} kg</div>
          <div class="stat-label">Weight</div>
        </div>
        <div class="stat-info">
          {{ weightComparison }}
        </div>
      </div>
    </div>

    <!-- Visual Comparison -->
    <div class="visual-comparison">
      <div class="comparison-scene">
        <!-- Human silhouette (reference) -->
        <div class="silhouette human">
          <Icon name="mdi:human" />
          <div class="label">Human (1.7m)</div>
        </div>

        <!-- Pokemon silhouette -->
        <div
          class="silhouette pokemon"
          :style="{
            transform: `scale(${scale})`,
            transformOrigin: 'bottom center'
          }"
        >
          <NuxtImg
            v-if="sprite"
            :src="sprite"
            :alt="name"
            class="pokemon-sprite"
          />
          <Icon v-else name="mdi:pokeball" />
          <div class="label">{{ name }} ({{ heightInMeters.toFixed(1) }}m)</div>
        </div>
      </div>

      <!-- Scale reference -->
      <div class="scale-reference">
        <div class="scale-line" />
        <div class="scale-markers">
          <span>0m</span>
          <span>1m</span>
          <span>2m</span>
          <span>3m</span>
          <span v-if="heightInMeters > 3">{{ Math.ceil(heightInMeters) }}m</span>
        </div>
      </div>
    </div>

    <!-- Fun Facts -->
    <div v-if="funFacts.length > 0" class="fun-facts">
      <div class="fun-facts__header">
        <Icon name="mdi:lightbulb-on" />
        <span>Did you know?</span>
      </div>
      <ul>
        <li v-for="(fact, index) in funFacts" :key="index">{{ fact }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.size-comparison {
  padding: $spacing-4;
  background: $gray-50;
  border-radius: $radius-lg;
  border: 2px solid $gray-200;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.size-comparison__header {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-4;

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

.size-comparison__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-6;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  @at-root .dark & {
    background: $dark-surface;
  }

  > svg {
    font-size: 32px;
    color: $primary;
  }

  > div:nth-child(2) {
    flex: 1;
  }
}

.stat-value {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  font-family: $font-family-mono;
  color: $text-primary;
}

.stat-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  color: $white;
  font-weight: $font-weight-semibold;
  font-size: $font-size-sm;
  white-space: nowrap;

  svg {
    font-size: 16px;
  }
}

.stat-info {
  font-size: $font-size-sm;
  color: $text-secondary;
  font-style: italic;
}

.visual-comparison {
  background: linear-gradient(to bottom, #e0f2fe, #f0f9ff);
  border-radius: $radius-lg;
  padding: $spacing-6 $spacing-4;
  margin-bottom: $spacing-4;

  @at-root .dark & {
    background: linear-gradient(to bottom, rgba(14, 165, 233, 0.1), rgba(56, 189, 248, 0.05));
  }
}

.comparison-scene {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: $spacing-8;
  min-height: 250px;
  position: relative;
}

.silhouette {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  transition: transform 0.5s ease;

  svg {
    font-size: 80px;
    color: rgba(0, 0, 0, 0.3);

    @at-root .dark & {
      color: rgba(255, 255, 255, 0.3);
    }
  }

  .label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    text-align: center;
    background: $white;
    padding: 4px $spacing-2;
    border-radius: $radius-sm;
    white-space: nowrap;

    @at-root .dark & {
      background: $dark-surface;
    }
  }

  &.pokemon {
    .pokemon-sprite {
      width: 80px;
      height: 80px;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
  }
}

.scale-reference {
  margin-top: $spacing-4;
}

.scale-line {
  height: 2px;
  background: linear-gradient(to right, transparent, $gray-400, transparent);
  margin-bottom: $spacing-2;
}

.scale-markers {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-xs;
  color: $text-secondary;
  font-family: $font-family-mono;
}

.fun-facts {
  padding: $spacing-4;
  background: linear-gradient(135deg, rgba($warning, 0.1), rgba($primary, 0.1));
  border-radius: $radius-lg;
  border: 1px solid rgba($warning, 0.3);

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-weight: $font-weight-bold;
    color: $primary;
    margin-bottom: $spacing-3;

    svg {
      font-size: 20px;
      color: $warning;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: $spacing-2 0;
      padding-left: $spacing-4;
      position: relative;
      color: $text-primary;

      &::before {
        content: '✨';
        position: absolute;
        left: 0;
      }

      &:not(:last-child) {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>
