import {
  zoom,
  zoomTransform,
} from 'd3-zoom'
import {
  event
} from 'd3-selection'
import options from './options'
import eventer from './event'
import {
  merge,
  parseTranform,
} from './util'
import thumbnails from './thumbnails'

const dftOptions = {
  enable: true,
  scaleExtent: [1 / 4, 8],
  translateExtent: null,
  filter: null,
}

const defaultFilter = function(opts) {
  return () => {
    if (opts.thumbnails.enable) {
      return event.type !== 'wheel' && event.type !== 'dblclick'
    }
    return !event.button
  }
}

class Zoom {

  constructor(options) {
    this._opts = options
    this._zoomer = zoom()
    this._$zoomWrapper = null
    this._$subscriber = null
    // 缓存wrapper的transform属性，每次读取DOM由于性能问题出现延时则会计算错误
    this._transform = { x: 0, y: 0, k: 1 }
  }

  create($root, $subscriber, $zoomWrapper) {
    this._transform = parseTranform($zoomWrapper.attr('transform'))
    // 需要使用引用传递的方式将this._transform传递给thumbnails
    // 是因为thumbnails在zoom和drag的使用同时需要修改zoomWrapper的tramform值
    // 如果每次从dom上读取再写入有性能问题，因此使用缓存
    // 但zoom.js的zoom事件也要修改tramform的值，
    // 如果不使用同一个引用，在事件响应中数据同步比较麻烦
    thumbnails.create($root, $subscriber, $zoomWrapper, this._transform)
    this._$subscriber = $subscriber
    this._$zoomWrapper = $zoomWrapper
    eventer.emit('zoom.create')
  }

  update() {
    if (this._opts.enable) {
      this._bindParams()
      this._zoomer.on('start', () => {
        eventer.emit('zoom.start', this._transform)
      }).on('zoom', () => {
        const transform = { ...event.transform }
        const dx = transform.x - this._transform.x
        const dy = transform.y - this._transform.y
        merge(this._transform, transform)
        this._zoom(dx, dy)
        eventer.emit('zoom.zooming', event)
      }).on('end', () => {
        eventer.emit('zoom.end')
      })
    } else {
      this._zoomer.on('start', null).on('zoom', null).on('end', null)
    }
    this._$subscriber.call(this._zoomer)
    eventer.emit('zoom.update')
  }

  resizeZoom(rect, scale) {
    const k = this._transform.k * scale
    // 对于已transform的元素，调整scale后，且以元素上(x1, y1)点做基准点，
    // 那么重新计算translate的(dx2, dy2)的公式
    // dx2 = ((k1 - k2) * x1 + k2 * dx1) / k1
    // dy2 = ((k1 - k2) * y1 + k2 * dy1) / k1
    // 由于相对于可视区左上角(0, 0)做基准点，所以 (x1, y1) = (0, 0)
    this._transform.x *= k / this._transform.k
    this._transform.y *= k / this._transform.k
    this._transform.k = k
    this._zoom(0, 0, rect, scale)
  }

  destroy() {
    this._zoomer.on('start', null).on('zoom', null).on('end', null)
    this._zoomer = null
    this._$zoomWrapper = null
    this._opts = null
    eventer.emit('zoom.destroy')
  }

  _zoom(dx, dy, rect, scale) {
    const { x, y, k } = this._transform
    let transform = `translate(${x}, ${y}) scale(${k})`
    this._$zoomWrapper.attr('transform', transform)
    transform = zoomTransform({}).translate(x, y).scale(k)
    this._$subscriber.property('__zoom', transform)
    if (this._opts.thumbnails.enable) {
      thumbnails.updateBrushPositon(dx, dy, rect, scale)
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

options.zoom = merge({}, dftOptions, options.zoom)
const zoomer = new Zoom(options.zoom)

export default zoomer
