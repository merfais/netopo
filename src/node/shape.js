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
  delete attr.type
  delete attr.hover
  delete attr.style
  return {
    attr,
    style,
  }
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

const shape = {
  rect,
  circle,
  image,
  text: label,
}

export const shapes = Object.keys(shape)

export function renderComponent(d, renderShape, renderLabel) {
  const prepare = shape[d.shape.type]
  if (d.shape.type !== 'text') {
    prepare.shape(d)
    const prop = genShapeProp(d)
    const prop2 = {
      attr: { ...prop.attr },
      style: { ...prop.style }
    }
    prop2.attr.id += '_cover'
    prop2.style.opacity = 0
    prop2.style.filter = null
    renderShape(d, prop, prop2)
  }
  d.label.text += ''
  if (d.label.text) {
    prepare.label(d)
    renderLabel(genLabelProp(d))
  }
}
