<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <ul class='menu'>
      <li v-for='first in route'>
        <a :href='first.path' target='_blank'>{{first.path}}</a>
        <ul v-if='first.children'>
          <li v-for='second in first.children'>
            <a :href='second.path' target='_blank'>{{second.path}}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
  import router from 'demo/router'
  export default {
    name: 'HelloWorld',
    data() {
      return {
        msg: 'Welcome to Your Vue.js App',
        route: []
      };
    },
    mounted() {
      debugger
      router.options.routes.forEach(route => {
        let firstPath = '/#' + route.path
        let firstRoute = {
          path: firstPath
        }
        if (_.isArray(route.children)) {
          firstRoute.children = []
          route.children.forEach(child => {
            firstRoute.children.push({
              path: firstPath + '/' + child.path
            })
          })
        }
        this.route.push(firstRoute)
      })
    }
  };
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
  a {
    color: #42b983;
  }

  .menu {
    & > li {
      float: left;
      a {
        font-size: 20px;
        width: 200px;
        background: #323747;
        text-align: left;
        padding-left: 10px;
        margin: 5px;
        display: inline-block;
      }

      li > a {
        font-size: 17px;
        width: 180px;
        margin-left: -10px;
      }
    }
  }

</style>
