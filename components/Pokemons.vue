<script setup lang="ts">
const demo = ref(null);
const intersectionActive = ref(false);
const emit = defineEmits(['loadMorePokemons']);
const props = defineProps({
  pokemons: {
    type: Array,
    required: true,
  },
  loadingPokemons: {
    type: Boolean,
    required: true
  }
});

const { pokemons,loadingPokemons } = props;

watch(pokemons, () => {
    if(intersectionActive.value) return;

    const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loadingPokemons) {
          emit('loadMorePokemons');
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '150px'
    }
  );

  // observe each element
  if (demo.value) {
    observer.observe(demo.value);
    intersectionActive.value = true;
  }
});

</script>

<template>
    <div>
        <div class="flex flex-wrap gap-4 justify-center h-full py-8" style="min-height: 100vh !important;" >
            <PokemonCard v-for="pokemon in pokemons" :key="pokemon.name" :pokemon="pokemon"/>
        </div>
        <span ref="demo">next</span>

    </div>
</template>