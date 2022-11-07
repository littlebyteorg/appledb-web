<template>
    <div
        class="wrapper firmwareVersionTableElement"
        v-on:click="expanded = !expanded"
        :style="{
            'grid-template-columns': showSingleDownloads ? '50% calc(50% - 4em) 2em 2em' : '50% calc(50% - 2em) 2em'
        }"
    >
        <div>
            <a style="cursor: pointer;">{{ [fw.osStr, fw.version].join(' ') }}
                <template v-for="tag in [[fw.duplicateVersion || options.showBuildColumn ? fw.build : false, fw.preinstalled ? 'Preinstalled' : false].filter(x => x)]" :key="tag">
                    <span v-if="tag.length"> ({{tag.join(', ')}})</span>
                </template>
            </a>
            <div class="signingStatus">
                <i :id="`signing-status-${fw.build}`" class="fas"></i>
                <span :id="`signing-text-${fw.build}`" class="signingText"></span>
            </div>
        </div>
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
            expanded: false,
            signed: 'unknown'
        }
    },
    mounted() {
        this.getSigningStatus(this.fw.build, this.fw.devices)
    },
    methods: {
        getSigningStatus(buildid, identifiers) {
            var request = new XMLHttpRequest()

            request.open('GET', `https://api.ipsw.me/v4/ipsw/${identifiers[0]}/${buildid}`)

            request.setRequestHeader('Accept', 'application/json')

            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status == 200) {
                        const response = JSON.parse(this.responseText)
                        var statusElement = document.getElementById(`signing-status-${buildid}`)
                        var statusText = document.getElementById(`signing-text-${buildid}`)
                        
                        if (response.signed) {
                            statusElement.classList.add('fa-check')
                            statusText.innerHTML = 'Signed'
                        }
                        else {
                            statusElement.classList.add('fa-times')
                            statusText.innerHTML = 'Not signed'
                        }
                    }
                }
            }

            request.send()
        }
    }
}
</script>

<style lang="scss" scoped>
.signingStatus {
    display: inline;

    &:hover {
        .signingText {
            opacity: 0.8;
            margin-left: 0px;
        }
    }

    i {
        font-size: .7em;
        padding-left: 4px;
        padding-bottom: 2px;
        vertical-align: middle;
    }

    .signingText {
        position: absolute;
        padding-left: .5em;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 1px;
        font-size: .7em;
        opacity: 0;
        transition: 150ms opacity ease-in-out, 150ms margin ease-in-out;
        padding-top: 3.5px;
        margin-left: -10px;
    }

    .fa-check {
        color: rgb(76, 175, 80, 0.7);
    }

    .fa-times {
        font-size: .8em;
        padding-bottom: 0;
        color: rgb(244, 67, 54, 0.7);
    }
}
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