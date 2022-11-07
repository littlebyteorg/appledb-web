<template>
    <div
        class="wrapper firmwareVersionTableElement"
        v-on:click="expanded = !expanded"
        :style="{
            'grid-template-columns': showSingleDownloads ? '50% calc(50% - 4em) 2em 2em' : '50% calc(50% - 2em) 2em'
        }"
    >
        <div><a style="cursor: pointer;">{{ [fw.osStr, fw.version].join(' ') }}
            <template v-for="tag in [[fw.duplicateVersion || options.showBuildColumn ? fw.build : false, fw.preinstalled ? 'Preinstalled' : false].filter(x => x)]" :key="tag">
                <span v-if="tag.length"> ({{tag.join(', ')}})</span>
            </template>
        </a></div>
        <div style="text-align: right;">{{ fw.releasedStr }}</div>
        <div style="text-align: right;">
            <a style="cursor: pointer;">
                <i :class="[
                    'fas',
                    expanded ? 'fa-chevron-right' : 'fa-chevron-down'
                ]"/>
            </a>
        </div>
        <div v-on:click="expanded = !expanded" style="text-align: right;" v-if="fw.filteredDownloads.length == 1">
            <a :href="fw.filteredDownloads[0].url">
                <i class="fas fa-download"/>
            </a>
        </div>
    </div>
    <div v-if="expanded" class="custom-container">
        <h5>Firmware</h5>
        <ul style="padding-left: 0; list-style-type: none;">
            <li>Version: {{ [fw.osStr, fw.version].join(' ') }}</li>
            <li v-if="fw.build">Build: {{ fw.build }}</li>
            <li><router-link :to="fw.url">View more</router-link></li>
        </ul>
        <template v-if="fw.filteredDownloads.length">
            <h5>Download</h5>
            <ul :style="`${fw.filteredDownloads.length == 1 ? 'padding-left: 0; list-style-type: none;' : ''}`">
                <li v-if="fw.filteredDownloads.length == 1"><a :href="fw.filteredDownloads[0].url">{{ fw.filteredDownloads[0].label.slice(0,60) }}{{ fw.filteredDownloads[0].label.length > 60 ? '...' : '' }}</a></li>
                <li v-else v-for="dl in fw.filteredDownloads" :key="dl"><a :href="dl.url">{{ dl.deviceName }}</a></li>
            </ul>
        </template>
        <template v-if="fw.filteredOtas.length">
            <h5>Download (OTA)</h5>
            <ul :style="`${fw.filteredOtas.length == 1 ? 'padding-left: 0; list-style-type: none;' : ''}`">
                <li v-if="fw.filteredOtas.length == 1"><a :href="fw.filteredOtas[0].url">{{ fw.filteredOtas[0].label.slice(0,60) }}{{ fw.filteredOtas[0].label.length > 60 ? '...' : '' }}</a></li>
                <li v-else v-for="dl in fw.filteredOtas" :key="dl"><a :href="dl.url">{{ dl.deviceName }}</a></li>
            </ul>
        </template>
        <template v-if="fw.jailbreakArr.length">
            <h5>Jailbreaks</h5>
            <ul>
                <li v-for="jb in fw.jailbreakArr" :key="jb"><router-link :to="encodeURI(`/jailbreak/${jb.replace(/ /g, '-')}.html`)">{{ jb }}</router-link></li>
            </ul>
        </template>
    </div>
    <div v-if="!expanded" style="border-bottom: 1px solid var(--c-border); width: calc(100% - 24px); margin: auto; margin-block: -1px;"/>
</template>

<script>

export default {
    props: {
        fw: Object,
        options: Object,
        showSingleDownloads: Boolean
    },
    data() {
        return {
            expanded: false
        }
    }
}
</script>

<style scoped>
.wrapper {
    display: grid;
    padding: 1em;
    cursor: pointer;
    border-radius: 12px;
    transition: background 75ms ease-in-out;
}

.wrapper:hover {
    background: var(--c-border);
}

h5 {
    margin-top: 1.5em;
    padding-top: 0;
}
</style>