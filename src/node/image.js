import {
  merge
} from '../util.js'

const DEFAULT = {
  get shape() {
    return {
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      style: {},
      class: '',
    }
  },
  get label() {
    return {
      x: null,      // 如果渲染时未提供，则置为 shape.x + shape.width / 2
      y: null,      // 如果渲染时未提供，则置为 shape.y + shape.height
      width: null,  // 如果渲染时未提供，则置为 100
      style: {
        display: 'flex',
        'justify-content': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'padding-top': '5px',
        'letter-spacing': '0.1em',
      }
    }
  },
  get certer() {
    return {
      x: 0,
      y: 0,
    }
  }
}

function calcLinkPoint(d) {
  const x = parseFloat(d.shape.x) || 0
  const y = parseFloat(d.shape.y) || 0
  const width = parseFloat(d.shape.width) || 0
  const height = parseFloat(d.shape.height) || 0
  d.linkPoint.x = d.linkPoint.x || x + width / 2
  d.linkPoint.y = d.linkPoint.y || y + height / 2
}

function shape(d) {
  d.shape = merge({}, DEFAULT.shape, d.shape)
  calcLinkPoint(d)
}

function label(d) {
  d.label = merge({}, DEFAULT.label, d.label)
  if (d.label.x === null &&
    d.label.y === null &&
    _.isNumber(d.shape.x) &&
    _.isNumber(d.shape.y) &&
    _.isNumber(d.shape.height) &&
    _.isNumber(d.shape.width)) {
    // 未设置label的位置，设置定位
    d.label.x = d.shape.x + d.shape.width / 2
    d.label.y = d.shape.y + d.shape.height
  }
  if (d.label.width === null) {
    // 未设置label宽度
    d.label.width = 100
  }
  if (d.label.transform === null && _.isNumber(d.label.width)) {
    // 未设置label偏移，用于配合width使label居中
    d.label.transform = `translate(${-d.label.width / 2}, 0)`
  }
}

export default {
  shape,
  label
}
