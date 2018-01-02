import {
  zoom,
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
    this._zoomer = zoom()
    this._$wrapper = null
    this._$subscriber = null
  }

  create($root, $subscriber, $zoomWrapper) {
    thumbnails.create($root, $subscriber)
    this._$subscriber = $subscriber
    this._$wrapper = $zoomWrapper
    eventer.emit('zoom.create')
    this.update()
  }

  update() {
    if (this._opts.enable) {
      this._bindParams()
      let wrapperTransform = {}
      this._zoomer.on('start', () => {
        wrapperTransform = parseTranform(this._$wrapper.attr('transform'))
        eventer.emit('zoom.start', wrapperTransform)
      }).on('zoom', () => {
        if (this._opts.useThumbnails) {
          if (event.sourceEvent.type === 'mousemove') {
            wrapperTransform.x = event.transform.x
            wrapperTransform.y = event.transform.y
            const { x, y, k } = wrapperTransform
            this._$wrapper.attr('transform', `translate(${x}, ${y}) scale(${k})`)
            thumbnails.updateBrushPositon(wrapperTransform)
          }
        } else {
          this._$wrapper.attr('transform', event.transform)
        }
        eventer.emit('zoom.zooming', event)
      })
    }
    this._$subscriber.call(this._zoomer)
    eventer.emit('zoom.update')
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
