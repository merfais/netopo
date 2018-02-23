function genNode (...args) {
  const id = args.join('_')
  return {
    id: 'node' + id,
    shape: {
      type: 'image',
      href: require('../assets/vm.png')
    },
    label: {
      text: '虚拟机' + id
    },
    value: _.random(50)
  }
}

function genEdge(source, target) {
  return {
    id: 'edge_' + source + '_' + target,
    source,
    target,
    value: _.random(30),
  }
}

export function genSimpleGraph(n = 6) {
  const nodes = []
  const edges = []
  const links = [5, 8, 10, 5, 4, 10]
  while (n) {
    const src = genNode(n)
    nodes.push(src)
    let m = links[n - 1]
    while (m) {
      const dst = genNode(n, m)
      nodes.push(dst)
      const edge = genEdge(src.id, dst.id)
      edges.push(edge)
      m -= 1
    }
    n -= 1
  }
  edges.push(genEdge('node2_7', 'node5_1'))
  edges.push(genEdge('node6', 'node1_3'))
  edges.push(genEdge('node3', 'node4'))
  return Object.freeze({ nodes, edges })
}
