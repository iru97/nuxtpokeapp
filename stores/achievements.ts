/**
 * Achievements Store
 * Gamification system with badges and unlockable achievements
 */

import { defineStore } from 'pinia'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'collection' | 'exploration' | 'team' | 'social' | 'expertise' | 'rare'
  unlocked: boolean
  unlockedDate?: string
  progress: number
  total: number
  hidden?: boolean // Hidden until unlocked
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

interface AchievementsState {
  achievements: Record<string, Achievement>
  stats: {
    pokemonViewed: number
    pokemonCompared: number
    teamsCreated: number
    teamsShared: number
    calculatorUses: number
  }
}

export const useAchievementsStore = defineStore('achievements', {
  state: (): AchievementsState => ({
    achievements: {},
    stats: {
      pokemonViewed: 0,
      pokemonCompared: 0,
      teamsCreated: 0,
      teamsShared: 0,
      calculatorUses: 0
    }
  }),

  getters: {
    /**
     * Get all achievements
     */
    allAchievements(): Achievement[] {
      return Object.values(this.achievements)
    },

    /**
     * Get unlocked achievements
     */
    unlockedAchievements(): Achievement[] {
      return this.allAchievements.filter(a => a.unlocked)
    },

    /**
     * Get locked achievements
     */
    lockedAchievements(): Achievement[] {
      return this.allAchievements.filter(a => !a.unlocked && !a.hidden)
    },

    /**
     * Get achievements by category
     */
    achievementsByCategory: (state) => (category: Achievement['category']): Achievement[] => {
      return Object.values(state.achievements).filter(a => a.category === category)
    },

    /**
     * Total achievements unlocked
     */
    totalUnlocked(): number {
      return this.unlockedAchievements.length
    },

    /**
     * Total achievements available
     */
    totalAvailable(): number {
      return this.allAchievements.length
    },

    /**
     * Completion percentage
     */
    completionPercent(): number {
      if (this.totalAvailable === 0) return 0
      return Math.round((this.totalUnlocked / this.totalAvailable) * 100)
    },

    /**
     * Recent achievements (last 5 unlocked)
     */
    recentAchievements(): Achievement[] {
      return this.unlockedAchievements
        .sort((a, b) => {
          const dateA = new Date(a.unlockedDate || 0).getTime()
          const dateB = new Date(b.unlockedDate || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 5)
    }
  },

  actions: {
    /**
     * Initialize default achievements
     */
    initAchievements() {
      const defaultAchievements: Achievement[] = [
        // COLLECTION
        {
          id: 'first-catch',
          name: 'First Catch',
          description: 'Mark your first Pokemon as owned',
          icon: 'mdi:pokeball',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 1,
          rarity: 'common'
        },
        {
          id: 'collector-10',
          name: 'Rookie Collector',
          description: 'Own 10 Pokemon',
          icon: 'mdi:numeric-10-box',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'common'
        },
        {
          id: 'collector-50',
          name: 'Rising Collector',
          description: 'Own 50 Pokemon',
          icon: 'mdi:numeric-5-box',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 50,
          rarity: 'uncommon'
        },
        {
          id: 'collector-100',
          name: 'Dedicated Collector',
          description: 'Own 100 Pokemon',
          icon: 'mdi:trophy',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 100,
          rarity: 'rare'
        },
        {
          id: 'kanto-master',
          name: 'Kanto Master',
          description: 'Complete the Kanto Pokedex (151/151)',
          icon: 'mdi:trophy-variant',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 151,
          rarity: 'epic'
        },
        {
          id: 'national-dex',
          name: 'National Dex Complete',
          description: 'Catch all 1,025 Pokemon',
          icon: 'mdi:crown',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 1025,
          rarity: 'legendary'
        },
        {
          id: 'shiny-hunter',
          name: 'Shiny Hunter',
          description: 'Own 10 shiny Pokemon',
          icon: 'mdi:star',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'rare'
        },
        {
          id: 'shiny-master',
          name: 'Shiny Master',
          description: 'Own 100 shiny Pokemon',
          icon: 'mdi:star-four-points',
          category: 'collection',
          unlocked: false,
          progress: 0,
          total: 100,
          rarity: 'legendary'
        },

        // EXPLORATION
        {
          id: 'explorer-10',
          name: 'Curious Explorer',
          description: 'View 10 different Pokemon',
          icon: 'mdi:map',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'common'
        },
        {
          id: 'explorer-100',
          name: 'Dedicated Explorer',
          description: 'View 100 different Pokemon',
          icon: 'mdi:map-marker-multiple',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 100,
          rarity: 'uncommon'
        },
        {
          id: 'explorer-500',
          name: 'Master Explorer',
          description: 'View 500 different Pokemon',
          icon: 'mdi:earth',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 500,
          rarity: 'rare'
        },
        {
          id: 'type-expert',
          name: 'Type Expert',
          description: 'View Pokemon of all 18 types',
          icon: 'mdi:shape',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 18,
          rarity: 'uncommon'
        },

        // TEAM BUILDING
        {
          id: 'first-team',
          name: 'Team Player',
          description: 'Create your first team',
          icon: 'mdi:account-group',
          category: 'team',
          unlocked: false,
          progress: 0,
          total: 1,
          rarity: 'common'
        },
        {
          id: 'team-creator-5',
          name: 'Team Strategist',
          description: 'Create 5 different teams',
          icon: 'mdi:account-multiple',
          category: 'team',
          unlocked: false,
          progress: 0,
          total: 5,
          rarity: 'uncommon'
        },
        {
          id: 'team-creator-10',
          name: 'Team Master',
          description: 'Create 10 different teams',
          icon: 'mdi:account-multiple-check',
          category: 'team',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'rare'
        },

        // SOCIAL
        {
          id: 'first-share',
          name: 'Sharing is Caring',
          description: 'Share your first team',
          icon: 'mdi:share-variant',
          category: 'social',
          unlocked: false,
          progress: 0,
          total: 1,
          rarity: 'common'
        },
        {
          id: 'social-butterfly',
          name: 'Social Butterfly',
          description: 'Share 10 teams',
          icon: 'mdi:share-all',
          category: 'social',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'uncommon'
        },

        // EXPERTISE
        {
          id: 'comparator-10',
          name: 'Analyst',
          description: 'Compare 10 Pokemon',
          icon: 'mdi:compare',
          category: 'expertise',
          unlocked: false,
          progress: 0,
          total: 10,
          rarity: 'common'
        },
        {
          id: 'comparator-50',
          name: 'Expert Analyst',
          description: 'Compare 50 Pokemon',
          icon: 'mdi:compare-horizontal',
          category: 'expertise',
          unlocked: false,
          progress: 0,
          total: 50,
          rarity: 'uncommon'
        },
        {
          id: 'calculator-pro',
          name: 'Calculator Pro',
          description: 'Use damage calculator 100 times',
          icon: 'mdi:calculator',
          category: 'expertise',
          unlocked: false,
          progress: 0,
          total: 100,
          rarity: 'rare'
        },

        // RARE
        {
          id: 'legendary-collector',
          name: 'Legendary Collector',
          description: 'Own all Legendary Pokemon',
          icon: 'mdi:fire',
          category: 'rare',
          unlocked: false,
          progress: 0,
          total: 60, // Approximate number of legendaries
          rarity: 'epic',
          hidden: true
        },
        {
          id: 'mythical-collector',
          name: 'Mythical Collector',
          description: 'Own all Mythical Pokemon',
          icon: 'mdi:sparkles',
          category: 'rare',
          unlocked: false,
          progress: 0,
          total: 25, // Approximate number of mythicals
          rarity: 'epic',
          hidden: true
        },
        {
          id: 'daily-streak-7',
          name: 'Week Warrior',
          description: 'Visit the site 7 days in a row',
          icon: 'mdi:calendar-week',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 7,
          rarity: 'uncommon'
        },
        {
          id: 'daily-streak-30',
          name: 'Monthly Master',
          description: 'Visit the site 30 days in a row',
          icon: 'mdi:calendar-month',
          category: 'exploration',
          unlocked: false,
          progress: 0,
          total: 30,
          rarity: 'epic'
        }
      ]

      // Initialize achievements that don't exist yet
      for (const achievement of defaultAchievements) {
        if (!this.achievements[achievement.id]) {
          this.achievements[achievement.id] = achievement
        }
      }

      this.save()
    },

    /**
     * Unlock an achievement
     */
    unlock(id: string) {
      const achievement = this.achievements[id]
      if (!achievement || achievement.unlocked) return

      achievement.unlocked = true
      achievement.unlockedDate = new Date().toISOString()

      this.save()

      // Show toast notification (implement in component)
      return achievement
    },

    /**
     * Update achievement progress
     */
    updateProgress(id: string, progress: number) {
      const achievement = this.achievements[id]
      if (!achievement || achievement.unlocked) return

      achievement.progress = Math.min(progress, achievement.total)

      if (achievement.progress >= achievement.total) {
        this.unlock(id)
      }

      this.save()
    },

    /**
     * Increment achievement progress
     */
    incrementProgress(id: string, amount: number = 1) {
      const achievement = this.achievements[id]
      if (!achievement) return

      this.updateProgress(id, achievement.progress + amount)
    },

    /**
     * Track Pokemon viewed
     */
    trackPokemonViewed() {
      this.stats.pokemonViewed++
      this.updateProgress('explorer-10', this.stats.pokemonViewed)
      this.updateProgress('explorer-100', this.stats.pokemonViewed)
      this.updateProgress('explorer-500', this.stats.pokemonViewed)
      this.save()
    },

    /**
     * Track comparison made
     */
    trackComparison() {
      this.stats.pokemonCompared++
      this.updateProgress('comparator-10', this.stats.pokemonCompared)
      this.updateProgress('comparator-50', this.stats.pokemonCompared)
      this.save()
    },

    /**
     * Track team created
     */
    trackTeamCreated() {
      this.stats.teamsCreated++
      this.updateProgress('first-team', this.stats.teamsCreated)
      this.updateProgress('team-creator-5', this.stats.teamsCreated)
      this.updateProgress('team-creator-10', this.stats.teamsCreated)
      this.save()
    },

    /**
     * Track team shared
     */
    trackTeamShared() {
      this.stats.teamsShared++
      this.updateProgress('first-share', this.stats.teamsShared)
      this.updateProgress('social-butterfly', this.stats.teamsShared)
      this.save()
    },

    /**
     * Track calculator use
     */
    trackCalculatorUse() {
      this.stats.calculatorUses++
      this.updateProgress('calculator-pro', this.stats.calculatorUses)
      this.save()
    },

    /**
     * Check collection achievements
     */
    checkCollectionAchievements(totalOwned: number, totalShinies: number, kantoOwned: number) {
      this.updateProgress('first-catch', totalOwned)
      this.updateProgress('collector-10', totalOwned)
      this.updateProgress('collector-50', totalOwned)
      this.updateProgress('collector-100', totalOwned)
      this.updateProgress('national-dex', totalOwned)
      this.updateProgress('kanto-master', kantoOwned)
      this.updateProgress('shiny-hunter', totalShinies)
      this.updateProgress('shiny-master', totalShinies)
    },

    /**
     * Check daily streak achievements
     */
    checkDailyStreak(streak: number) {
      this.updateProgress('daily-streak-7', streak)
      this.updateProgress('daily-streak-30', streak)
    },

    /**
     * Save to localStorage
     */
    save() {
      if (import.meta.client) {
        localStorage.setItem('pokemon-achievements', JSON.stringify({
          achievements: this.achievements,
          stats: this.stats
        }))
      }
    },

    /**
     * Load from localStorage
     */
    load() {
      if (import.meta.client) {
        const saved = localStorage.getItem('pokemon-achievements')
        if (saved) {
          const data = JSON.parse(saved)
          this.achievements = data.achievements || {}
          this.stats = data.stats || {
            pokemonViewed: 0,
            pokemonCompared: 0,
            teamsCreated: 0,
            teamsShared: 0,
            calculatorUses: 0
          }
        }
      }
    },

    /**
     * Initialize store
     */
    init() {
      this.load()
      this.initAchievements()
    }
  }
})
