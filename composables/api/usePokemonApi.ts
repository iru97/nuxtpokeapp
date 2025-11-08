import type {
  Pokemon,
  PokemonSpecies,
  EvolutionChain,
  NamedAPIResourceList,
} from '~/types'
import { CACHE_TTL, API_ENDPOINTS } from '~/constants/pokemon'

/**
 * Composable for Pokemon API operations
 */
export const usePokemonApi = () => {
  const config = useRuntimeConfig()
  const cache = useCache()
  const baseURL = config.public.apiBase as string

  /**
   * Get a single Pokemon by ID or name
   */
  const getPokemon = async (idOrName: string | number) => {
    const cacheKey = `pokemon-${idOrName}`
    const cached = cache.get<Pokemon>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<Pokemon>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.POKEMON}/${idOrName}`)
    )

    // Cache successful response
    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.POKEMON)
    }

    return { data, error, pending }
  }

  /**
   * Get Pokemon list with pagination
   */
  const getPokemonList = async (limit: number = 25, offset: number = 0) => {
    const cacheKey = `pokemon-list-${limit}-${offset}`
    const cached = cache.get<NamedAPIResourceList>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<NamedAPIResourceList>(
      cacheKey,
      () =>
        $fetch(`${baseURL}${API_ENDPOINTS.POKEMON}`, {
          params: { limit, offset },
        })
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.POKEMON_LIST)
    }

    return { data, error, pending }
  }

  /**
   * Get multiple Pokemon in parallel
   */
  const getPokemonBatch = async (ids: (string | number)[]) => {
    try {
      const promises = ids.map(async (id) => {
        const cacheKey = `pokemon-${id}`
        const cached = cache.get<Pokemon>(cacheKey)

        if (cached) {
          return cached
        }

        const pokemon = await $fetch<Pokemon>(
          `${baseURL}${API_ENDPOINTS.POKEMON}/${id}`
        )
        cache.set(cacheKey, pokemon, CACHE_TTL.POKEMON)
        return pokemon
      })

      const results = await Promise.all(promises)
      return { data: results, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get Pokemon species data
   */
  const getPokemonSpecies = async (idOrName: string | number) => {
    const cacheKey = `species-${idOrName}`
    const cached = cache.get<PokemonSpecies>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<PokemonSpecies>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.POKEMON_SPECIES}/${idOrName}`)
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.SPECIES)
    }

    return { data, error, pending }
  }

  /**
   * Get evolution chain
   */
  const getEvolutionChain = async (id: number) => {
    const cacheKey = `evolution-${id}`
    const cached = cache.get<EvolutionChain>(cacheKey)

    if (cached) {
      return { data: ref(cached), error: ref(null), pending: ref(false) }
    }

    const { data, error, pending } = await useAsyncData<EvolutionChain>(
      cacheKey,
      () => $fetch(`${baseURL}${API_ENDPOINTS.EVOLUTION_CHAIN}/${id}`)
    )

    if (data.value && !error.value) {
      cache.set(cacheKey, data.value, CACHE_TTL.EVOLUTION)
    }

    return { data, error, pending }
  }

  /**
   * Get complete Pokemon data (pokemon + species)
   */
  const getPokemonComplete = async (idOrName: string | number) => {
    const { data: pokemon, error: pokemonError } = await getPokemon(idOrName)

    if (pokemonError.value || !pokemon.value) {
      return {
        pokemon: null,
        species: null,
        error: pokemonError.value,
      }
    }

    const { data: species, error: speciesError } = await getPokemonSpecies(
      idOrName
    )

    return {
      pokemon: pokemon.value,
      species: species.value,
      error: speciesError.value,
    }
  }

  /**
   * Search Pokemon by name (fuzzy search)
   */
  const searchPokemon = async (query: string, limit: number = 20) => {
    if (!query || query.length < 2) {
      return { data: [], error: null }
    }

    try {
      // Get all pokemon (we'll filter client-side for now)
      // In production, you'd want a proper search API or use a search library
      const { data } = await getPokemonList(2000, 0)

      if (!data.value) {
        return { data: [], error: null }
      }

      const filtered = data.value.results
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)

      return { data: filtered, error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Invalidate cache for a Pokemon
   */
  const invalidatePokemonCache = (idOrName: string | number) => {
    cache.invalidate(`pokemon-${idOrName}`)
    cache.invalidate(`species-${idOrName}`)
  }

  /**
   * Clear all Pokemon cache
   */
  const clearCache = () => {
    cache.clear()
  }

  return {
    getPokemon,
    getPokemonList,
    getPokemonBatch,
    getPokemonSpecies,
    getEvolutionChain,
    getPokemonComplete,
    searchPokemon,
    invalidatePokemonCache,
    clearCache,
  }
}
