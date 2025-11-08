<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__content">
      <Icon
        v-if="icon"
        :name="icon"
        class="empty-state__icon"
      />
      <h3 class="empty-state__title">{{ title }}</h3>
      <p v-if="description" class="empty-state__description">
        {{ description }}
      </p>
      <button
        v-if="actionText"
        class="empty-state__action"
        @click="emit('action')"
      >
        <Icon v-if="actionIcon" :name="actionIcon" />
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  @include flex-center;
  padding: $spacing-12 $spacing-4;
  min-height: 400px;

  &__content {
    @include flex-center;
    @include flex-column;
    gap: $spacing-4;
    max-width: 400px;
    text-align: center;
  }

  &__icon {
    font-size: 64px;
    color: $gray-400;
    opacity: 0.5;
  }

  &__title {
    margin: 0;
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  &__description {
    margin: 0;
    font-size: $font-size-base;
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }

  &__action {
    @include flex-center;
    gap: $spacing-2;
    margin-top: $spacing-2;
    padding: $button-padding-md;
    background-color: $primary;
    color: $white;
    border: none;
    border-radius: $button-border-radius;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background-color: $primary-dark;
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
