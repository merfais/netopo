import {
  select,
  namespaces,
} from 'd3-selection'
import ds from '../dataSet'
import options from '../options'
import drag from '../drag'
import {
  bindHover,
  unBindHover,
} from '../hover'
import {
  bind,
  bindStyle,
  bindAttr,
  merge,
} from '../util.js'
import {
  shapes,
  renderComponent,
} from './shape.js'

const dftOptions = {
  drag: {
    enable: true,
  },
  shadow: {
    enable: false,
  },
  tooltip: {
    enable: true,
  }
}

function renderShape($node, $node2) {
  return (d, prop = {}, prop2 = {}) => {
    if (!_.isEmpty(prop)) {
      $node.append(prop.type)
        .call(bind(prop))
    }
    if (!_.isEmpty(prop2)) {
      $node2.selectAll(prop2.type).remove()
        .data([d]).enter()
        .append(prop2.type)
        .call(bind(prop2))
        .call(bindHover('node', $node))
        .call(drag.bind())
    }
  }
}

function renderLabel($node) {
  return (prop = {}) => {
    if (!_.isEmpty(prop)) {
      $node.append('foreignObject')
        .call(bindAttr(prop.attr))
        .append('xhtml:div')
        .call(bindStyle(prop.style))
        .html(prop.text)
    }
  }
}

function prepareNode(d) {
  // 节点位置
  const x = _.get(d, ['position', 'x'], 0)
  const y = _.get(d, ['position', 'y'], 0)
  // 属性
  const attr = {
    id: d.id,
    transform: `translate(${x}, ${y})`,
  }
  // 样式
  const style = { ...d.style }
  // 连线位置
  d.linkPoint.x += x
  d.linkPoint.y += y
  return {
    attr,
    style,
  }
}

function renderNode(d) {
  const $node = select(document.createElementNS(namespaces.svg, 'g'))
  const $node2 = select(document.createElementNS(namespaces.svg, 'g'))
  renderComponent(d, renderShape($node, $node2), renderLabel($node))
  const prop = prepareNode(d)
  const prop2 = merge({}, prop, {
    attr: {
      id: prop.attr.id + '_cover',
    }
  })
  $node.call(bind(prop))
  $node2.call(bind(prop2))
  return {
    $node2,
    $node,
  }
}

let $labelDiv
let $labelDivWrapper
let labelDivStyle = {}
export function appendHiddenDiv($parent) {
  if ($parent) {
    $labelDivWrapper = $parent.append('div').call(bindStyle({
      visibility: 'hidden',
      position: 'absolute',
    }))
    $labelDiv = $labelDivWrapper.append('div')
  }
}

export function calcLabelHeight(label) {
  if (label.width !== null) {
    $labelDivWrapper.style('width', parseFloat(label.width) + 'px')
  }
  $labelDiv.html(label.text)
  if (!_.isEqual(labelDivStyle, label.style)) {
    labelDivStyle = label.style
    $labelDiv.call(bindStyle(label.style))
  }
  return $labelDivWrapper.node().clientHeight
}

export function updateNodesPosition($container, $container2) {
  return (type, d) => {
    if (type === 'tick') {
      _.forEach(ds.nodes, d => {
        d.linkPoint.x += d.x - d.position.x
        d.linkPoint.y += d.y - d.position.y
        d.position.x = d.x
        d.position.y = d.y
        const transform = `translate(${d.position.x}, ${d.position.y})`
        $container.select(`#${d.id}`).attr('transform', transform)
      })
    } else if (type === 'end') {
      $container2.selectAll('g').attr('transform', d => {
        if (!_.has(d, 'position')) {
          throw new Error('data.position is required')
        }
        return `translate(${d.position.x}, ${d.position.y})`
      })
    } else if (type === 'drag') {
      if (!_.has(d, 'position')) {
        throw new Error('data.position is required')
      }
      const translate = `translate(${d.position.x}, ${d.position.y})`
      $container.select(`#${d.id}`).attr('transform', translate)
      $container2.select(`#${d.id}_cover`).attr('transform', translate)
    }
  }
}

export function renderNodes($container, $container2) {
  const nodeOpts = merge({}, dftOptions, options.node)
  // ds.change.node的值在get一次后会被置为[],只有在有新的数据变化时才会被再次赋值
  // 因此这里需要缓存一次，因为下面有多个地方使用
  const nodes = ds.change.nodes
  if (nodes.length) { // 认为只有数据变化才渲染
    // eslint-disable-next-line no-underscore-dangle
    let $nodes = $container.selectAll('g').data(nodes, d => d._id)
    $nodes.exit().remove()
    // eslint-disable-next-line no-underscore-dangle
    const $nodes2 = $container2.selectAll('g').data(nodes, d => d._id)
    $nodes2.exit().remove()
    $nodes2.enter().append(d => {
      if (!_.has(d, 'shape')) {
        d.shape = {
          type: 'text'
        }
      } else {
        if (shapes.indexOf(d.shape.type) === -1) {
          d.shape.type = 'text'
        }
      }
      _.forEach(nodeOpts, (item, key) => {
        d[key] = merge({}, item, d[key])
      })
      const { $node, $node2 } = renderNode(d)
      $container.append(() => $node.node())
      return $node2.node()
    })
  }
}

export function destroyNodes($container, $container2) {
  $container2.selectAll('g').property('_destroy', function() {
    select(this.firstChild).call(unBindHover())
  })
  $container2.remove()
  $container.remove()
}
