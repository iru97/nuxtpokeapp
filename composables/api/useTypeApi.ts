import type { Type } from '~/types'
import { CACHE_TTL, API_ENDPOINTS } from '~/constants/pokemon'

/**
 * Composable for Type API operations
 */
export const useTypeApi = () => {
  const config = useRuntimeConfig()
  const cache = useCache()
  const baseURL = config.public.apiBase as string

  /**
   * Get a type by ID or name
   */
  const getType = async (idOrName: string | number) => {
    const cacheKey = `type-${idOrName}`
    const cached = cache.get<Type>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<Type>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.TYPE}/${idOrName}`)
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.TYPE)
    }

    return { data, error, pending }
  }

  /**
   * Get all types
   */
  const getAllTypes = async () => {
    const cacheKey = 'all-types'
    const cached = cache.get(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.TYPE}`, {
        params: { limit: 100 }
      })
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.TYPE)
    }

    return { data, error, pending }
  }

  /**
   * Get type effectiveness (damage relations)
   */
  const getTypeEffectiveness = async (typeNames: string[]) => {
    try {
      const types = await Promise.all(
        typeNames.map(async (name) => {
          const { data } = await getType(name)
          return data.value
        })
      )

      // Calculate combined effectiveness
      const effectiveness = {
        doubleDamageTo: [] as string[],
        halfDamageTo: [] as string[],
        noDamageTo: [] as string[],
        doubleDamageFrom: [] as string[],
        halfDamageFrom: [] as string[],
        noDamageFrom: [] as string[],
      }

      types.forEach((type) => {
        if (!type) return

        effectiveness.doubleDamageTo.push(
          ...type.damage_relations.double_damage_to.map((t) => t.name)
        )
        effectiveness.halfDamageTo.push(
          ...type.damage_relations.half_damage_to.map((t) => t.name)
        )
        effectiveness.noDamageTo.push(
          ...type.damage_relations.no_damage_to.map((t) => t.name)
        )
        effectiveness.doubleDamageFrom.push(
          ...type.damage_relations.double_damage_from.map((t) => t.name)
        )
        effectiveness.halfDamageFrom.push(
          ...type.damage_relations.half_damage_from.map((t) => t.name)
        )
        effectiveness.noDamageFrom.push(
          ...type.damage_relations.no_damage_from.map((t) => t.name)
        )
      })

      // Remove duplicates
      Object.keys(effectiveness).forEach((key) => {
        effectiveness[key as keyof typeof effectiveness] = [
          ...new Set(effectiveness[key as keyof typeof effectiveness]),
        ]
      })

      return { data: effectiveness, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    getType,
    getAllTypes,
    getTypeEffectiveness,
  }
}
