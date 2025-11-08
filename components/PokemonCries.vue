<script setup lang="ts">
/**
 * Pokemon Cries Audio Player
 * Plays Pokemon cries with visual feedback
 */

interface Props {
  cries: {
    latest?: string
    legacy?: string
  }
  pokemonName: string
}

const props = defineProps<Props>()

const isPlaying = ref(false)
const currentAudio = ref<HTMLAudioElement | null>(null)
const activeVersion = ref<'latest' | 'legacy'>('latest')

const playSound = (version: 'latest' | 'legacy') => {
  const url = version === 'latest' ? props.cries.latest : props.cries.legacy

  if (!url) {
    console.warn('No audio URL available')
    return
  }

  // Stop current audio if playing
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
  }

  // Create and play new audio
  const audio = new Audio(url)
  currentAudio.value = audio
  activeVersion.value = version
  isPlaying.value = true

  audio.play().catch(error => {
    console.error('Failed to play audio:', error)
    isPlaying.value = false
  })

  audio.onended = () => {
    isPlaying.value = false
  }

  audio.onerror = () => {
    isPlaying.value = false
    console.error('Audio playback error')
  }
}

const stop = () => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    isPlaying.value = false
  }
}

onUnmounted(() => {
  stop()
})
</script>

<template>
  <div class="pokemon-cries">
    <div class="cries__header">
      <Icon name="mdi:volume-high" />
      <h3>Pokémon Cries</h3>
    </div>

    <div class="cries__buttons">
      <button
        v-if="cries.latest"
        class="cry-button"
        :class="{ playing: isPlaying && activeVersion === 'latest' }"
        @click="playSound('latest')"
      >
        <Icon :name="isPlaying && activeVersion === 'latest' ? 'mdi:pause' : 'mdi:play'" />
        <span>Latest Cry</span>
        <span class="badge">Gen 6+</span>
      </button>

      <button
        v-if="cries.legacy"
        class="cry-button"
        :class="{ playing: isPlaying && activeVersion === 'legacy' }"
        @click="playSound('legacy')"
      >
        <Icon :name="isPlaying && activeVersion === 'legacy' ? 'mdi:pause' : 'mdi:play'" />
        <span>Legacy Cry</span>
        <span class="badge">Gen 1-5</span>
      </button>

      <button
        v-if="isPlaying"
        class="cry-button cry-button--stop"
        @click="stop"
      >
        <Icon name="mdi:stop" />
        <span>Stop</span>
      </button>
    </div>

    <div v-if="isPlaying" class="cries__visualizer">
      <div class="wave-bar" v-for="i in 20" :key="i" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pokemon-cries {
  padding: $spacing-4;
  background: $gray-50;
  border-radius: $radius-lg;
  border: 2px solid $gray-200;

  @at-root .dark & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.cries__header {
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

.cries__buttons {
  display: flex;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.cry-button {
  @include reset-button;
  @include spring-bounce;
  @include accessible-focus;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: $white;
  border: 2px solid $gray-300;
  border-radius: $radius-lg;
  font-weight: $font-weight-semibold;
  cursor: pointer;
  transition: all $transition-base;

  @at-root .dark & {
    background: $dark-surface;
    border-color: rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 20px;
  }

  &:hover {
    border-color: $primary;
    background: rgba($primary, 0.05);
  }

  &.playing {
    background: $primary;
    color: $white;
    border-color: $primary;

    .badge {
      background: rgba(255, 255, 255, 0.2);
      color: $white;
    }
  }

  &--stop {
    background: $error;
    color: $white;
    border-color: $error;

    &:hover {
      background: darken($error, 10%);
    }
  }

  .badge {
    padding: 2px $spacing-2;
    background: $gray-200;
    border-radius: $radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.cries__visualizer {
  margin-top: $spacing-4;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 60px;
  justify-content: center;
}

.wave-bar {
  width: 4px;
  background: linear-gradient(to top, $primary, $secondary);
  border-radius: $radius-sm;
  animation: wave 0.8s ease-in-out infinite;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

@keyframes wave {
  0%, 100% {
    height: 20%;
  }
  50% {
    height: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wave-bar {
    animation: none;
    height: 50%;
  }
}
</style>
