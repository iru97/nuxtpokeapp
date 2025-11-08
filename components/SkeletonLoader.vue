<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  borderRadius?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  borderRadius: '4px',
  variant: 'rectangular'
})

const variantStyles = computed(() => {
  if (props.variant === 'circular') {
    return {
      width: props.height,
      height: props.height,
      borderRadius: '50%'
    }
  }
  if (props.variant === 'text') {
    return {
      width: props.width,
      height: '1em',
      borderRadius: '4px'
    }
  }
  return {
    width: props.width,
    height: props.height,
    borderRadius: props.borderRadius
  }
})
</script>

<template>
  <div
    class="skeleton-loader"
    :style="variantStyles"
  />
</template>

<style scoped lang="scss">
.skeleton-loader {
  @include skeleton-loading;
  display: inline-block;
}
</style>
