import {
  genShadow,
  merge,
} from '../helper'
import rect from './rect'
import circle from './circle'
import image from './image'
import label from './text'
import line from './line'

function genShapeProp(d, filter) {
  // 阴影
  if (d.shadow.enable !== false) {
    const shadow = genShadow(d.shadow, filter)
    d.shape.style.filter = shadow.styleFilter
    if (_.isObject(d.shape.hover) && _.isObject(d.shape.hover.style)) {
      d.shape.hover.style.filter = shadow.hoverFilter
    }
  }
  const attr = { ...d.shape }
  attr.id = `${d.id}_shape`
  const style = attr.style
  const type = attr.type
  delete attr.type
  delete attr.hover
  delete attr.style
  const prop = {
    attr,
    style,
    type,
  }
  const prop2 = {
    attr: {
      ...attr,
      id: attr.id + '_cover',
    },
    style: {
      ...style,
      opacity: 0,
      filter: null,
    },
    type,
  }
  return { prop, prop2 }
}

function genLabelProp(d) {
  const attr = { ...d.label }
  attr.id = `${d.id}_label`
  const style = attr.style
  const text = attr.text
  delete attr.style
  delete attr.text
  delete attr.hover
  return {
    attr,
    style,
    text,
  }
}

const nodeShapes = {
  rect,
  circle,
  image,
  text: label,
}

export function genNodeProp(d, filter, calcLabelHeight) {
  const node = nodeShapes[d.shape.type]
  if (!node) {
    throw new Error(`node type: ${d.shape.type} is not supported`)
  }
  node.prepareData(d, calcLabelHeight)
  const shapeProp = genShapeProp(d, filter)
  if (d.shape.type === 'text') {
    shapeProp.prop = {}
    shapeProp.prop2.type = 'rect'
  } else if (d.shape.type === 'image') {
    shapeProp.prop2.type = 'rect'
    delete shapeProp.prop2.attr.href
  }
  let labelProp = {}
  if (_.has(d.label, 'text')) {
    if (typeof d.label.text !== 'string') {
      throw new Error('label text must be string')
    }
    if (d.label.text) {
      labelProp = genLabelProp(d)
    }
  }
  return {
    labelProp,
    shapeProp,
  }
}

const pathShapes = {
  line,
}

export function genEdgeProp(d, filter) {
  const edge = pathShapes[d.path.type]
  if (!edge) {
    throw new Error(`edge type: ${d.path.type} is not supported`)
  }
  edge.prepareData(d)
  if (d.shadow.enable !== false) {
    // FIXME: 开启filter会有性能问题
    const shadow = genShadow(d.shadow, filter)
    d.path.style.filter = shadow.styleFilter
    if (_.isObject(d.path.hover) && _.isObject(d.path.hover.style)) {
      d.path.hover.style.filter = shadow.hoverFilter
    }
  }
  if (d.dashArray) {
    merge(d.path.style, {
      'stroke-dasharray': d.dashArray
    })
    merge(d.path.hover, {
      style: {
        'stroke-dasharray': d.dashArray
      }
    })
  }
  const attr = { ...d.path }
  const style = attr.style
  delete attr.style
  delete attr.hover
  const prop = {
    attr,
    style,
  }
  const prop2 = {
    style: merge({}, prop.style, {
      opacity: 0,
      'stroke-width': d.hoverBoundarySpan,
      'stroke-dasharray': null,
      filter: null,
    }),
    attr: {}
  }
  return { prop, prop2 }
}
