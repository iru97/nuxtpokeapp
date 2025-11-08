// Core Pokemon Types
export interface Pokemon {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  order: number
  is_default: boolean
  sprites: PokemonSprites
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  moves: PokemonMove[]
  species: NamedAPIResource
  forms: NamedAPIResource[]
  game_indices: GameIndex[]
  held_items: HeldItem[]
  location_area_encounters: string
  past_types: PastType[]
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  front_female: string | null
  front_shiny_female: string | null
  back_default: string | null
  back_shiny: string | null
  back_female: string | null
  back_shiny_female: string | null
  other: {
    dream_world: {
      front_default: string | null
      front_female: string | null
    }
    home: {
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
    'official-artwork': {
      front_default: string | null
      front_shiny: string | null
    }
  }
  versions: any // Simplified - contains sprites for all game versions
}

export interface PokemonType {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStat {
  stat: NamedAPIResource
  effort: number
  base_stat: number
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: NamedAPIResource
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: VersionGroupDetail[]
}

export interface VersionGroupDetail {
  level_learned_at: number
  version_group: NamedAPIResource
  move_learn_method: NamedAPIResource
}

export interface GameIndex {
  game_index: number
  version: NamedAPIResource
}

export interface HeldItem {
  item: NamedAPIResource
  version_details: VersionDetail[]
}

export interface VersionDetail {
  rarity: number
  version: NamedAPIResource
}

export interface PastType {
  generation: NamedAPIResource
  types: PokemonType[]
}

// Pokemon Species
export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: NamedAPIResource
  pokedex_numbers: PokedexNumber[]
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  shape: NamedAPIResource
  evolves_from_species: NamedAPIResource | null
  evolution_chain: {
    url: string
  }
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  names: Name[]
  pal_park_encounters: PalParkEncounter[]
  flavor_text_entries: FlavorTextEntry[]
  form_descriptions: Description[]
  genera: Genus[]
  varieties: PokemonSpeciesVariety[]
}

export interface PokedexNumber {
  entry_number: number
  pokedex: NamedAPIResource
}

export interface Name {
  name: string
  language: NamedAPIResource
}

export interface PalParkEncounter {
  base_score: number
  rate: number
  area: NamedAPIResource
}

export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface Description {
  description: string
  language: NamedAPIResource
}

export interface Genus {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpeciesVariety {
  is_default: boolean
  pokemon: NamedAPIResource
}

// Evolution Chain
export interface EvolutionChain {
  id: number
  baby_trigger_item: NamedAPIResource | null
  chain: ChainLink
}

export interface ChainLink {
  is_baby: boolean
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionDetail {
  item: NamedAPIResource | null
  trigger: NamedAPIResource
  gender: number | null
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  min_level: number | null
  min_happiness: number | null
  min_beauty: number | null
  min_affection: number | null
  needs_overworld_rain: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  relative_physical_stats: number | null
  time_of_day: string
  trade_species: NamedAPIResource | null
  turn_upside_down: boolean
}

// Type
export interface Type {
  id: number
  name: string
  damage_relations: TypeRelations
  past_damage_relations: TypeRelationsPast[]
  game_indices: GameIndex[]
  generation: NamedAPIResource
  move_damage_class: NamedAPIResource | null
  names: Name[]
  pokemon: TypePokemon[]
  moves: NamedAPIResource[]
}

export interface TypeRelations {
  no_damage_to: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  double_damage_from: NamedAPIResource[]
}

export interface TypeRelationsPast {
  generation: NamedAPIResource
  damage_relations: TypeRelations
}

export interface TypePokemon {
  slot: number
  pokemon: NamedAPIResource
}

// Ability
export interface Ability {
  id: number
  name: string
  is_main_series: boolean
  generation: NamedAPIResource
  names: Name[]
  effect_entries: VerboseEffect[]
  effect_changes: AbilityEffectChange[]
  flavor_text_entries: FlavorTextEntry[]
  pokemon: AbilityPokemon[]
}

export interface VerboseEffect {
  effect: string
  short_effect: string
  language: NamedAPIResource
}

export interface AbilityEffectChange {
  effect_entries: Effect[]
  version_group: NamedAPIResource
}

export interface Effect {
  effect: string
  language: NamedAPIResource
}

export interface AbilityPokemon {
  is_hidden: boolean
  slot: number
  pokemon: NamedAPIResource
}

// Move
export interface Move {
  id: number
  name: string
  accuracy: number | null
  effect_chance: number | null
  pp: number | null
  priority: number
  power: number | null
  contest_combos: ContestComboSets | null
  contest_type: NamedAPIResource | null
  contest_effect: APIResource | null
  damage_class: NamedAPIResource
  effect_entries: VerboseEffect[]
  effect_changes: MoveEffectChange[]
  learned_by_pokemon: NamedAPIResource[]
  flavor_text_entries: FlavorTextEntry[]
  generation: NamedAPIResource
  machines: MachineVersionDetail[]
  meta: MoveMetaData | null
  names: Name[]
  past_values: PastMoveStatValues[]
  stat_changes: MoveStatChange[]
  super_contest_effect: APIResource | null
  target: NamedAPIResource
  type: NamedAPIResource
}

export interface ContestComboSets {
  normal: ContestComboDetail
  super: ContestComboDetail
}

export interface ContestComboDetail {
  use_before: NamedAPIResource[] | null
  use_after: NamedAPIResource[] | null
}

export interface MoveEffectChange {
  effect_entries: Effect[]
  version_group: NamedAPIResource
}

export interface MachineVersionDetail {
  machine: APIResource
  version_group: NamedAPIResource
}

export interface MoveMetaData {
  ailment: NamedAPIResource
  category: NamedAPIResource
  min_hits: number | null
  max_hits: number | null
  min_turns: number | null
  max_turns: number | null
  drain: number
  healing: number
  crit_rate: number
  ailment_chance: number
  flinch_chance: number
  stat_chance: number
}

export interface PastMoveStatValues {
  accuracy: number | null
  effect_chance: number | null
  power: number | null
  pp: number | null
  effect_entries: VerboseEffect[]
  type: NamedAPIResource | null
  version_group: NamedAPIResource
}

export interface MoveStatChange {
  change: number
  stat: NamedAPIResource
}

// Common Resource Types
export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

// Pagination
export interface NamedAPIResourceList {
  count: number
  next: string | null
  previous: string | null
  results: NamedAPIResource[]
}

// Generation
export interface Generation {
  id: number
  name: string
  abilities: NamedAPIResource[]
  names: Name[]
  main_region: NamedAPIResource
  moves: NamedAPIResource[]
  pokemon_species: NamedAPIResource[]
  types: NamedAPIResource[]
  version_groups: NamedAPIResource[]
}
