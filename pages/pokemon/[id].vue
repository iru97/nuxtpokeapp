<script setup lang="ts">
    const route = useRoute();
    const pokemonId = route.params.id
    const title = `Pokemon ${pokemonId}`

    const nextPokemonId = computed(() => {
        return (Number(pokemonId) + 1);
    });

    // Use useAsyncData for better SSR support and caching
    const { data } = await useAsyncData(
        `pokemon-${pokemonId}`,
        () => $fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    );

    // SEO Meta tags
    useHead({
        title: data.value ? `${data.value.name} - PokéApp` : `Pokémon ${pokemonId}`,
        meta: [
            { name: 'description', content: data.value ? `Información completa sobre ${data.value.name}, incluyendo estadísticas, tipos y habilidades.` : 'Información del Pokémon' },
            { property: 'og:title', content: data.value ? `${data.value.name} - PokéApp` : `Pokémon ${pokemonId}` },
            { property: 'og:description', content: data.value ? `Descubre ${data.value.name}, un Pokémon de tipo ${data.value.types.map((t: any) => t.type.name).join(', ')}` : 'Información del Pokémon' },
            { property: 'og:image', content: data.value?.sprites?.other?.['official-artwork']?.front_default || '' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: data.value ? `${data.value.name} - PokéApp` : `Pokémon ${pokemonId}` },
            { name: 'twitter:description', content: data.value ? `Stats y habilidades de ${data.value.name}` : 'Información del Pokémon' },
            { name: 'twitter:image', content: data.value?.sprites?.other?.['official-artwork']?.front_default || '' }
        ]
    });
</script>

<template>
    <div class="px-12">
        <h2>
            {{ title  }}
        </h2>
        <v-card v-if="data"> {{ data.name }}</v-card>
        <v-btn small color="primary">
            <NuxtLink v-if="nextPokemonId" :to="'/pokemon/' + nextPokemonId">Pokemon {{ nextPokemonId }}</NuxtLink>
        </v-btn>
    </div>
    
</template>