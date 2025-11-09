import { defineStore } from 'pinia'
import type { Pokemon } from '~/types'

interface TeamPokemon {
  pokemon: Pokemon
  slot: number
  nickname?: string
}

interface Team {
  id: string
  name: string
  pokemon: TeamPokemon[]
  createdAt: number
  updatedAt: number
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    currentTeam: [] as TeamPokemon[],
    savedTeams: [] as Team[],
    maxTeamSize: 6,
    currentTeamName: 'My Team',
  }),

  getters: {
    /**
     * Get current team Pokemon
     */
    getTeam: (state) => state.currentTeam,

    /**
     * Get team size
     */
    teamSize: (state) => state.currentTeam.length,

    /**
     * Check if team is full
     */
    isFull: (state) => state.currentTeam.length >= state.maxTeamSize,

    /**
     * Check if Pokemon is in team
     */
    isInTeam: (state) => (pokemonId: number) => {
      return state.currentTeam.some(tp => tp.pokemon.id === pokemonId)
    },

    /**
     * Get all team types (unique)
     */
    teamTypes: (state) => {
      const types = new Set<string>()
      state.currentTeam.forEach(tp => {
        tp.pokemon.types.forEach(t => types.add(t.type.name))
      })
      return Array.from(types)
    },

    /**
     * Get all saved teams
     */
    getSavedTeams: (state) => state.savedTeams,

    /**
     * Get saved team count
     */
    savedTeamsCount: (state) => state.savedTeams.length,
  },

  actions: {
    /**
     * Add Pokemon to team
     */
    addPokemon(pokemon: Pokemon, nickname?: string) {
      if (this.isFull) {
        console.warn('Team is full. Maximum 6 Pokemon allowed.')
        return false
      }

      if (this.isInTeam(pokemon.id)) {
        console.warn(`${pokemon.name} is already in the team`)
        return false
      }

      const slot = this.currentTeam.length

      this.currentTeam.push({
        pokemon,
        slot,
        nickname,
      })

      this.persistToLocalStorage()
      return true
    },

    /**
     * Remove Pokemon from team by slot
     */
    removePokemon(slot: number) {
      const index = this.currentTeam.findIndex(tp => tp.slot === slot)
      if (index !== -1) {
        this.currentTeam.splice(index, 1)
        // Reorder slots
        this.currentTeam.forEach((tp, idx) => {
          tp.slot = idx
        })
        this.persistToLocalStorage()
        return true
      }
      return false
    },

    /**
     * Clear current team
     */
    clearTeam() {
      this.currentTeam = []
      this.currentTeamName = 'My Team'
      this.persistToLocalStorage()
    },

    /**
     * Update Pokemon nickname
     */
    updateNickname(slot: number, nickname: string) {
      const teamPokemon = this.currentTeam.find(tp => tp.slot === slot)
      if (teamPokemon) {
        teamPokemon.nickname = nickname
        this.persistToLocalStorage()
        return true
      }
      return false
    },

    /**
     * Save current team
     */
    saveTeam(name?: string) {
      if (this.currentTeam.length === 0) {
        console.warn('Cannot save empty team')
        return false
      }

      const teamName = name || this.currentTeamName || 'Unnamed Team'

      const team: Team = {
        id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: teamName,
        pokemon: [...this.currentTeam],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      this.savedTeams.push(team)
      this.persistToLocalStorage()
      return true
    },

    /**
     * Load a saved team
     */
    loadTeam(teamId: string) {
      const team = this.savedTeams.find(t => t.id === teamId)
      if (team) {
        this.currentTeam = [...team.pokemon]
        this.currentTeamName = team.name
        this.persistToLocalStorage()
        return true
      }
      return false
    },

    /**
     * Delete a saved team
     */
    deleteTeam(teamId: string) {
      const index = this.savedTeams.findIndex(t => t.id === teamId)
      if (index !== -1) {
        this.savedTeams.splice(index, 1)
        this.persistToLocalStorage()
        return true
      }
      return false
    },

    /**
     * Update team name
     */
    updateTeamName(name: string) {
      this.currentTeamName = name
      this.persistToLocalStorage()
    },

    /**
     * Export team to JSON
     */
    exportTeam() {
      const data = {
        name: this.currentTeamName,
        pokemon: this.currentTeam.map(tp => ({
          id: tp.pokemon.id,
          name: tp.pokemon.name,
          nickname: tp.nickname,
          slot: tp.slot,
        })),
        exportedAt: new Date().toISOString(),
      }
      return JSON.stringify(data, null, 2)
    },

    /**
     * Import team from JSON
     */
    async importTeam(jsonData: string): Promise<boolean> {
      try {
        const data = JSON.parse(jsonData)

        // Clear current team
        this.currentTeam = []

        // Load Pokemon data
        for (const p of data.pokemon) {
          try {
            const pokemon = await $fetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${p.id}`)
            this.currentTeam.push({
              pokemon,
              slot: p.slot,
              nickname: p.nickname,
            })
          } catch (err) {
            console.error(`Failed to load Pokemon ${p.id}:`, err)
          }
        }

        this.currentTeamName = data.name || 'Imported Team'
        this.persistToLocalStorage()
        return true
      } catch (err) {
        console.error('Failed to import team:', err)
        return false
      }
    },

    /**
     * Persist to localStorage
     */
    persistToLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nuxt-pokemon-teams', JSON.stringify({
            currentTeam: this.currentTeam,
            currentTeamName: this.currentTeamName,
            savedTeams: this.savedTeams,
          }))
        } catch (err) {
          console.error('Failed to persist teams to localStorage:', err)
        }
      }
    },

    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('nuxt-pokemon-teams')
          if (stored) {
            const data = JSON.parse(stored)
            this.currentTeam = data.currentTeam || []
            this.currentTeamName = data.currentTeamName || 'My Team'
            this.savedTeams = data.savedTeams || []
          }
        } catch (err) {
          console.error('Failed to load teams from localStorage:', err)
        }
      }
    },

    /**
     * Initialize store
     */
    init() {
      this.loadFromLocalStorage()
    },
  },
})
