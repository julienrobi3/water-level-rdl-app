// store.js
import Vue from "vue";

const state = Vue.observable({
  //revoir: Sortir la map de l état
  units:"meter",
});

const mutations = {
  updateSelectedUnits(units) {
    state.units = units;
  },
};

export default {
  state: state,
  mutations,
};
