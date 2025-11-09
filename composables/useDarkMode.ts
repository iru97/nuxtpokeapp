/**
 * Dark Mode Composable
 * Manages theme switching with system preference detection and localStorage persistence
 */

export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)
  const isInitialized = useState('darkModeInitialized', () => false)

  /**
   * Toggle between light and dark mode
   */
  const toggleDark = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    persistTheme(isDark.value)
  }

  /**
   * Set dark mode explicitly
   */
  const setDark = (dark: boolean) => {
    isDark.value = dark
    applyTheme(dark)
    persistTheme(dark)
  }

  /**
   * Apply theme to document
   */
  const applyTheme = (dark: boolean) => {
    if (import.meta.client) {
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  /**
   * Persist theme preference to localStorage
   */
  const persistTheme = (dark: boolean) => {
    if (import.meta.client) {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    }
  }

  /**
   * Initialize dark mode based on saved preference or system preference
   */
  const initDarkMode = () => {
    if (import.meta.client && !isInitialized.value) {
      const saved = localStorage.getItem('theme')

      if (saved) {
        // Use saved preference
        isDark.value = saved === 'dark'
      } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDark.value = prefersDark
      }

      applyTheme(isDark.value)
      isInitialized.value = true

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        // Only auto-switch if user hasn't manually set preference
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches
          applyTheme(e.matches)
        }
      }

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Legacy browsers
        mediaQuery.addListener(handleChange)
      }
    }
  }

  /**
   * Clear saved preference and revert to system preference
   */
  const clearPreference = () => {
    if (import.meta.client) {
      localStorage.removeItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
      applyTheme(prefersDark)
    }
  }

  return {
    isDark: readonly(isDark),
    isInitialized: readonly(isInitialized),
    toggleDark,
    setDark,
    initDarkMode,
    clearPreference
  }
}
