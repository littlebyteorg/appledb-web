<script setup lang="ts">
import HomeContent from '@theme/HomeContent.vue'
import HomeFeatures from '@theme/HomeFeatures.vue'
import HomeFooter from '@theme/HomeFooter.vue'
import HomeHero from '@theme/HomeHero.vue'
</script>

<template>
    <div class="hero">
        <HomeHero />
    </div>
    <main class="home">
        <HomeFeatures />
        <HomeContent />
        <HomeFooter />
    </main>
</template>

<style scoped>
    .hero {
        padding: 2em 0 0;
        display: block;
    }
    .home {
        padding-top: 1em;
    }
</style>
