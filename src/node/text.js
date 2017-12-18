import {
  merge
} from '../util.js'

const DEFAULT = {
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
      hover: {}
    }
  }
}

function calcLinkPoint(d) {
  const x = parseFloat(d.label.x) || 0
  const y = parseFloat(d.label.y) || 0
  const width = parseFloat(d.label.width) || 0
  const height = parseFloat(d.label.height) || 0
  d.linkPoint.x = d.linkPoint.x || x + width / 2
  d.linkPoint.y = d.linkPoint.y || y + height / 2
}

function label(d) {
  d.label = merge({}, DEFAULT.label, d.label)
  calcLinkPoint(d)
}

export default {
  label
}
