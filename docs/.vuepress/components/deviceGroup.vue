<template>
    <!--<div class="navigator">
        <router-link to="../">Home</router-link><span/>
        <router-link to="./">Device Selection</router-link><span/>
        <router-link :to="`./${frontmatter.type}`">{{ frontmatter.type }}</router-link>
    </div>-->

    <p v-for="s in introStr" :key="s">{{ s }}</p>

    <div v-if="frontmatter.type == 'iPhone'" class="custom-container tip"><p>{{iPhoneNote}}</p></div>

    <template v-for="dev in deviceArr" :key="dev"><template v-for="url in [`/device/${dev.groupKey.fdn()}.html`]" :key="url">
        <div class="flexWrapper">
            <div class="devHead">
                <router-link :to="url" style="color: inherit;">
                    <h3>{{dev.name}}</h3>
                    <div class="flexWrapper flexImg" style="user-select: none;">
                        <div
                            v-for="i in (Math.min(dev.img.images.length,3) || 1)"
                            :key="i"
                            :class="`imgWrapper imgWrapper${i}`"
                        >
                            <picture
                                v-for="imgUrl in [
                                    dev.img.key != 'logo' && dev.img.images.length ?
                                        `https://img.appledb.dev/device@main/${dev.img.key.replace(/\//g,'%252F')}/${dev.img.images[i-1].id}${isDarkMode && dev.img.images[i-1].dark ? '_dark' : ''}` :
                                        `https://img.appledb.dev/device@main/logo/0${isDarkMode ? '_dark' : ''}`
                                ]"
                                :key="imgUrl"
                            >
                                <source :srcset="imgUrl + '.avif'" type="image/avif">
                                <source :srcset="imgUrl + '.webp'" type="image/webp">
                                <img
                                    :src="imgUrl + '.png'"
                                    :class="`devImage devImage${i}`"
                                >
                            </picture>
                        </div>
                    </div>
                </router-link>
            </div>
            <div class="flexWrapper flexColumn devInfo">
                <ul class="devInfo infoList" style="position: absolute;">
                    <li v-for="i in infoObj[dev.key].slice(0,3)" :key="i">
                        <span v-html="i.replace('...','')"/>
                        <router-link v-if="i.includes('...')" :to="url">...</router-link>
                    </li>
                    <li><router-link :to="url">{{ viewDeviceStr }}</router-link></li>
                </ul>
                <ul class="devReleased infoList" style="position: relative; top: 9em;">
                    <li v-if="dev.releasedStr">{{ releasedOn.format({ suffix: (new Date() < new Date(dev.releasedStr[0])) ? 'ing' : 'ed', released: dev.releasedStr.slice(0,1).join(', ') }) }}<template v-if="dev.releasedStr.length > 1">, <router-link :to="url">...</router-link></template></li>
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
import substitutes from '../plugins/writeTemp/lib/deviceNameSubstitutes.json'

String.prototype.fdn = function() {
    let arr = this.split('')
    for (let c in arr) for (var i = 0; i < substitutes.length / 2; i++)
        if (arr[c] == substitutes[i*2]) arr[c] = substitutes[i*2+1]
    return arr.join('')
}

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
                identifier: "Identifier: ${identifier}",
                soc: "SoC: ${soc}",
                arch: "Architecture: ${arch}",
                model: "Model: ${model}",
                board: "Board: ${board}"
            },
            releasedOn: "Releas${suffix} on ${released}",
            viewDeviceStr: 'View more',
            iPhoneNote: 'Note that all "Plus", "Max" and "mini" models of iPhones are functionally identical to the regular models.',
            frontmatter: usePageFrontmatter(),
            isDarkMode: useDarkMode()
        }
    },
    computed: {
        introStr() {
            let description = [
                `Please select what model of $type you have below.`
            ]
            if (this.frontmatter.subtitle) description = this.frontmatter.subtitle
            return description.map(x => x.replace('$type', this.frontmatter.type))
        },
        deviceArr() {
            return this.frontmatter.group
        },
        infoObj() {
            let o = {}
            for (const dev of this.deviceArr) {
                let attr = ['identifier','soc','model','board','arch']
                .map(x => {
                    return {
                        type: x,
                        value: dev[x]
                    }
                })

                o[dev.key] = []
                for (const i of attr) if (i.value && i.value != '') {
                    let val = i.value
                    if (['identifier','model','board'].includes(i.type)) val = val.map(x => `<code style="padding: 0 2px; background: none; font-size: 0.95em;">${x}</code>`)
                    let ret = this.labels[i.type].format({ [i.type]: val.slice(0,3).join(', ') })
                    if (i.value.length > 3) ret += ', ...'
                    o[dev.key].push(ret)
                }
            }
            return o
        }
    }
}
</script>

<style lang="scss" scoped>
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
    height: 8em;
}

.flexColumn {
    flex-direction: column;
}

.devHead {
    margin-right: 1em;
    width: 50%;
}

.imgWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.devImage {
    max-width: 100%;
    max-height: 8em;
    padding-right: 0.5em;
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