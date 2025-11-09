<template>
    <div>
      <Navbar/>
      <main>
        <slot />
      </main>
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

main {
  min-height: calc(100vh - 72px);
}
</style>