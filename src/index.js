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
import renderNodes, { appendHiddenDiv } from './node/index'
import renderEdges from './edge/index'
import renderDefs from './defs'
import tooltip from './tooltip'
import simulation from './simulation'
import zoom from './zoom'

export default class Network {

  _$graph = null
  _$edgeContainer = null
  _$nodeContainer = null

  constructor(dom, options) {
    if (!dom) {
      throw new Error('dom paramter is required')
    }
    this._prepareOptions(options)
    this._initDom(dom)
    simulation.create((genTransform, tick) => {
      if (tick) {
        _.forEach(ds.nodes, node => {
          const transform = genTransform(node)
          select(`#${node.id}`).attr('transform', transform)
        })
      } else {
        this._$nodeContainer2.selectAll('g').attr('transform', d => {
          return genTransform(d)
        })
      }
    }, (genPath, tick) => {
      if (tick) {
        _.forEach(ds.edges, edge => {
          const path = genPath(edge)
          select(`#${edge.id}`).attr('d', path)
        })
      } else {
        this._$edgeContainer2.selectAll('path').attr('d', d => {
          return genPath(d)
        })
      }
    },
      this._$graph
    )
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
    renderNodes(this._$nodeContainer, this._$nodeContainer2, ds.nodes)
    renderEdges(this._$edgeContainer, this._$edgeContainer2, ds.edges)
    renderDefs(this._$defs)
    simulation.update(ds.nodes, ds.links)
  }

  setOptions(opts) {
    merge(options, opts)
  }

  _prepareOptions(opts) {
    merge(options, opts)
    // shadow
    options.node.shadow = merge({}, options.shadow, options.node.shadow)
    options.edge.shadow = merge({}, options.shadow, options.edge.shadow)
    // options.node.tooltip = merge({}, options.tooltip, options.node.tooltip)
    // options.edge.tooltip = merge({}, options.tooltip, options.edge.tooltip)
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
    const $svgWraper = $container.append('div').call(bindStyle({
      width: grid.width,
      height: grid.height || '500px',
      margin: `${grid.top} ${grid.right} ${grid.bottom} ${grid.left}`,
      position: 'relative',
      overflow: 'hidden',
    }))
    this._$graph = $svgWraper.append('svg').call(bindStyle({
      width: '100%',
      height: '100%',
      'user-select': 'none',
    })).call(bindAttr({
      class: 'network-topo',
    }))
    this._$defs = this._$graph.append('defs')
    const $zoomWraper = this._$graph.append('g').attr('class', 'zoom-wraper')
    this._$edgeContainer = $zoomWraper.append('g').attr('class', 'nt-edges')
    this._$nodeContainer = $zoomWraper.append('g').attr('class', 'nt-nodes')
    this._$edgeContainer2 = $zoomWraper.append('g').attr('class', 'nt-edges-cover')
    this._$nodeContainer2 = $zoomWraper.append('g').attr('class', 'nt-nodes-cover')
    zoom.create($svgWraper, this._$graph)
  }
}
