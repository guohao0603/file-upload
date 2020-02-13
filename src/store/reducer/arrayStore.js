const state = {
  products: [
    {name: 'apple', price: 2},
    {name: 'banana', price: 3},
    {name: 'pear', price: 4},
    {name: 'melon', price: 5}
  ]
}

const getters = {
  changeProduct: (state) => {
    return state.products.map(val => {
      return {
        name: '**' + val.name + '--',
        price: val.price * 2
      }
    })
  }
}

const mutations = {
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
}
const actions = {
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
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
