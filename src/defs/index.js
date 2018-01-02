import {
  select,
  namespaces,
} from 'd3-selection'
import {
  bindAttr,
} from '../util.js'

function renderFilter($filter, data) {
  $filter.call(bindAttr(data.attr))
  _.forEach(data.subNodes, item => {
    const $subNode = $filter.append(item.name)
    renderFilter($subNode, item)
  })
}

class Filter {
  constructor() {
    this._filter = new Map()
    this._last = new Map()
  }

  get data() {
    // 清空filter集，缓存到last
    // last集用于diff和读取
    if (this._filter.size) {
      this._last = new Map(this._filter)
      this._filter.clear()
    }
    return [...this._last.values()]
  }

  insert(data) {
    if (!this._last.has(data.id)) {
      this._filter.set(data.id, data)
    } else {
      this._filter.set(data.id, this._last.get(data.id))
    }
  }

  clear() {
    this._filter.clear()
    this._last.clear()
  }
}

export const filter = new Filter()

export function renderDefs($defs) {
  if (filter.data.length) {
    const $filters = $defs.selectAll('filter').data(filter.data, d => d.id)
    $filters.exit().remove()
    $filters.enter().append(d => {
      const $filter = select(document.createElementNS(namespaces.svg, 'filter'))
      renderFilter($filter, d.genData(d))
      return $filter.node()
    })
  }
  return $defs
}

export function destroyDefs($defs) {
  $defs.remove()
}

/*
const filter = {
  id: d.id,
  width: '200%',
  height: '200%',
  x: '-50%',
  y: '-50%',
  subNodes: [{
    name: '',
    in: 'SourceAlpha',
    stdDeviation: d.blur
  }]
}

function renderFilter($filter, d) {
  $filter.call(bindAttr({
    id: d.id,
    width: '200%',
    height: '200%',
    x: '-50%',
    y: '-50%'
  }))
  $filter.append('feGaussianBlur').call(bindAttr({
    in: 'SourceAlpha',
    stdDeviation: d.blur
  }))
  $filter.append('feOffset').call(bindAttr({
    dx: d.offsetX,
    dy: d.offsetY,
    result: 'offset'
  }))
  $filter.append('feFlood').call(bindAttr({
    'flood-color': d.color
  }))
  $filter.append('feComposite').call(bindAttr({
    in2: 'offset'
    operator: 'in'
  }))
  const $feMerge = $filter.append('feMerge')
  $feMerge.append('feMergeNode')
  $feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
}
*/
