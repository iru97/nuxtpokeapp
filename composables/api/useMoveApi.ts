import type { Move } from '~/types'
import { CACHE_TTL, API_ENDPOINTS } from '~/constants/pokemon'

/**
 * Composable for Move API operations
 */
export const useMoveApi = () => {
  const config = useRuntimeConfig()
  const cache = useCache()
  const baseURL = config.public.apiBase as string

  /**
   * Get a move by ID or name
   */
  const getMove = async (idOrName: string | number) => {
    const cacheKey = `move-${idOrName}`
    const cached = cache.get<Move>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<Move>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.MOVE}/${idOrName}`)
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.MOVE)
    }

    return { data, error, pending }
  }

  /**
   * Get multiple moves in parallel
   */
  const getMovesBatch = async (ids: (string | number)[]) => {
    try {
      const promises = ids.map(async (id) => {
        const cacheKey = `move-${id}`
        const cached = cache.get<Move>(cacheKey)

        if (cached) {
          return cached
        }

        const move = await $fetch<Move>(
          `${baseURL}${API_ENDPOINTS.MOVE}/${id}`
        )
        cache.set(cacheKey, move, CACHE_TTL.MOVE)
        return move
      })

      const results = await Promise.all(promises)
      return { data: results, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    getMove,
    getMovesBatch,
  }
}
