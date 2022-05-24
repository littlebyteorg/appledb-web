<template>
    <div class="flexContainer">
        <div class="flexImg"><a :href="`/firmware.html?os=${latestVersion.osStr}&build=${latestVersion.build}`">
            <img :src="`/assets/images@lowres/${image}_firmware_release${isDarkMode && dark ? '_dark' : ''}.png`" style="max-height: 7em;">
        </a></div>
        <div class="flexText">
            <h2>{{ latestVersion.osStr }} {{ latestVersion.version }} ({{ latestVersion.build }})</h2>
            <p>{{ new Intl.DateTimeFormat('en-US', { dateStyle: 'medium'}).format(new Date(latestVersion.released)) }}</p>
            <a :href="`/firmware.html?os=${latestVersion.osStr}&build=${latestVersion.build}`">View more</a>
        </div>
    </div>
</template>

<script>
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import latestVersion from '@temp/latestVersion'

export default {
    props: {
        osStr: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        beta: {
            type: Boolean,
            required: true
        },
        dark: {
            type: Boolean,
            default: true
        },
        startsWith: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isDarkMode: useDarkMode(),
            latestVersion: latestVersion.filter(x => x.osStr == this.osStr && x.beta == this.beta && x.version.startsWith(this.startsWith))[0],
        }
    }
}
</script>

<style scoped>
.flexContainer {
    display: flex;
}

img {
    padding: 2em;
    padding-right: 3em;
}

h2 {
    border-bottom: none;
    padding-bottom: 0;
    margin-block-end: 0;
}

p {
    margin-block-start: .5em;
}

.flexImg {
    width: 14.5em;
    height: 11em;
    text-align: center;
}

.flexText {
    border-bottom: 1px solid var(--c-border);
    width: calc(100% - 15em);
}
</style>