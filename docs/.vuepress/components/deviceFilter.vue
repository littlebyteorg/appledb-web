<template>
    <div style="overflow-x: auto;"><div class="filterWrapper">
        <div
            v-for="item in filterOptions"
            :key="item.value"
            :class="[
                'filterItem',
                options.filterDev.includes(item.value) ? 'active' : ''
            ]"
            v-on:click="options.filterDev.includes(item.value) ? options.filterDev = options.filterDev.filter(x => x != item.value) : options.filterDev = options.filterDev.concat(item.value)"
        >
            {{ item.label }}
        </div>
    </div></div>
</template>

<script>
export default {
    props: {
        filterOptions: Array,
        options: Object
    }
}
</script>

<style lang="scss" scoped>

.filterWrapper {
    display: flex;
    margin: 1em 0.5em;
    
    .filterItem {
        cursor: pointer;
        transition: background 150ms ease-in-out, color 150ms ease-in-out;
        white-space: nowrap;
        border: 1px solid var(--c-border);
        border-radius: 1em;
        padding: .5em;
        padding-inline: 1em;
        margin-inline: .3em;
        color: var(--c-text-lightest);
    }

    
    .active {
        background: var(--c-tip-bg);
        color: var(--c-text);
    }

    :hover {
        background: var(--c-border);
        color: var(--c-text);
    }

    .filterItem:first-child {
        margin-left: 0;
    }

    .filterItem:last-child {
        margin-right: 0;
    }
}
</style>