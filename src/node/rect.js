import {
  merge
} from '../util.js'

const dftOptions = {
  shape: {
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
  },
  label: {
    x: 0,
    y: 0,
    width: 100,
    height: 30,
    style: {
      display: 'flex',
      height: '100%',
      padding: '5px',
      color: '#333',
      'justify-content': 'center',
      'align-items': 'center',
      'word-break': 'break-all',
      'line-height': '1.2em',
      'letter-spacing': '0.1em',
      'font-size': '14px',
      'box-sizing': 'border-box',
    },
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

function prepareShape(d) {
  d.shape = merge({}, dftOptions.shape, d.shape)
  calcLinkPoint(d)
}

function prepareLabel(d) {
  const wh = {
    width: _.get(d.shape, 'width', dftOptions.shape.width),
    height: _.get(d.shape, 'height', dftOptions.shape.height)
  }
  d.label = merge({}, dftOptions.label, wh, d.label)
}

function prepare(d) {
  prepareShape(d)
  prepareLabel(d)
}

export default {
  prepare,
}
