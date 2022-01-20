import Vue from 'vue'
import App from './App.vue'
import i18n from './i18n'
import VCalendar from 'v-calendar';
import { BootstrapVue } from "bootstrap-vue";
import store from "./store";

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false
Vue.use(VCalendar);
Vue.prototype.$store = store;

Vue.use(BootstrapVue);
new Vue({
  i18n,
  render: h => h(App)
}).$mount('#app')
