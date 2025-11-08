<script setup lang="ts">
import type { Pokemon } from '~/types'

interface Props {
  pokemon: Pokemon
}

const props = defineProps<Props>()

interface SpriteGroup {
  title: string
  sprites: { label: string; url: string | null }[]
}

const spriteGroups = computed<SpriteGroup[]>(() => {
  const { sprites } = props.pokemon

  return [
    {
      title: 'Default',
      sprites: [
        { label: 'Front', url: sprites.front_default },
        { label: 'Back', url: sprites.back_default },
        { label: 'Front Shiny', url: sprites.front_shiny },
        { label: 'Back Shiny', url: sprites.back_shiny },
      ]
    },
    {
      title: 'Official Artwork',
      sprites: [
        { label: 'Official Art', url: sprites.other?.['official-artwork']?.front_default },
        { label: 'Official Art (Shiny)', url: sprites.other?.['official-artwork']?.front_shiny },
      ]
    },
    {
      title: 'Home',
      sprites: [
        { label: 'Home Front', url: sprites.other?.home?.front_default },
        { label: 'Home Front Shiny', url: sprites.other?.home?.front_shiny },
      ]
    },
    {
      title: 'Dream World',
      sprites: [
        { label: 'Dream World', url: sprites.other?.dream_world?.front_default },
      ]
    },
  ].filter(group => group.sprites.some(s => s.url))
})

const selectedSprite = ref<string | null>(null)

const openLightbox = (url: string) => {
  selectedSprite.value = url
}

const closeLightbox = () => {
  selectedSprite.value = null
}
</script>

<template>
  <div class="pokemon-sprites">
    <div
      v-for="group in spriteGroups"
      :key="group.title"
      class="pokemon-sprites__group"
    >
      <h3 class="pokemon-sprites__group-title">{{ group.title }}</h3>

      <div class="pokemon-sprites__grid">
        <button
          v-for="sprite in group.sprites.filter(s => s.url)"
          :key="sprite.label"
          class="pokemon-sprites__item"
          @click="openLightbox(sprite.url!)"
        >
          <div class="pokemon-sprites__image-container">
            <img
              :src="sprite.url!"
              :alt="sprite.label"
              class="pokemon-sprites__image"
              loading="lazy"
            />
          </div>
          <span class="pokemon-sprites__label">{{ sprite.label }}</span>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <Transition name="fade">
      <div
        v-if="selectedSprite"
        class="pokemon-sprites__lightbox"
        @click="closeLightbox"
      >
        <button class="pokemon-sprites__lightbox-close" @click="closeLightbox">
          <Icon name="mdi:close" />
        </button>
        <img
          :src="selectedSprite"
          alt="Enlarged sprite"
          class="pokemon-sprites__lightbox-image"
          @click.stop
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.pokemon-sprites {
  @include flex-column;
  gap: $spacing-8;
  padding: $spacing-6;
  background: $white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;

  &__group {
    @include flex-column;
    gap: $spacing-4;
  }

  &__group-title {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    font-family: $font-family-secondary;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: $spacing-4;
  }

  &__item {
    @include reset-button;
    @include flex-column;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-3;
    background: $gray-50;
    border: 2px solid $gray-200;
    border-radius: $radius-lg;
    transition: all $transition-base;
    cursor: pointer;

    &:hover {
      border-color: $primary;
      box-shadow: $shadow-md;
      transform: translateY(-4px);

      .pokemon-sprites__image {
        transform: scale(1.1);
      }
    }
  }

  &__image-container {
    @include flex-center;
    width: 100%;
    height: 120px;
    background: radial-gradient(circle, $white 0%, $gray-100 100%);
    border-radius: $radius-md;
  }

  &__image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform $transition-base;
    image-rendering: pixelated;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-align: center;
  }

  &__lightbox {
    @include overlay(rgba(0, 0, 0, 0.9), $z-index-modal);
    @include flex-center;
    padding: $spacing-4;
    cursor: pointer;
  }

  &__lightbox-close {
    @include reset-button;
    position: absolute;
    top: $spacing-4;
    right: $spacing-4;
    width: 48px;
    height: 48px;
    @include flex-center;
    background: rgba($white, 0.1);
    color: $white;
    border-radius: $radius-full;
    transition: all $transition-fast;
    cursor: pointer;

    &:hover {
      background: rgba($white, 0.2);
      transform: scale(1.1);
    }

    svg {
      font-size: 32px;
    }
  }

  &__lightbox-image {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    image-rendering: auto;
    animation: zoomIn 0.3s ease-out;
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
