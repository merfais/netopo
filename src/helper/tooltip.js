import _ from 'lodash'
import {
  event as d3Event
} from 'd3-selection'
import {
  merge,
  bindStyle,
} from './util'

const theme = {
  border: '0 solid rgb(51, 51, 51)',
  'border-radius': '4px',
  'white-space': 'nowrap',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
  'z-index': 1,
  'background-color': 'rgba(50, 50, 50, 0.7)',
  'box-shadow': '3px 3px 10px rgba(0, 0, 0, 0.2)',
  color: '#fff',
  'font-style': 'normal',
  'font-size': '14px',
  'line-height': '21px',
  padding: '5px',
  left: 0,
  top: 0,
  position: 'absolute',
  display: 'none',
}

const dftOptions = {
  enable: true,
  gap: 20,
  style: theme,
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

export default class Tooltip {

  _opts = null
  _onDragStart = null
  _onDragEnd = null
  _$viewer = null
  _$tip = null
  _ds = null
  _eventer = null
  _noError = true

  constructor(options) {
    if (_.has(options, 'tooltip')) {
      this._opts = merge({}, dftOptions, options.tooltip)
      options.tooltip = this._opts
    } else {
      this._opts = merge({}, dftOptions, options)
    }
    this._onDragStart = () => {
      this._opts.enable = false
    }
    this._onDragEnd = () => {
      this._opts.enable = true
    }
  }

  create($viewer, eventer, ds) {
    this._ds = ds
    this._eventer = eventer
    this._$viewer = $viewer
    this._$tip = $viewer.append('div')
      .attr('class', 'tooltip')
      .call(bindStyle(this._opts.style))
    this._eventer.on('drag.start', this._onDragStart)
    this._eventer.on('drag.end', this._onDragEnd)
    this._eventer.emit('tooltip.create')
    return this
  }

  show(d) {
    if (!_.isObject(d)) {
      throw new Error('d is required when use tooltip')
    }
    let tooltip
    if (_.has(d, 'tooltip')) {
      tooltip = d.tooltip
    } else {
      tooltip = d
    }
    if (!_.has(tooltip, 'enable')) {
      throw new Error('tooltip.enable is required')
    }
    this._enable = tooltip.enable
    if (this._enable) {
      this._eventer.emit('tooltip.show')
      let formatter
      if (_.isFunction(this._opts.formatter)) {
        formatter = this._opts.formatter
      } else if (_.isFunction(tooltip.formatter)) {
        formatter = tooltip.formatter
      } else {
        formatter = d => `${d.value}`
      }
      this._noError = true
      try {
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
      } catch (e) {
        this._noError = false
        throw e
      }
    }
  }

  update() {
    if (this._enable && this._noError) {
      const viewerRect = this._$viewer.node().getBoundingClientRect()
      const tipRect = this._$tip.node().getBoundingClientRect()
      const { left, top } = updatePosition(viewerRect, tipRect, this._opts.gap)
      this._$tip.call(bindStyle({
        left,
        top,
        display: 'block',
      }))
      this._eventer.emit('tooltip.update')
    }
  }

  hide() {
    this._$tip.style('display', 'none')
    this._eventer.emit('tooltip.hide')
  }

  destroy() {
    this._$tip.remove()
    this._opts = null
    this._eventer.off('drag.start', this._onDragStart)
    this._eventer.off('drag.end', this._onDragEnd)
    this._eventer.emit('tooltip.destroy')
    this._eventer = null
  }
}
