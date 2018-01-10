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
    this._$wrapper = null
    this._$subscriber = null
    this._transform = { x: 0, y: 0, k: 1 }
  }

  create($root, $subscriber, $zoomWrapper) {
    thumbnails.create($root, $subscriber)
    this._$subscriber = $subscriber
    this._$wrapper = $zoomWrapper
    eventer.emit('zoom.create')
  }

  update(k) {
    if (this._opts.enable) {
      this._bindParams()
      this._zoomer.on('start', () => {
        this._transform = parseTranform(this._$wrapper.attr('transform'))
        eventer.emit('zoom.start', this._transform)
      }).on('zoom', () => {
        this.zoom({ ...event.transform })
        eventer.emit('zoom.zooming', event)
      })
    } else {
      this._zoomer.on('start', null).on('zoom', null)
    }
    this._$subscriber.call(this._zoomer)
    eventer.emit('zoom.update')
  }

  zoom(transform) {
    merge(this._transform, transform)
    const { x, y, k } = this._transform
    console.log(this._transform)
    transform = `translate(${x}, ${y}) scale(${k})`
    this._$wrapper.attr('transform', transform)
    transform = zoomTransform({}).translate(x, y).scale(k)
    this._$subscriber.property('__zoom', transform)
    if (this._opts.thumbnails.enable) {
      thumbnails.updateBrushPositon(this._transform)
      // thumbnails.update()
    }
  }

  destroy() {
    this._zoomer.on('start', null).on('zoom', null)
    this._zoomer = null
    this._$wrapper = null
    this._opts = null
    eventer.emit('zoom.destroy')
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
