<script setup lang="ts">
    const title = `Pokemons`
    const pokemonPerPage = 25;
    let pokemons = ref([] as any);
    let page = 0;
    let loadingPokemons = ref(false);

    // SEO Meta tags
    useHead({
        title: 'Pokémon - Explora todos los Pokémon | PokéApp',
        meta: [
            { name: 'description', content: 'Explora la lista completa de Pokémon con sus estadísticas, tipos y habilidades. Descubre información detallada de cada Pokémon.' },
            { property: 'og:title', content: 'Pokémon - Explora todos los Pokémon | PokéApp' },
            { property: 'og:description', content: 'Explora la lista completa de Pokémon con información detallada.' },
            { property: 'og:type', content: 'website' },
            { name: 'twitter:card', content: 'summary' }
        ]
    });

    const getPokemons = async () => {
        loadingPokemons.value = true;
        const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${page * pokemonPerPage}`) as any;

        // Fetch all Pokemon details in parallel for better performance
        const pokemonDetails = await Promise.all(
            data.value.results.map((pokemon: any) => $fetch(pokemon.url))
        );

        pokemons.value.push(...pokemonDetails);
        page++;
        loadingPokemons.value = false;
    }

    onMounted(async () => {
        await getPokemons();
    })
</script>

<template>
    <div>
        <div class="text-center mt-4 text-4xl">
           <h2>
            {{ title  }}
        </h2> 
        </div>
        
        <Pokemons v-bind="{
            pokemons,
            loadingPokemons
        }"  @loadMorePokemons="getPokemons"/>
    </div>
    
</template>