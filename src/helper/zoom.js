import _ from 'lodash'
import {
  zoom,
} from 'd3-zoom'
import {
  event
} from 'd3-selection'
import {
  merge,
  parseTranform,
} from './util'
import Thumbnails, {
  bindTransform,
} from './thumbnails'

const dftOptions = {
  enable: true,
  scaleExtent: [1 / 4, 8],
  translateExtent: null,
  filter: null,
  thumbnails: {},
}

const defaultFilter = function(opts) {
  return () => {
    if (opts.thumbnails.enable) {
      return event.type !== 'wheel' &&
        event.type !== 'dblclick' &&
        event.button === 0  // 左键
    }
    return !event.button
  }
}

export default class Zoom {

  _opts = null
  _eventer = null
  _zoomer = null
  _thumbnails = null
  _$zoomWrapper = null
  _$subscriber = null

  constructor(options) {
    if (_.has(options, 'zoom')) {
      this._opts = merge({}, dftOptions, options.zoom)
      options.zoom = this._opts
    } else {
      this._opts = merge({}, dftOptions, options)
    }
    this._zoomer = zoom()
  }

  create($root, $subscriber, $zoomWrapper, eventer) {
    this._eventer = eventer
    // 缓存wrapper的transform属性，每次读取DOM由于性能问题出现延时则会计算错误
    if (_.isObject(this._opts.transform)) {
      this._opts.transform.x = this._opts.transform.x || 0
      this._opts.transform.y = this._opts.transform.y || 0
      this._opts.transform.k = this._opts.transform.k || 1
      bindTransform($zoomWrapper, $subscriber, this._opts.transform)
    } else {
      this._opts.transform = parseTranform($zoomWrapper.attr('transform'))
    }
    this._thumbnails = new Thumbnails(this._opts)
      .create($root, $subscriber, $zoomWrapper, eventer)
    this._$subscriber = $subscriber
    this._$zoomWrapper = $zoomWrapper
    this._eventer.emit('zoom.create')
    return this
  }

  update() {
    if (this._opts.enable) {
      if (_.isObject(this._opts.transform)) {
        this._opts.transform.x = this._opts.transform.x || 0
        this._opts.transform.y = this._opts.transform.y || 0
        this._opts.transform.k = this._opts.transform.k || 1
        bindTransform(this._$zoomWrapper, this._$subscriber, this._opts.transform)
      }
      this._bindParams()
      this._zoomer.on('start', () => {
        this._eventer.emit('zoom.start', this._opts.transform)
      }).on('zoom', () => {
        const transform = { ...event.transform }
        const dx = transform.x - this._opts.transform.x
        const dy = transform.y - this._opts.transform.y
        merge(this._opts.transform, transform)
        this._zoom(dx, dy)
        this._eventer.emit('zoom.zooming', event)
      }).on('end', () => {
        this._eventer.emit('zoom.end')
      })
    } else {
      this._zoomer.on('start', null).on('zoom', null).on('end', null)
    }
    this._$subscriber.call(this._zoomer)
    this._eventer.emit('zoom.update')
  }

  resizeZoom(scale, rect) {
    const k = this._opts.transform.k * scale
    // 对于已transform的元素，调整scale后，且以元素上(x1, y1)点做基准点，
    // 那么重新计算translate的(dx2, dy2)的公式
    // dx2 = ((k1 - k2) * x1 + k2 * dx1) / k1
    // dy2 = ((k1 - k2) * y1 + k2 * dy1) / k1
    // 由于相对于可视区左上角(0, 0)做基准点，所以 (x1, y1) = (0, 0)
    this._opts.transform.x *= k / this._opts.transform.k
    this._opts.transform.y *= k / this._opts.transform.k
    this._opts.transform.k = k
    this._zoom(0, 0, rect, scale)
  }

  destroy() {
    this._zoomer.on('start', null).on('zoom', null).on('end', null)
    this._zoomer = null
    this._thumbnails.destroy()
    this._thumbnails = null
    this._$subscriber = null
    this._$zoomWrapper = null
    this._opts = null
    this._eventer.emit('zoom.destroy')
    this._eventer = null
  }

  _zoom(dx, dy, rect, scale) {
    bindTransform(this._$zoomWrapper, this._$subscriber, this._opts.transform)
    if (this._opts.thumbnails.enable) {
      this._thumbnails.updateBrushPositon(dx, dy, rect, scale)
    }
  }

  _bindParams() {
    if (this._opts.scaleExtent !== null) {
      this._zoomer.scaleExtent(this._opts.scaleExtent)
    }
    if (this._opts.translateExtent !== null) {
      this._zoomer.translateExtent(this._opts.translateExtent)
    }
    if (this._opts.filter !== null) {
      this._zoomer.filter(this._opts.filter)
    } else {
      this._zoomer.filter(defaultFilter(this._opts))
    }
  }
}
