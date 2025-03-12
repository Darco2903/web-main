<script>
export default {
    name: "LoadingSpinner",

    props: {
        loading: {
            type: Boolean,
            required: true,
        },
        color: {
            type: String,
            default: "#eee",
            required: false,
        },
        size: {
            type: String,
            default: "32px",
            required: false,
        },
        width: {
            type: String,
            default: "5px",
            required: false,
        },
    },

    data() {
        return {
            //
        };
    },

    mounted() {
        //
    },

    methods: {
        //
    },
};
</script>
<template>
    <div class="loading-ring-container">
        <div class="loading-ring" :loading></div>
    </div>
</template>

<style scoped>
.loading-ring {
    width: v-bind(size);
    height: v-bind(size);
    border-radius: 50%;
    border: v-bind(width) solid;
    border-color: v-bind(color) transparent v-bind(color) transparent;
    animation: lds-ring 0.4s infinite linear;
    /* transition: opacity 0.2s; */
}

.loading-ring[loading="false"] {
    opacity: 0;
}

@keyframes lds-ring {
    100% {
        transform: rotate(360deg);
    }
}
</style>
