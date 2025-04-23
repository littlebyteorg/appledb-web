<template>
    <div :class="sectionClass" style="margin-top: 1em;">
        <div v-for="(item, index) in content" :key="item.text">
            <a v-if="item.link" :href="item.link" target="_blank">
                <buttonElement
                    :item="item" 
                    :index="index" 
                    :length="content.length
                "/>
            </a>
            <buttonElement
                v-else
                :item="item" 
                :index="index" 
                :length="content.length
            "/>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        content: Array,
        sectionClass: String
    }
}
</script>

<style scoped lang="scss">
.wrap {
    display: flex;
    flex-flow: row wrap;
}

a:hover {
    text-decoration: none;
}
</style>