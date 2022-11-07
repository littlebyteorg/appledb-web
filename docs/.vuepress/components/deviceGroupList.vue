<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <template v-for="o in groupObj" :key="o">
        <h2 style="margin-bottom: 1.5em; ">{{ o.label }}</h2>

        <div class="gridWrapper">
            <div v-for="t in o.types" :key="t" class="gridItem"><router-link :to="`/device-selection/${t.fdn()}.html`">
                <div class="imgWrapper"><picture>
                    <source :srcset="imageObj[t] + '.avif'" type="image/avif">
                    <source :srcset="imageObj[t] + '.webp'" type="image/webp">
                    <img :src="imageObj[t] + '.png'">
                </picture></div>
                <div class="title">{{t}}</div>
            </router-link></div>
        </div>
    </template>

    <p><router-link to="/device-list.html">{{ viewAllStr }}</router-link></p>

    <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'
import deviceTypeGroups from '@temp/deviceTypeGroups'

String.prototype.fdn = function() {
  return this
  .replace(/ /g, '-')
  .replace(/\//g,'%2F')
  .replace(/ü/g,'u')
  .replace(/²/g,'2')
  .replace(/³/g,'3')
}

export default {
    data() {
        return {
            introStr: [
                'Please select what kind of device you have below.'
            ],
            viewAllStr: 'View all devices',

            frontmatter: usePageFrontmatter(),
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        groupList() {
            return this.frontmatter.groupList
        },
        typeArr() {
            return Array.from(new Set(this.groupList.map(x => x.type)))
        },
        groupObj() {
            var presetTypeArr = []
            var presetOrder = deviceTypeGroups.map(x => {
                x.types = x.types.filter(y => this.typeArr.includes(y))
                for (const t of x.types) presetTypeArr.push(t)
                return x
            })

            const unsetTypes = this.typeArr.filter(x => !presetTypeArr.includes(x))
            if (unsetTypes.length > 0) presetOrder.push({
                label: "Other",
                types: unsetTypes
            })

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
                if (tempTypeArr.includes(g.type) || g.img.count < 1) continue
                tempTypeArr.push(g.type)
                firstDeviceObj[g.type] = {
                    key: g.devices[0],
                    imageBool: g.img.count > 0,
                    dark: g.img.dark
                }
            }

            const missingTypes = typeArr.filter(x => !Object.keys(firstDeviceObj).includes(x))
            for (const type of missingTypes) {
                const firstGroup = groupList.filter(x => x.type == type)[0]
                firstDeviceObj[type] = {
                    key: firstGroup.devices[0],
                    imageBool: firstGroup.img.count > 0,
                    dark: firstGroup.img.dark
                }
            }

            const overrides = { 
                AirPods: "AirPods1,1",
                "MacBook Pro": "MacBookPro18,1"
            }
            
            for (const o in overrides) {
                const group = groupList.filter(x => {
                    if (!x.key) return false
                    return x.key.includes(overrides[o])
                })[0]
                if (!group) continue
                firstDeviceObj[o] = {
                    key: group.devices[0],
                    imageBool: group.img.count > 0,
                    dark: group.img.dark
                }
            }

            var ret = {}
            for (const d in firstDeviceObj) ret[d] = firstDeviceObj[d].imageBool ?
                `https://img.appledb.dev/device@preview/${firstDeviceObj[d].key}/0${this.isDarkMode && firstDeviceObj[d].dark ? '_dark' : ''}` :
                `https://img.appledb.dev/device@preview/logo/0${this.isDarkMode ? '_dark' : ''}`
            
            return ret
        }
    }
}
</script>

<style scoped lang="scss">
.gridWrapper {
    display: grid;
    text-align: center;
    gap: 0 3em;
    padding-bottom: 1em;
    
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