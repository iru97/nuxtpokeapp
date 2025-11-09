<template>
    <div>
      <Navbar/>
      <div class="px-2">
        <slot />
      </div>
      <ComparisonFloatingButton />
    </div>
  </template>

<script setup lang="ts">

const route = useRoute();
</script>

<style>
* {
  font-family: 'Quicksand';
}
</style>