<template>
    <div
        :class="[
            'button',
            index == length - 1 ? 'last' : ''
        ]"
        :style="item.style ? item.style: ''"
    >
        <i :class="item.icon"></i>
        <span v-html="item.text"/>
    </div>
</template>

<script>
export default {
    props: {
        item: Object,
        index: Number,
        length: Number
    }
}
</script>

<style lang="scss" scoped>
.button {
    color: var(--c-text);
    background: var(--c-border);
    padding: .7em 1em;
    margin-right: .5em;
    margin-bottom: .5em;
    border-radius: 4px;
    font-weight: 600;
    box-shadow: 0px 2px 2px 0px #0000000e;

    transition: all 100ms ease-in-out;

    &:hover {
        color: var(--c-text-lightest);
        background: var(--c-bg-light);
        cursor: pointer;
    }

    i {
        margin-right: .7em;
    }

    &.last {
        margin-right: 0;
    }
}

html.dark {
    .button {
        background: var(--c-bg-light);
        color: var(--c-text-lightest);

        &:hover {
            background: var(--c-border);
            color: var(--c-text);
        }
    }
}
</style>