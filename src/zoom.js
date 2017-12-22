import {
  zoom,
} from 'd3-zoom'
import {
  event
} from 'd3-selection'
import options from './options'
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
  useThumbnails: true,
}

const defaultFilter = function(options) {
  return () => {
    if (options.useThumbnails) {
      return event.type !== 'wheel' && event.type !== 'dblclick'
    }
    return !event.button
  }
}

class Zoom {

  constructor(options) {
    this._opts = options
    this._zoomer = this._initZoom()
    this._$wraper = null
  }

  create($root, $subscriber) {
    thumbnails.create($root, $subscriber)
    this._$wraper = $subscriber.select('.zoom-wraper')
    $subscriber.call(this._zoomer)
  }

  destroy() {
    this._zoomer.on('start', null).on('zoom', null)
    this._zoomer = null
    this._$wraper = null
    this._opts = null
  }

  _initZoom() {
    return zoom().on('start', () => {
      this._bindParams()
    }).on('zoom', () => {
      if (this._opts.enable) {
        if (this._opts.useThumbnails) {
          let { x, y, k } = parseTranform(this._$wraper.attr('transform'))
          const dx = event.transform.x - x
          const dy = event.transform.y - y
          x = event.transform.x
          y = event.transform.y
          this._$wraper.attr('transform', `translate(${x}, ${y}) scale(${k})`)
          thumbnails.updateBrushPositon(dx, dy, k)
        } else {
          this._$wraper.attr('transform', event.transform)
        }
      }
    })
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
