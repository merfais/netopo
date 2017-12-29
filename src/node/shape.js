import rect from './rect'
import circle from './circle'
import image from './image'
import label from './text'
import genShadowFilter from '../defs/shadow'

function genShapeProp(d) {
  // 阴影
  if (d.shadow.enable !== false) {
    const shadow = genShadowFilter(d.shadow)
    d.shape.style.filter = shadow.styleFilter
    d.shape.hover.style.filter = shadow.hoverFilter
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

export const shapes = Object.keys(nodeShapes)

export function renderComponent(d, renderShape, renderLabel) {
  const node = nodeShapes[d.shape.type]
  if (!node) {
    throw new Error('shape type is not supported')
  }
  node.prepare(d)
  const nodeProp = genShapeProp(d)
  if (d.shape.type === 'text') {
    nodeProp.prop = {}
    nodeProp.prop2.type = 'rect'
  } else if (d.shape.type === 'image') {
    nodeProp.prop2.type = 'rect'
    delete nodeProp.prop2.attr.href
  }
  let labelProp = {}
  d.label.text += ''
  if (d.label.text) {
    labelProp = genLabelProp(d)
  }
  renderShape(d, nodeProp.prop, nodeProp.prop2)
  renderLabel(labelProp)
}
