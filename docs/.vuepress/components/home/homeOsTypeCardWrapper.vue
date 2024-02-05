<template>
    <h1 style="margin-bottom: .5em;">Firmware versions</h1>
    <div class="wrapper">
        <!--<div class="overlay left"></div>
        <div class="overlay right"></div>-->
        <div class="cardWrapper">
            <div class="recentDeviceCard" v-for="card in osTypeCards" :key="card.name">
                <router-link v-if="card.link" :to="card.link">
                    <homeSmallCard :card="card"/>
                </router-link>
                <homeSmallCard v-else :card="card"/>
            </div>
            <div style="margin-left: -2em;"><p style="width: 2em; margin-left: 0;"></p></div>
        </div>
    </div>
    <div class="space"></div>
</template>

<script>
export default {
    data() {
        return {
            osTypeCards: []
        }
    },
    created() {
        fetch("https://api.appledb.dev/appledb-web/homePage.json")
            .then(response => response.json())
            .then(data => {
                this.osTypeCards = data.osTypeCardArray
        })
    }
}
</script>

<style lang="scss" scoped>
.space {
    height: 12em;
}

.wrapper {
    position: absolute;
    left: 0em;
    width: 100%;
}

/*.overlay {
    &.right {
        background: linear-gradient(90deg, #00000000, var(--c-bg));
        max-width: 2em;
        right: calc(max(2rem, calc(calc(100vw - var(--homepage-width)) / 2)) - 2em);
    }

    &.left {
        background: linear-gradient(270deg, #00000000, var(--c-bg));
        max-width: 2em;
        left: calc(max(2rem, calc(calc(100vw - var(--homepage-width)) / 2)) - 4em);
    }

    height: 21em;
    position: absolute;
    width: 100%;
    z-index: 99999;
}*/

.cardWrapper {
    display: flex;
    overflow-x: scroll;
    gap: 5em;
    padding-block: .5em 1.5em;
    padding-inline: max(calc(50vw - max(var(--homepage-width), 85%) / 2), 2em);
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>