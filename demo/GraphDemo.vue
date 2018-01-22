<template>
  <div class='container'>
    <div class='md-6'>
      <graph class='graph'
        :data='fixedData'
        :options='fixedOpts'
      >
      </graph>
    </div>
    <div class='md-6'>
      <graph class='graph'
        :data='forceData'
        :options='forceOpts'
      >
      </graph>
    </div>
    <br>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
  import Graph from './components/Graph'

  export default {
    components: {
      Graph,
    },
    data() {
      return {
        sideSlideShow: false,
        forceData: null,
        forceOpts: {},
        fixedData: null,
        fixedOpts: {
          simulation: {
            // enable: false,
          },
        },
      }
    },
    computed: {
    },
    methods: {
      click5() {
        this.sideSlideShow = true
      },
      genNetworkNode(n = 10) {
        const data = []
        const shape = ['text', 'image']
        while(n--) {
          const item = {
            id: 'node' + n,
            shape: {
              type: 'image',
              href: require('./assets/vm.png')
            },
            value: n
          }
          data.push(item)
        }
        return data
      },
      genNetworkEdge(e = 20, n = 10) {
        const map = new Map()
        let m = n
        while(m--) {
          map.set(m, m)
        }
        const data = []
        let count =_.round(_.random(n / 40,  n / 5))
        while (count--) {
          const source = _.random(n - 1)
          map.delete(source)
          let rc = _.random(n / 20, n / 10)
          while(--rc > 0) {
            const target = _.random(n - 1)
            map.delete(target)
            data.push({
              id: 'edge' + source + '_' + target,
              source: 'node' + source,
              target: 'node' + target,
              value: e,
            })
          }
        }
        const rs = [...map.values()]
        let l = rs.length - 1
        while (l > 0) {
          const source = rs[l]
          let target = rs[l - 1] ? rs[l - 1] : 1
          data.push({
            id: 'edge' + source + '_' + target,
            source: 'node' + source,
            target: 'node' + target,
            value: e,
          })
          l -= 2
        }
        return data
      },
      render() {
        this.forceData = Promise.resolve().then(() => {
          return {
            nodes: this.genNetworkNode(120),
            edges: this.genNetworkEdge(300, 120),
          }
        })
        this.fixedData = Promise.resolve().then(() => {
          return {
            nodes: this.genNetworkNode(120),
            edges: this.genNetworkEdge(300, 120),
          }
        })
      },
      test() {
        this.render()
      },
    },
    mounted() {
      this.render()
    },
  }
</script>

<style scoped>
  .container {
    display: flex;
    flex-wrap: wrap;
  }
  .md-6 {
    flex-basis: 50%;
    max-width: 50%;
    overflow: hidden;
  }
  .graph {
    border: 1px solid #aaa;
  }
</style>
