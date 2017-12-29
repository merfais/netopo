import {
  select,
  namespaces,
} from 'd3-selection'
import options from '../options'
import drag from '../drag'
import bindHover from '../hover'
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
    _type: 'node',
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
        .call(bindHover($node, d.shape.type === 'text' ? 'label' : 'node'))
        .call(drag.bind(d.drag.enable))
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
  // shape label要先计算，因为节点的position信息需要动态计算
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

export default function render($container, $container2, nodes) {
  const nodeOpts = merge({}, dftOptions, options.node)
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
