import { uuid } from './util'

function extendNode(node, key) {
  const rst = {
    _id: uuid(),
    _edges: []
  }
  if (!_.has(node, 'id')) {
    rst.id = key
  }
  if (!_.isPlainObject(node.linkPoint)) {
    rst.linkPoint = {}
  }
  return rst
}

function extendEdge(edge, key) {
  const rst = {
    _id: uuid()
  }
  if (!_.has(edge, 'id')) {
    rst.id = key
  }
  return rst
}

class DataSet {

  _nodes = new Map()      // 节点集
  _edges = new Map()      // 边集
  _rawNodes = new Map()   // 原始节点集，由于涉及DOM的更新，因此需要diff
  _rawEdges = new Map()   // 原始边集，用于diff
  // forceLink集，用于力导图，力导图会修改links集的数据结构，所以不能直接使用edges集
  // 由于未涉及DOM更新，所以无需raw缓存
  _links = new Set()
  _hasChange = {          // 标记数据是否发生变化(增、删、改)
    node: false,          // 重新渲染图，如果数据未发生变化，则不渲染
    edge: false,
  }

  set nodes(nodes) {
    const map = new Map()
    const raw = new Map()
    _.forEach(nodes, (node, id) => {
      if (_.isArray(nodes)) {
        if (!_.has(node, 'id')) {
          throw new Error('id is required in node object')
        }
        id = node.id
      }
      // diff数据，如果数据没有变化直接使用旧数据
      if (this._nodes.has(id) && _.isEqual(this._rawNodes.get(id), node)) {
        map.set(id, this._nodes.get(id))
        raw.set(id, this._rawNodes.get(id))
      } else {
        this._hasChange.node = true
        map.set(id, {
          ...node,
          ...extendNode(node, id) // 数据变化会生成新的数据索引等信息
        })
        raw.set(id, node)
      }
    })
    if (this._nodes.size !== map.size) {
      this._hasChange.node = true
    }
    this._nodes.clear()
    this._rawNodes.clear()
    this._nodes = map
    this._rawNodes = raw
  }

  get nodes() {
    return [...this._nodes.values()]
  }

  set edges(edges) {
    const map = new Map()
    const raw = new Map()
    this._links.clear()
    _.forEach(edges, (edge, id) => {
      if (_.isArray(edges)) {
        if (!_.has(edge, 'id')) {
          throw new Error('id is required in node object')
        }
        id = edge.id
      }
      this._links.add({
        source: edge.source,
        target: edge.target,
      })
      // diff数据，如果数据没有变化直接使用旧数据
      if (this._edges.has(id) && _.isEqual(this._rawEdges.get(id), edge)) {
        map.set(id, this._edges.get(id))
        raw.set(id, this._rawEdges.get(id))
      } else {
        this._hasChange.edge = true
        map.set(id, {
          ...edge,
          ...extendEdge(edge, id) // 数据变化会生成新的数据索引等信息
        })
        const fromNode = this._nodes.get(edge.source)
        if (fromNode) {
          fromNode._edges.push({ // eslint-disable-line no-underscore-dangle
            id,
            target: edge.target,
          })
        }
        const toNode = this._nodes.get(edge.target)
        if (toNode) {
          toNode._edges.push({ // eslint-disable-line no-underscore-dangle
            id,
            source: edge.source,
          })
        }
        raw.set(id, edge)
      }
    })
    if (this._edges.size !== map.size) {
      this._hasChange.edge = true
    }
    this._edges.clear()
    this._rawEdges.clear()
    this._edges = map
    this._rawEdges = raw
  }

  get edges() {
    return [...this._edges.values()]
  }

  get links() {
    return [...this._links.values()]
  }

  get nodeMap() {
    return this._nodes
  }

  get edgeMap() {
    return this._edges
  }

  get change() {
    const self = this
    /* eslint-disable no-underscore-dangle */
    return {
      get nodes() {
        if (self._hasChange.node) {
          self._hasChange.node = false
          return [...self._nodes.values()]
        }
        return []
      },
      get edges() {
        if (self._hasChange.edge) {
          self._hasChange.edge = false
          return [...self._edges.values()]
        }
        return []
      }
    }
    /* eslint-enable no-underscore-dangle */
  }

  clear() {
    this._nodes.clear()
    this._edges.clear()
    this._rawNodes.clear()
    this._rawEdges.clear()
    this._links.clear()
  }
}

export default new DataSet()
