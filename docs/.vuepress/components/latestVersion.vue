<template>
    <div v-for="osStr in [...new Set(latestVersion.map(x => x.osStr))].filter(x => latestVersion.filter(y => y.osStr == x).length)" :key="osStr" class="fwBlock">
        <div class="versionBlockWrapper" v-for="version in latestVersion.filter(x => x.osStr == osStr)" :key="version">
            <router-link :to="`/firmware/${version.osStr.replace(/ /g,'-')}/${version.uniqueBuild}`">
                <div class="versionBlock">
                    <div class="img">
                        <picture v-for="property in [getProperties(version)]" :key="property">
                            <source :srcset="`https://img.appledb.dev/images@preview/${property.image}_firmware_release${isDarkMode && property.dark ? '_dark' : ''}/${property.imageName}.avif`" type="image/avif">
                            <source :srcset="`https://img.appledb.dev/images@preview/${property.image}_firmware_release${isDarkMode && property.dark ? '_dark' : ''}/${property.imageName}.webp`" type="image/webp">
                            <img :src="`https://img.appledb.dev/images@preview/${property.image}_firmware_release${isDarkMode && property.dark ? '_dark' : ''}/${property.imageName}.png`">
                        </picture>
                    </div>
                    <div class="text">
                        <h2 class="versionString">{{ version.osStr }} {{ version.version }}</h2>
                        <div class="subtitle">
                            <div>{{ version.released }}<!-- — <code style="background: none; padding-inline: 2px; font-size: 1em;">{{ version.build }}</code>--></div>
                            <div class="tag" style="color: #ab47bc;" v-if="version.beta">beta</div>
                            <div class="tag" style="color: #ab47bc;" v-else-if="version.rc">rc</div>
                            <div class="tag" style="color: #f0ad05;" v-else-if="version.internal">internal</div>
                            <div class="tag" style="color: #039be5;" v-else>release</div>
                            <div class="tag" v-if="version.rsr">rsr</div>
                            <div class="tag" v-if="version.bsi">bsi</div>
                        </div>
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
        osStr: 'HomePod Software',
        image: 'audio',
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
        osStr: 'macOS',
        image: 'sonoma',
        startsWith: '14',
        dark: true
    },
    {
        osStr: 'macOS',
        image: 'sonoma',
        startsWith: '15',
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
        osStr: 'iPadOS',
        image: 'ipados17',
        startsWith: '17',
        dark: true
    },
    {
        osStr: 'iPadOS',
        image: 'ipados17',
        startsWith: '18',
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
        osStr: 'iOS',
        image: 'ios17',
        startsWith: '17',
        dark: true
    },
    {
        osStr: 'iOS',
        image: 'ios17',
        startsWith: '18',
        dark: true
    },
    {
        osStr: 'watchOS',
        image: 'watch',
        dark: false
    },
    {
        osStr: 'tvOS',
        image: 'tv',
        dark: false
    },
    {
        osStr: 'Bluetooth Headset Firmware',
        image: 'airpods',
        dark: false
    },
    {
        osStr: 'visionOS',
        image: 'vision',
        dark: false
    }
]

const osStrOrder = [
    'iOS',
    'iPadOS',
    'macOS',
    'tvOS',
    'watchOS',
    'HomePod Software',
    'Bluetooth Headset Firmware'
]

export default {
    data() {
        return {
            isDarkMode: useDarkMode(),
            properties: properties
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
                const dateRel = [a,b].map(x => new Date(x.released))
                if (dateRel[0] < dateRel[1]) return 1
                if (dateRel[0] > dateRel[1]) return -1

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
img {
    max-height: 7em;
    padding: 2em;
    padding-right: 3em;
}

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
    margin-top: 6px;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-weight: 700;
    line-height: 1em;
    font-size: .5em;
    letter-spacing: .5px;
    margin-right: 1em;
}

.subtitle {
    display: flex;
    flex-flow: row wrap;

    margin-bottom: .5em;

    div {
        margin-right: .5em;

        &:last-of-type {
            margin-right: 0;
        }
    }
}

.fwBlock {
    .versionBlock {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-around;
        padding-top: 1em;

        .img {
            width: 16.5em;
            max-height: 11em;
            text-align: center;
        }

        .text {
            padding-bottom: 1em;
            border-bottom: 1px solid var(--c-border);
            flex-grow: 2;
            line-height: 2em;

            .versionString {
                border-bottom: none;
                padding-bottom: 0;
                margin-block-end: 0;
            }
        }
    }
}

@media screen and (max-width: 800px) {
    img {
        max-width: 4em;
        padding-inline: 0;
        padding-right: 1em;
    }

    .fwBlock .versionBlock {
        padding-top: .5em;
        margin-left: -.5em;

        h2 {
            font-size: 1.6em;
        }

        .subtitle {
            margin-top: .2em;
        }

        .img {
            width: 7em;
            margin-right: -.5em;
        }

        .text {
            width: calc(100% - 10em);
        }
    }
}
</style>