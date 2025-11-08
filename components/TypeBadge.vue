<script setup lang="ts">
import { TYPE_COLORS } from '~/constants/pokemon'

interface Props {
  type: string
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  clickable: false
})

const emit = defineEmits<{
  click: [type: string]
}>()

const typeColor = computed(() => TYPE_COLORS[props.type.toLowerCase()] || TYPE_COLORS.normal)

const sizeClasses = {
  sm: 'type-badge--sm',
  md: 'type-badge--md',
  lg: 'type-badge--lg'
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.type)
  }
}
</script>

<template>
  <span
    class="type-badge"
    :class="[sizeClasses[size], { 'type-badge--clickable': clickable }]"
    :style="{ backgroundColor: typeColor }"
    @click="handleClick"
  >
    {{ type }}
  </span>
</template>

<style scoped lang="scss">
.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-1 $spacing-3;
  border-radius: $radius-full;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: $white;
  box-shadow: $shadow-sm;
  transition: all $transition-fast;
  user-select: none;

  &--sm {
    padding: $spacing-1 $spacing-2;
    font-size: $font-size-xs;
  }

  &--md {
    padding: $spacing-1 $spacing-3;
    font-size: $font-size-xs;
  }

  &--lg {
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
      filter: brightness(1.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
</style>
