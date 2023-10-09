<script setup lang="ts">
    const route = useRoute();
    const pokemonId = route.params.id
    const title = `Pokemon ${pokemonId}`

    const nextPokemonId = computed(() => {
        return (Number(pokemonId) + 1);
    });

    const { data } = await $fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`) as any;
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