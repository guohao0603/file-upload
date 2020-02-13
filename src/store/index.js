import Vue from 'vue'
import Vuex from 'vuex'
import countStore from './reducer/countStore'
import arrayStore from './reducer/arrayStore'
Vue.use(Vuex)
export const store = new Vuex.Store({
  modules: {
    countStore,
    arrayStore
  }
})
