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
    flex-direction: row;
    overflow-x: auto;
    gap: 2em;
    justify-content: space-between;
    padding-block: .5em 1.5em;
    padding-inline: max(calc(50vw - max(var(--homepage-width), 85%) / 2), 2em);
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}

@media screen and (max-width: 800px) {
    .cardWrapper {
        gap: 1em;
    }
    /*.wrapper {
        position: static;
        width: 100%;
    }

    .space {
        height: 0;
    }

    .cardWrapper {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        padding-inline: 2em;
        margin-inline: -1em;

        .deviceTypeCard {
            margin: auto;
        }
    }*/
}
</style>