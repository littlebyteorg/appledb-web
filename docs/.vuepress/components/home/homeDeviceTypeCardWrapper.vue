<template>
    <div class="wrapper">
        <div class="overlay left"></div>
        <div class="overlay right"></div>
        <div class="cardWrapper">
            <div class="deviceTypeCard" v-for="deviceTypeCard in deviceTypeCards" :key="deviceTypeCard.name">
                <a v-if="deviceTypeCard.link" :href="deviceTypeCard.link">
                    <homeDeviceTypeCard
                        :deviceTypeName="deviceTypeCard.name"
                        :deviceTypeImageKey="deviceTypeCard.imageKey"
                    />
                </a>
                <homeDeviceTypeCard v-else
                    :deviceTypeName="deviceTypeCard.name"
                    :deviceTypeImageKey="deviceTypeCard.imageKey"
                />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            deviceTypeCards: [
                {
                    name: "Mac",
                    imageKey: "Mac15,11",
                    link: "/device-selection/"
                },
                {
                    name: "iPhone",
                    imageKey: "iPhone16,1",
                    link: "/device-selection/"
                },
                {
                    name: "iPad",
                    imageKey: "iPad14,5",
                    link: "/device-selection/"
                },
                {
                    name: "Apple Watch",
                    imageKey: "Watch6,14",
                    link: "/device-selection/"
                },
                {
                    name: "AirPods",
                    imageKey: "MagSafe Charging Case for AirPods Pro (2nd generation)",
                    link: "/device-selection/"
                },
                {
                    name: "Apple TV",
                    imageKey: "AppleTV14,1",
                    link: "/device-selection/"
                },
                {
                    name: "HomePod",
                    imageKey: "AudioAccessory6,1",
                    link: "/device-selection/"
                },
                {
                    name: "Accessories",
                    imageKey: "iPhone 14 Plus Leather Case with MagSafe",
                    link: "/device-selection/"
                }
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    margin-left: -2em;
    margin-right: -2em;
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
    overflow-x: scroll;
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