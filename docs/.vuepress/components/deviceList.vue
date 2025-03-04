<template>
    <form onsubmit="event.preventDefault();" class="search-box" role="search">
        <input :placeholder="searchStr" :aria-placeholder="searchStr" v-model="searchQuery">
    </form>

    <br>

    <a @click="showFilter = !showFilter">{{ showFilter ? 'Hide' : 'Show' }} filter</a>

    <template v-if="showFilter">
        <h2>Filter</h2>
        <p v-if="devTypeFilter.length == devTypeArr.length"><a @click="devTypeFilter = []">Clear all</a></p>
        <p v-else><a @click="devTypeFilter = devTypeArr">Select all</a></p>
        <ul class="filterList">
            <li v-for="deviceType in devTypeArr" :key="deviceType"
                :class="devTypeFilter.includes(deviceType) ? 'active' : ''"
                @click="devTypeFilter.includes(deviceType) ? devTypeFilter = devTypeFilter.filter(x => x != deviceType) : devTypeFilter.push(deviceType)">
                {{ deviceType }}</li>
        </ul>
    </template>

    <table>
        <thead>
            <tr>
                <th v-for="h in [
                    'Model',
                    'Name',
                    'Released',
                    'Identifier'
                ]" :key="h">{{ h }}</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="dev in devList.filter(checkSearch)" :key="dev.key">
                <tr v-if="devTypeFilter.includes(dev.type)">
                    <td>{{ dev.model.join(', ') }}</td>
                    <td>
                        <router-link :to="'/device/identifier/' + dev.key.fdn() + '.html'">
                            {{ dev.name }}
                        </router-link>
                    </td>
                    <td><span v-if="dev.released">{{ Array.isArray(dev.released) ? dev.released.join(', ') : dev.released
                    }}</span></td>
                    <td><code v-if="dev.identifier[0] && dev.name != dev.identifier">
                            {{ dev.identifier.join(', ') }}
                        </code></td>
                </tr>
            </template>
        </tbody>
    </table>

    <p>AppleDB is not affiliated with Apple Inc.</p>
</template>

<script>
import { usePageFrontmatter } from '@vuepress/client'
import substitutes from '../plugins/writeTemp/lib/deviceNameSubstitutes.json'

String.prototype.fdn = function () {
    let arr = this.split('')
    for (let c in arr) for (var i = 0; i < substitutes.length / 2; i++)
        if (arr[c] == substitutes[i * 2]) arr[c] = substitutes[i * 2 + 1]
    return arr.join('')
}

String.prototype.format = function (vars) {
    let temp = this;
    for (let item in vars)
        temp = temp.replace("${" + item + "}", vars[item]);
    return temp
}

export default {
    data() {
        return {
            searchQuery: '',
            searchProperties: [
                'model',
                'name',
                'identifier',
                'key',
                'board',
                'soc'
            ],
            searchStr: 'Search',
            showFilter: false,
            devTypeFilter: [],
            fm: usePageFrontmatter()
        }
    },
    computed: {
        devList() { return Object.keys(this.fm.deviceList).map(x => this.fm.deviceList[x]) },
        devTypeArr() {
            const ret = [...new Set(this.devList.map(x => x.type))]
            this.devTypeFilter = ret
            return ret
        },
    },
    methods: {
        checkSearch(dev) {
            const searchQuery = this.searchQuery.toLowerCase()
            for (const p of this.searchProperties) {
                try {
                    if (dev[p].toLowerCase().includes(searchQuery)) return true
                } catch {
                    continue
                }
            }
            return false
        }
    },
    mounted() {
        this.devTypeFilter = this.devTypeArr
    }
}
</script>

<style scoped lang="scss">
.filterList {
    display: flex;
    flex-flow: row wrap;
    list-style-type: none;
    padding-left: 0;

    gap: .5em;

    li {
        background: var(--c-border);
        padding: .5em 1em;
        border-radius: .5em;
        transition: all .2s cubic-bezier(0, 0, .5, 1);

        &:hover {
            cursor: pointer;
            background: var(--c-bg);
            color: var(--c-text);
            box-shadow: 2px 4px 12px rgba(0, 0, 0, .08);
            transform: scale(1.02);
        }

        &.active {
            background: var(--c-text-lightest);
            color: var(--c-bg);
        }
    }
}

.search-box {
    margin-left: 0;
}

@media (max-width: 720px) {
    .search-box input {
        cursor: initial;
        width: initial;
        border-color: var(--search-border-color);
        position: static;
    }

    .search-box input:focus {
        border-color: var(--search-accent-color);
    }
}
</style>
