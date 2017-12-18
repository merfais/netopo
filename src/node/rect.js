import {
  merge
} from '../util.js'

const DEFAULT = {
  get shape() {
    return {
      x: 0,
      y: 0,
      rx: 5,
      ry: 5,
      width: 100,
      height: 36,
      style: {
        cursor: 'pointer',
        stroke: '#666',
        'stroke-width': 0.8,
        fill: 'e8e8e8',
      },
      class: '',
      hover: {
        style: {
          stroke: '#777',
          fill: '#eee',
        },
        class: '',
      }
    }
  },
  get label() {
    return {
      x: 0,
      y: 0,
      width: 100,
      height: 30,
      style: {
        display: 'flex',
        height: '100%',
        'justify-content': 'center',
        'align-items': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'letter-spacing': '0.1em',
        padding: '5px',
        color: '#333',
      },
      hover: {
        style: {},
        class: '',
      }
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
  const wh = {
    width: _.get(d.shape, 'width', DEFAULT.shape.width),
    height: _.get(d.shape, 'height', DEFAULT.shape.height)
  }
  d.label = merge({}, DEFAULT.label, wh, d.label)
}

export default {
  shape,
  label
}
