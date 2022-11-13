<template>
    <div
        class="wrapper firmwareVersionTableElement"
        v-on:click="expanded = !expanded"
    >
        <div>
            <span style="font-weight: 600;">
                <template v-if="options.showVersionString">{{ [fw.osStr, fw.version].join(' ') }}</template>
                <template v-for="tag in [[
                    fw.duplicateVersion || options.showBuildNumber ? fw.build : false,
                    fw.preinstalled.some(r => fw.devices.includes(r)) && (fw.filteredDownloads.length || fw.filteredOtas.length) ? 'Preinstalled' : false
                ].filter(x => x)]" :key="tag">
                    <span v-if="tag.length">{{(options.showVersionString ? ' (' : '') + tag.join(', ') + (options.showVersionString ? ')' : '')}}</span>
                </template>
            </span>
            <div class="signingStatus" :style="{
                'display': options.showSigningStatus ? 'initial' : 'none'
            }">
                <i :id="`signing-status-${fw.osStr}-${fw.build}`" class="fas"></i>
                <span :id="`signing-text-${fw.osStr}-${fw.build}`" class="signingText"></span>
            </div>
        </div>
        <div style="text-align: right; margin-left: auto;" class="releasedStr" v-if="fw.releasedStr && options.showReleasedString">{{ fw.releasedStr }}</div>
        <div v-if="showSingleDownloads" :style="{
            'text-align': 'right',
            'margin-left': fw.releasedStr && options.showReleasedString ? 0 : 'auto',
        }" class="downloadIcon">
            <div v-if="fw.filteredDownloads.length || fw.filteredOtas.length" v-on:click="openDownloadDropdown()">
                <a style="cursor: pointer;"><i class="downloadIcon fas fa-download"/></a>
                <div :class="[
                    'downloadDropdown',
                    'custom-container',
                    showDownloadDropdown ? 'active' : ''
                ]" style="cursor: initial;">
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
                </div>
            </div>
            <!--<div v-on:click="expanded = !expanded" v-else-if="fw.filteredDownloads.length == 1 || fw.filteredOtas.length == 1">
                <template v-if="fw.filteredDownloads.length == 1">
                    <a :href="fw.filteredDownloads[0].url">
                        <i class="fas fa-download"/>
                    </a>
                </template>
                <template v-else>
                    <a :href="fw.filteredOtas[0].url">
                        <i class="fas fa-download"/>
                    </a>
                </template>
            </div>-->
            <div v-else-if="fw.preinstalled.some(r => fw.devices.includes(r))" v-on:click="openDownloadDropdown()">
                <i class="fas fa-box-open"></i>
                <!--<i class="fas fa-check" style="position: absolute; right: -130.5px; padding-top: 6px; font-size: .45em; color: #fff;"></i>-->
                <div :class="[
                    'downloadDropdown',
                    'custom-container',
                    showDownloadDropdown ? 'active' : ''
                ]" style="padding-inline: 1.3em !important; font-weight: 500;">
                    Preinstalled firmware
                </div>
            </div>
            <div style="opacity: 0;" v-else>
                <i class="fas fa-download"/>
            </div>
        </div>
        <div style="width: 1em;" class="expandChevron">
            <a style="cursor: pointer;">
                <i :class="[
                    'fas',
                    expanded ? 'fa-chevron-right' : 'fa-chevron-down'
                ]"/>
            </a>
        </div>
    </div>
    <div v-if="expanded" class="custom-container expandedView">
        <h5>Firmware</h5>
        <ul style="padding-left: 0; list-style-type: none;">
            <li v-if="fw.build">Build: {{ fw.build }}</li>
            <li v-if="fw.releasedStr" class="releasedInfo">Released{{ fw.releasedStr.includes(',') ? ' on' : ':'}} {{ fw.releasedStr }}</li>
            <li><router-link :to="fw.url">View more</router-link></li>
        </ul>
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
            showDownloadDropdown: false,
            signed: 'unknown'
        }
    },
    mounted() {
        if (shouldSigningStatusBeChecked(this.fw.osStr, this.fw.devices[0])) this.getSigningStatus(this.fw.build, this.fw.devices, this.fw.osStr)
    },
    methods: {
        async getSigningStatus(buildid, identifiers, osStr) {
            var request = new XMLHttpRequest()

            request.open('GET', `https://api.ipsw.me/v4/ipsw/${identifiers[0]}/${buildid}`)

            request.setRequestHeader('Accept', 'application/json')

            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status == 200) {
                        const response = JSON.parse(this.responseText)
                        var statusElement = document.getElementById(`signing-status-${osStr}-${buildid}`)
                        var statusText = document.getElementById(`signing-text-${osStr}-${buildid}`)
                        
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
        },
        shouldSigningStatusBeChecked(identifier, osStr) {
            return [
                'bridgeOS',
                'iOS',
                'iPadOS',
                'macOS',
                'audioOS',
                'tvOS',
                'watchOS',
                'Apple TV Software',
                'iPhoneOS'
            ].includes(osStr) || ![
                'iPhone1,1',
                'iPhone1,2',
                'iPod1,1'
            ].includes(identifier)
        },
        openDownloadDropdown() {
            var elements = document.getElementsByClassName('downloadDropdown active')
            for (let element of elements) element.classList.remove('active')

            this.expanded = !this.expanded
            this.showDownloadDropdown = !this.showDownloadDropdown
        } 
    }
}
</script>

<style lang="scss" scoped>
.signingStatus {
    display: inline;

    i {
        font-size: .7em;
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
    display: flex;
    padding: 1.2em 1em;
    cursor: pointer;
    border-radius: 12px;
    transition: background 75ms ease-in-out;

    div {
        padding-inline: .5em;

        &:first-child {
            padding-left: 0;
        }

        &:last-child {
            padding-right: 0;
        }
    }

    &:hover {
        background: var(--c-border);

        .signingText {
            opacity: 0.8;
            margin-left: 2px;
        }
    }
}

h5 {
    margin-top: 1.5em;
    padding-top: 0;
}

.releasedInfo {
    display: none;
}

@media screen and (max-width: 575px) {
    .releasedStr {
        display: none;
    }

    .downloadIcon {
        margin-left: auto !important;
    }

    .releasedInfo {
        display: block;
    }
}

.downloadDropdown {
    text-align: left;
    padding: 1em 2em !important;
    box-shadow: 0px 2px 12px rgba(0,0,0,0.1);
    transition: opacity 200ms ease-in-out, margin-top 200ms ease-in-out, transform 300ms ease-in-out;
    position: absolute;
    word-wrap: break-word;

    max-width: 70%;
    opacity: 0;
    transform: scale(0);
    transform-origin: top right;

    h5 {
        margin-top: 1em;
        padding-bottom: 0;
    }

    div {
        padding-left: 0;
        padding-bottom: .5em;
    }

    right: calc(calc(calc(100vw - var(--content-width)) / 2) + 3em);
    margin-top: 0px;
}

@media screen and (max-width: 740px) {
    .downloadDropdown {
        right: 4.5em;
        max-width: 60%;
    }
}

.downloadIcon {
    width: 1em;

    i {
        width: 100%;
        text-align: center;
    }
}

.downloadIcon:hover .downloadDropdown {
    opacity: 1;
    margin-top: 10px;
    transform: scale(1);
}

.expandedView {
    h5 {
        padding-bottom: 0;
    }
}
</style>