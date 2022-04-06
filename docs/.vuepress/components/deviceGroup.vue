<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <div v-if="frontmatter.type == 'iPhone'" class="custom-container tip"><p>{{iPhoneNote}}</p></div>
    
    <table v-for="t in Math.ceil(deviceArr.length / colCount)" :key="t">
        <tr>
            <th v-for="c in colCount" :key="c">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    {{ deviceArr[(t - 1) * colCount + c - 1].name.replace('generation', 'gen') }}
                </router-link>
            </th>
        </tr>
        <tr>
            <td v-for="c in colCount" :key="c">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    <img :src="`/assets/images/device@256/${deviceArr[(t - 1) * colCount + c - 1].devices[0]}/0.png`" style="max-height: 8em;">
                </router-link>
            </td>
        </tr>
    </table>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'

String.prototype.format = function(vars) {
  let temp = this;
  for (let item in vars)
    temp = temp.replace("${" + item + "}", vars[item]);
  return temp
}

export default {
    data() {
        return {
            colCount: 3,
            iPhoneNote: 'Note that all "Plus", "Max", "Pro" and "mini" models of iPhones are functionally identical to the regular models.',
            frontmatter: usePageFrontmatter(),
        }
    },
    computed: {
        introStr() {
            return [
                `Please select what model of ${this.frontmatter.type} you have below.`
            ]
        },
        deviceArr() {
            return this.frontmatter.group
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