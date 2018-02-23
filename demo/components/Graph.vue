<template>
  <div class='graph-comp'>
    <div ref='graph' :style='{height: height}'></div>
    <loading
      :loading='loading'
      :message='message'
      class='cover'>
    </loading>
  </div>
</template>

<script>
  import Graph from 'demo/js/netopo.min.js'
  import Loading from './Loading.vue'

  export default {
    components: {
      Loading
    },
    props: {
      data: Promise,
      title: String,
      options: Object,
      withLoading: {
        type: Boolean,
        default: true,
      },
      height: {
        type: String,
        default: '600px',
      },
      width: {
        type: String,
        default: '100%'
      },
    },
    data() {
      return {
        graph: null,
        message: '',
        loading: false,
        nodes: null,
        edges: null,
        zoom: null,
      }
    },
    watch: {
      data: {
        immediate: true,
        handler(data) {
          if (data && (data instanceof Promise || _.isFunction(data.then))) {
            this.render(data)
          }
        }
      },
      options: {
        deep: true,
        handler(options) {
          this.graph.setOptions(options)
        }
      },
    },
    methods: {
      init() {
        this.graph = new Graph(this.$refs.graph, this.options)
        this.graph.on('node.click', (...args) => {
          this.$emit('nodeClick', ...args)
        }).on('edge.click', (...args) => {
          this.$emit('edgeClick', ...args)
        }).on([
          'simulation.end',
          'drag.end',
          'zoom.end',
          'thumbnails.zoomend',
          'thumbnails.dragend'
        ], () => {
          this.emitRenderEnd()
        })
        this.zoom = this.graph.getOptionsRef().zoom
      },
      render(promise) {
        this.loading = this.withLoading
        this.message = ''
        return promise.then(data => {
          if (data) {
            this.nodes = data.nodes  // maybe Array or Object
            this.edges = data.edges
            if (_.isEmpty(this.nodes) && _.isEmpty(this.edges)) {
              this.message = '没有数据'
            } else {
              this.graph.render({
                nodes: this.nodes,
                edges: this.edges,
              })
            }
          } else {
            this.message = '没有数据'
          }
          this.loading = false
        }).catch(err => {
          console.log(err)
          this.message = 'Error'
          this.loading = false
        })
      },
      emitRenderEnd() {
        this.$emit('renderEnd', {
          nodes: this.nodes,
          edges: this.edges,
          zoom: this.zoom.transform,
        })
      }
    },
    mounted() {
      this.init()
    },
    beforeDestroy() {
      if (this.graph) {
        this.graph.destroy()
      }
    }
  }
</script>

<style scoped>

  .graph-comp {
    position: relative;

    .cover {
      background: #fff;
    }
  }
</style>
