import _ from 'lodash'
import {
  select,
  namespaces
} from 'd3-selection'
import {
  bindAttr
} from './util'

function renderFilter($filter, data) {
  $filter.call(bindAttr(data.attr))
  _.forEach(data.subNodes, item => {
    if (item.name) {
      const $subNode = $filter.append(item.name)
      renderFilter($subNode, item)
    }
  })
}

export default class Filter {
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
      this._filter.set(filter.attr.id, this._last.get(filter.attr.id))
    }
  }

  render(filter) {
    const $filter = select(document.createElementNS(namespaces.svg, 'filter'))
    renderFilter($filter, filter)
    return $filter.node()
  }

  clear() {
    this._filter.clear()
    this._last.clear()
  }
}
