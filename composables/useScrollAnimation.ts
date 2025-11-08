/**
 * Scroll Animation Composable
 * Triggers animations when elements scroll into view using Intersection Observer
 */

export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1, // Percentage of element visible before triggering
    rootMargin = '0px', // Margin around root
    once = true, // Trigger only once
  } = options

  const elementRef = ref<HTMLElement | null>(null)
  const isVisible = ref(false)
  const hasAnimated = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value || !import.meta.client) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          hasAnimated.value = true

          // Disconnect if once is true
          if (once && observer) {
            observer.disconnect()
          }
        } else if (!once) {
          isVisible.value = false
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    elementRef,
    isVisible: readonly(isVisible),
    hasAnimated: readonly(hasAnimated),
  }
}
