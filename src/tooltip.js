import {
  event as d3Event
} from 'd3-selection'
import ds from './dataSet'
import options from './options'
import eventer from './event'
import {
  merge,
  bindStyle,
} from './util'

const dftOptions = {
  enable: true,
  style: {
    border: '0 solid rgb(51, 51, 51)',
    'border-radius': '4px',
    'white-space': 'nowrap',
    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
    'z-index': 1,
    'background-color': 'rgba(50, 50, 50, 0.7)',
    color: '#fff',
    'font-style': 'normal',
    'font-size': '14px',
    'line-height': '21px',
    padding: '5px',
    left: 0,
    top: 0,
    position: 'absolute',
    display: 'none',
  },
}

const dftFormatter = type => {
  if (type === 'node') {
    return d => `${d.label.text}: ${d.value}`
  } else if (type === 'edge') {
    return d => {
      let source = ds.nodeMap.get(d.source)
      source = source ? source.label.text : d.source
      let target = ds.nodeMap.get(d.target)
      target = target ? target.label.text : d.target
      return `${source} -> ${target}: ${d.value}`
    }
  } else {
    return d => `${d.value}`
  }
}

function updatePosition(viewerRect, tipRect, gap) {
  let left = d3Event.offsetX + gap
  // 如果越过右侧边界，则在鼠标左侧显示
  if (left + tipRect.width > viewerRect.width) {
    left = d3Event.offsetX - tipRect.width - gap
    // 如果越过左侧边界，则不再以鼠标为基点，以右侧边界为基准
    if (left < 0) {
      left = viewerRect.width - tipRect.width - gap
    }
  }
  let top = d3Event.offsetY + gap
  // 如果越过下边界
  if (top + tipRect.height > viewerRect.height) {
    top = d3Event.offsetY - tipRect.height - gap
    // 如果越过上边界
    if (top < 0) {
      top = viewerRect.height - tipRect.height - gap
    }
  }
  return {
    top: top + 'px',
    left: left + 'px'
  }
}

class Tooltip {
  constructor(options) {
    this._opts = options
    this._gap = 20
    this._onDragStart = () => (this._opts.enable = false)
    this._onDragEnd = () => (this._opts.enable = true)
  }

  create($viewer) {
    this._$viewer = $viewer
    this._$tip = $viewer.append('div').call(bindStyle(this._opts.style))
    eventer.on('drag.start', this._onDragStart)
    eventer.on('drag.end', this._onDragEnd)
  }

  show(d) {
    if (!_.isObject(d)) {
      throw new Error('d is required when use tooltip')
    }
    d.tooltip = d.tooltip || {}
    this._enable = d.tooltip.enable
    if (this._enable) {
      eventer.emit('tooltip.show')
      const type = _.has(d, 'shape') ? 'node' : 'edge'
      let formatter = dftFormatter(type)
      if (_.isFunction(d.tooltip.formatter)) {
        formatter = d.tooltip.formatter
      }
      const html = formatter(d)
      if (!_.isString(html)) {
        throw new Error('tooltip.formatter must return a string')
      }
      if (html) {
        this._$tip.html(html)
        this.update()
      } else {
        this._enable = false
      }
    }
  }

  update() {
    if (this._enable) {
      const viewerRect = this._$viewer.node().getBoundingClientRect()
      const tipRect = this._$tip.node().getBoundingClientRect()
      const { left, top } = updatePosition(viewerRect, tipRect, this._gap)
      this._$tip.call(bindStyle({
        left,
        top,
        display: 'block',
      }))
      eventer.emit('tooltip.update')
    }
  }

  hide() {
    this._$tip.style('display', 'none')
    eventer.emit('tooltip.hide')
  }

  destroy() {
    this._$tip.remove()
    this._opts = null
    eventer.off('drag.start', this._onDragStart)
    eventer.off('drag.end', this._onDragEnd)
    eventer.emit('tooltip.destroy')
  }
}

options.tooltip = merge({}, dftOptions, options.tooltip)
const tooltip = new Tooltip(options.tooltip)

export default tooltip
