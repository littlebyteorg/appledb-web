<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <div v-if="frontmatter.type == 'iPhone'" class="custom-container tip"><p>{{iPhoneNote}}</p></div>

    <template v-for="(dev, index) in deviceArr" :key="dev">
        <div class="flexWrapper">
            <div class="devHead">
                <h3>{{dev.name}}</h3>
                <img :src="`https://raw.githubusercontent.com/emiyl/apple-device-images/gh-pages/device@256/${dev.devices[0]}/0.png`" style="max-height: 8em;">
            </div>
            <div class="flexWrapper flexColumn devInfo">
                <p>
                    <div v-for="i in infoObj[dev.name].slice(0,3)" :key="i">
                        {{ i.replace('...','') }}
                        <router-link v-if="i.includes('...')" :to="`/device/${dev.name.replace(/ /g, '-')}.html`">...</router-link>
                    </div>
                    <div><router-link :to="`/device/${dev.name.replace(/ /g, '-')}.html`">{{ viewDeviceStr }}</router-link></div>
                    <template v-if="infoObj[dev.name].length < 3"><br v-for="i in (3 - infoObj[dev.name].length)" :key="i"></template>
                </p>
                <p>
                    <div v-if="dev.released">{{ releasedOn.format({ released: dev.released.join(', ') }) }}</div>
                </p>
            </div>
        </div>
        <br>
        <hr>
    </template>
    
    <!--<table v-for="t in Math.ceil(deviceArr.length / colCount)" :key="t">
        <tr>
            <th v-for="c in colCount" :key="c" :style="{'width': parseInt(100 / colCount) + '%'}">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    {{ deviceArr[(t - 1) * colCount + c - 1].name.replace('generation', 'gen') }}
                </router-link>
            </th>
        </tr>
        <tr>
            <td v-for="c in colCount" :key="c">
                <router-link v-if="deviceArr[(t - 1) * colCount + c - 1]" :to="`/device/${deviceArr[(t - 1) * colCount + c - 1].name.replace(/ /g, '-')}.html`">
                    <img :src="`https://raw.githubusercontent.com/emiyl/apple-device-images/gh-pages/device@256/${deviceArr[(t - 1) * colCount + c - 1].devices[0]}/0.png`" style="max-height: 8em;">
                </router-link>
            </td>
        </tr>
    </table>-->
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
            labels: {
                soc: "SoC: ${soc}",
                arch: "Architecture: ${arch}",
                model: "Model: ${model}",
                board: "Board: ${board}"
            },
            releasedOn: "Released on ${released}",
            viewDeviceStr: 'View more',
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
        },
        infoObj() {
            let o = {}
            for (const dev of this.deviceArr) {
                let attr = ['soc','arch','model','board']
                .map(x => {
                    return {
                        type: x,
                        value: dev[x]
                    }
                })

                o[dev.name] = []
                for (const i of attr) if (i.value && i.value != '') {
                    let ret = this.labels[i.type].format({ [i.type]: i.value.slice(0,3).join(', ') })
                    if (i.value.length > 3) ret += ', ...'
                    o[dev.name].push(ret)
                }
            }
            return o
        }
    }
}
</script>

<style scoped>
td, th {
    text-align: center;
}

.noBorder tr {
    background-color: inherit;
}

.noBorder td {
    border: 0;
    text-align: initial;
    vertical-align: 0;
}

.flexWrapper {
    display: flex;
    flex-wrap: wrap;
}

.flexColumn {
    flex-direction: column;
}

.devHead {
    margin-right: 1em;
    min-width: 50%;
}
</style>