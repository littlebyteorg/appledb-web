<template>
    <h5 v-if="!mainList" style="margin-bottom: .3em;">
        {{ versionHeaderStr }}
        <i
            v-if="!hasFirmwareFilters"
            class="fas fa-sort"
            style="
                margin-inline: 10px;
                font-size: 1em;
                cursor: pointer;
            " @click="versionArr.reverse()"
        ></i>
    </h5>

    <div class="optionsWrapper" v-if="hasFirmwareFilters">
        <div
                :class="[options.showRelease ? 'active' : '', 'release', 'btn','sbiFilter']"
                @click="options.showRelease = !options.showRelease; filterVersions()"
                v-if="hasFirmwares.release"
        >
            <i class="fas fa-circle release"></i> Release
        </div>
        <div
            :class="[options.showBeta ? 'active' : '', 'beta', 'btn','sbiFilter']"
            @click="options.showBeta = !options.showBeta; filterVersions()"
            v-if="hasFirmwares.beta"
        >
            <i class="fas fa-circle beta"></i> Beta
        </div>
        <div
            :class="[options.showInternal ? 'active' : '', 'internal', 'btn','sbiFilter']"
            @click="options.showInternal = !options.showInternal; filterVersions()"
            v-if="hasFirmwares.internal"
        >
            <i class="fas fa-circle internal"></i> Internal
        </div>
        <div class="separatorBefore"></div>
        <div :class="['hoverOn',deviceFilter.length < 2 ? 'show740' : '']">
            <div
                class="btn"
            >
                <i class="fas fa-filter"></i> Filter
            </div>
            <div class="hoverElement filterList">
                <div
                    v-for="filter in [
                        {
                            label: 'Release',
                            option: 'showRelease'
                        },
                        {
                            label: 'Beta',
                            option: 'showBeta'
                        },
                        {
                            label: 'Internal',
                            option: 'showInternal'
                        }
                    ]"
                    :key="filter"
                    :class="[
                        'filterListItem',
                        'show740',
                        options[filter.option] ? 'active' : ''
                    ]"
                    @click="options[filter.option] = !options[filter.option]; filterVersions()"
                >
                    <div :class="['iconWrapper',filter.option]"><i class="fas fa-check"></i></div>
                    <div class="textWrapper">{{ filter.label }}</div>
                </div>
                <template v-if="deviceFilter.length > 1">
                    <hr class="show740">
                    <template v-if="deviceFilter.length > 4">
                        <div
                            class="filterListItem active"
                            @click="options.filterDev.length == deviceFilter.length ?
                                options.filterDev = [] :
                                options.filterDev = deviceFilter.map(x => x.value)
                            ;filterVersions()"
                        >
                            <div class="iconWrapper noBorder"><i :class="`fas fa-border-${options.filterDev.length == deviceFilter.length ? 'none' : 'all'}`"></i></div>
                            <div class="textWrapper">{{ options.filterDev.length == deviceFilter.length ? 'Clear' : 'Select' }} all</div>
                        </div>
                    </template>
                    <div
                        v-for="filter in deviceFilter"
                        :key="filter"
                        :class="[
                            'filterListItem',
                            options.filterDev.includes(filter.value) ? 'active' : ''
                        ]"
                        v-on:click="
                        options.filterDev = options.filterDev.includes(filter.value) ?
                            options.filterDev.filter(x => x != filter.value) :
                            options.filterDev.concat(filter.value);
                        filterVersions()
                    ">
                        <div class="iconWrapper"><i class="fas fa-check"></i></div>
                        <div class="textWrapper">{{ filter.label }}</div>
                    </div>
                </template>
            </div>
        </div>
        <div class="separatorAfter"></div>
        <div
            @click="versionArr.reverse()"
            class="btn"
        >
            <i class="fas fa-sort"></i> Sort
        </div>
        <div
            @click="$refs.fwSearchBar.focus()"
            class="btn searchBtn"
        >
            <i class="fas fa-search"></i> <input
                class="search"
                v-model="options.searchStr"
                placeholder="Search"
                aria-placeholder="Search"
                v-on:keyup.enter="filterVersions()"
                ref="fwSearchBar"
            >
        </div>
    </div>

    <div v-if="options.showFilter" class="optionsWrapper filterListHorizontal">
        <template v-if="deviceFilter.length > 4">
            <div class="btn" @click="options.filterDev = []; filterVersions()">
                <i class="fas fa-times" style="font-size: .8em; margin-right: 4px;"></i> Clear all
            </div>
            <div class="btn" @click="options.filterDev = deviceFilter.map(x => x.value); filterVersions()">
                <i class="fas fa-check" style="font-size: .8em; margin-right: 4px;"></i> Select all
            </div>
            <div style="border-right: 1px solid var(--c-border); margin-inline: .5em; margin-block: .4em;"></div>
        </template>
        <div
            v-for="filter in deviceFilter"
            :key="filter"
            :class="[
                'filterBtn',
                'btn',
                options.filterDev.includes(filter.value) ? 'active' : ''
            ]"
            @click="
            options.filterDev = options.filterDev.includes(filter.value) ?
                options.filterDev.filter(x => x != filter.value) :
                options.filterDev.concat(filter.value);
            filterVersions()
        ">
            <span>{{ filter.label }}</span>
        </div>
    </div>

    <firmwareVersionTableElement
        v-for="fw in versionArr.slice(loadedFirmwares[0], loadedFirmwares[1])"
        :key="fw"
        :fw="fw"
        :options="options"
        :showDots="(options.showRelease + options.showBeta + options.showInternal > 1) && hasFirmwareFilters"
        :showSingleDownloads="versionArr.map(x => x.filteredDownloads || x.filteredOtas).filter(x => x.length).length > 0 || versionArr.map(fw => fw.preinstalled.some(r => fw.devices.includes(r))).filter(x => x).length > 0"
    />

    <template v-if="loadedFirmwares[1] < versionArr.length">
        <div style="display: flex; padding: 1em; padding-top: 1.5em;">
            <div>Displaying {{ loadedFirmwares[1] }} firmware versions out of {{ versionArr.length }}.</div>
            <div style="margin-left: auto;"><a style="cursor: pointer;" v-on:click="loadedFirmwares[1] += 500">Load more</a></div>
        </div>
    </template>

    <hiddenOptions
        v-if="devOptions.show"
        :options="options"
        :optionsObj="optionsObj"
        :devOptions="devOptions"
        :deviceFilter="deviceFilter"
        :filterVersions="filterVersions"
    />
</template>

<script>
export default {
    props: {
        fmVersionArr: Array,
        deviceFilter: Array,
        mainList: Boolean,
        hasFirmwares: Object,
        hasFirmwareFilters: Boolean,
        devOptions: Object
    },
    data() {
        return {
            loadedFirmwares: [0,100],
            versionArr: [],

            versionHeaderStr: 'Firmware Versions',

            optionsObjStr: {
                showBuildNumber: "Show build numbers",
                showVersionString: "Show version numbers",
                showReleasedString: "Show release dates",
                showSigningStatus: "Show signing status",
                showTweetButton: "Show Tweet button"
            },

            options: {
                showBuildNumber: false,
                showVersionString: true,
                showReleasedString: true,
                showSigningStatus: true,

                showRelease: true,
                showBeta: false,
                showInternal: false,

                showTweetButton: false,

                searchStr: '',
                
                showFilter: false,
                filterDev: []
            },
        }
    },
    computed: {
        optionsObj() {
            return [
                "showBuildNumber",
                "showVersionString",
                "showReleasedString",
                "showSigningStatus",
                "showTweetButton"
            ].map(x => {
                return {
                    label: this.optionsObjStr[x],
                    model: x,
                    display: true
                }
            })
        }
    },
    methods: {
        filterVersions() {
            this.versionArr = this.fmVersionArr.filter(fw =>
                (
                    (fw.internal ? this.options.showInternal : 
                    ((fw.beta || fw.rc) ? this.options.showBeta : this.options.showRelease)) &&
                    fw.deviceFilterArr.some(r => this.options.filterDev.includes(r))
                ) && (
                    [fw.osStr,fw.version,fw.build].join(' ').toLowerCase().includes(this.options.searchStr.toLowerCase())
                )
            )

            let query = this.$route.query
            
            let filterValues = [
                ['release',  this.options.showRelease],
                ['beta',    this.options.showBeta],
                ['internal',this.options.showInternal]
            ]
            
            let filter = filterValues.filter(x => x[1]).map(x => x[0])
            if (filter.length == filterValues.length) filter = []

            if (this.deviceFilter.length != this.options.filterDev.length) {
                filter.push(...this.options.filterDev)
            }
            
            filter = filter.length ? { filter: filter.join(';') } : {}
            
            this.$router.push({ query: filter })
        }
    },
    mounted() {
        let querySet = {
            releaseBetaInternalFilter: false,
            deviceFilter: false
        }

        let query = this.$route.query
        if (query && query.filter && query.filter.length) {
            query = query.filter.split(';')
            if (query.some(r => ['release','beta','internal'].includes(r))) {
                querySet.releaseBetaInternalFilter = true
                this.options.showRelease = query.includes('release')
                this.options.showBeta = query.includes('beta')
                this.options.showInternal = query.includes('internal')
            }
            if (query.some(r => this.deviceFilter.map(x => x.value).includes(r))) {
                querySet.deviceFilter = true
                this.options.filterDev = query.filter(x => this.deviceFilter.map(x => x.value).includes(x))
            }
        }

        if (!querySet.deviceFilter) this.options.filterDev = this.deviceFilter.map(x => x.value)

        if (!querySet.releaseBetaInternalFilter) {
            if (this.mainList) {
                this.options.showBeta = true
                this.options.showInternal = true
            } else if (!this.hasFirmwareFilters) {
                this.options.showRelease = this.hasFirmwares.release
                this.options.showBeta = this.hasFirmwares.beta
                this.options.showInternal = this.hasFirmwares.internal
            }
        }

        this.filterVersions()
    }
}
</script>

<style lang="scss" scoped>
html.dark .btn {
    background: var(--c-border-dark);
}

.optionsWrapper {
    display: flex;
    align-content: space-between;
    flex-flow: row wrap;
    margin-bottom: .5em;

    .separatorBefore {
        margin-inline: auto;
    }
    .separatorAfter {
        margin-inline: 0;
    }

    .search {
        font-size: 1em;
        background: inherit;
        border: none;
        margin: 0;
        padding: 0;
        margin-left: 4px;
        width: 51px;

        &:focus-visible {
            outline: none;

        }
    }

    .btn {
        white-space: nowrap;
        padding: .7em;
        padding-inline: 1.2em;
        margin: .3em;
        border-radius: 4em;
        cursor: pointer;
        transition: 100ms background ease-in-out, transform 150ms ease-in-out;
        border: 1px solid var(--c-border);
        box-shadow: 0px 2px 4px rgba(0,0,0,0.05);

        .fas {
            font-size: .9em;
        }

        &:has(>.search:focus-visible) {
            background: var(--c-border) !important;
        }

        &:hover {
            transform: scale(1.05);
            background: var(--c-border) !important;
        }

        &.active {
            background: var(--c-border);
            font-weight: 600;

            &.release {
                background: #039be530 !important;
                border-color: #039be501 !important;
            }

            &.beta {
                background: #ab47bc30 !important;
                border-color: #ab47bc01 !important;
            }

            &.internal {
                background: #fbc02d30 !important;
                border-color: #fbc02d01 !important;
            }
        }

        &.release {
            background: #039be510 !important;
                border-color: #039be501 !important;
            &:hover {
                background: #039be530 !important;
            }
        }
        &.beta {
            background: #ab47bc10 !important;
            border-color: #ab47bc01 !important;
            &:hover {
                background: #ab47bc30 !important;
            }
        }
        &.internal {
            background: #fbc02d10 !important;
            border-color: #fbc02d01 !important;
            &:hover {
                background: #fbc02d30 !important;
            }
        }

        .fa-circle {
            font-size: .5em;
            vertical-align: middle;
            padding-bottom: 2px;
            padding-right: 4px;
        }

        .release {
            color: #039be5;
        }

        .beta {
            color: #ab47bc;
        }

        .internal {
            color: #fbc02d;
        }
    }
}

.hoverElement {
    opacity: 0;
    transition: opacity 100ms ease-in-out, margin-top 100ms ease-in-out, transform 200ms ease;
    margin-top: -10px;
    transform: scale(0);
    transform-origin: top left;
    position: relative;
    left: calc(calc(calc(100vw - var(--content-width)) / 2) + 416px);
    max-width: calc(var(--content-width) * 0.6);
}

.show740 {
    display: none !important;
}

@media screen and (max-width: 740px) {
    .show740 {
        display: inherit !important;
        
        &.filterListItem {
            display: flex !important;
        }
    }

    .hoverElement {
        left: 2em;
        max-width: 60%;
    }

    .optionsWrapper {
        .sbiFilter {
            display: none;
        }

        .separatorBefore {
            margin-inline: 0;
        }
        .separatorAfter {
            margin-inline: 0;
        }
    }
}


.hoverOn:hover .hoverElement {
    opacity: 1;
    margin-top: 5px;
    transform: scale(1);
}

.filterList {
    position: absolute;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
    padding: 1em;
    border-radius: 8px;
}

/*.filterListHorizontal {
    display: flex;
    flex-flow: row nowrap;
    overflow-x: auto;

    padding-bottom: 1em;
    margin-bottom: 0;

    .filterBtn {
        background: var(--c-bg) !important;

        &.active {
            background: var(--c-border) !important;
        }
    }
}*/

.filterListItem {
    padding: .4em;
    display: flex;

    &:hover {
        cursor: pointer;
    }
    
    .iconWrapper {
        opacity: 0.7;
        display: block;
        border: 1px solid;
        border-radius: 4px;
        margin-right: .8em;
        font-size: .6em;

        i {
            opacity: 0;
            padding: 4px;
        }

        &.noBorder {
            i {
                padding-block: 0;
            }

            margin-right: .4em;
            font-size: 1em;
            border: 0px;
        }

        &.showRelease {
            color: #039be5;
            opacity: 1;
        }

        &.showBeta {
            color: #ab47bc;
            opacity: 1;
        }

        &.showInternal {
            color: #fbc02d;
            opacity: 1;
        }
    }

    &.active i {
        opacity: 1;
    }
}
</style>