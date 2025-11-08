/**
 * Parallax Effect Composable
 * Creates depth by moving elements at different speeds based on scroll position
 */

export const useParallax = (options = {}) => {
  const {
    speed = 0.5, // Parallax speed multiplier (0.5 = half speed)
    direction = 'vertical', // 'vertical' or 'horizontal'
    offset = 0, // Initial offset
  } = options

  const parallaxOffset = ref(offset)
  const prefersReducedMotion = ref(false)

  const handleScroll = () => {
    if (prefersReducedMotion.value) {
      parallaxOffset.value = 0
      return
    }

    if (direction === 'vertical') {
      parallaxOffset.value = window.scrollY * speed
    } else {
      parallaxOffset.value = window.scrollX * speed
    }
  }

  const parallaxStyle = computed(() => {
    if (prefersReducedMotion.value) {
      return {}
    }

    if (direction === 'vertical') {
      return {
        transform: `translateY(${parallaxOffset.value}px)`,
        willChange: 'transform',
      }
    } else {
      return {
        transform: `translateX(${parallaxOffset.value}px)`,
        willChange: 'transform',
      }
    }
  })

  onMounted(() => {
    if (!import.meta.client) return

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Initial calculation
    handleScroll()

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    })
  })

  return {
    parallaxOffset: readonly(parallaxOffset),
    parallaxStyle,
  }
}
