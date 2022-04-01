<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>
    
    <table v-for="t in Math.ceil(typeArr.length / colCount)" :key="t">
        <tr>
            <th v-for="c in colCount" :key="c">
                <router-link v-if="typeArr[(t - 1) * colCount + c - 1]" :to="`/device-selection/${typeArr[(t - 1) * colCount + c - 1].replace(/ /g, '-')}.html`">
                    {{ typeArr[(t - 1) * colCount + c - 1] }}
                </router-link>
            </th>
        </tr>
        <tr>
            <td v-for="c in colCount" :key="c">
                <router-link v-if="typeArr[(t - 1) * colCount + c - 1]" :to="`/device-selection/${typeArr[(t - 1) * colCount + c - 1].replace(/ /g, '-')}.html`">
                    <img :src="imageObj[typeArr[(t - 1) * colCount + c - 1]]" style="height: 8em;">
                </router-link>
            </td>
        </tr>
    </table>

    <p><router-link to="/device-list.html">{{ viewAllStr }}</router-link></p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

export default {
    data() {
        return {
            introStr: [
                'Different devices will require different steps to jailbreak your Apple device. This page will help you find where to start.',
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
        imageObj() {
            const groupList = this.groupList
            var tempTypeArr = []
            var firstDeviceObj = {}

            for (const g of groupList) {
                if (tempTypeArr.includes(g.type)) continue
                tempTypeArr.push(g.type)
                firstDeviceObj[g.type] = g.devices[0]
            }

            const overrides = { "iPhone": "iPhone14,2" }
            for (const o in overrides) firstDeviceObj[o] = overrides[o]

            var ret = {}
            for (const d in firstDeviceObj) ret[d] = `/assets/images/device/${firstDeviceObj[d]}.png`
            
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