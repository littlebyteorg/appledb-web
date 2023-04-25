<template>
    <div class="hiddenArea">
        <div class="custom-container">
            <h4>Hidden area</h4>
            <p>Welcome to the spooky hidden area. Here's a collection of options of various use for curious people.</p>
            <p><a style="cursor: pointer;" v-on:click="devOptions.show = false">Hide me!</a></p>
        </div>
        <div class="custom-container">
            <h4>Options</h4>
            <div class="toggleBubbleWrapper">
                <div
                    v-for="option in optionsObj" :key="option"
                    v-on:click="options[option.model] = !options[option.model]"
                    :class="[
                        'toggleBubbleItem',
                        options[option.model] ? 'active' : ''
                    ]"
                >
                    {{ option.label }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        options: Object,
        optionsObj: Object,
        deviceFilter: Array,
        devOptions: Object,
        filterVersions: Function,
    }
}
</script>

<style lang="scss" scoped>
.hiddenArea {
    .toggleBubbleWrapper {
        display: flex;
        flex-flow: row wrap;
        margin-inline: -.4em;
        margin-bottom: 1em;

        .toggleBubbleItem {
            padding: .7em 1.2em;
            margin: .4em;
            border-radius: 5em;
            border: 1px solid var(--c-border);
            box-shadow: 0px 2px 4px rgba(0,0,0,0.05);
            transition: background 100ms ease-in-out, color 100ms ease-in-out, transform 200ms ease-in-out;
            cursor: pointer;
            background: var(--c-bg-light);

            &.active {
                background: var(--c-text-lightest);
                color: var(--c-bg);

                &.dark {
                    background: #000;
                }
            }

            &:hover {
                transform: scale(1.05);
            }
        }
    }
}

html.dark .hiddenArea .toggleBubbleWrapper .toggleBubbleItem.active {
    background: var(--c-border);
    color: var(--c-text);
}
</style>