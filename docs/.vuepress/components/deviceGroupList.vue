<template>
    <div>
        <div @click="unexpandMenu()">
            <p v-for="s in introStr" :key="s">{{ s }}</p>
        </div>

        <div class="groupLabelWrapper">
            <div class="flexWrapper" @click="unexpandMenu()">
                <div
                    v-for="o in groupObj" :key="o"
                    :class="[
                        'groupLabel',
                        activeGroup == o.id ? 'active' : ''
                    ]"
                    @click="(activeGroup = o.id)"
                    :ref="`groupLabel-${o.id}`"
                >
                    {{ o.label }}
                </div>
            </div>
            <div class="flexWrapper">
                <label
                    for="checkbox"
                    @click="getWrappedLabels() && (expandedMenu = !expandedMenu)"
                >
                    <div class="groupLabel icon">
                            <i v-if="expandedMenu" class="fas fa-times"></i>
                            <i v-else class="fas fa-bars"></i>
                    </div>
                </label>
            </div>
        </div>

        <input id="checkbox" type="checkbox" name="menu" ref="checkbox"/>
        <ul class="submenu">
            <li
                v-for="group in wrappedGroups" :key="group"
                :class="[
                    activeGroup == group.id ? 'active' : ''
                ]"
                @click="activeGroup = group.id"
            >
                {{ group.label }}
            </li>
        </ul>

        <div @click="unexpandMenu()">
            <template v-for="o in groupObj.filter(x => x.id == activeGroup)" :key="o">
                <div class="gridWrapper">
                    <div v-for="t in o.types" :key="t" class="gridItem">
                        <router-link :to="o.label == 'Software' ?
                            `/device/${t.fdn()}.html` :
                            `/device-selection/${t.fdn()}.html`
                        ">
                            <div class="imgWrapper"><picture>
                                <source :srcset="imageObj[t] + '.avif'" type="image/avif">
                                <source :srcset="imageObj[t] + '.webp'" type="image/webp">
                                <img :src="imageObj[t] + '.png'">
                            </picture></div>
                            <div class="title">{{t}}</div>
                        </router-link>
                    </div>
                </div>
            </template>

            <p><router-link to="/device-list.html">{{ viewAllStr }}</router-link></p>

            <p>AppleDB is not affiliated with Apple Inc.</p>
        </div>
    </div>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import deviceTypeGroups from '@temp/deviceTypeGroups'
import substitutes from '../plugins/writeTemp/lib/deviceNameSubstitutes.json'

String.prototype.fdn = function() {
    let arr = this.split('')
    for (let c in arr) for (var i = 0; i < substitutes.length / 2; i++)
        if (arr[c] == substitutes[i*2]) arr[c] = substitutes[i*2+1]
    return arr.join('')
}

export default {
    data() {
        return {
            introStr: [
                'Please select what kind of device you have below.'
            ],
            viewAllStr: 'View all devices',
            activeGroup: 0,
            wrappedGroups: [],
            expandedMenu: false,
            hasSoftwareType: false,

            frontmatter: usePageFrontmatter(),
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        groupList() {
            return this.frontmatter.groupList
        },
        typeArr() {
            let ret = Array.from(new Set(this.groupList.map(x => x.type)))
            if (ret.includes('Software')) {
                this.hasSoftwareType = true
                ret = ret.filter(x => x != 'Software')
            }
            return ret
        },
        groupObj() {
            var presetTypeArr = []
            var presetOrder = deviceTypeGroups.map(x => {
                x.types = x.types.filter(y => this.typeArr.includes(y))
                for (const t of x.types) presetTypeArr.push(t)
                return x
            })

            if (this.hasSoftwareType) presetOrder.push({
                label: "Software",
                types: this.groupList.filter(x => x.type == 'Software').map(x => x.groupKey).sort((a,b) => {
                    a = a.toLowerCase()
                    b = b.toLowerCase()
                    if (a < b) return -1
                    if (a > b) return 1
                    return 0
                })
            })

            const unsetTypes = this.typeArr.filter(x => !presetTypeArr.includes(x))
            if (unsetTypes.length > 0) presetOrder.push({
                label: "Other",
                types: unsetTypes
            })

            for (var i = 0; i < presetOrder.length; i++) {
                presetOrder[i].id = i
            }

            return presetOrder
        },
        devCount() {
            const groupList = this.groupList
            var tempTypeArr = []
            var ret = {}

            for (const g of groupList) {
                if (tempTypeArr.includes(g.type)) continue
                tempTypeArr.push(g.type)
                ret[g.type] = 0
            }

            for (const g of groupList) ret[g.type] += g.devices.length
            
            return ret
        },
        imageObj() {
            const groupList = this.groupList
            var tempTypeArr = []
            var firstDeviceObj = {}

            const typeArr = Array.from(new Set(groupList.map(x => x.type)))
            
            for (const g of groupList) {
                if (tempTypeArr.includes(g.type) || !g.img || g.img.images.length < 1 || g.img.key == 'logo') continue
                tempTypeArr.push(g.type)
                firstDeviceObj[g.type] = {
                    key: g.img.key,
                    imageBool: g.img.images.length > 0,
                    imageNames: g.img.images
                }
            }

            const missingTypes = typeArr.filter(x => !Object.keys(firstDeviceObj).includes(x))
            for (const type of missingTypes) {
                const firstGroup = groupList.filter(x => x.type == type)[0]
                firstDeviceObj[type] = {
                    key: firstGroup.groupKey,
                    imageBool: firstGroup.img.images.length > 0 && firstGroup.img.key != 'logo',
                    imageNames: firstGroup.img.images
                }
            }

            if (this.hasSoftwareType) {
                for (const software of this.groupList.filter(x => x.type == "Software")) {
                    firstDeviceObj[software.groupKey] = {
                        key: software.img.key,
                        imageBool: software.img.images.length > 0 && software.img.key != 'logo',
                        imageNames: software.img.images
                    }
                }
            }

            const overrides = { 
                AirPods: "AirPods1,1",
                'Apple TV': "AppleTV14,1"
            }
            
            for (const o in overrides) {
                const group = groupList.filter(x => {
                    if (!x.key) return false
                    return x.key.includes(overrides[o])
                })[0]
                if (!group) continue
                firstDeviceObj[o] = {
                    key: group.devices[0],
                    imageBool: group.img.images.length > 0,
                    imageNames: group.img.images
                }
            }

            var ret = {}
            for (const d in firstDeviceObj) ret[d] = firstDeviceObj[d].imageBool ?
                `https://img.appledb.dev/device@preview/${firstDeviceObj[d].key}/${firstDeviceObj[d].imageNames[0].id}${this.isDarkMode && firstDeviceObj[d].imageNames[0].dark ? '_dark' : ''}` :
                `https://img.appledb.dev/device@preview/logo/0${this.isDarkMode ? '_dark' : ''}`
            
            return ret
        }
    },
    methods: {
        async getWrappedLabels() {
            let id = 0
            let previousTop = -1
            for (var i of this.groupObj) {
                const [groupLabel] = this.$refs[`groupLabel-${i.id}`]
                let top = groupLabel.getBoundingClientRect().top
                
                if (previousTop < 0 || previousTop == top) {
                    previousTop = top
                    id = i.id
                    continue
                } else break
            }
            
            this.wrappedGroups = this.groupObj.slice(id+1)
        },
        unexpandMenu() {
            this.expandedMenu = false
            if (this.$refs.checkbox) this.$refs.checkbox.checked = false
        }
    },
    mounted() {
        window.onresize = () => {
            this.getWrappedLabels();
        }
    }
}
</script>

<style scoped lang="scss">
input[type=checkbox] {
    display: none;
}

.submenu {
  opacity: 0;
  transform: scale(0);
}

input[type=checkbox]:checked~.submenu {
    opacity: 1;
    transform: scale(1);
}

@media screen and (max-width: 740px) {
    .submenu {
        right: 2em !important;
    }
}

.submenu {
    margin-top: -3em;
    margin-bottom: 2em;
    list-style-type: none;
    font-weight: 600;
    padding-left: 0;

    transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
    transform-origin: top right;

    background: var(--c-border);
    padding: .5em 1em;
    border-radius: 8px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.02), 0 2px 6px rgba(0, 0, 0, 0.06);

    position: absolute;
    right: calc(((100vw - var(--content-width)) / 2) + 1em);

    li {
        padding-inline: .7em calc(.7em + 2px);
        margin-block: .5em;
        border-left: 2px solid transparent;
        cursor: pointer;
        transition: color 100ms ease-in-out;
    }

    .active, :hover {
        color: var(--c-brand);
        border-color: var(--c-brand);
    }
}

.groupLabelWrapper {
    display: flex;
    flex-flow: row nowrap;
    margin-block: 1em 3em;
    height: 3em;
    overflow: hidden;
}

.flexWrapper {
    display: flex;
    flex-flow: row wrap;
}

.groupLabel {
    font-weight: 600;
    padding-top: .75em;
    padding-inline: 1em;

    transition: color 100ms ease-in-out;
    cursor: pointer;
    user-select: none;

    &:hover, &.active {
        color: var(--c-brand);

        &:after {
            transform: scaleX(1);
        }
    }

    &.icon {
        border-bottom: 0;
        font-size: 1.2em;
        margin-inline: calc(.5em - .2em);
        margin-top: -.2em;
    }

    &:after {
        color: var(--c-brand);
        display: block;
        content: '';
        padding-top: .75em;
        border-bottom: solid 2px;
        transform: scaleX(0);
        transition: transform 100ms ease-in-out;
        width: 100%;
    }
}

.gridWrapper {
    display: grid;
    text-align: center;
    gap: 0 3em;
    margin-bottom: -1em;
    
    .imgWrapper {
        display: grid;
        align-items: center;
        height: 8em;

        img {
            max-height: 8em;
            margin-block: auto;
        }
    }
}

.gridItem {
    .title {
        color: var(--c-text);
        font-weight: 600;
        font-size: 1.2em;
        padding-top: 1em;
    }

    padding-bottom: 2em;
    margin-bottom: 2em;
    border-bottom: 1px solid var(--c-border);
}
@media screen and (min-width: 576px) {
    .gridWrapper {
        width: calc(100% - 6em);
        grid-template-columns: 33% 34% 33%;
    }
}

@media screen and (max-width: 575px) {
    .gridWrapper {
        width: calc(100% - 3em);
        grid-template-columns: 50% 50%;
    }
}
</style>