<template>
    <div class="wrapper" v-if="deviceTypeCards.length">
        <!--<div class="overlay left"></div>
        <div class="overlay right"></div>-->
        <div class="cardWrapper">
            <div class="deviceTypeCard" v-for="deviceTypeCard in deviceTypeCards" :key="deviceTypeCard.name">
                <router-link v-if="deviceTypeCard.link" :to="deviceTypeCard.link">
                    <homeSmallCard :card="deviceTypeCard"/>
                </router-link>
                <homeSmallCard v-else :card="deviceTypeCard"/>
            </div>
            <div style="margin-left: -2em;"><p style="width: 2em; margin-left: 0;"></p></div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            deviceTypeCards: []
        }
    },
    created() {
        fetch("https://api.appledb.dev/appledb-web/homePage.json")
            .then(response => response.json())
            .then(data => {
                this.deviceTypeCards = data.deviceTypeCardArray
        })
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    margin-left: -2em;
    margin-right: -2em;
    max-width: 100vw;
}

.overlay {
    &.right {
        background: linear-gradient(90deg, #00000000, var(--c-bg));
        max-width: 2em;
        right: calc(max(2rem, calc(calc(100vw - var(--homepage-width)) / 2)) - 2em);
    }

    &.left {
        background: linear-gradient(270deg, #00000000, var(--c-bg));
        max-width: 2em;
        left: calc(max(2rem, calc(calc(100vw - var(--homepage-width)) / 2)) - 2em);
    }

    height: 12em;
    position: absolute;
    width: 100%;
    z-index: 99999;
}

.cardWrapper {
    display: flex;
    overflow-x: auto;
    gap: 2em;
    padding-block: .5em 1.5em;
    padding-inline: .5em;
    padding-left: 2em;
}

.deviceTypeCard {
    margin-left: 2em;
    margin-right: 2em;
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>