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
    margin-top: 1em;

    .title {
        margin-right: 1em;

        &:last-of-type {
            margin-right: 0;
        }
    }
}
.title {
    font-weight: 600;
    font-size: 2.2rem;
    line-height: 1.25;
    margin-bottom: 0.67em;
    color: var(--c-text-lightest);
    transition: color 100ms ease-in-out;

    &.active {
        color: var(--c-text);
    }

    &:hover {
        cursor: pointer;

        &:not(.active) {
            color: var(--c-brand);
        }
    }
}
</style>