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
                :class="[options.showStable ? 'active' : '', 'stable', 'btn']"
                @click="options.showStable = !options.showStable; filterVersions()"
                v-if="hasFirmwares.stable"
        >
            <i class="fas fa-circle stable"></i> Stable
        </div>
        <div
            :class="[options.showBeta ? 'active' : '', 'beta', 'btn']"
            @click="options.showBeta = !options.showBeta; filterVersions()"
            v-if="hasFirmwares.beta"
        >
            <i class="fas fa-circle beta"></i> Beta
        </div>
        <div
            :class="[options.showInternal ? 'active' : '', 'internal', 'btn']"
            @click="options.showInternal = !options.showInternal; filterVersions()"
            v-if="hasFirmwares.internal"
        >
            <i class="fas fa-circle internal"></i> Internal
        </div>
        <div class="separator"></div>
        <div
            @click="versionArr.reverse()"
            class="btn"
        >
            <i class="fas fa-sort"></i> Sort
        </div>
        <div
            class="btn searchBtn"
        >
            <i class="fas fa-search"></i> <input
                class="search"
                v-model="options.searchStr"
                placeholder="Search"
                aria-placeholder="Search"
                v-on:keyup.enter="filterVersions()"
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
            v-on:click="
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
        :showDots="(options.showStable + options.showBeta + options.showInternal > 1) && hasFirmwareFilters"
        :showSingleDownloads="versionArr.map(x => x.filteredDownloads || x.filteredOtas).filter(x => x.length).length > 0 || versionArr.map(fw => fw.preinstalled.some(r => fw.devices.includes(r))).filter(x => x).length > 0"
    />

    <template v-if="loadedFirmwares[1] < versionArr.length">
        <div style="display: flex; padding: 1em; padding-top: 1.5em;">
            <div>Displaying {{ loadedFirmwares[1] }} firmwares out of {{ versionArr.length }}.</div>
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
                showSigningStatus: "Show signing status"
            },

            options: {
                showBuildNumber: false,
                showVersionString: true,
                showReleasedString: true,
                showSigningStatus: true,

                showStable: true,
                showBeta: false,
                showInternal: false,

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
                "showSigningStatus"
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
                    ((fw.beta || fw.rc) ? this.options.showBeta : this.options.showStable)) &&
                    fw.deviceFilterArr.some(r => this.options.filterDev.includes(r))
                ) && (
                    [fw.osStr,fw.version,fw.build].join(' ').toLowerCase().includes(this.options.searchStr.toLowerCase())
                )
            )
        }
    },
    mounted() {
        this.options.filterDev = this.deviceFilter.map(x => x.value)

        if (this.mainList) {
            this.options.showBeta = true
            this.options.showInternal = true
        } else if (!this.hasFirmwareFilters) {
            this.options.showStable = this.hasFirmwares.stable
            this.options.showBeta = this.hasFirmwares.beta
            this.options.showInternal = this.hasFirmwares.internal
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

    .separator {
        margin-inline: auto;
    }

    .search {
        font-size: 1em;
        background: inherit;
        border: none;
        margin: 0;
        padding: 0;
        margin-left: 4px;
        width: fit-content;
        block-size: fit-content;
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

        .fa-filter {
            font-size: .9em;
        }

        &.active {
            background: var(--c-border);
            font-weight: 600;

            &.stable {
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

        &.stable {
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

        &:hover {
            transform: scale(1.05);
            background: var(--c-border) !important;
        }

        .fa-circle {
            font-size: .5em;
            vertical-align: middle;
            padding-bottom: 2px;
            padding-right: 4px;
        }

        .stable {
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
    transform-origin: top right;
    position: relative;
    right: calc(calc(calc(100vw - var(--content-width)) / 2) + .5em);
    max-width: calc(var(--content-width) * 0.6);
}

@media screen and (max-width: 740px) {
    .hoverElement {
        right: 2em;
        max-width: 60%;
    }

    .optionsWrapper {

        .searchBtn {
            width: 100%;
        }
    }
}

@media screen and (max-width: 450px) {
    .optionsWrapper .separator {
        margin-inline: 0;
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
    display: flex;
    flex-flow: row wrap;
}

.filterListHorizontal {
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
}

.filterListItem {
    padding: .8em 1em;
    margin: .3em;

    border-radius: 5em;
    
    &.active {
        background: var(--c-border);
    }
}
</style>