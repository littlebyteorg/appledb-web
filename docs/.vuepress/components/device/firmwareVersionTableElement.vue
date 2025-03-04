<template>
    <div
        class="wrapper firmwareVersionTableElement"
        @click="expanded = !expanded"
    >
        <div class="firmwareAndReleasedStr" :style="{'width': `calc(100% - ${(1 + showSingleDownloads) * 32}px)`}">
            <div>
                <span
                    style="font-weight: 600;"
                    v-if="options.showVersionString"
                >
                    {{ [
                        fw.osStr,
                        fw.version
                    ].join(' ') }}
                </span>
                <template v-if="fw.build && (expanded || this.fw.duplicateVersion || this.options.showBuildNumber)">
                    <i
                        style="margin-inline: 8px; font-size: .3em"
                        class="fas fa-circle">
                    </i>
                    <code
                        style="
                            padding-inline: 0;
                            background: none;
                            font-size: 0.95em;
                        "
                    >
                        {{ this.fw.build }}
                    </code>
                </template>
                <template v-if="this.fw.preinstalled.some(r => this.fw.devices.includes(r)) && (this.fw.filteredDownloads.length || this.fw.filteredOtas.length)">
                    <i class="fas fa-box-open" style="padding-left: 8px;"/>
                </template>
                <div style="padding-inline: .25em; display: inline-block;"></div>
                <div v-if="showDots || expanded" :class="[
                    fw.internal ? 'internal' : (
                        (fw.beta || fw.rc) ? 'beta' : 'release'
                    ),
                    'releaseBetaInternalWrapper'
                ]"><span>
                    {{ fw.internal ? 'internal' : (
                        fw.rc ? 'rc' : (
                            fw.beta ? 'beta' : 'release'
                        )
                    ) }}
                    </span>
                </div>
                <span v-else-if="(fw.internal || fw.beta || fw.rc) && Object.keys(hasFirmwares).filter(x => hasFirmwares[x]).length == 1">
                    <i
                        style="margin-left: 0px; font-size: .4em;"
                        :class="[
                            fw.internal ? 'internal' : (
                                (fw.beta || fw.rc) ? 'beta' : 'release'
                            ),
                            'fas',
                            'fa-circle'
                        ]">
                    </i>
                </span>
                <div v-if="fw.rsr" class="releaseBetaInternalWrapper"><span>RSR</span></div>
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
                                <li v-if="fw.filteredDownloads.length == 1"><a :href="fw.filteredDownloads[0].url">{{ fw.filteredDownloads[0].deviceName.slice(0,60) }}{{ fw.filteredDownloads[0].deviceName.length > 60 ? '...' : '' }}</a></li>
                                <li v-else v-for="dl in fw.filteredDownloads" :key="dl"><a :href="dl.url">{{ dl.deviceName }}</a></li>
                            </ul>
                        </template>
                        <template v-if="fw.filteredOtas.length">
                            <h5>Download (OTA)</h5>
                            <ul :style="`${fw.filteredOtas.length == 1 ? 'padding-left: 0; list-style-type: none;' : ''}`">
                                <li v-if="fw.filteredOtas.length == 1"><a :href="fw.filteredOtas[0].url">{{ fw.filteredOtas[0].deviceName.slice(0,60) }}{{ fw.filteredOtas[0].deviceName.length > 60 ? '...' : '' }}</a></li>
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
                        expanded ? 'fa-chevron-down' : 'fa-chevron-right'
                    ]"/>
                </a>
            </div>
        </div>
    </div>
    <div v-if="expanded" class="expandedView">
        <div class="custom-container releasedInfo" v-if="fw.releasedStr">
            <div style="display: flex; flex-flow: row wrap; align-content: space-between;">
                <ul style="padding-left: 0; list-style-type: none;">
                    <li class="releasedInfo">Released{{ fw.releasedStr.includes(',') ? ' on' : ':'}} {{ fw.releasedStr }}</li>
                </ul>
            </div>
        </div>
        <div v-if="fwData && fwData.content" class="custom-container">
            <h5>Devices</h5>
            <grid :content="fwData.content" :sectionClass="fwData.class + ' blue' || ''"/>
            <br>
        </div>
        <div v-if="fw.jailbreakArr.length" class="custom-container">
            <h5>Jailbreaks</h5>
            <ul>
                <li v-for="jb in fw.jailbreakArr" :key="jb"><router-link :to="encodeURI(`/jailbreak/${jb.replace(/ /g, '-')}.html`)">{{ jb }}</router-link></li>
            </ul>
        </div>
        <div class="custom-container">
            <p><a :href="fw.url">View more <i style="font-size: 0.8em; padding-left: 2px;" class="fas fa-arrow-right"></i></a></p>
        </div>
        <div class="custom-container" v-if="options.showTweetButton"><p>
            <a
                :href="'https://twitter.com/intent/tweet?text=' + encodeURI(
                    `${[fw.osStr, fw.version ].join(' ')}${fw.build ? ' (' + fw.build + ')' : ''} has been released. https://appledb.dev${fw.url}`
                )"
                target="_blank"
            >
                <i
                    style="margin-right: 8px;"
                    class="fab fa-twitter"
                />Tweet
            </a>
        </p></div>
    </div>
    <div v-if="!expanded" style="border-bottom: 1px solid var(--c-border); width: calc(100% - 24px); margin: auto; margin-block: -1px;"/>
</template>

<script>
export default {
    props: {
        fw: Object,
        options: Object,
        showSingleDownloads: Boolean,
        hasFirmwares: Object,
        showDots: Boolean
    },
    data() {
        return {
            expanded: false,
            showDownloadDropdown: false,
            signed: 'unknown',
            fwData: [],
            tags: []
        }
    },
    mounted() {
        const identifierArr = this.fw.devices.filter(x => this.shouldSigningStatusBeChecked(x, this.fw.filteredDownloads, (this.fw.beta || this.fw.rc)))
        this.fw.jailbreakArr = Object.keys(this.fw.jailbreakCompatibility).filter(x => [...new Set(identifierArr).intersection(new Set(this.fw.jailbreakCompatibility[x]))].length)
        if (identifierArr.length) this.getSigningStatus(this.fw.build, identifierArr[0], this.fw.osStr, this.fw.beta || this.fw.rc, this.fw.uniqueBuild)
        
        this.tags = [
        ].filter(x => x.val)
    },
    async created() {
        //let data = await this.getFwData()
        //this.fwData = data.sections.find(x => x.title == 'Devices')
    },
    methods: {
        async getSigningStatus(buildid, identifier, osStr, beta) {
            var request = new XMLHttpRequest()

            /*if (beta) request.open('GET', `https://api.m1sta.xyz/betas/${identifier}`)
            else*/ request.open('GET', `https://api.ipsw.me/v4/ipsw/${identifier}/${buildid}`)

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
        shouldSigningStatusBeChecked(identifier, filteredDownloads, beta) {
            if (beta || !filteredDownloads || [
                'iPhone1,1',
                'iPhone1,2',
                'iPod1,1'].includes(identifier)) return false
            return filteredDownloads.filter(x => x.key.startsWith(identifier) && x.url.endsWith('.ipsw')).length > 0
        },
        openDownloadDropdown() {
            var elements = document.getElementsByClassName('downloadDropdown active')
            for (let element of elements) element.classList.remove('active')

            this.expanded = !this.expanded
            this.showDownloadDropdown = !this.showDownloadDropdown
        },
        getFwData() {
            return fetch(`/pageData/firmware/${[this.fw.osStr,this.fw.uniqueBuild].join(';')}.json`.replace(/\.html/g,''), {
                method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            )
            .then((response) => response.text())
            .then((response) => JSON.parse(response));
        }
    }
}
</script>

<style lang="scss" scoped>
.releaseBetaInternalWrapper {
    display: inline-block;
    margin-top: -10px;
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
    margin-top: 2px;
}

.signingStatus {
    display: inline;

    i {
        font-size: .5em;
        vertical-align: middle;
        margin-top: -4px;
        width: 8px;
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
        padding: 4px;
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

.notReleasedInfo {
    display: block;
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

    .notReleasedInfo {
        display: none;
    }

    .alignRightDate {
        margin-left: auto !important;
    }
}

.alignRight {
    margin-left: auto;
}

.alignRightDate {
    margin-left: 0;
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
    margin-top: .5em;

    h5 {
        padding-bottom: 0;
        display: block;

        &::after {
            background: none;
            margin-left: 0;
            height: 0;
        }
    }
}

.release {
    color: #039be5 !important;
}

.beta {
    color: #ab47bc !important;
}

.internal {
    color: #f0ad05 !important;
}

.fa-circle {
    font-size: .45em;
    margin-left: 1em;
    vertical-align: middle;
    margin-top: -.1em;
    color: var(--c-text-lightest)
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