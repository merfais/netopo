function extendNode(node, key) {
  const rst = {
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
  const rst = {}
  if (!_.has(edge, 'id')) {
    rst.id = key
  }
  return rst
}

export default class DataSet {

  _rawNodes = new Map()   // 原始节点集，由于涉及DOM的更新，因此需要diff
  _nodes = new Map()      // 节点集
  _edges = new Map()      // 边集
  _enterNodes = new Map()
  _enterEdges = new Map()
  _exitNodes = null
  _exitEdges = null
  _updateNodes = new Map()
  _updateEdges = new Map()
  // forceLink集，用于力导图，力导图会修改links集的数据结构，所以不能直接使用edges集
  // 由于未涉及DOM更新，所以无需raw缓存
  _links = new Set()

  set nodes(nodes) {
    const raw = new Map()
    this._exitNodes = new Map(this._nodes)
    this._nodes.clear()
    this._updateNodes.clear()
    this._enterNodes.clear()
    _.forEach(nodes, (node, id) => {
      if (_.isArray(nodes)) {
        if (!_.has(node, 'id')) {
          throw new Error('id is required in node object')
        }
        id = node.id
      }
      raw.set(id, node)
      // diff数据，如果数据没有变化直接使用旧数据
      // FIXME: node.type 变化需要重建DOM，应该放到enter集中
      if (this._exitNodes.has(id)) {
        if (_.isEqual(this._rawNodes.get(id), node)) {
          node = this._exitNodes.get(id)
          // eslint-disable-next-line no-underscore-dangle
          node._edges = [] // 清理掉edge信息，有可能edge发生变化，set edge时重新生成
          this._nodes.set(id, node)
        } else {
          node = {
            ...node,
            ...extendNode(node, id)
          }
          this._nodes.set(id, node)
          this._updateNodes.set(id, node)
        }
        this._exitNodes.delete(id)
      } else {
        node = {
          ...node,
          ...extendNode(node, id) // 数据变化会生成新的数据索引等信息
        }
        this._nodes.set(id, node)
        this._enterNodes.set(id, node)
      }
    })
    this._rawNodes = raw
  }

  set edges(edges) {
    this._exitEdges = new Map(this._edges)
    this._edges.clear()
    this._updateEdges.clear()
    this._enterEdges.clear()
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
      this._addEdgeToNode(id, edge.source)
      this._addEdgeToNode(id, edge.target)
      edge = {
        ...edge,
        ...extendEdge(edge, id)
      }
      // edge不使用diff，因为edge的位置信息根据node的位置计算得出，
      // 很可能edge本身无变化，但连接的node位置发生变化，所以edge需要渲染
      // dataSet集决定哪些需要重新渲染，所以无法在渲染时再决定dataSet集
      if (this._exitEdges.has(id)) {
        this._edges.set(id, edge)
        this._updateEdges.set(id, edge)
        this._exitEdges.delete(id)
      } else {
        this._edges.set(id, edge)
        this._enterEdges.set(id, edge)
      }
    })
  }

  get nodes() {
    return [...this._nodes.values()]
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

  get exitNodes() {
    const rtn = [...this._exitNodes.values()]
    this._exitNodes.clear()
    return rtn
  }

  get exitEdges() {
    const rtn = [...this._exitEdges.values()]
    this._enterEdges.clear()
    return rtn
  }

  get updateNodes() {
    const rtn = [...this._updateNodes.values()]
    this._updateNodes.clear()
    return rtn
  }

  get updateEdges() {
    const rtn = [...this._updateEdges.values()]
    this._updateEdges.clear()
    return rtn
  }

  get enterNodes() {
    const rtn = [...this._enterNodes.values()]
    this._enterNodes.clear()
    return rtn
  }

  get enterEdges() {
    const rtn = [...this._enterEdges.values()]
    this._enterEdges.clear()
    return rtn
  }

  clear() {
    this._nodes.clear()
    this._edges.clear()
    this._enterNodes.clear()
    this._enterEdges.clear()
    this._updateNodes.clear()
    this._updateEdges.clear()
    this._exitNodes.clear()
    this._exitEdges.clear()
    this._rawNodes.clear()
    this._links.clear()
  }

  _addEdgeToNode(edgeId, nodeId) {
    const node = this._nodes.get(nodeId)
    /* eslint-disable no-underscore-dangle */
    if (node && node._edges.indexOf(edgeId) === -1) {
      node._edges.push(edgeId)
    }
    /* eslint-enable no-underscore-dangle */
  }
}
