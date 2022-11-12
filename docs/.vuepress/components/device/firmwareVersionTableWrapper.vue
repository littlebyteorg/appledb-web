<template>
    <h2 v-if="!mainList" style="margin-bottom: .3em;">
        {{ versionHeaderStr }}
        <i
            v-if="!hasFirmwareFilters"
            class="fas fa-sort"
            style="
                margin-left: 5px;
                margin-bottom: .6em;
                font-size: .7em;
                cursor: pointer;
            " v-on:click="versionArr.reverse()"
        ></i>
    </h2>
    
    <div class="optionsWrapper" style="margin-bottom: .3em;" v-if="hasFirmwareFilters">
        <div
            :class="[options.showStable ? 'active' : '', 'stable']"
            v-on:click="options.showStable = !options.showStable; filterVersions()"
            v-if="hasFirmwares.stable"
        >
            <i class="fas fa-circle stable"></i> Stable
        </div>
        <div
            :class="[options.showBeta ? 'active' : '', 'beta']"
            v-on:click="options.showBeta = !options.showBeta; filterVersions()"
            v-if="hasFirmwares.beta"
        >
            <i class="fas fa-circle beta"></i> Beta
        </div>
        <div
            :class="[options.showInternal ? 'active' : '', 'internal']"
            v-on:click="options.showInternal = !options.showInternal; filterVersions()"
            v-if="hasFirmwares.internal"
        >
            <i class="fas fa-circle internal"></i> Internal
        </div>
        <div
            v-on:click="versionArr.reverse()"
            style="margin-left: auto;"
        >
            <i class="fas fa-sort"></i> Sort
        </div>
    </div>

    <firmwareVersionTableElement
        v-for="fw in versionArr.slice(loadedFirmwares[0], loadedFirmwares[1])"
        :key="fw"
        :fw="fw"
        :options="options"
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
                (fw.beta ? this.options.showBeta : this.options.showStable) &&
                (fw.internal ? this.options.showInternal : true) &&
                fw.deviceFilterArr.some(r => this.options.filterDev.includes(r))
            )
        }
    },
    mounted() {
        this.options.filterDev = this.deviceFilter.map(x => x.value)

        if (this.mainList) {
            this.options.showBeta = true
            this.options.showInternal = true
        }

        this.filterVersions()
    }
}
</script>

<style lang="scss" scoped>
html.dark .optionsWrapper div {
    background: var(--c-border-dark);
}

.optionsWrapper {
    display: flex;
    align-content: space-between;
    flex-wrap: wrap;

    .active {
        background: var(--c-border);
        font-weight: 600;

        &.stable {
            background: #039be530 !important;
            border-color: #039be501;
        }

        &.beta {
            background: #ab47bc30 !important;
            border-color: #ab47bc01;
        }

        &.internal {
            background: #fbc02d30 !important;
            border-color: #fbc02d01;
        }
    }

    div {
        padding: .7em;
        padding-inline: 1.2em;
        margin: .3em;
        border-radius: 4em;
        cursor: pointer;
        transition: 100ms background ease-in-out, transform 150ms ease-in-out;
        //border: 1px solid var(--c-border);
        box-shadow: 0px 2px 9px rgba(0,0,0,0.1);
        
        &.stable {
            background: #039be510 !important;
            &:hover {
                background: #039be530 !important;
            }
        }
        &.beta {
            background: #ab47bc10 !important;
            &:hover {
                background: #ab47bc30 !important;
            }
        }
        &.internal {
            background: #fbc02d10 !important;
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
</style>