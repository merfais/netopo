import {
  select,
  namespaces,
} from 'd3-selection'
import options from '../options'
import {
  bindAttr,
  merge,
} from '../util.js'
import {
  brighterFilter,
  darkerFilter,
} from './color'

const dftOptions = {
  brighter: {
    value: 1,
  },
  darker: {
    value: 1
  },
  custom: {}
}

function renderFilter($filter, data) {
  $filter.call(bindAttr(data.attr))
  _.forEach(data.subNodes, item => {
    if (item.name) {
      const $subNode = $filter.append(item.name)
      renderFilter($subNode, item)
    }
  })
}

class Filter {
  constructor(options) {
    this._filter = new Map()
    this._last = new Map()

    _.forEach(options.custom, (filter, key) => {
      if (!_.has(filter, 'attr')) {
        filter.attr = {}
      }
      if (!_.has(filter.attr, 'id')) {
        filter.attr.id = key
      }
      this.use(filter)
    })
    this.use(darkerFilter(options.darker.value))
    this.use(brighterFilter(options.brighter.value))
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

  /**
   * 插入filter的描述对象
   *
   * @name use
   * @function
   * @param {object} filter 描述对象
   *
   * {
   *   // name: 顶级无name属性，用于filter便签
   *   attr: {
   *     id: d.id,
   *     width: '200%',
   *     height: '200%',
   *     x: '-50%',
   *     y: '-50%',
   *   },
   *   subNodes: [{
   *     name: 'feDropShadow',
   *     attr: {
   *       dx: d.offsetX,
   *       dy: d.offsetY,
   *       stdDeviation: d.blur,
   *       'flood-color': d.color
   *     }
   *     subNodes: [{
   *
   *     }]
   *   }, {
   *
   *   }]
   * }
   *
   */
  use(filter) {
    if (!_.has(filter, 'attr') || !_.has(filter.attr, 'id')) {
      throw new Error('filter.attr.id is required')
    }
    if (!this._last.has(filter.attr.id)) {
      this._filter.set(filter.attr.id, filter)
    } else {
      this._filter.set(filter.attr.id, this._last.get(filter.id))
    }
  }

  clear() {
    this._filter.clear()
    this._last.clear()
  }
}

options.filter = merge({}, dftOptions, options.filter)
const filter = new Filter(options.filter)

export function renderDefs($defs) {
  if (filter.data.length) {
    const $filters = $defs.selectAll('filter').data(filter.data, d => d.id)
    $filters.exit().remove()
    $filters.enter().append(d => {
      const $filter = select(document.createElementNS(namespaces.svg, 'filter'))
      renderFilter($filter, d)
      return $filter.node()
    })
  }
  return $defs
}

export function destroyDefs($defs) {
  filter.clear()
  $defs.remove()
}

export default filter
