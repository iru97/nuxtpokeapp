<script setup lang="ts">
    const title = `Pokemons`
    const pokemonPerPage = 25;
    let pokemons = ref([] as any);
    let page = 0;
    let loadingPokemons = ref(false);

    const getPokemons = async () => {
        loadingPokemons.value = true;
        const { data } = await useFetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${page * pokemonPerPage}`) as any;

        for await (const pokemon of data.value.results) {
            const pkmResponse =  await $fetch(pokemon.url) as any;
            pokemons.value.push(pkmResponse);
        }

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