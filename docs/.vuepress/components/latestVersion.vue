<template>
    <template v-for="version in latestVersion" :key="version"><template v-for="url in [`/firmware.html?os=${version.osStr}&build=${version.build}`]" :key="url"><template v-for="props in [properties.filter(x => x.osStr == version.osStr && (x.startsWith ? version.version.startsWith(x.startsWith) : true))[0]]" :key="props">
        <div class="releasefw--flexContainer">
            <div class="releasefw--flexImg"><a :href="url">
                <img :src="`/assets/images@lowres/${props.image}_firmware_release${isDarkMode && props.dark ? '_dark' : ''}.png`" style="height: 7em; padding: 2em; padding-right: 3em;">
            </a></div>
            <div class="releasefw--flexText">
                <h2 style="border-bottom: none; padding-bottom: 0; margin-block-end: 0;">{{ version.osStr }} {{ version.version }} ({{ version.build }})</h2>
                <p style="margin-block-start: .5em;">{{ new Intl.DateTimeFormat('en-US', { dateStyle: 'medium'}).format(version.released) }}</p>
                <a :href="url">View more</a>
            </div>
        </div>
    </template></template></template>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import latestVersion from '@temp/latestVersion'

export default {
    data() {
        return {
            isDarkMode: useDarkMode(),
            properties: [
                {
                    osStr: 'audioOS',
                    image: 'audio',
                    startsWith: '15',
                    dark: false
                },
                {
                    osStr: 'audioOS',
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
                    dark: true
                },
                {
                    osStr: 'iOS',
                    image: 'ios15',
                    startsWith: '15',
                    dark: false
                },
                {
                    osStr: 'iOS',
                    image: 'ios16',
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
                    dark: false
                },
            ]
        }
    },
    computed: {
        latestVersion() {
            return latestVersion
            .filter(x => 
                this.properties.map(y => y.osStr)
                .includes(x.osStr)
            )
            .map(x => {
                const dateOffset = new Date().getTimezoneOffset() * 60 * 1000
                const currentDate = new Date(x.released).valueOf()
                const adjustedDate = new Date(currentDate + dateOffset)
                x.released = adjustedDate
                return x
            })
            .sort((a,b) => {
                const dateRel = b.released - a.released
                if (dateRel != 0) return dateRel

                if (a.osStr < b.osStr) return -1
                if (a.osStr > b.osStr) return 1

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

<style>
.releasefw--flexContainer {
    display: flex;
    flex-wrap: wrap;
    padding-top: 1em;
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

@media (max-width: 720px) {
    .releasefw--flexContainer {
        flex-direction: column;
    }

    .releasefw--flexImg {
        width: 100%;
    }
}
</style>