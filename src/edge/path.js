import {
  path
} from 'd3-path'
import ds from '../dataSet.js'

const shape = {
  line(x1, y1, x2, y2) {
    const d = path()
    d.moveTo(x1, y1)
    d.lineTo(x2, y2)
    return d
  },
  arc() {
    // 弧线
  },
  quadratic() {
    // 二次贝塞尔曲线
  },
  bezier() {
    // 三次贝塞尔曲线
  },
}

function draw(shape, x1, y1, x2, y2) {
  return shape(x1, y1, x2, y2)
}

export const shapes = Object.keys(shape)

export function genPath(edge) {
  if (typeof edge === 'string') {
    edge = ds.edgeMap.get(edge) || {}
  }
  const { x: x1, y: y1 } = ds.nodeMap.get(edge.source).linkPoint
  const { x: x2, y: y2 } = ds.nodeMap.get(edge.target).linkPoint
  return draw(shape[edge.type], x1, y1, x2, y2)
}

/*
export const edgeType = {
  line: 'line',
  arc: 'arc',
  vertical: '',
  horizontal: '',
  vBezier: '',
  hBezier: '',
}
*/
