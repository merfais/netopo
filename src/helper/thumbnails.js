import {
  event,
} from 'd3-selection'
import {
  drag
} from 'd3-drag'
import {
  zoom,
  zoomTransform,
} from 'd3-zoom'
import { Base64 } from 'js-base64'
import {
  merge,
  bindStyle,
  pixeled,
  getSvgRect,
} from './util'

const theme = {
  background: {
    display: 'block',
    overflow: 'hidden',
    position: 'absolute',
    top: '5px',
    right: '5px',
    border: '0px solid #ccc',
    'box-shadow': '0 0 10px rgba(0, 0, 0, .3)',
    'background-color': '#fafafa',
    'background-size': '100%',
    'background-repeat': 'no-repeat',
    'background-position': 'center',
    transition: 'height .3s, width .3s',
  },
  brush: {
    position: 'absolute',
    background: '#bcbcbc',
    border: '1px dashed #aaa',
    cursor: 'move',
    opacity: 0.3
  },
}

const dftOptions = {
  enable: true,
  width: 200,
  height: 200,
  maxWidth: 200,      // 只支持px，防止缩略图过大
  minWidth: 150,      // 只支持px，防止缩略图过小
  scale: 1 / 6,       // 缩略图占可视区的比例，超过maxWidth会缩小
  spread: {           // 缩略图是否完全展开显示，防止缩略图过大遮盖大片的原图区域
    always: false,    // 默认使用小缩略图，hover时放大
    rect: {           // 小缩略图区域大小
      width: '40px',
      height: '40px',
    },
  },
  style: {
    width: 0,
    height: 0,
    ...theme.background,
  },
  hover: {},
  brush: {
    minSize: 20, // 只支持px，防止brush过小
    style: theme.brush
  }
}

function removeDOM(dom) {
  if (dom && dom.remove) {
    dom.remove()
  }
}

function genImg(rect, svg) {
  const viewBox = `${rect.left} ${rect.top} ${rect.width} ${rect.height}`
  svg.setAttribute('viewBox', viewBox)
  const s = new XMLSerializer().serializeToString(svg)
  return 'data:image/svg+xml;base64,' + Base64.encode(s)
}

function hover($thumbnails, eventer) {
  return {
    mouseenter(d) {
      $thumbnails.call(bindStyle(d.hover))
      eventer.emit('thumbnails.hover', d)
    },
    mouseleave(d) {
      $thumbnails.call(bindStyle({
        height: d.style.height,
        width: d.style.width,
      }))
    },
  }
}

export default class Thumbnails {

  _$thumbnails = null
  _$graph = null
  _$zoomWrapper = null
  _$brush = null
  _opts = null              // 全局options.thumbnails的索引
  _eventer = null
  _zoomer = null
  _dragger = null
  _graphRect = null         // 可视区域
  _brushRect = null         // brush区域，= 可视区域
  _brushBaseRect = null     // 用于计算缩放后的brush大小
  _brushBoundary = 20       // 防止brush被拖出可视区
  _brushMaxScale = 0.95     // brush最大缩放系数，占缩略图比例，防止brush完全溢出缩略图区域
  _transform = null
  _onUpdate = null          // 缩略图的更新通过事件传递，更新事件响应回调
  _onStart = null
  _onZoomEnd = null

  constructor(options) {
    if (_.has(options, 'thumbnails')) {
      this._opts = merge({}, dftOptions, options.thumbnails)
      options.thumbnails = this._opts
    } else {
      this._opts = merge({}, dftOptions, options)
    }
    this._zoomer = this._initZoom()
    this._dragger = this._initDrag()
    this._onUpdate = () => this.update() // drag or simulation end event handler
    this._onStart = () => this._$thumbnails.call(bindStyle({
      width: 0,
      height: 0,
    }))
    this._onZoomEnd = () => this._$thumbnails.call(bindStyle({
      width: this._opts.style.width,
      height: this._opts.style.height
    }))
  }

  /**
   * 渲染缩略图，只是生成必要的DOM的结构，绑定事件等
   *
   * @name create
   * @function
   * @param {DOMObject} $parent 缩略图的父元素，父元素必须是可定位的元素，缩略图相对其绝对定位
   * @param {DOMObject} $graph 原始图DOM，原始图必须含class=[.wrapper]的标签，用于缩放和平移
   */
  create($parent, $graph, $zoomWrapper, eventer, transform) {
    this._eventer = eventer
    this._transform = transform
    this._$thumbnails = $parent.append('div')
      .attr('class', 'thumbnails')
      .data([this._opts])
    this._$brush = this._$thumbnails.append('div').attr('class', 'brush')
    this._$graph = $graph
    this._$zoomWrapper = $zoomWrapper
    if (!this._opts.enable) {
      this._opts.style.display = 'none'
    }
    const hoverHandler = eventer.bind(hover(this._$thumbnails, eventer))
    this._$thumbnails
      .call(bindStyle(this._opts.style))
      .call(this._zoomer)
      .call(hoverHandler)
      .on('wheel', () => {
        event.stopPropagation()
        event.preventDefault()
      })
    this._$brush
      .call(bindStyle(this._opts.brush.style))
      .call(this._dragger)
    this._eventer.on('graph.update', this._onUpdate)
    this._eventer.on('simulation.start', this._onStart)
    this._eventer.on('simulation.end', this._onUpdate)
    this._eventer.on('drag.start', this._onStart)
    this._eventer.on('drag.end', this._onUpdate)
    this._eventer.on('zoom.start', this._onStart)
    this._eventer.on('zoom.end', this._onZoomEnd)
    this.update()
    return this
  }

  /**
   * 生成缩略图，在原始图绘制结束和更新结束后调用。
   *
   * @name update
   * @function
   */
  update() {
    if (this._opts.enable) {
      this._graphRect = getSvgRect(this._$graph.node())
      // 图像偏移后重新生成缩略图需要考虑偏移量
      // scale = 1.1 原始图放大10%为了生成缩略图时留出边白区域，而不是完全填充
      const zoomwrapperRect = getSvgRect(this._$zoomWrapper.node(), this._transform, 1.1)
      // 缩略图需要使用svg的viewBox属性缩放后生成
      const left = Math.min(0, zoomwrapperRect.left)
      const top = Math.min(0, zoomwrapperRect.top)
      const right = Math.max(this._graphRect.right, zoomwrapperRect.right)
      const bottom = Math.max(this._graphRect.bottom, zoomwrapperRect.bottom)
      const width = right - left
      const height = bottom - top
      let viewBox = { left, top, width, height }
      // 图拖拽发生变化后重新生成缩略图，需要在原来缩放的基础上重新计算scale
      if (this._brushRect) {
        this._opts.scale = this._brushRect.width / this._graphRect.width
      }
      // 缩略图大小受最大宽度的限制
      if (viewBox.width * this._opts.scale > this._opts.maxWidth) {
        this._opts.scale = this._opts.maxWidth / viewBox.width
      } else if (viewBox.width * this._opts.scale < this._opts.minWidth) {
        this._opts.scale = this._opts.minWidth / viewBox.width
      }
      this._opts.width = viewBox.width * this._opts.scale
      this._opts.height = viewBox.height * this._opts.scale
      this._brushRect = {
        width: this._graphRect.width * this._opts.scale,
        height: this._graphRect.height * this._opts.scale,
        top: Math.min(0, zoomwrapperRect.top) * -this._opts.scale,
        left: Math.min(0, zoomwrapperRect.left) * -this._opts.scale,
      }
      if (this._brushBaseRect) {
        this._brushBaseRect.width = this._brushRect.width * this._transform.k
        this._brushBaseRect.height = this._brushRect.height * this._transform.k
      } else {
        this._brushBaseRect = { ...this._brushRect }
      }
      this._calcScaleExtent()
      const graph = this._$graph.node().cloneNode(true)
      // FIXME: 为了效率，这里依赖了具体的实现，有待改进。实现中不一定存在这些DOM
      removeDOM(graph.querySelector('.tg-edges-cover'))
      removeDOM(graph.querySelector('.tg-nodes-cover'))
      removeDOM(graph.querySelector('defs'))
      const image = genImg(viewBox, graph)
      const style = {
        display: this._opts.style.display,
        'background-image': `url(${image})`,
      }
      this._opts.hover = pixeled({
        width: this._opts.width,
        height: this._opts.height
      })
      if (this._opts.spread.always) {
        merge(this._opts.style, this._opts.hover)
        merge(style, this._opts.hover)
      } else {
        merge(this._opts.style, this._opts.spread.rect)
        merge(style, this._opts.spread.rect)
      }
      this._$thumbnails.call(bindStyle(style))
      this._$brush.call(bindStyle(pixeled(this._brushRect)))
      this._eventer.emit('thumbnails.update')
    }
  }

  /**
   * 更新brush位置，原始图发生拖拽后调用
   *
   * @name updateBrushPositon
   * @function
   * @param {object} transform 原始图的transfrom
   */
  updateBrushPositon(dx, dy, graphRect, scale) {
    this._brushRect.top -= dy * this._opts.scale
    this._brushRect.left -= dx * this._opts.scale
    const style = {
      left: this._brushRect.left,
      top: this._brushRect.top,
    }
    if (graphRect) {
      this._opts.scale /= scale
      this._graphRect.width = graphRect.width
      this._graphRect.height = graphRect.height
      this._brushRect.width = this._graphRect.width * this._opts.scale
      this._brushRect.height = this._graphRect.height * this._opts.scale
      this._brushBaseRect.width = this._brushRect.width * this._transform.k
      this._brushBaseRect.height = this._brushRect.height * this._transform.k
      style.width = this._brushRect.width
      style.height = this._brushRect.height
    }
    this._$brush.call(bindStyle(pixeled(style)))
    this._eventer.emit('thumbnails.update')
  }

  destroy() {
    this._dragger.on('drag', null)
    this._zoomer.on('start', null).on('zoom', null)
    this._$thumbnails.on('wheel', null).call(this._eventer.unBind(hover()))
    this._$thumbnails.remove()
    this._$thumbnails = null
    this._$graph = null
    this._$zoomWrapper = null
    this._$brush = null
    this._opts = null
    this._graphRect = null
    this._brushRect = null
    this._brushBaseRect = null
    this._eventer.off('graph.update', this._onUpdate)
    this._eventer.off('simulation.start', this._onStart)
    this._eventer.off('simulation.end', this._onUpdate)
    this._eventer.off('drag.start', this._onStart)
    this._eventer.off('drag.end', this._onUpdate)
    this._eventer.off('zoom.start', this._onStart)
    this._eventer.off('zoom.end', this._onZoomEnd)
    this._eventer.emit('thumbnails.destroy')
    this._eventer = null
  }

  _calcScaleExtent() {
    // 缩略图高宽比>可视区，则以宽为基准，即宽度临界值后达到，高度可以超出
    let modifier = this._opts.width / this._opts.height >
      this._brushRect.width / this._brushRect.height ? 'width' : 'height'
    const max = this._opts[modifier] * this._brushMaxScale
    // 如果brush初始范围已经超过缩略图区域，则初始范围即使最大缩放区域
    const maxValue = max > this._brushRect[modifier] ? max : this._opts[modifier]
    const maxScale = maxValue / this._brushRect[modifier] / this._transform.k
    // 视窗 宽 > 高, 则以高为基准，即高度最小值先到达
    modifier = this._brushRect.width > this._brushRect.height ? 'height' : 'width'
    const min = this._opts.brush.minSize / this._brushRect[modifier]
    const minScale = (min > 1 ? 0.5 : min) / this._transform.k
    this._zoomer.scaleExtent([minScale, maxScale])
  }

  _initZoom() {
    return zoom().filter(() => {
      return event.type === 'wheel'
    }).on('zoom', () => {
      let k = event.transform.k
      this._brushRect.width = this._brushBaseRect.width * k
      this._brushRect.height = this._brushBaseRect.height * k
      // scale与translate的{dx, dy} 计算有关，所有每次scale后要重置
      this._opts.scale = this._brushRect.width / this._graphRect.width
      this._$brush.call(bindStyle(pixeled(this._brushRect)))
      // 对于已transform的元素，调整scale后，且以元素上(x1, y1)点做基准点，
      // 那么重新计算translate的(dx2, dy2)的公式
      // dx2 = ((k1 - k2) * x1 + k2 * dx1) / k1
      // dy2 = ((k1 - k2) * y1 + k2 * dy1) / k1
      // 由于相对于可视区左上角(0, 0)做基准点，所以 (x1, y1) = (0, 0)
      const { x: dx1, y: dy1, k: k1 } = this._transform
      const x = 1 / k / k1 * dx1
      const y = 1 / k / k1 * dy1
      this._transform.x = x
      this._transform.y = y
      this._transform.k = 1 / k
      const transform = zoomTransform({}).translate(x, y).scale(1 / k)
      this._$graph.property('__zoom', transform)
      this._$zoomWrapper.attr('transform', `translate(${x}, ${y}) scale(${1 / k})`)
      this._eventer.emit('thumbnails.zoom', { x, y, k: 1 / k })
    })
  }

  _initDrag() {
    return drag().on('drag', () => {
      let top = this._brushRect.top + event.dy
      let left = this._brushRect.left + event.dx
      if (top + this._brushRect.height < this._brushBoundary) {
        top = this._brushBoundary - this._brushRect.height
      } else if (top > this._opts.height - this._brushBoundary) {
        top = this._opts.height - this._brushBoundary
      }
      if (left + this._brushRect.width < this._brushBoundary) {
        left = this._brushBoundary - this._brushRect.width
      } else if (left > this._opts.width - this._brushBoundary) {
        left = this._opts.width - this._brushBoundary
      }
      const dy = top - this._brushRect.top
      const dx = left - this._brushRect.left
      if (dy || dx) {
        this._brushRect.top = top
        this._brushRect.left = left
        this._$brush.call(bindStyle(pixeled({ left, top })))
        // 对于已transform的元素，调整translate时，已知增量{dx, dy}，
        // 则计算真正的translate值的公式
        // dx2 = dx + dx1 + x * (k1 - k2)
        // dy2 = dx + dy1 + y * (k1 - k2)
        // 由于scale未变化所以 k1 - k2 = 0
        const { x: dx1, y: dy1, k } = this._transform
        const x = dx1 - dx / this._opts.scale
        const y = dy1 - dy / this._opts.scale
        this._transform.x = x
        this._transform.y = y
        const transform = zoomTransform({}).translate(x, y).scale(k)
        this._$graph.property('__zoom', transform)
        this._$zoomWrapper.attr('transform', `translate(${x}, ${y}) scale(${k})`)
        this._eventer.emit('thumbnails.drag', { x, y, k })
      }
    })
  }
}
