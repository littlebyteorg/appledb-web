<template>
    <h1>Recent devices</h1>
    <div class="wrapper">
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
    <div class="space"></div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.space {
    height: 21em;
}

.wrapper {
    position: absolute;
    left: 0;
    width: 100%;
}

.cardWrapper {
    display: flex;
    overflow-x: scroll;
    gap: 2em;
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