# 🎮 PokéApp - Complete Pokédex Application

A comprehensive, modern Pokémon application built with **Nuxt 3**, **TypeScript**, and **Pinia**. Explore, compare, and build teams with over 1,025 Pokémon across 9 generations.

![Nuxt 3](https://img.shields.io/badge/Nuxt-3.20.1-00DC82?style=flat&logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vue.js)
![Pinia](https://img.shields.io/badge/Pinia-State%20Management-FFD859?style=flat&logo=pinia)

---

## ✨ Features

### 🔍 **Exploration & Search**
- **Complete Pokédex** - Browse all 1,025+ Pokémon with infinite scroll
- **Advanced Search** - Filter by name, type, stats, generation, height, weight
- **Generations** - Explore 9 generations from Kanto to Paldea
- **Statistics Dashboard** - View insights, records, and type distributions
- **Pokemon Detail Pages** - Comprehensive information with stats, abilities, moves, evolution chains

### 💾 **Data Management**
- **Favorites System** - Save your favorite Pokémon with collections
- **Team Builder** - Create teams of up to 6 Pokémon with type coverage analysis
- **Pokemon Comparison** - Compare up to 3 Pokémon side-by-side
- **Export/Import** - Share favorites and teams via JSON

### 🎨 **Visualization**
- **Shiny Pokémon** - Toggle between normal and shiny sprites
- **Type Effectiveness** - Complete type matchup matrices
- **Stats Visualization** - Progress bars, radar charts, and rankings
- **Sprites Gallery** - View all available sprites with lightbox

### 📱 **User Experience**
- **Responsive Design** - Mobile-first approach, works on all devices
- **Dark Mode** - Complete dark/light theme system with toggle and system preference detection
- **SSR & SEO** - Server-side rendering with optimized meta tags
- **Persistent State** - LocalStorage for favorites, teams, and comparisons
- **Loading States** - Enhanced skeleton loaders with shimmer effects
- **Scroll Animations** - Smooth fade-in animations on scroll
- **3D Card Effects** - Realistic tilt effects on Pokemon cards
- **Parallax Backgrounds** - Subtle depth effects on hero sections
- **Accessibility** - WCAG AA compliant with full keyboard navigation and screen reader support
- **Reduced Motion** - Respects user motion preferences for accessibility

### 🎯 **NEW: Competitive & Collection Features**

#### **Competitive Tools**
- **⚔️ Damage Calculator** - Complete Gen 9 damage calculator with:
  - Pokemon vs Pokemon battle simulation
  - Move selection with power/accuracy display
  - Battle conditions (Weather, Terrain, Screens, Burn, Critical Hits)
  - Stage modifiers (-6 to +6)
  - Damage range with KO probability
  - STAB, type effectiveness, and all damage formula modifiers
  - Real-time calculation results

- **📊 Stat Calculator** - Advanced stat calculations:
  - IV/EV calculations with nature modifiers
  - Stat range calculator (min/max with perfect/zero IVs)
  - All 25 Pokemon natures supported
  - EV spread validator (max 510 total, 252 per stat)

- **🧬 Breeding Calculator** - Breeding probability system:
  - IV inheritance calculations (Destiny Knot, Power Items)
  - Shiny probability (Masuda Method, Shiny Charm)
  - Egg group compatibility checker
  - Breeding path recommendations
  - Hatch step calculator (Flame Body effect)

#### **Collection System**
- **✅ Pokédex Checklist** - Complete collection tracker:
  - National Dex progress (1,025 Pokémon)
  - 9 Generation-specific checklists (Kanto through Paldea)
  - Shiny Dex tracking
  - Interactive grid (click to mark owned/shiny)
  - Filter by All/Caught/Missing
  - Daily visit streak tracking
  - Completion percentages
  - Export/Import collection data

- **🏆 Achievement System** - Gamification with 25+ badges:
  - **Collection Achievements** - First Catch, Kanto Master, National Dex Complete
  - **Exploration Achievements** - View milestones, Type Expert, Daily Streaks
  - **Team Building** - Team creator milestones
  - **Social** - Sharing achievements
  - **Expertise** - Calculator and comparison usage
  - **Rare** - Hidden legendary/mythical collector achievements
  - Progress tracking with rarity tiers (Common → Legendary)
  - Auto-unlock on completion

#### **Encyclopedia Features**
- **🎵 Pokémon Cries** - Audio playback system:
  - Latest cry (Gen 6+)
  - Legacy cry (Gen 1-5)
  - Visual waveform animation
  - Play/pause/stop controls
  - Audio error handling

- **📖 Multiple Flavor Texts** - Complete Pokédex entries:
  - Flavor texts from ALL game versions
  - Grouped by generation (Gen 1-9)
  - Expandable sections per generation
  - Version-specific badges
  - Entry count display

- **📏 Size Comparison** - Visual size visualizer:
  - Compare with human reference (1.7m)
  - Size categories (Tiny → Gigantic)
  - Weight comparisons with real objects
  - Fun facts based on size/weight
  - Scale markers and visual silhouettes

#### **Database & Reference**
- **⚔️ Move Database** - Complete move reference:
  - 900+ moves with full stats
  - Search and filter by type/category
  - Power, Accuracy, PP, and effects
  - Damage class indicators (Physical/Special/Status)
  - Move effect descriptions

#### **Fun & Engagement**
- **🎲 Random Generators** - Multiple random tools:
  - Single Random Pokémon generator
  - Random Team Generator (1-6 Pokémon)
  - Random Challenge Generator:
    - Monotype challenges
    - Generation-specific runs
    - Nuzlocke rules
    - Stat-limited challenges
  - Quick generator buttons
  - Copy team to clipboard
  - Visual challenge badges

---

## 🎨 **Modern Design System**

### Design Features (2024-2025)
- **✅ Glassmorphism** - Frosted glass effects on cards and modals
- **✅ Bento Grid Layouts** - Modern asymmetric grid for featured content
- **✅ Fluid Typography** - Responsive font sizing across all screen sizes
- **✅ 3D Interactions** - Card tilt effects mimicking physical Pokemon cards
- **✅ Micro-interactions** - Spring-bounce animations with tactile feedback
- **✅ Scroll Animations** - Intersection Observer-based reveal animations
- **✅ Parallax Effects** - Depth perception with scroll-based movement
- **✅ Dark Mode** - System-aware theme with localStorage persistence

### Accessibility Features
- **WCAG AA Compliant** - Proper contrast ratios and focus indicators
- **ARIA Labels** - Complete semantic markup for screen readers
- **Keyboard Navigation** - Full app navigation without mouse
- **Reduced Motion** - Respects `prefers-reduced-motion` media query
- **Focus Management** - Visible focus states on all interactive elements
- **Screen Reader Support** - Descriptive labels and roles throughout

### Performance Optimizations
- **Passive Scroll Listeners** - Better scroll performance
- **GPU-Accelerated Transforms** - Smooth 3D animations
- **Intersection Observer** - Efficient scroll-triggered animations
- **Once-Only Animations** - Trigger animations only once for better performance
- **Image Optimization** - Lazy loading with NuxtImg
- **Code Splitting** - Dynamic imports for optimal bundle size

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nuxtpokeapp

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📂 Project Structure

```
nuxtpokeapp/
├── assets/
│   └── styles/              # SCSS design system
│       ├── variables.scss   # Design tokens
│       └── mixins.scss      # Reusable SCSS utilities
├── components/
│   ├── comparison/          # Comparison feature components
│   ├── detail/              # Pokemon detail page components
│   ├── PokemonCard.vue      # Main Pokemon card component
│   ├── PokemonList.vue      # Pokemon grid/list
│   ├── PokemonFilters.vue   # Advanced filters
│   ├── Navbar.vue           # Main navigation
│   └── ...
├── composables/
│   ├── api/
│   │   └── usePokemonApi.ts # PokeAPI integration
│   ├── useDarkMode.ts       # Dark mode management
│   ├── use3DTilt.ts         # 3D card tilt effects
│   ├── useScrollAnimation.ts # Scroll-triggered animations
│   └── useParallax.ts       # Parallax scroll effects
├── constants/
│   └── pokemon.ts           # Pokemon constants & type data
├── layouts/
│   └── default.vue          # Default layout
├── pages/
│   ├── index.vue            # Home page
│   ├── pokemons.vue         # Main Pokédex
│   ├── pokemon/[id].vue     # Pokemon detail
│   ├── favorites.vue        # Favorites management
│   ├── compare.vue          # Pokemon comparison
│   ├── team-builder.vue     # Team builder
│   ├── advanced-search.vue  # Advanced search
│   ├── stats.vue            # Statistics dashboard
│   └── generations/
│       ├── index.vue        # Generations overview
│       └── [id].vue         # Generation detail
├── stores/
│   ├── pokemon.ts           # Pokemon state
│   ├── filters.ts           # Filter state
│   ├── favorites.ts         # Favorites state
│   ├── comparison.ts        # Comparison state
│   └── team.ts              # Team builder state
├── types/
│   └── index.ts             # TypeScript interfaces
└── nuxt.config.ts           # Nuxt configuration
```

---

## 🎯 Core Features

### 1. Pokédex

Browse the complete Pokédex with:
- **Filters**: Type, generation, stats, search
- **Sorting**: By number, name, stats
- **Pagination**: Infinite scroll or paginated
- **Quick Actions**: Add to favorites, team, or comparison

```typescript
// pages/pokemons.vue
- Advanced filtering system
- Real-time search
- Type-based filtering
- Generation filtering
```

### 2. Pokemon Detail Page

Comprehensive Pokemon information:
- **Header**: Name, types, image, navigation
- **Stats Tab**: Base stats with visual charts
- **Evolution Tab**: Complete evolution chain
- **Moves Tab**: Filterable move list by learning method
- **Abilities Tab**: Descriptions and hidden abilities
- **Sprites Tab**: All available sprites with lightbox

**Shiny Toggle**: Click the sparkles button to view shiny versions!

### 3. Team Builder

Build and analyze your perfect team:
- **6 Pokemon Slots**: Visual team composition
- **Type Coverage Analysis**: See offensive coverage
- **Weakness Analysis**: Identify team vulnerabilities
- **Save/Load Teams**: Multiple team slots
- **Export/Import**: Share teams via JSON

```typescript
// Analysis Features:
- Offensive type coverage
- Defensive weaknesses
- Type distribution
- Real-time updates
```

### 4. Pokemon Comparison

Compare up to 3 Pokemon simultaneously:
- **Stats Comparison**: Side-by-side with highlights
- **Type Effectiveness**: Complete matchup matrix
- **Abilities**: Compare abilities and descriptions
- **Moves**: Compare movesets by learning method

### 5. Advanced Search

Find Pokemon with detailed criteria:
- Name or Pokedex number
- Multiple type selection
- Generation filter
- Stat ranges (HP, Attack, Defense, Speed)
- Height and weight ranges
- Active filter counter

### 6. Generations

Explore Pokemon by generation:
- **9 Generations**: Kanto through Paldea
- **Generation Pages**: All Pokemon from each gen
- **Color Themes**: Unique colors per generation
- **Filters**: Search and type filtering within generation

### 7. Statistics Dashboard

Discover Pokemon insights:
- **Type Distribution**: Visual breakdown of all types
- **Average Stats**: Base stat averages
- **Strongest Pokemon**: By individual stat
- **Top 10 Rankings**: Highest total base stats
- **Physical Records**: Tallest, shortest, heaviest, lightest

---

## 🛠 Technical Stack

### Core Technologies
- **Nuxt 3.20.1** - Vue.js framework with SSR
- **Vue 3** - Composition API
- **TypeScript** - Strict mode enabled
- **Pinia** - State management
- **SCSS** - Styling with design system

### Key Dependencies
- **@nuxt/image** - Optimized image loading
- **@nuxtjs/google-fonts** - Custom fonts (Quicksand, Roboto)
- **nuxt-icon** - Icon system (Material Design Icons)

### API Integration
- **PokeAPI v2** - Complete Pokemon data
- **SWR Caching** - Smart caching strategy
- **Error Handling** - Graceful fallbacks

---

## 🎨 Design System

### Color Palette

```scss
// Primary Colors
$primary: #3b4cca
$primary-dark: #2a3a9a
$accent: #ffde00

// Type Colors (18 types)
$fire: #ee8130
$water: #6390f0
$grass: #7ac74c
// ... and more

// Semantic Colors
$success: #4caf50
$error: #f44336
$warning: #ffa726
```

### Typography

- **Primary Font**: Quicksand (headings)
- **Secondary Font**: Roboto (body text)
- **Mono Font**: Roboto Mono (stats, numbers)

### Spacing System

8px base unit with consistent spacing scale:
```scss
$spacing-1: 0.25rem  // 4px
$spacing-2: 0.5rem   // 8px
$spacing-3: 0.75rem  // 12px
$spacing-4: 1rem     // 16px
// ... up to spacing-20
```

---

## 📊 State Management

### Pinia Stores

#### Pokemon Store (`stores/pokemon.ts`)
- Pokemon list caching
- Lazy loading
- Error handling

#### Filters Store (`stores/filters.ts`)
- Search queries
- Type filters
- Generation filters
- Stat filters
- Sort preferences

#### Favorites Store (`stores/favorites.ts`)
- Favorite Pokemon IDs
- Collections
- Recently viewed
- Export/import to JSON
- LocalStorage persistence

#### Comparison Store (`stores/comparison.ts`)
- Up to 3 Pokemon
- Add/remove functionality
- LocalStorage persistence

#### Team Store (`stores/team.ts`)
- Up to 6 Pokemon per team
- Multiple saved teams
- Team analysis
- Export/import functionality
- LocalStorage persistence

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Optional: Custom API URL
NUXT_PUBLIC_POKEMON_API_URL=https://pokeapi.co/api/v2
```

### Nuxt Config

Key configurations in `nuxt.config.ts`:
- SSR enabled
- TypeScript strict mode
- Auto-imported components
- Optimized images
- SEO-ready meta tags

---

## 📱 Features by Page

### Home (`/`)
- Hero section with CTA
- Quick access cards (8 features)
- Pokemon of the Day (random)
- Featured Pokemon showcase
- Generation browser
- Stats overview

### Pokédex (`/pokemons`)
- Complete Pokemon list
- Advanced filters sidebar
- Search functionality
- Infinite scroll
- Quick actions

### Pokemon Detail (`/pokemon/[id]`)
- Comprehensive Pokemon info
- Tabbed interface (5 tabs)
- Shiny toggle
- Navigation controls
- Add to favorites/team/comparison

### Favorites (`/favorites`)
- Saved Pokemon grid
- Collections filter
- Recently viewed section
- Export functionality
- Clear all option

### Team Builder (`/team-builder`)
- 6 Pokemon slots
- Type coverage analysis
- Weakness analysis
- Save/load teams
- Export/import

### Compare (`/compare`)
- Up to 3 Pokemon
- 4 comparison views
- Add/remove Pokemon
- Clear all
- Floating access button

### Advanced Search (`/advanced-search`)
- 9+ filter criteria
- Real-time filtering
- Active filter counter
- Reset functionality
- Results grid

### Generations (`/generations`)
- 9 generation cards
- Color-coded by region
- Pokemon counts
- Navigation to detail

### Generation Detail (`/generations/[id]`)
- All Pokemon from generation
- Search within generation
- Type filtering
- Stats overview

### Statistics (`/stats`)
- Type distribution charts
- Average base stats
- Strongest by stat
- Top 10 rankings
- Physical records

---

## 🎯 Key Components

### PokemonCard
Reusable Pokemon card with:
- Image display
- Type badges
- Stats preview
- Quick actions (favorite, team, compare)
- Hover animations
- Loading skeleton

### PokemonDetailHeader
Pokemon detail page header:
- Pokemon image (normal/shiny)
- Basic info (name, types, height, weight)
- Navigation controls
- Favorite button
- Shiny toggle

### PokemonStats
Stats visualization:
- Progress bars
- Radar chart
- Individual stat breakdown
- Total base stats

### PokemonEvolution
Evolution chain display:
- Visual chain layout
- Evolution methods
- Level requirements
- Interactive cards

### Comparison Components
- **ComparisonStats**: Side-by-side stats
- **ComparisonTypes**: Type effectiveness matrix
- **ComparisonAbilities**: Abilities comparison
- **ComparisonMoves**: Movesets comparison

---

## 🎯 Modern Composables (Modernization Features)

### useDarkMode
Complete dark mode management with system preference detection.

```typescript
const { isDark, toggleDark, initDarkMode } = useDarkMode()

// Usage
onMounted(() => {
  initDarkMode() // Initialize on app mount
})

// Toggle dark mode
<button @click="toggleDark">
  <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" />
</button>
```

**Features:**
- System preference detection (`prefers-color-scheme`)
- LocalStorage persistence
- Automatic theme changes listener
- Manual toggle support

### use3DTilt
Realistic 3D tilt effect for cards (mimics physical Pokemon cards).

```vue
<script setup>
const {
  cardRef,
  transformStyle,
  glareStyle,
  handleMouseMove,
  handleMouseEnter,
  handleMouseLeave
} = use3DTilt({
  maxTilt: 8,      // Max tilt angle in degrees
  scale: 1.03,     // Scale on hover
  speed: 300       // Transition speed in ms
})
</script>

<template>
  <div
    ref="cardRef"
    :style="transformStyle"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="glare" :style="glareStyle" />
    <!-- Card content -->
  </div>
</template>
```

**Features:**
- Real-time perspective calculations
- Holographic glare effect
- Automatic reduced motion support
- Configurable parameters

### useScrollAnimation
Trigger animations when elements scroll into view.

```vue
<script setup>
const { elementRef, isVisible } = useScrollAnimation({
  threshold: 0.2,  // % of element visible before trigger
  once: true       // Trigger only once
})
</script>

<template>
  <section
    ref="elementRef"
    class="scroll-fade"
    :class="{ 'is-visible': isVisible }"
  >
    <!-- Content -->
  </section>
</template>

<style>
.scroll-fade {
  @include scroll-fade-in; // From mixins.scss
}
</style>
```

**Features:**
- Intersection Observer API
- Configurable threshold
- Once-only or repeating animations
- Reduced motion safe

### useParallax
Create depth with scroll-based parallax effects.

```vue
<script setup>
const { parallaxStyle } = useParallax({
  speed: 0.5,         // Parallax speed (0.5 = half scroll speed)
  direction: 'vertical' // 'vertical' or 'horizontal'
})
</script>

<template>
  <div class="background" :style="parallaxStyle">
    <!-- Background content -->
  </div>
</template>
```

**Features:**
- Passive scroll listeners
- Configurable speed and direction
- GPU-accelerated transforms
- Automatic reduced motion support

### SCSS Mixins (Modernization)

```scss
// Accessible focus (WCAG AA)
@include accessible-focus($primary, 2px, 3px);

// Reduced motion safe
@include reduced-motion-safe;

// Spring bounce (buttons)
@include spring-bounce;

// Skeleton shimmer (loading)
@include skeleton-shimmer;

// Fluid typography
@include fluid-type(2.5rem, 4.5rem);

// Bento grid layout
@include bento-grid(4, $spacing-4, 200px);

// Scroll fade in
@include scroll-fade-in(0s);

// 3D card tilt
@include card-3d-tilt;

// Modern button with ripple
@include button-modern;

// Glassmorphism
@include glass-morphism(0.9, 10px);
```

---

## 🔌 API Integration

### PokeAPI v2

All Pokemon data from [PokeAPI](https://pokeapi.co):

```typescript
// Example API calls
GET /pokemon/{id}           // Pokemon details
GET /pokemon-species/{id}   // Species data
GET /evolution-chain/{id}   // Evolution chain
GET /type/{name}            // Type information
GET /ability/{name}         // Ability details
GET /move/{name}            // Move information
```

### Caching Strategy

- **LocalStorage**: Favorites, teams, comparisons
- **In-Memory**: Pokemon data during session
- **SWR**: Stale-while-revalidate for API calls

---

## 🎮 User Guide

### Getting Started

1. **Browse Pokemon**: Start at `/pokemons` to see all Pokemon
2. **Search**: Use the search bar or advanced search
3. **Save Favorites**: Click the heart icon on any Pokemon
4. **Build Teams**: Go to Team Builder and add up to 6 Pokemon
5. **Compare**: Select Pokemon for comparison (max 3)
6. **Explore Generations**: Browse by generation/region

### Tips & Tricks

- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K`: Open search modal
  - `Esc`: Close modals

- **Quick Navigation**:
  - Click Pokemon cards to view details
  - Use navbar badges to see counts
  - Floating comparison button for quick access

- **Advanced Features**:
  - Toggle shiny sprites on detail pages
  - Export teams and favorites for backup
  - Use generation filters for focused browsing

---

## 🧪 Development

### Code Style

- **TypeScript Strict Mode**: Full type safety
- **Composition API**: Vue 3 best practices
- **SCSS Modules**: Component-scoped styles
- **BEM Methodology**: Consistent class naming

### Component Guidelines

```vue
<script setup lang="ts">
// 1. Imports
import type { Pokemon } from '~/types'

// 2. Props & Emits
interface Props {
  pokemon: Pokemon
}
const props = defineProps<Props>()

// 3. Composables & Stores
const pokemonStore = usePokemonStore()

// 4. State & Computed
const loading = ref(false)
const filteredData = computed(() => ...)

// 5. Methods
const handleAction = () => {
  // Implementation
}

// 6. Lifecycle
onMounted(() => {
  // Init logic
})
</script>

<template>
  <!-- Template -->
</template>

<style scoped lang="scss">
// Scoped styles
</style>
```

### Adding New Features

1. Create types in `/types`
2. Add store if needed in `/stores`
3. Create components in `/components`
4. Add pages in `/pages`
5. Update constants if needed

---

## 📈 Performance

### Optimizations

- **Image Optimization**: Nuxt Image with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **SSR**: Server-side rendering for faster initial load
- **Caching**: Smart caching strategy
- **Tree Shaking**: Unused code elimination

### Lighthouse Scores

Target scores (production build):
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **PokeAPI**: Comprehensive Pokemon data API
- **Nuxt Team**: Amazing framework
- **Pokemon Company**: Original Pokemon designs and data
- **Community**: Open source contributors

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

## 🎉 Version History

### v1.0.0 (Current)
- ✅ Complete Pokédex with 1,025+ Pokemon
- ✅ Advanced search and filtering
- ✅ Team builder with type analysis
- ✅ Pokemon comparison (up to 3)
- ✅ Favorites system with collections
- ✅ Generation browsing (9 generations)
- ✅ Statistics dashboard
- ✅ Shiny Pokemon visualization
- ✅ Responsive design
- ✅ SSR & SEO optimized

---

**Built with ❤️ using Nuxt 3, Vue 3, and TypeScript**

*Gotta catch 'em all!* 🎮
