<script setup lang="ts">
    const title = "Inicio"

    // SEO Meta tags
    useHead({
        title: 'PokéApp - Tu guía completa de Pokémon',
        meta: [
            { name: 'description', content: 'Descubre información completa sobre todos los Pokémon. Explora estadísticas, tipos, habilidades y más en PokéApp.' },
            { property: 'og:title', content: 'PokéApp - Tu guía completa de Pokémon' },
            { property: 'og:description', content: 'Tu guía completa de Pokémon con estadísticas, tipos y habilidades.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' }
        ]
    });
</script>

<template>
    <h2>
        {{ title  }}
    </h2>
</template>