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
import options from './options'
import {
  merge,
  bindStyle,
  pixeled,
  parseTranform,
  getInverseRect,
} from './util'

const dftOptions = {
  enable: true,
  maxWidth: 200, // 只支持px，防止缩略图过大
  scale: 1 / 6,  // 缩略图占可视区的比例，超过maxWidth会缩小
  style: {
    display: 'block',
    overflow: 'hidden',
    width: null,
    height: null,
    position: 'absolute',
    top: 0,
    right: 0,
    border: '1px solid #ccc',
    'box-shadow': '0 0 10px rgba(0, 0, 0, .3)',
    'background-color': '#fff',
    'background-size': '100%',
    'background-repeat': 'no-repeat',
    'background-position': 'center'
  },
  brush: {
    minSize: 20, // 只支持px，防止brush过小
    style: {
      position: 'absolute',
      background: '#f5f5f5',
      border: '1px dashed #333',
      cursor: 'move',
      opacity: 0.3
    }
  }
}

function genImg(viewBox, svg) {
  svg.setAttribute('viewBox', _.values(viewBox).join(' '))
  const s = new XMLSerializer().serializeToString(svg)
  return 'data:image/svg+xml;base64,' + Base64.encode(s)
}

class Thumbnails {

  constructor(options) {
    this._$thumbnails = null
    this._$graph = null
    this._$wraper = null
    this._$brush = null
    this._opts = options          // 全局options.thumbnails的索引
    this._zoomer = this._initZoom()
    this._drager = this._initDrag()
    this._graphRect = null        // 可视区域
    this._graphBaseRect = null    // 用于缩放后重新计算可视区的偏移
    this._wraperRect = null       // 图像区域
    this._thumbnailsRect = null   // 缩略图区域，>= 图像区域
    this._brushRect = null        // brush区域，= 可视区域
    this._brushBaseRect = null    // 用于计算缩放后的brush大小
    this._brushBoundary = 20      // 防止brush被拖出可视区
    this._brushMaxScale = 0.95    // brush最大缩放系数，占缩略图比例，防止brush完全溢出缩略图区域
    this._scaleExtent = [0.1, 4]  // 缩放阈值, 图像渲染后后重新计算大小
  }

  /**
   * 渲染缩略图，只是生成必要的DOM的结构，绑定事件等
   *
   * @name create
   * @function
   * @param {DOMObject} $parent 缩略图的父元素，父元素必须是可定位的元素，缩略图相对其绝对定位
   * @param {DOMObject} $sourceGraph 原始图DOM，原始图必须含class=[.wraper]的标签，用于缩放和平移
   */
  create($parent, $sourceGraph) {
    this._$thumbnails = $parent.append('div')
    this._$brush = this._$thumbnails.append('div').attr('class', 'brush')
    this._$graph = $sourceGraph
    this._$wraper = this._$graph.select('.zoom-wraper')
    if (!this._opts.enable) {
      this._opts.style.display = 'none'
    }
    this._$thumbnails
      .call(bindStyle(this._opts.style))
      .call(this._zoomer)
      .on('wheel', () => {
        event.stopPropagation()
        event.preventDefault()
      })
    this._$brush
      .call(bindStyle(this._opts.brush.style))
      .call(this._drager)
  }

  /**
   * 生成缩略图，在原始图绘制结束后调用。
   *
   * @name update
   * @function
   */
  update() {
    if (this._opts.enable) {
      this._graphRect = getInverseRect(this._$graph.node())
      this._graphBaseRect = { ...this._graphRect }
      // 图像偏移后重新生成缩略图需要考虑偏移量
      const transform = parseTranform(this._$wraper.attr('transform'))
      this._wraperRect = getInverseRect(this._$wraper.node(), transform)
      // 缩略图需要使用svg的viewBox属性缩放后生成
      const viewBox = {
        x: Math.min(0, this._wraperRect.left),
        y: Math.min(0, this._wraperRect.top),
        width: Math.max(this._graphRect.width, this._wraperRect.width),
        height: Math.max(this._graphRect.height, this._wraperRect.height),
      }
      // 缩略图大小受最大宽度的限制
      if (viewBox.width * this._opts.scale > this._opts.maxWidth) {
        this._opts.scale = this._opts.maxWidth / viewBox.width
      }
      this._thumbnailsRect = {
        width: viewBox.width * this._opts.scale,
        height: viewBox.height * this._opts.scale,
      }
      this._brushRect = {
        width: this._graphRect.width * this._opts.scale,
        height: this._graphRect.height * this._opts.scale,
        top: Math.min(0, this._wraperRect.top) * -this._opts.scale,
        left: Math.min(0, this._wraperRect.left) * -this._opts.scale,
      }
      this._brushBaseRect = { ...this._brushRect }
      this._calcScaleExtent()
      const graph = this._$graph.node().cloneNode(true)
      graph.querySelector('.nt-edges-cover').remove()
      graph.querySelector('.nt-nodes-cover').remove()
      graph.querySelector('defs').remove()
      const image = genImg(viewBox, graph)
      this._$thumbnails.call(bindStyle({
        display: this._opts.style.display,
        'background-image': `url(${image})`,
        ...pixeled(this._thumbnailsRect),
      }))
      this._$brush.call(bindStyle(pixeled(this._brushRect)))
    }
  }

  destroy() {
    this._drager.on('drag', null)
    this._zoomer.on('start', null).on('zoom', null)
    this._$thumbnails.on('wheel', null)
    this._$thumbnails.remove()
    this._$thumbnails = null
    this._$graph = null
    this._$wraper = null
    this._$brush = null
    this._opts = null
    this._graphRect = null
    this._graphBaseRect = null
    this._wraperRect = null
    this._thumbnailsRect = null
    this._brushRect = null
    this._brushBaseRect = null
  }

  _calcScaleExtent() {
    // 缩略图高宽比>可视区，则以宽为基准，即宽度临界值后达到，高度可以超出
    const modifier = this._thumbnailsRect.width / this._thumbnailsRect.height >
      this._brushRect.width / this._brushRect.height ? 'width' : 'height'
    const max = this._thumbnailsRect[modifier] * this._brushMaxScale
    // 如果brush初始范围已经超过缩略图区域，则初始范围即使最大缩放区域
    const maxValue = max > this._brushRect[modifier] ? max : this._thumbnailsRect[modifier]
    this._scaleExtent[1] = maxValue / this._brushRect[modifier]
    // 视窗 宽 > 高, 则以高为基准，即高度最小值先到达
    const minScale = this._brushRect.width > this._brushRect.height ?
      this._opts.brush.minSize / this._brushRect.height :
      this._opts.brush.minSize / this._brushRect.width
    this._scaleExtent[0] = minScale > 1 ? 0.5 : minScale
  }

  _initZoom() {
    return zoom().filter(() => {
      return event.type === 'wheel'
    }).on('start', () => {
      this._zoomer.scaleExtent(this._scaleExtent)
      // TODO: update scaleExtent before zoom
    }).on('zoom', () => {
      let k = event.transform.k
      this._brushRect.width = this._brushBaseRect.width * k
      this._brushRect.height = this._brushBaseRect.height * k
      this._$brush.call(bindStyle(pixeled(this._brushRect)))
      // 缩放时需要重新计算偏移位置
      const dx = this._brushRect.left - this._brushBaseRect.left
      const dy = this._brushRect.top - this._brushBaseRect.top
      // 使用新的缩放系数计算偏移量
      const x = -dx / k / this._opts.scale + this._graphBaseRect.left
      const y = -dy / k / this._opts.scale + this._graphBaseRect.top
      this._graphRect.left = x
      this._graphRect.top = y
      this._$wraper.attr('transform', `translate(${x}, ${y}) scale(${1 / k})`)
    })
  }

  _initDrag() {
    return drag().on('drag', () => {
      let top = this._brushRect.top + event.dy
      let left = this._brushRect.left + event.dx
      if (top + this._brushRect.height < this._brushBoundary) {
        top = this._brushBoundary - this._brushRect.height
      } else if (top > this._thumbnailsRect.height - this._brushBoundary) {
        top = this._thumbnailsRect.height - this._brushBoundary
      }
      if (left + this._brushRect.width < this._brushBoundary) {
        left = this._brushBoundary - this._brushRect.width
      } else if (left > this._thumbnailsRect.width - this._brushBoundary) {
        left = this._thumbnailsRect.width - this._brushBoundary
      }
      const dy = top - this._brushRect.top
      const dx = left - this._brushRect.left
      if (dy || dx) {
        this._brushRect.top = top
        this._brushRect.left = left
        this._$brush.call(bindStyle(pixeled({ left, top })))
        let { x, y, k } = parseTranform(this._$wraper.attr('transform'))
        // 偏移需要乘以缩放系数
        x += -dx * k / this._opts.scale
        y += -dy * k / this._opts.scale
        const t = zoomTransform(this._$wraper.node())
        console.log(t)
        this._$wraper.attr('transform', `translate(${x}, ${y}) scale(${k})`)
      }
    })
  }
}

options.thumbnails = merge({}, dftOptions, options.thumbnails)
const thumbnails = new Thumbnails(options.thumbnails)

export default thumbnails
