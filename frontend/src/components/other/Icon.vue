<template>
    <svg-icon type="mdi" :path="path" :size="48"></svg-icon>
</template>


<script>
    /**
     * @see https://www.npmjs.com/package/@jamescoyle/vue-icon
     */
    import SvgIcon from '@jamescoyle/vue-icon'

    import {
        mdiHelp,
    } from '@mdi/js'

    export default {
        name: "IconVue",

        components: {
            SvgIcon,
            mdiHelp,
        },

        data () {
            return {
                path: mdiHelp,
            }
        },

        props: {
            // Default icon
            icon : {
                type: String,
                default: mdiHelp
            }
        },

        async mounted () {
            this.path = this.icon;
        },
    }
</script>