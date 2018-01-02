import {
  select
} from 'd3-selection'
import {
  bindStyle,
  bindAttr,
  merge,
} from './util'
import ds from './dataSet'
import options from './options'
import eventer from './event'
import {
  renderNodes,
  updateNodesPosition,
  appendHiddenDiv,
  destroyNodes,
} from './node/index'
import {
  renderEdges,
  updateEdgesPosition,
  destroyEdges
} from './edge/index'
import {
  renderDefs,
  destroyDefs,
} from './defs'
import tooltip from './tooltip'
import simulation from './simulation'
import zoom from './zoom'
import drag from './drag'

export default class Network {

  _$graph = null
  _$defs = null
  _$edgeContainer = null
  _$edgeContainer2 = null
  _$nodeContainer = null
  _$nodeContainer2 = null

  constructor(dom, options) {
    if (!dom) {
      throw new Error('dom paramter is required')
    }
    this._prepareOptions(options)
    this._initDom(dom)
    const updateNodes = updateNodesPosition(this._$nodeContainer, this._$nodeContainer2)
    const updateEdges = updateEdgesPosition(this._$edgeContainer, this._$edgeContainer2)
    simulation.create(updateNodes, updateEdges, this._$graph)
    const updateView = d => {
      updateNodes('drag', d)
      updateEdges('drag', d)
    }
    drag.create(updateView, this._$zoomWrapper)
  }

  render({ nodes = [], edges = [] }) {
    if (!Array.isArray(nodes)) {
      throw new Error('type error: nodes must be Array')
    }
    if (!Array.isArray(edges)) {
      throw new Error('type error: edges must be Array')
    }
    ds.nodes = nodes
    ds.edges = edges
    renderNodes(this._$nodeContainer, this._$nodeContainer2)
    renderEdges(this._$edgeContainer, this._$edgeContainer2)
    renderDefs(this._$defs)
    simulation.update(ds.nodes, ds.links)
  }

  setOptions(opts) {
    merge(options, opts)
  }

  destroy() {
    tooltip.destroy()
    zoom.destroy()
    simulation.destroy()
    drag.destroy()
    destroyNodes(this._$nodeContainer, this._$nodeContainer2)
    destroyEdges(this._$edgeContainer, this._$edgeContainer2)
    destroyDefs(this._$defs)
    this._$graph = null
    this._$defs = null
    this._$edgeContainer = null
    this._$edgeContainer2 = null
    this._$nodeContainer = null
    this._$nodeContainer2 = null
    this._$zoomWrapper = null
    this._opts = null
    ds.clear()
    eventer.emit('destroy')
    eventer.destroy()
  }

  _prepareOptions(opts) {
    merge(options, opts)
    // shadow
    options.node.shadow = merge({}, options.shadow, options.node.shadow)
    options.edge.shadow = merge({}, options.shadow, options.edge.shadow)
  }

  _initDom(dom) {
    if (typeof dom === 'string') {
      dom = document.getElementById(dom)
    }
    if (!dom.getBoundingClientRect) {
      throw new Error('real DOM instance or an exist DOM id is required')
    }
    const grid = merge({
      width: dom.clientWidth + 'px',
      height: dom.clientHeight + 'px',
    }, options.grid)
    const $container = select(dom).append('div').call(bindStyle({
      position: 'relative',
    }))
    tooltip.create($container)
    appendHiddenDiv($container)
    const $svgWrapper = $container.append('div').call(bindStyle({
      width: grid.width,
      height: grid.height || '500px',
      margin: `${grid.top} ${grid.right} ${grid.bottom} ${grid.left}`,
      position: 'relative',
      overflow: 'hidden',
    }))
    this._$graph = $svgWrapper.append('svg').call(bindStyle({
      width: '100%',
      height: '100%',
      'user-select': 'none',
    })).call(bindAttr({
      class: 'network-topo',
    }))
    this._$defs = this._$graph.append('defs')
    const $zoomWrapper = this._$graph.append('g').attr('class', 'zoom-wrapper')
    this._$edgeContainer = $zoomWrapper.append('g').attr('class', 'nt-edges')
    this._$nodeContainer = $zoomWrapper.append('g').attr('class', 'nt-nodes')
    this._$edgeContainer2 = $zoomWrapper.append('g').attr('class', 'nt-edges-cover')
    this._$nodeContainer2 = $zoomWrapper.append('g').attr('class', 'nt-nodes-cover')
    this._$zoomWrapper = $zoomWrapper
    zoom.create($svgWrapper, this._$graph, $zoomWrapper)
  }
}
