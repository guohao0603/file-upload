const state = {
  count: 1
}

const getters = {
  getCount: (state) => {
    return state.count
  }
}

const mutations = {
  setCount (state, value) {
    state.count += value
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
