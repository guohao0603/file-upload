import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    products: [
      {name: 'apple', price: 2},
      {name: 'banana', price: 3},
      {name: 'pear', price: 4},
      {name: 'melon', price: 5}
    ]
  },
  getters: {
    changeProduct: (state) => {
      return state.products.map(val => {
        return {
          name: '**' + val.name + '--',
          price: val.price * 2
        }
      })
    }
  },
  mutations: {
    decrePrice (state) {
      state.products.forEach(val => {
        val.price -= 1
      })
    },
    addPrice (state) {
      state.products.forEach(val => {
        val.price = val.price + 1
      })
    }
  },
  actions: {
    decrePriceAction (context) {
      setTimeout(() => {
        context.commit('decrePrice')
      }, 500)
    },
    addPriceAction (context) {
      setTimeout(() => {
        context.commit('addPrice')
      }, 500)
    }
  }
})

/*
  action和mutaion类似， 不同的是Action提交的是mutation,而不是直接变更状态
  而且Action支持异步，mutation必须同步执行
  Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 context.commit 提交一个 mutation，
  或者通过 context.state 和 context.getters 来获取 state 和 getters。

 */
