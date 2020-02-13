<template>
  <div class="hello">
    <div class="product-one">
      <h2>vuex使用</h2>
      <ul>
        <li v-for="(item,index) in product" :key="index">
          <div class="name">{{item.name}}</div>
          <div class="price">{{item.price}}</div>
        </li>
      </ul>
      <ul>
        <li v-for="(item,index) in changeProduct" :key="index">
          <div class="name">{{item.name}}</div>
          <div class="price">{{item.price}}</div>
        </li>
      </ul>
      <div class="priceOne" @click="decrePrice()">同步价格减少</div>
      <div class="priceTwo" @click="decrePriceAction()">异步价格减少</div>
      <div class="priceThree" @click="addPriceAction()">异步价格增加</div>

      <div class="priceOne" @click="addCount()">数量：{{getCount}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted () {
    console.log(this.$store)
  },
  computed: {
    product () {
      return this.$store.state.arrayStore.products
    },
    changeProduct () {
      return this.$store.getters['arrayStore/changeProduct']
    },
    getCount () {
      return this.$store.getters['countStore/getCount']
    }
  },

  methods: {
    addCount () {
      return this.$store.commit('countStore/setCount', 1)
    },
    decrePrice () {
      return this.$store.commit('arrayStore/decrePrice')
    },
    decrePriceAction () {
      return this.$store.dispatch('arrayStore/decrePriceAction')
    },
    addPriceAction () {
      return this.$store.dispatch('arrayStore/addPriceAction')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }

  .priceOne {
    cursor: pointer;
    color: aqua;
  }
  .priceTwo {
    cursor: pointer;
    color: blue;
  }
  .priceThree {
    cursor: pointer;
    color: red;
  }
</style>
