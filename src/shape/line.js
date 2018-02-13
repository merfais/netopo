import {
  path
} from 'd3-path'
import {
  merge
} from '../helper'
import {
  pathTheme
} from './theme'

const dftOptions = {
  path: {
    ...pathTheme,
  },
}

function drawCircle(d, x, y, r) {
  d.arc(x - r, y, r, 0, 2 * Math.PI)
}

function genPath(edge) {
  return ds => {
    const source = ds.nodeMap.get(edge.source)
    const target = ds.nodeMap.get(edge.target)
    if (!source) {
      throw new Error(`edge.source: ${edge.source} not found`)
    }
    if (!target) {
      throw new Error(`edge.targe: ${edge.target} not found`)
    }
    const { x: x1, y: y1 } = source.linkPoint
    const { x: x2, y: y2 } = target.linkPoint
    const d = path()
    if (source.id === target.id) {
      // 如果出现自己连接自己的环
      const r = (source.shape.width || source.shape.r * 2 || 30) * 0.6
      // const r = 25
      drawCircle(d, x1, y1, r)
    } else {
      d.moveTo(x1, y1)
      d.lineTo(x2, y2)
    }
    return [d.toString()]
  }
}

function prepareData(d) {
  d.path[0] = merge({}, dftOptions.path, d.path[0])
  d.genPath = genPath(d)
}

export default {
  prepareData
}
