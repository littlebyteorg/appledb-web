<template>
    <div v-for="osStr in osStrArr.filter(x => latestVersion.filter(y => y.osStr == x).length)" :key="osStr" class="fwBlock">
        <div class="versionBlockWrapper" v-for="version in latestVersion.filter(x => x.osStr == osStr)" :key="version">
            <router-link :to="`/firmware/${version.osStr.replace(/ /g,'-')}/${version.uniqueBuild}`">
                <div class="versionBlock">
                    <div class="img">
                        <picture v-for="property in [getProperties(version)]" :key="property">
                            <source :srcset="`/assets/images@lowres/${property.image}_firmware_release${isDarkMode && property.dark ? '_dark' : ''}.webp`" type="image/webp">
                            <img :src="`/assets/images@lowres/${property.image}_firmware_release${isDarkMode && property.dark ? '_dark' : ''}.png`" style="height: 7em; padding: 2em; padding-right: 3em;">
                        </picture>
                    </div>
                    <div class="text">
                        <h2 class="versionString">{{ version.osStr }} {{ version.version }} ({{ version.build }})</h2>
                        <p style="margin-block-start: .5em;">{{ version.released }}</p>
                        <a class="link">View more</a>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import latestVersion from '@temp/latestVersion'

const properties = [
    {
        osStr: 'audioOS',
        image: 'audio',
        startsWith: '15',
        dark: false
    },
    {
        osStr: 'audioOS',
        image: 'audio',
        startsWith: '16',
        dark: false
    },
    {
        osStr: 'macOS',
        image: 'monterey',
        startsWith: '12',
        dark: true
    },
    {
        osStr: 'macOS',
        image: 'bigsur',
        startsWith: '11',
        dark: true
    },
    {
        osStr: 'macOS',
        image: 'ventura',
        startsWith: '13',
        dark: true
    },
    {
        osStr: 'iPadOS',
        image: 'ipados15',
        startsWith: '15',
        dark: true
    },
    {
        osStr: 'iPadOS',
        image: 'ipados16',
        startsWith: '16',
        dark: true
    },
    {
        osStr: 'iOS',
        image: 'ios12',
        startsWith: '12',
        dark: false
    },
    {
        osStr: 'iOS',
        image: 'ios15',
        startsWith: '15',
        dark: true
    },
    {
        osStr: 'iOS',
        image: 'ios16',
        startsWith: '16',
        dark: true
    },
    {
        osStr: 'watchOS',
        image: 'watch',
        startsWith: '8',
        dark: false
    },
    {
        osStr: 'watchOS',
        image: 'watch',
        startsWith: '9',
        dark: false
    },
    {
        osStr: 'tvOS',
        image: 'tv',
        startsWith: '15',
        dark: false
    },
    {
        osStr: 'tvOS',
        image: 'tv',
        startsWith: '16',
        dark: false
    },
    {
        osStr: 'Bluetooth Headset Firmware',
        image: 'airpods',
        dark: false
    },
]

const osStrOrder = [
    'iOS',
    'iPadOS',
    'macOS',
    'tvOS',
    'watchOS',
    'audioOS',
    'Bluetooth Headset Firmware'
]

const getOsStrArr = [...new Set(latestVersion.map(x => x.osStr))].sort()
const osStrArr = osStrOrder.filter(x => getOsStrArr.includes(x)).concat(getOsStrArr.filter(x => !osStrOrder.includes(x)))

export default {
    data() {
        return {
            isDarkMode: useDarkMode(),
            properties: properties,
            osStrArr: osStrArr
        }
    },
    methods: {
        getProperties(version) {
            return properties.find(x => x.osStr == version.osStr && (x.startsWith ? version.version.startsWith(x.startsWith) : true))
        }
    },
    computed: {
        latestVersion() {
            return latestVersion
            .filter(x => 
                this.properties.map(y => y.osStr)
                .includes(x.osStr)
            )
            .sort((a,b) => {
                const dateRel = new Date(b.released) - new Date(a.released)
                if (dateRel != 0) return dateRel

                if (a.osStr.toLowerCase() < b.osStr.toLowerCase()) return -1
                if (a.osStr.toLowerCase() > b.osStr.toLowerCase()) return 1

                if (a.version < b.version) return 1
                if (a.version > b.version) return -1
                return 0
            }).filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.osStr === value.osStr &&
                    t.version === value.version &&
                    t.build === value.build
                ))
            )
        }
    }
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

.fwBlock {
    background: var(--c-container-bg);
    transition: background 100ms ease-in-out;
    border-radius: 8px;
    margin-block: 1em;
    padding: 1em;

    .title {
        font-weight: 700;
        font-size: 1.5em;
    }

    .versionBlockWrapper:last-of-type .versionBlock .text {
        border: none;
    }

    .versionBlock {
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

            .versionString {
                border-bottom: none;
                padding-bottom: 0;
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

@media (max-width: 866px) {
    .releasefw--flexContainer {
        flex-direction: column;
    }

    .releasefw--flexImg {
        width: 100%;
    }
}
</style>