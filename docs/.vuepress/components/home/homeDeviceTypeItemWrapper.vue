<template>
    <div class="wrapper" v-if="deviceTypeCards.length">
        <!--<div class="overlay left"></div>
        <div class="overlay right"></div>-->
        <div class="cardWrapper">
            <div class="deviceTypeCard" v-for="(deviceTypeCard, index) in deviceTypeCards" :key="deviceTypeCard.name">
                <a v-if="deviceTypeCard.link" :href="deviceTypeCard.link">
                    <homeSmallItem :card="deviceTypeCard" :index="index"/>
                </a>
                <homeSmallItem v-else :card="deviceTypeCard"/>
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
.space {
    height: 12em;
}

.wrapper {
    position: absolute;
    left: 0em;
    width: 100%;
}

.cardWrapper {
    display: flex;
    overflow-x: scroll;
    gap: 2em;
    padding-block: .5em 1.5em;
    padding-inline: max(calc(50vw - max(var(--homepage-width), 85%) / 2), 4em);
    transition: width .2s cubic-bezier(0,0,.5,1), margin  .2s cubic-bezier(0,0,.5,1);

    &:hover {
        margin-left: -1em;
    }
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>