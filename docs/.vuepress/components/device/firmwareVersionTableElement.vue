<template>
    <div
        class="wrapper firmwareVersionTableElement"
        v-on:click="expanded = !expanded"
    >
        <div class="firmwareAndReleasedStr" :style="{'width': `calc(100% - ${(1 + showSingleDownloads) * 32}px)`}">
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
                <div style="padding-inline: .25em; display: inline-block;"></div>
                <div v-if="showDots" :class="[
                    fw.internal ? 'internal' : (
                        (fw.beta || fw.rc) ? 'beta' : 'stable'
                    ),
                    'stableBetaInternalWrapper'
                ]"><span>
                    {{ fw.internal ? 'internal' : (
                        fw.rc ? 'rc' : (
                            fw.beta ? 'beta' : 'stable'
                        )
                    ) }}
                    </span>
                </div>
                <div v-if="fw.rsr" class="stableBetaInternalWrapper"><span>RSR</span></div>
                <div v-if="fw.sdk" class="stableBetaInternalWrapper"><span>SDK</span></div>
                <div class="signingStatus" :style="{
                    'display': options.showSigningStatus ? 'initial' : 'none'
                }">
                    <i :id="`signing-status-${fw.osStr}-${fw.build}`" class="fas"></i>
                    <span :id="`signing-text-${fw.osStr}-${fw.build}`" class="signingText"></span>
                </div>
            </div>
            <div style="text-align: right;" class="releasedStr" v-if="fw.releasedStr && options.showReleasedString">{{ fw.releasedStr }}</div>
        </div>

        <div class="iconFlex">
            <template v-if="showSingleDownloads">
                <div
                    v-if="fw.filteredDownloads.length || fw.filteredOtas.length"
                    @click="openDownloadDropdown()"
                    class="downloadIcon iconChild"
                >
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

                <div
                    v-else-if="fw.preinstalled.some(r => fw.devices.includes(r))"
                    @click="openDownloadDropdown()"
                    class="downloadIcon iconChild"
                >
                    <i class="fas fa-box-open"></i>
                    <div :class="[
                        'downloadDropdown',
                        'custom-container',
                        showDownloadDropdown ? 'active' : ''
                    ]" style="padding-inline: 1.3em !important; font-weight: 500;">
                        Preinstalled firmware
                    </div>
                </div>
            </template>

            <div class="iconChild">
                <a style="cursor: pointer;">
                    <i :class="[
                        'fas',
                        expanded ? 'fa-chevron-right' : 'fa-chevron-down'
                    ]"/>
                </a>
            </div>
        </div>
    </div>
    <div v-if="expanded" class="custom-container expandedView">
        <h5 v-if="fw.build && fw.releasedStr">Firmware</h5>
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
        showSingleDownloads: Boolean,
        showDots: Boolean
    },
    data() {
        return {
            expanded: false,
            showDownloadDropdown: false,
            signed: 'unknown'
        }
    },
    mounted() {
        const identifierArr = this.fw.devices.filter(x => this.shouldSigningStatusBeChecked(x, this.fw.osStr))
        if (identifierArr.length) this.getSigningStatus(this.fw.build, identifierArr[0], this.fw.osStr, this.fw.beta || this.fw.rc)
    },
    methods: {
        async getSigningStatus(buildid, identifier, osStr, beta) {
            var request = new XMLHttpRequest()

            if (beta) request.open('GET', `https://api.m1sta.xyz/betas/${identifier}`)
            else request.open('GET', `https://api.ipsw.me/v4/ipsw/${identifier}/${buildid}`)

            request.setRequestHeader('Accept', 'application/json')

            request.onreadystatechange = function () {
                if (this.readyState === 4 && this.status == 200) {
                    let response = JSON.parse(this.responseText)
                    var statusElement = document.getElementById(`signing-status-${osStr}-${buildid}`)
                    var statusText = document.getElementById(`signing-text-${osStr}-${buildid}`)

                    if (beta) {
                        response = response.filter(x => x.buildid == buildid)
                        if (!response.length) return
                        else response = response[0]
                    }
                    
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
            ].includes(osStr) && ![
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
.stableBetaInternalWrapper {
    display: inline-block;
    margin-top: -6px;
    vertical-align: middle;

    span {
        border-radius: 4em;
        border: 1px solid;
        padding: 3.5px 9px;
        text-transform: uppercase;
        font-size: calc(1em - 2px);
        font-weight: 700;
        font-size: .5em;
        letter-spacing: .5px;
    }
}

.signingText {
    padding-left: .5em;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 1px;
    font-size: .7em;
    opacity: 0.8;
    padding-top: 3.5px;
}

.signingStatus {
    display: inline;

    i {
        font-size: .5em;
        padding-bottom: 2px;
        vertical-align: middle;
    }

    .signingText {
        position: absolute;
        opacity: 0;
        transition: 150ms opacity ease-in-out, 150ms margin ease-in-out;
        margin-left: -12px;
    }

    .fa-check, .fa-times {
        border: 1px solid;
        border-radius: 5em;
        padding: 3.5px 5px;
        text-align: center;
    }

    .fa-check {
        color: rgb(76, 175, 80, 1);
    }

    .fa-times {
        color: rgb(244, 67, 54, 1);
    }
}
.wrapper {
    display: flex;
    padding: 1.2em 1em;
    cursor: pointer;
    border-radius: 12px;
    transition: background 75ms ease-in-out;

    div {
        padding-right: .5em;

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
            margin-left: 3px;
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

    .firmwareAndReleasedStr {
        width: 100% !important;
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

.stable {
    color: #039be5;
}

.beta {
    color: #ab47bc;
}

.internal {
    color: #f0ad05;
}

.fa-circle {
    font-size: .45em;
    margin-left: 1em;
    opacity: 0.7;
    vertical-align: middle;
    margin-top: -.1em;
}

.firmwareAndReleasedStr {
    display: flex;
    justify-content: space-between;
}

.iconFlex {
    display: flex;
    align-content: flex-end;
    margin-left: auto;

    .iconChild {
        width: 24px;
        text-align: center;
    }
}
</style>