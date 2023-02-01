<template>
    <div class="titleWrapper">
        <div
            v-for="(title, index) in sections.map(x => x.title)"
            :key="title"
            :class="[
                'title',
                index == activeTab ? 'active' : ''
            ]"
            @click="activeTab = index"
        >
            {{ title }}
        </div>
    </div>
    <latestVersion v-if="sections[activeTab].component == 'latestVersion'"/>
    <latestDevice v-else-if="sections[activeTab].component == 'latestDevice'"/>
</template>

<script>
export default {
    props: {
        sections: Array
    },
    data() {
        return {
            activeTab: 0
        }
    }
}
</script>

<style lang="scss" scoped>
.titleWrapper {
    display: flex;
    flex-flow: row wrap;
    margin-block: 1em 1em;

    .title {
        margin-right: 1em;
        margin-bottom: .5em;

        &:last-of-type {
            margin-right: 0;
        }
    }
}
.title {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.25;
    color: var(--c-text-lightest);
    transition: color 100ms ease-in-out, transform 100ms ease-in-out;

    padding: .5em 1em;
    border-radius: 8px;

    background: var(--c-border);

    &.active {
        color: var(--c-bg);
        background: #1bcbf0;
        background: linear-gradient(315deg, #1bcbf0 0%, #d96cd5 100%);
    }

    &:hover {
        cursor: pointer;
        transform: scale(1.03);

        &:not(.active) {
            color: var(--c-brand);
        }
    }
}

html.dark .active {
    color: white;
    background: #9154e0;
    background: linear-gradient(315deg, #9154e0 0%, #4a3e80 100%);
}
</style>