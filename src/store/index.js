// store.js
import Vue from "vue";

const state = Vue.observable({
  //revoir: Sortir la map de l état
  units:"foot",
  selectedDate:null,
});

const mutations = {
  updateSelectedUnits(units) {
    state.units = units;
  },
  updateSelectedDate(date) {
    state.selectedDate = date;
  },
};

export default {
  state: state,
  mutations,
};
