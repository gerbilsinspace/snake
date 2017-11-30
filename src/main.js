// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueTouch from 'vue-touch'
import App from './App'
import { state } from './store'
import { mutations } from './mutations'
import { getters } from './getters'
import { db } from './firebase'

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(VueTouch, { name: 'v-touch' })

export const store = new Vuex.Store({
  state,
  mutations,
  getters
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  store,
  created () {
    db.ref('snakeLeaderboard').on('value', function (snapshot) {
      store.commit('setLeaderboard', snapshot.val())
    })
  },
  components: { App }
})
