<template>
    <h1 style="margin-bottom: .5em;">Firmware versions</h1>
    <div class="wrapper">
        <!--<div class="overlay left"></div>
        <div class="overlay right"></div>-->
        <div class="cardWrapper">
            <div class="card" v-for="card in osTypeCards" :key="card.name">
                <homeOsCard :card="card" :latestVersion="latestVersion[card.osStr]"/>
            </div>
        </div>
    </div>
    <div class="space"></div>
</template>

<script>
export default {
    data() {
        return {
            osTypeCards: [],
            latestVersion: Object
        }
    },
    created() {
        fetch("https://api.appledb.dev/appledb-web/homePage.json")
            .then(response => response.json())
            .then(data => {
                this.osTypeCards = data.osTypeCardArray
                this.latestVersion = data.latestVersions
        })
    }
}
</script>

<style lang="scss" scoped>
.cardWrapper {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    padding-block: .5em 1.5em;
    padding-inline: max(calc(50vw - max(var(--homepage-width), 85%) / 2), 2em);
}

.card {
    width: 100%;
}

@media screen and (min-width: 800px) {
    .card {
        width: 50%;
    }
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>