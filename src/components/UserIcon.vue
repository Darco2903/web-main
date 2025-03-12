<script>
import userIconDark from "@icons/profile/user-default-dark.jpg";

export default {
    name: "UserIcon",

    props: {
        userIcon: {
            type: String,
            required: false,
            default: userIconDark,
        },

        roundBorder: {
            type: Boolean,
            required: false,
            default: false,
        },

        size: {
            type: String,
            required: false,
            default: "128px",
        },

        borderSize: {
            type: String,
            required: false,
            default: "4px",
        },
    },

    data() {
        return {
            //
        };
    },

    computed: {
        imageSrc() {
            return this.userIcon || userIconDark;
        },

        userBoxImageStyle() {
            return {
                "border-radius": this.roundBorder ? "50%" : "0%",
            };
        },
    },
};
</script>
<template>
    <div id="user-image-container" :style="userBoxImageStyle">
        <img id="user-image" :src="imageSrc" />
    </div>
</template>
<style>
#user-image-container {
    width: v-bind(size);
    height: v-bind(size);

    /* width: 100px; */
    /* height: 100px; */
    /* outline: 4px solid #222245; */
    outline: v-bind(borderSize) solid #eee;
    outline-offset: -1px;
    /* border-radius: 5%; */
    overflow: hidden;
    transition: outline var(--theme-time) ease, border-radius 0.2s ease;
}

#user-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
