<template>
    <div
        v-for="filter in filterGroups"
        :key="filter"
        class="section"
    >
        <div
            class="blockWrapper"
            v-for="device in latestDevices.filter(x => filter.released.includes(x.released[0]) && filter.type.includes(x.type))"
            :key="device"
        ><router-link :to="`/device/${device.groupKey.replace(/ /g,'-')}`">
            <div class="block">
                <div class="img">
                    <picture>
                        <source :srcset="`https://img.appledb.dev/device@preview/${device.imgKey}/0${device.imgDark && isDarkMode ? '_dark' : ''}.avif`" type="image/avif">
                        <source :srcset="`https://img.appledb.dev/device@preview/${device.imgKey}/0${device.imgDark && isDarkMode ? '_dark' : ''}.webp`" type="image/webp">
                        <img
                            :src="`https://img.appledb.dev/device@preview/${device.imgKey}/0${device.imgDark && isDarkMode ? '_dark' : ''}.png`"
                            class="deviceImg"
                        >
                    </picture>
                </div>
                <div class="text">
                    <h2 class="headerString">{{ device.name }}</h2>
                    <div class="subtitle">
                        <div>{{ device.released[0] }}</div>
                    </div>
                    <a class="link">View more</a>
                </div>
            </div>
        </router-link></div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import latestDevices from '@temp/latestDevices'

const getReleaseDateArr = [...new Set(latestDevices.map(x => x.released[0]))]
const getDeviceTypeArr = [...new Set(latestDevices.map(x => x.type))]

let groups = []
let oldDevice

for (let device of latestDevices) {
    if (!oldDevice) {
        groups.push({
            type: [device.type],
            released: [device.released[0]]
        })
        oldDevice = device
        continue
    }
    
    const releaseMatch = device.released[0] == oldDevice.released[0]
    const typeMatch = device.type == oldDevice.type

    if (releaseMatch || typeMatch) {
        let group = groups.slice(-1)[0]

        if (releaseMatch) group.type.push(device.type)
        if (typeMatch) group.released.push(device.released[0])

        groups[group.length-1] = group
        
        oldDevice = device
        continue
    }

    groups.push({
        type: [device.type],
        released: [device.released[0]]
    })
    oldDevice = device
}

groups = groups.map(x => {
    x.type = [...new Set(x.type)]
    x.released = [...new Set(x.released)]
    return x
})

export default {
    data() {
        return {
            isDarkMode: useDarkMode(),
            latestDevices: latestDevices,
            releaseDateArr: getReleaseDateArr,
            deviceTypeArr: getDeviceTypeArr,
            filterGroups: groups
        }
    },
}
</script>

<style lang="scss" scoped>
a {
    color: var(--c-text);

    &:hover {
        text-decoration: none;
    }

    .link {
        color: var(--c-brand);

        &:hover {
            text-decoration: underline;
        }
    }
}

.tag {
    display: inline-block;
    border-radius: 4em;
    border: 1px solid;
    padding: 5px 9px;
    text-transform: uppercase;
    font-weight: 700;
    font-size: .5em;
    letter-spacing: .5px;
    margin-right: 1em;
}

.subtitle {
    display: flex;
    flex-flow: row wrap;

    margin-block: .5em 1em;

    div {
        margin-right: .5em;

        &:last-of-type {
            margin-right: 0;
        }
    }
}

.section {
    background: var(--c-container-bg);
    transition: background 150ms ease-in-out;
    border-radius: 8px;
    margin-block: 1em;
    padding: 1em;

    .title {
        font-weight: 700;
        font-size: 1.5em;
    }

    .blockWrapper:last-of-type .block .text {
        border: none;
    }

    .block {
        display: flex;
        flex-wrap: wrap;
        padding-top: 1em;
        justify-content: space-around;

        .img {
            width: 16.5em;
            max-height: 11em;
            text-align: center;
        }

        .text {
            padding-bottom: 1em;
            border-bottom: 1px solid var(--c-border);
            flex-grow: 2;

            .headerString {
                border-bottom: 0;
                padding-bottom: 2px;
                margin-block-end: 0;
            }
        }
    }
}

.releasefw--flexContainer {
    display: flex;
    flex-wrap: wrap;
    padding-top: 1em;
    justify-content: space-around;
}

.releasefw--flexImg {
    width: 16.5em;
    max-height: 11em;
    text-align: center;
}

.releasefw--flexText {
    padding-bottom: 1em;
    border-bottom: 1px solid var(--c-border);
    flex-grow: 2;
}

.releasefw--title {
    border-bottom: none;
    padding-bottom: 0;
    margin-block-end: 0;
}

.deviceImg {
    max-height: 7em;
    max-width: 11.5em;
    padding: 2em;
    padding-right: 3em;
}

@media (max-width: 866px) {
    .releasefw--flexContainer {
        flex-direction: column;
    }

    .releasefw--flexImg {
        width: 100%;
    }
}
</style>