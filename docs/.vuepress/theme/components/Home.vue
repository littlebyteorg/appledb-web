<script setup lang="ts">
import HomeContent from '@vuepress/theme-default/lib/client/components/HomeContent.vue'
import HomeFeatures from '@vuepress/theme-default/lib/client/components/HomeFeatures.vue'
import HomeFooter from '@vuepress/theme-default/lib/client/components/HomeFooter.vue'
import HomeHero from '@vuepress/theme-default/lib/client/components/HomeHero.vue'
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
