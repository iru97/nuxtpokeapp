// API Response types
export interface APIResponse<T> {
  data: T | null
  error: Error | null
  pending: boolean
}

// Filters
export interface PokemonFilters {
  search: string
  types: string[]
  generation: number | null
  legendary: boolean | null
  mythical: boolean | null
  sortBy: SortOption
  sortOrder: 'asc' | 'desc'
}

export type SortOption =
  | 'id'
  | 'name'
  | 'height'
  | 'weight'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'

// Pagination
export interface PaginationState {
  page: number
  limit: number
  total: number
  offset: number
}

// Cache
export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheManager {
  get<T>(key: string): T | null
  set<T>(key: string, data: T, ttl?: number): void
  invalidate(key: string): void
  clear(): void
}

// Error handling
export interface APIError {
  message: string
  statusCode?: number
  data?: any
}

// Fetch options
export interface FetchOptions {
  cache?: boolean
  cacheTTL?: number
  retry?: number
  timeout?: number
}
