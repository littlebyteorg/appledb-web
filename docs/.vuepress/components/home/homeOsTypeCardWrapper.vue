<template>
    <h1>Firmware versions</h1>
    <div class="wrapper">
        <div class="overlay left"></div>
        <div class="overlay right"></div>
        <div class="cardWrapper">
            <div class="recentDeviceCard" v-for="card in [
                {
                    title: 'iOS',
                    image: {
                        type: 'images',
                        key: 'ios17'
                    }
                },
                {
                    title: 'iPadOS',
                    image: {
                        type: 'images',
                        key: 'ipados17'
                    }
                },
                {
                    title: 'macOS',
                    image: {
                        type: 'images',
                        key: 'Sonoma'
                    }
                },
                {
                    title: 'tvOS',
                    image: {
                        type: 'device',
                        key: 'AppleTV14,1'
                    }
                },
                {
                    title: 'watchOS',
                    image: {
                        type: 'device',
                        key: 'Watch7,1'
                    }
                },
                {
                    title: 'visionOS',
                    image: {
                        type: 'device',
                        key: 'RealityDevice14,1'
                    }
                }
            ]" :key="card.name">
                <homeSmallCard :card="card"/>
            </div>
            <div style="margin-left: -2em;"><p style="width: 2em; margin-left: 0;"></p></div>
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.wrapper {
    margin-left: -2em;
    margin-right: -2em;
    margin-top: .5em;
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

    height: 21em;
    position: absolute;
    width: 100%;
    z-index: 99999;
}

.cardWrapper {
    display: flex;
    overflow-x: scroll;
    gap: 2em;
    padding-block: .5em 1.5em;
    padding-inline: .5em;
    padding-left: 2em;
}

.recentDeviceCard {
    margin-left: 2em;
    margin-right: 2em;
}

a {
    color: var(--c-text);
    &:hover { text-decoration: none; }
}
</style>