<template>
    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <div v-if="frontmatter.type == 'iPhone'" class="custom-container tip"><p>{{iPhoneNote}}</p></div>

    <template v-for="dev in deviceArr" :key="dev"><template v-for="url in [`/device/${dev.name.replace(/ /g, '-').replace(/\//g,'%2F')}.html`]" :key="url">
        <div class="flexWrapper">
            <div class="devHead">
                <router-link :to="url" style="color: inherit;">
                    <h3>{{dev.name}}</h3>
                    <div class="flexWrapper flexImg" style="user-select: none; height: 8em;">
                        <div style="text-align: center;">
                            <img v-for="i in Math.min(dev.img.count,3)" :key="i" :class="`devImage${i}`" :src="`https://img.appledb.dev/device@preview/${dev.devices[0].replace(/\//g,'%252F')}/${i-1}${isDarkMode && dev.img.dark ? '_dark' : ''}.png`" style="max-height: 8em; padding-right: .5em;">
                        </div>
                    </div>
                </router-link>
            </div>
            <div class="flexWrapper flexColumn devInfo">
                <ul class="devInfo infoList" style="position: absolute;">
                    <li v-for="i in infoObj[dev.name].slice(0,3)" :key="i">
                        {{ i.replace('...','') }}
                        <router-link v-if="i.includes('...')" :to="url">...</router-link>
                    </li>
                    <li><router-link :to="url">{{ viewDeviceStr }}</router-link></li>
                </ul>
                <ul class="devReleased infoList" style="position: relative; top: 9em;">
                    <li v-if="dev.released">{{ releasedOn.format({ released: dev.released.slice(0,1).join(', ') }) }}<template v-if="dev.released.length > 1">, <router-link :to="url">...</router-link></template></li>
                </ul>
            </div>
        </div>
        <span class="variablePadding"/>
        <hr>
    </template></template>

    <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import { useDarkMode } from '@vuepress/theme-default/lib/client/composables'

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
            iPhoneNote: 'Note that all "Plus", "Max" and "mini" models of iPhones are functionally identical to the regular models.',
            frontmatter: usePageFrontmatter(),
            isDarkMode: useDarkMode()
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

<style>
h3 {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

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

.flexImg {
    overflow: hidden;
    max-height: 8em;
}

.flexColumn {
    flex-direction: column;
}

.devHead {
    margin-right: 1em;
    width: 50%;
}

.devImage1 {
    max-width: 100%;
}

.variablePadding {
    display: block;
    margin-bottom: 1em;
}

@media only screen and (max-width: 600px) {
    .devHead {
        width: 100%;
    }
    .devInfo {
        position: static !important;
    }
    .devReleased {
        position: static !important;
    }
    h3 {
        white-space: normal;
        overflow: visible;
    }
    .variablePadding {
        display: none;
    }
}

.home {
    padding-top: 0 !important;
}

.infoList {
    list-style-type: none;
    padding-left: 0;
}
</style>