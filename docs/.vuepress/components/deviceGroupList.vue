<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <template v-for="o in groupObj" :key="o">
        <h2>{{ o.label }}</h2>
    
        <table v-for="t in Math.ceil(o.types.length / colCount)" :key="t">
            <tr>
                <th v-for="c in colCount" :key="c">
                    <router-link v-if="o.types[(t - 1) * colCount + c - 1]" :to="
                        // (devCount[o.types[(t - 1) * colCount + c - 1]] > 1) ?
                        `/device-selection/${o.types[(t - 1) * colCount + c - 1].replace(/ /g, '-')}.html`
                        // : `/device/${groupList.filter(x => x.type == o.types[(t - 1) * colCount + c - 1])[0].name.replace(/ /g, '-')}.html`*/
                    ">
                        {{ o.types[(t - 1) * colCount + c - 1] }}
                    </router-link>
                </th>
            </tr>
            <tr>
                <td v-for="c in colCount" :key="c">
                    <router-link v-if="o.types[(t - 1) * colCount + c - 1]" :to="
                        // (devCount[o.types[(t - 1) * colCount + c - 1]] > 1) ?
                        `/device-selection/${o.types[(t - 1) * colCount + c - 1].replace(/ /g, '-')}.html`
                        // : `/device/${groupList.filter(x => x.type == o.types[(t - 1) * colCount + c - 1])[0].name.replace(/ /g, '-')}.html`
                    ">
                        <img :src="imageObj[o.types[(t - 1) * colCount + c - 1]]" style="max-height: 8em;">
                    </router-link>
                </td>
            </tr>
        </table>
    </template>

    <p><router-link to="/device-list.html">{{ viewAllStr }}</router-link></p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

export default {
    data() {
        return {
            introStr: [
                'Please select what kind of device you have below.'
            ],
            viewAllStr: 'View all devices',

            colCount: 3,
            frontmatter: usePageFrontmatter(),
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
            var presetOrder = [
                {
                    label: "iOS Devices",
                    types: [
                        "iPhone",
                        "iPad",
                        "iPad Air",
                        "iPad Pro",
                        "iPad mini",
                        "iPod"
                    ]
                },
                {
                    label: "macOS Devices",
                    types: [
                        "MacBook Air",
                        "MacBook Pro",
                        "iMac",
                        "Mac mini",
                        "Mac Studio",
                        "Developer Transition Kit",
                        "Apple Display"
                    ]
                },
                {
                    label: "Home and Accessories",
                    types: [
                        "Apple Watch",
                        "Apple TV",
                        "HomePod",
                        "AirPods",
                        "Apple Pencil",
                        "AirTag",
                        "Apple TV Remote"
                    ]
                },
                {
                    label: "Beats",
                    types: [
                        "Beats Earbuds",
                        "Beats Headphones",
                        "Beats Speakers"
                    ]
                }
            ].map(x => {
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

            for (const g of groupList) {
                if (tempTypeArr.includes(g.type)) continue
                tempTypeArr.push(g.type)
                firstDeviceObj[g.type] = g.devices[0]
            }

            const overrides = { 
                iPhone: "iPhone14,2",
                AirPods: "AirPods1,1"
            }
            
            for (const o in overrides) firstDeviceObj[o] = overrides[o]

            var ret = {}
            for (const d in firstDeviceObj) ret[d] = `/assets/images/device@256/${firstDeviceObj[d]}/0.png`
            
            return ret
        }
    }
}
</script>

<style scoped>
table {
    table-layout: fixed;
}
tr {
    width: 33%;
}
</style>