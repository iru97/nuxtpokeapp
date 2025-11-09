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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Keep Quicksand for headings and display text */
h1, h2, h3, h4, h5, h6,
.display-text,
.navbar__logo {
  font-family: 'Quicksand', cursive;
}

main {
  min-height: calc(100vh - 72px);
}
</style>