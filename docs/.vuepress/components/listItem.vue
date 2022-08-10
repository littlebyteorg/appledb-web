<template>
    <span :class="(item.children || item.hoverLink) ? 'hoverWrapper' : ''">
        <template v-if="customListDisc">
            <i v-if="item.children" :class="`fas fa-chevron-${expanded ? 'down' : 'right'} listChevron`"/>
            <i v-else class="fas fa-circle listCircle"/>
        </template>
        
        <span v-if="!item.link" v-html="item.text" />
        <a v-else-if="item.link.startsWith('http')" :href="item.link" target="_blank" v-html="item.text" />
        <router-link v-else :to="item.link" v-html="item.text" />

        <span v-if="item.children || item.hoverLink" :class="(expanded || (item.hoverLink && item.hoverLink.hideWhenInactive === false)) ? '' : 'showOnHover'">
            <i :class="`fas fa-${(item.hoverLink && item.hoverLink.icon) ? item.hoverLink.icon + ' spaceIcon' : 'circle spaceCircle'}`" />
            <a v-if="item.children" class="expandButton" v-on:click="expanded = !expanded">{{ expanded ? item.showLess || 'Show less' : item.showMore || 'Show more'}}</a>
            <template v-else-if="item.hoverLink">
                <span v-if="!item.hoverLink.link" v-html="item.hoverLink.text" />
                <a v-else-if="item.hoverLink.link.startsWith('http')" :href="item.hoverLink.link" target="_blank" v-html="item.hoverLink.text" />
                <router-link v-else :to="item.hoverLink.link" v-html="item.hoverLink.text" />
            </template>
        </span>
    </span>

    <div class="custom-container tip" v-if="item.children && expanded"><p>
        <h3 v-if="item.childrenTitle" style="padding-top: 2.5em;">{{item.childrenTitle}}</h3>
        <list :content="item.children" sectionClass="noListDisc customListDisc"/>
    </p></div>
</template>

<script>
export default {
    data() {
        return {
            expanded: false
        }
    },
    props: {
        item: Object,
        customListDisc: Boolean
    }
}
</script>

<style scoped>
.listChevron {
    float: left;
    margin-top: 0.8em;
    font-size: 0.7em;
    margin-left: -1.5em;
}

.listCircle {
    float: left;
    margin-left: -2.6em;
    margin-top: 1.8em;
    font-size: 0.4em;
}

.spaceCircle {
    font-size: 0.3rem;
    opacity: 0.5;
    vertical-align: middle;
    margin-left: 2em;
    margin-right: 2em;
}

.spaceIcon {
    font-size: .7rem;
    opacity: .7;
    vertical-align: middle;
    margin-bottom: 0.3em;
    margin-left: .7em;
    margin-right: .5em;
}

.expandButton {
    user-select: none;
    cursor: pointer;
}

.showOnHover {
    opacity: 0;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 100ms;
    position: absolute; 
    overflow: hidden; 
}

.showOnHover:hover {
    opacity: 1;
    position: initial; 
    overflow: initial; 
}

.hoverWrapper:hover .showOnHover {
    opacity: 1;
    position: initial; 
    overflow: initial; 
}
</style>