/**
 * 3D Card Tilt Effect Composable
 * Creates a realistic 3D tilt effect on hover, mimicking physical Pokemon cards
 */

export const use3DTilt = (options = {}) => {
  const {
    maxTilt = 10, // Maximum tilt angle in degrees
    perspective = 1000, // Perspective distance
    scale = 1.05, // Scale on hover
    speed = 400, // Transition speed in ms
    easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)', // Smooth easing
  } = options

  const cardRef = ref<HTMLElement | null>(null)
  const tiltX = ref(0)
  const tiltY = ref(0)
  const glareX = ref(50)
  const glareY = ref(50)
  const isHovering = ref(false)

  /**
   * Handle mouse move to calculate tilt
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.value) return

    const rect = cardRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate tilt angles
    const rotateX = ((y - centerY) / centerY) * -maxTilt
    const rotateY = ((x - centerX) / centerX) * maxTilt

    tiltX.value = rotateX
    tiltY.value = rotateY

    // Calculate glare position (for future holographic effects)
    glareX.value = (x / rect.width) * 100
    glareY.value = (y / rect.height) * 100

    isHovering.value = true
  }

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = () => {
    isHovering.value = true
  }

  /**
   * Reset tilt on mouse leave
   */
  const handleMouseLeave = () => {
    tiltX.value = 0
    tiltY.value = 0
    glareX.value = 50
    glareY.value = 50
    isHovering.value = false
  }

  /**
   * Computed transform style
   */
  const transformStyle = computed(() => {
    if (!isHovering.value) {
      return {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: `transform ${speed}ms ${easing}`
      }
    }

    return {
      transform: `perspective(${perspective}px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale(${scale})`,
      transition: `transform ${speed}ms ${easing}`
    }
  })

  /**
   * Computed glare style (for holographic overlay)
   */
  const glareStyle = computed(() => ({
    background: `radial-gradient(circle at ${glareX.value}% ${glareY.value}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`,
    opacity: isHovering.value ? 1 : 0,
    transition: `opacity ${speed}ms ${easing}`
  }))

  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    if (import.meta.client) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches

      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        prefersReducedMotion.value = e.matches
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        mediaQuery.addListener(handleChange)
      }

      onUnmounted(() => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange)
        } else {
          mediaQuery.removeListener(handleChange)
        }
      })
    }
  })

  /**
   * Final transform style with reduced motion support
   */
  const finalTransformStyle = computed(() => {
    if (prefersReducedMotion.value) {
      return {
        transform: 'none',
        transition: 'opacity 150ms ease'
      }
    }
    return transformStyle.value
  })

  return {
    cardRef,
    tiltX: readonly(tiltX),
    tiltY: readonly(tiltY),
    glareX: readonly(glareX),
    glareY: readonly(glareY),
    isHovering: readonly(isHovering),
    transformStyle: finalTransformStyle,
    glareStyle,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  }
}
