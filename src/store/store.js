import { createStore } from "vuex";

export default createStore({
    state: {
        user_id: null,
    },

    mutations: {
        setUserId(state, userId) {
            state.user_id = userId;
        },
    },

    actions: {
        updateUserId({ commit }, userId) {
            commit("setUserId", userId);
        },
    },

    getters: {
        getUserId(state) {
            return state.user_id;
        },
    },
});
