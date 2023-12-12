<template>
    <h1>Recent devices</h1>
    <div class="wrapper">
        <div class="overlay left"></div>
        <div class="overlay right"></div>
        <div class="cardWrapper">
            <div class="recentDeviceCard" v-for="card in [
                {
                    title: 'iPhone 15 Pro',
                    text: 'Released Sep 22, 2023',
                    link: '/device/iPhone-15-Pro.html',
                    image: {
                        type: 'device',
                        key: 'iPhone16,1',
                        count: 3
                    }
                },
                {
                    title: 'iPhone 15',
                    text: 'Released Sep 22, 2023',
                    link: '/device/iPhone-15.html',
                    image: {
                        type: 'device',
                        key: 'iPhone15,4',
                        count: 3
                    }
                },
                {
                    title: 'Apple Watch Series 9',
                    text: 'Released Sep 22, 2023',
                    link: '/device/Apple-Watch-Series-9.html',
                    image: {
                        type: 'device',
                        key: 'Watch7,1',
                        count: 3
                    }
                },
                {
                    title: 'Apple Watch Ultra 2',
                    text: 'Released Sep 22, 2023',
                    link: '/device/Apple-Watch-Ultra-2.html',
                    image: {
                        type: 'device',
                        key: 'Watch7,5',
                        count: 2
                    }
                },
                {
                    title: 'MacBook Pro (16-inch)',
                    text: 'Released Nov 07, 2023',
                    link: '/device/MacBook-Pro-(16-inch,-Nov-2023).html',
                    image: {
                        type: 'device',
                        key: 'Mac15,7',
                        count: 1
                    }
                },
                {
                    title: 'MacBook Pro (14-inch)',
                    text: 'Released Nov 07, 2023',
                    link: '/device/MacBook-Pro-(14-inch,-Nov-2023).html',
                    image: {
                        type: 'device',
                        key: 'Mac15,3',
                        count: 1
                    }
                },
                {
                    title: 'iMac (24-inch)',
                    text: 'Released Nov 07, 2023',
                    link: '/device/iMac-(24-inch,-M3,-2023).html',
                    image: {
                        type: 'images',
                        key: 'logo',
                        count: 1,
                        dark: true
                    }
                }
            ]" :key="card.title">
                <router-link :to="card.link"><homeLargeCard :card="card"/></router-link>
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