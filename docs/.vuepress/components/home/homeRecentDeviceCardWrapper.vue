<template>
    <h1>Recent Devices</h1>
    <div class="wrapper">
        <div class="cardWrapper">
            <div class="recentDeviceCard" v-for="card in recentDeviceCards" :key="card.title">
                <router-link :to="card.link"><homeLargeCard :card="card"/></router-link>
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
            recentDeviceCards: []
        }
    },
    created() {
        fetch("https://api.appledb.dev/appledb-web/homePage.json")
            .then(response => response.json())
            .then(data => {
                this.recentDeviceCards = data.recentDeviceCardArray
        })
    }
}
</script>

<style lang="scss" scoped>
.space {
    height: 23em;
}

.wrapper {
    position: absolute;
    left: 0em;
    width: 100%;
}

.cardWrapper {
    display: flex;
    overflow-x: auto;
    gap: 4em;
    padding-block: 2em 1.5em;
    padding-inline: max(calc(50vw - max(var(--homepage-width), 85%) / 2), 2em);

    .recentDeviceCard {
        padding-right: 2em;
    }
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>