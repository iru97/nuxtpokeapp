import type { Ability } from '~/types'
import { CACHE_TTL, API_ENDPOINTS } from '~/constants/pokemon'

/**
 * Composable for Ability API operations
 */
export const useAbilityApi = () => {
  const config = useRuntimeConfig()
  const cache = useCache()
  const baseURL = config.public.apiBase as string

  /**
   * Get an ability by ID or name
   */
  const getAbility = async (idOrName: string | number) => {
    const cacheKey = `ability-${idOrName}`
    const cached = cache.get<Ability>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<Ability>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.ABILITY}/${idOrName}`)
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.ABILITY)
    }

    return { data, error, pending }
  }

  /**
   * Get multiple abilities in parallel
   */
  const getAbilitiesBatch = async (ids: (string | number)[]) => {
    try {
      const promises = ids.map(async (id) => {
        const cacheKey = `ability-${id}`
        const cached = cache.get<Ability>(cacheKey)

        if (cached) {
          return cached
        }

        const ability = await $fetch<Ability>(
          `${baseURL}${API_ENDPOINTS.ABILITY}/${id}`
        )
        cache.set(cacheKey, ability, CACHE_TTL.ABILITY)
        return ability
      })

      const results = await Promise.all(promises)
      return { data: results, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    getAbility,
    getAbilitiesBatch,
  }
}
