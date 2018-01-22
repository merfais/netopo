<template>
  <div>
    <div class='container'>
      <div class='md-6'>
        <p>多连接、自动位置模拟 拓扑图</p>
        <graph class='graph'
          :data='multiLineData'
          :options='multiLineOpts'
          @edgeClick='edgeClick1'
        >
        </graph>
      </div>
      <div class='md-6'>
        <p>单连接、自动位置模拟 拓扑图</p>
        <graph class='graph'
          :data='forceData'
          :options='forceOpts'
          @edgeClick='edgeClick2'
        >
        </graph>
      </div>
      <div class='md-6'>
        <vue-button @click='save'>保存</vue-button>
        <vue-button @click='read'>读取</vue-button>
        <span>将当前拓扑缓存到sessionStorage，刷新后，可读取上次缓存的拓扑</span>
        <p>单连接、固定位置、可缓存位置 拓扑图</p>
        <graph class='graph'
          :data='fixedData'
          :options='fixedOpts'
          @renderEnd='renderEnd'
        >
        </graph>
      </div>
      <div class='md-6'>
        <vue-button @click='click5'>占位</vue-button>
        <p>单连接、自动位置模拟、带闭环 拓扑图</p>
        <graph class='graph'
          :data='circleData'
          :options='circleOpts'
        >
        </graph>
      </div>
    </div>
    <br>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
  import Graph from './components/Graph'
  import VueButton from './components/Button.vue'

  export default {
    components: {
      Graph,
      VueButton,
    },
    data() {
      return {
        forceData: null,
        forceOpts: {},
        multiLineData: null,
        multiLineOpts: {
          edge: {
            shape: {
              type: 'multiLine',
            },
            path:[{
              key: 'green',
              style: {
                stroke: 'green',
              },
            }, {
              key: 'dashGreen',
              dashArray: [5, 5],
              style: {
                stroke: 'green',
              },
            }, {
              key: 'yellow',
              style: {
                stroke: 'yellow',
              },
              hover: {
                style: {
                  stroke: 'yellow',
                },
              }
            }, {
              key: 'dashYellow',
              dashArray: [5, 5],
              style: {
                stroke: 'yellow',
              },
              hover: {
                style: {
                  stroke: 'yellow',
                },
              }
            }, {
              key: 'red',
              style: {
                stroke: 'red',
              },
              hover: {
                style: {
                  stroke: 'red',
                },
              }
            }, {
              key: 'dashRed',
              dashArray: [5, 5],
              style: {
                stroke: 'red',
              },
              hover: {
                style: {
                  stroke: 'red',
                },
              }
            }],
          },
        },
        fixedData: null,
        fixedOpts: {
          simulation: {
            enable: false,
          },
        },
        circleData: null,
        circleOpts: {
        },
      }
    },
    computed: {
    },
    methods: {
      click5() {
      },
      edgeClick1(...args) {
        console.log(...args)
      },
      edgeClick2(...args) {
        console.log(...args)
      },
      renderEnd(topo) {
        this.topo = topo
      },
      save() {
        sessionStorage.topo = JSON.stringify(this.topo)
      },
      read() {
        if (!sessionStorage.topo) {
          ys.warning('需要先保存，在是使用读取')
        } else {
          const topo = JSON.parse(sessionStorage.topo)
          this.fixedOpts = {
            zoom: {
              transform: topo.zoom
            }
          }
          this.fixedData = Promise.resolve(Object.freeze({
            nodes: topo.nodes,
            edges: topo.edges
          }))
        }
      },
      genFixedNode(n = 10) {
        const data = []
        while(n--) {
          const item = {
            id: 'node' + n,
            shape: {
              type: 'image',
              href: require('./assets/vm.png')
            },
            label: {
              text: '测试测试'
            },
            value: n,
            position: {
              x: _.random(-10, 670),
              y: _.random(-20, 670)
            },
          }
          data.push(item)
        }
        return Object.freeze(data)
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
            label: {
              text: '测试测试'
            },
            value: n
          }
          data.push(item)
        }
        return Object.freeze(data)
      },
      genNetworkEdge(e = 20, n = 10, multi = false) {
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
            const edge = {
              id: 'edge' + source + '_' + target,
              source: 'node' + source,
              target: 'node' + target,
              value: e,
            }
            if (multi) {
              const tem = [0, 1, 2, 3, 4, 5]
              const name = ['green', 'dashGreen', 'yellow', 'dashYellow', 'red', 'dashRed']
              const lines = _.shuffle(tem).slice(0, _.random(3) + 1).sort().map(i => name[i])
              edge.shape = {
                lines,
              }
            }
            data.push(edge)
          }
        }
        const rs = [...map.values()]
        let l = rs.length - 1
        while (l > 0) {
          const source = rs[l]
          let target = rs[l - 1] ? rs[l - 1] : 1
          const edge = {
            id: 'edge' + source + '_' + target,
            source: 'node' + source,
            target: 'node' + target,
            value: e,
          }
          if (multi) {
            const tem = [0, 1, 2, 3, 4, 5]
            const name = ['green', 'dashGreen', 'yellow', 'dashYellow', 'red', 'dashRed']
            const lines = _.shuffle(tem).slice(0, _.random(3) + 1).sort()
            edge.shape = {
              lines,
            }
          }
          data.push(edge)
          l -= 2
        }
        return Object.freeze(data)
      },
      genEdges(e = 20, n = 10) {
        const data = []
        while(e--) {
          const edge = {
            id: 'edge' + e,
            source: 'node' + _.random(n - 1),
            target: 'node' + _.random(n - 1),
            value: e,
          }
          data.push(edge)
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
        this.multiLineData = Promise.resolve().then(() => {
          return {
            nodes: this.genNetworkNode(120),
            edges: this.genNetworkEdge(300, 120, true),
          }
        })
        this.fixedData = Promise.resolve().then(() => {
          return {
            nodes: this.genFixedNode(20),
            edges: this.genEdges(20, 20),
          }
        })
        this.circleData = Promise.resolve().then(() => {
          return {
            nodes: this.genFixedNode(),
            edges: this.genEdges(),
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
    border: 1px solid #333;
  }
  .md-6 {
    flex-basis: 50%;
    max-width: 50%;
    overflow: hidden;
  }
  .graph {
    margin: 0 5px;
    border: 1px solid #aaa;
  }
  p {
    padding-left: 20px;
    margin-bottom: 5px;
  }
</style>
