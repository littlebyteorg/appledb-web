<template>
    <div class="tabWrapper">
        <div class="tabTitleWrapper" v-if="tabArr.length > 1">
            <div class="title">Device Info</div>
            <div
                v-for="tab in tabArr"
                :key="tab"
                :class="[
                    'tabTitle',
                    activeTab == tab ? 'active' : ''
                ]"
                @click="activeTab = tab"
            >
                {{ tab }}
            </div>
        </div>
        <template
            v-for="tab in tabArr"
            :key="tab"
        ><div
            class="tabContentWrapper"
            :style="{
                'margin-left': tabArr.length > 1 ? '' : '0'
            }"
            v-if="activeTab == tab"
        ><div class="tabContent">
            <template v-for="property in tabPropertyArr[tab]" :key="property">
                <div class="title">{{ property.formatExtraInfoTitle() }}</div>
                <div v-if="
                    Object.keys(tabData).length == 1 ||
                    Array.from(new Set(
                        Object.keys(tabData).map(x => 
                            JSON.stringify(tabData[x][tab][property])
                        )))
                    .length == 1 &&
                    Object.keys(tabData).map(x => 
                        JSON.stringify(tabData[x][tab][property]))
                    .length != 1"
                >
                    {{ tabData[Object.keys(tabData)[0]][tab][property].formatExtraInfoText(property) }}
                </div>
                <div v-else v-for="dev in Object.keys(tabData)" :key="dev" class="deviceStringWrapper">
                    <span class="deviceString"><router-link :to="`/device/identifier/${dev}.html`">{{ device.find(x => x.key == dev).name }}</router-link></span> 
                    <template v-if="tabData[dev] && tabData[dev][tab] && tabData[dev][tab][property]">
                        {{ tabData[dev][tab][property].formatExtraInfoText(property) }}
                    </template>
                    <template v-else>N/A</template>
                </div>
            </template>
        </div></div></template>
    </div>
</template>

<script>
String.prototype.formatExtraInfoTitle = function() {
    return this.replace(/_/g, ' ')
}

Array.prototype.formatExtraInfoText = function(property) {
    let temp = this

    if (property == 'Resolution') temp = temp.map(x => x.x + ' x ' + x.y)

    return Array.from(new Set(temp.flat())).filter(x => x || x === false)/*.sort()*/.join(', ')
    .replace(/true/g, 'Yes')
    .replace(/false/g, 'No')
}

export default {
    data() {
        return {
            activeTab: ''
        }
    },
    props: {
        tabArr: Array,
        tabPropertyArr: Object,
        tabData: Object,
        device: Array
    },
    mounted() {
        if (this.tabArr.length > 0) this.activeTab = this.tabArr[0]
    }
}
</script>

<style lang="scss" scoped>

.tabWrapper {
    display: flex;
    flex-flow: row wrap;
    height: 100%;

    .tabTitleWrapper {
        margin: -.5em 0 0 -.5em;
        border-right: 1px solid rgba(0,0,0,0.1);

        .title {
            display: none;
        }

        .tabTitle {
            padding: .5em 1em;
            margin: 0 1em .3em 0;
            border-radius: 3px;
            transition: 100ms ease-in-out;
            cursor: pointer;

            &:hover, &.active {
                background: var(--c-text-lightest);
                color: var(--c-bg);
                opacity: 1 !important;
            }
        }
    }

    .tabContentWrapper {
        margin-left: 1em;
        width: calc(100% - 9.25em);

        .deviceStringWrapper {
            margin-bottom: .5em;
        }

        .deviceString {
            color: var(--c-text-lightest);
            font-weight: 500;

            &::after {
                content: ' — ';
            }
        }
    }

    a {
        color: var(--c-text-lightest);
        font-weight: 500;
    }

    .propertyWrapper {
        margin-top: .8em;

        &:first-of-type {
            margin-top: 0;
        }
    }

    .title {
        font-weight: 700;
        margin-block: 0 .4em;
        color: var(--c-text-light);
        text-transform: uppercase;
        font-size: .8em;
        margin-top: 1.5em;
        &:first-of-type {
            margin-top: 0;
        }
    }
}

@media screen and (max-width: 800px) {
    .tabWrapper {
        flex-direction: column;

        .tabTitleWrapper {
            border-bottom: 1px solid rgba(0,0,0,0.1);
            border-right: none;
            margin: -.25em -.5em 1em -.5em;
            padding-bottom: .75em;

            .title {
                margin-inline: .5em;
                margin-bottom: .5em;
                display: inherit;
            }

            .tabTitle {
                margin: .25em;
                display: inline-block;
                
                background: var(--c-text-lightest);
                color: var(--c-bg);
                opacity: 0.7;
            }
        }

        .tabContentWrapper {
            margin-left: 0;
            width: 100%;
        }
    }
}

html.dark .tabWrapper .tabTitleWrapper {
    border-color: rgba(255,255,255,0.2);
}

@media screen and (max-width: 800px) {
    html.dark .tabWrapper .tabTitleWrapper .tabTitle {
        opacity: 0.6;
    }
}
</style>