<template>
    <div
        class="propertyBox"
        v-if="content.length"
    >
        <template
            v-for="property in content"
            :key="property"
        >
            <div class="propertyTitle">
                {{ property.title }}
            </div>
            <div class="propertyString">
                <property :property="property"/>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        content: Array,
        sectionClass: String
    },
}
</script>

<style lang="scss" scoped>
.propertyBox {
    background: var(--c-border);
    padding: 1.1em 1.5em;
    border-radius: 4px;
    box-shadow: 0 2px 4px #0000000d;
    line-height: 2.2em;
    transition: background .15s ease-in-out;
    margin-top: 1.5em;
    border: 1px solid rgba(0,0,0,0.1);

    .propertyTitle {
        font-weight: 700;
        color: var(--c-text-light);
        text-transform: uppercase;
        font-size: .8em;
    }

    display: grid;
    grid-template-columns: 20% 80%;
}

@media screen and (max-width: 740px) {
    .propertyBox {
        display: block;
    }
}
</style>