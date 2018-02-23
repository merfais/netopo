# 基于d3js的拓扑图

netopo主要用于解决PC端鼠标滚轮不能同时用于屏幕的滚动和图缩放的问题。
当一个页面中的内容超过一屏时，如果滚轮动作依旧用于图的缩放，
那么就会影响屏幕滚动的体验。

netopo将原来作用于拓扑图的滚轮事件转移到缩略图上，
通过对缩略图上的可视区的缩放来完成拓扑图的缩放，因此，
在缩略图区域外的滚轮事件仍用于屏幕的滚动，提升了用户体验。

## 获取 netopo

由于尚未发布到npm，因此目前只能通过下载代码的方式使用。

+ 使用打包后的代码

  ```
  dist
  ├── netopo.common.js      // commonjs规范
  ├── netopo.common.min.js
  ├── netopo.esm.js         // ES Module规范
  ├── netopo.esm.min.js
  ├── netopo.js             // umd 规范
  └── netopo.min.js
  ```
+ 使用源码

  ```
  src
  ├── defs.js
  ├── edge.js
  ├── helper
  ├── index.js              // 入口文件
  ├── node.js
  └── shape
  ```
## 引入 netopo

+ HTML中使用

  ```html
  <!DOCTYPE html>
  <html>
  <head>
    <script src="netopo.min.js"></script>
  </head>
  </html>
  ```
+ js中使用

  ```javascript
  // ES Module
  import TopoGraph from 'netopo';
  // or
  import TopoGraph from 'netopo.esm.min.js';

  // commonjs
  const TopoGraph = require('netopo');
  // or
  const TopoGraph = require('netopo.common.min.js');
  ```
## 一个简单的例子

在绘图前我们需要为 netopo 准备一个具备高宽的 DOM 容器。

```HTML
<body>
  <div id="netopo" style="width: 600px;height:400px;"></div>
</body>
```

然后`new`一个topoGraph的实例，再通过`render`方法渲染出拓扑图

```javascript
import TopoGraph from 'netopo';
const $netopo = document.getElementById('netopo')
const graph = new TopoGraph($netopo)
const nodes = [{
  id: 'id1',   // 必填
}, {
  id: 'id2',
}]
const edges = [{
  id: 'id2',      // 必填
  source: 'id1',  // 必填
  target: 'id2',  // 必填
}]
graph.render({ nodes, edges })
```
[点击查看更多示例](https://merfais.github.io/netopo/)

## 接口文档

### 构造函数 `constructor(dom, options)`

+ dom: 拓扑图容器，**必填**

  可以是通过getElementById获得的`HTMLElement`实例

  可以是DOM的id，string类型

+ options: 拓扑图初始参数，可通过`setOptions`再次修改

  ```javascript
  // 以下给出的值均为默认值
  options = {
    grid: {             // 图距外边框的距离，使用margin实现
      top: '0px',       // margin.top,  html css
      right: '0px',     // margin.right
      left: '0px',      // margin.left
      bottom: '0px',    // margin.bottom
      width: '100%',    // 图的宽度，默认自适应
      height: '100%',   // 图的高度，默认自适应
    },
    node: {             // 节点通用参数，会被data.nodes中node覆盖
      position: {       // 节点位置，通过节点SVGDOM的transform控制
                        // 当使用物理模拟时此参数提供初始位置，非必填，默认从力学模型的中心开始
                        // 当未使用物理模拟时，此参数必填，未填写则默认为(0,0)
        x: 0,
        y: 0
      },
      linkPoint: {      // 连线的起止位置，默认在节点的中心，根据不同节点类型，中心位置不同
                        // 非必填，默认不需指定，当指定时，按指定的值画线
                        // 暂时不支持多连线模式
        x: 0,
        y: 0,
      },
      linkOffset: {     // 连线相对node.position的偏移，用于计算linkPoint,
                        // 如果提供了`linkPoint`参数，则此参数无效果
        x: 0,
        y: 0,
      },
      shape: {          // 节点图形类型，目前只支持 circle, rect, image, text四种
        type: 'circle'  // 每种类型支持的参数略有不同，参考各个node类型文档的shape部分
      },
      label: {          // 参考每个node类型文档的label部分
        text: '',       // label文字
      }，
      shadow: {         // 节点阴影参数
        enable: false,  // 默认不开启，阴影滤镜对渲染性能有很大影响
        normal: {       // 普通模式下的滤镜参数
          enable: true,
          offsetX: 2,
          offsetY: 2,
          blur: 3,
          color: 'rgba(0,0,0,.3)',
        },
        hover: {        // hover模式下滤镜参数
          enable: true,
          offsetX: 2,
          offsetY: 2,
          blur: 3,
          color: 'rgba(0,0,0,.5)',
        },
      },
      tooltip: {        // 节点tooltip参数
        enable: true,   // 默认开启tooltip
        formatter: (d) => {  // 默认的tooltip内容格式, 参数d是node[i]索引
          return `${d.label.text || d.id}: ${d.value}`
        }
        // 其他参数参考options.tooltip部分
      },
      drag: {           // 节点拖拽参数
        enable: true,   // 默认开启拖拽功能
        mode: 'virtualNode',  // 默认使用虚拟节点模式，此参数暂未配置
        virtualNode: {        // 虚拟节点样式,  svg css
          cursor: 'move',
          opacity: 0.5,
          stroke: '#aaa',
          fill: '#ccc',
          'stroke-dasharray': 2,
          'stroke-width': 1,
          filter: null,
        },
      },
      x: null,        // 物理模拟相关数据，不支持配置，在开启物理模拟时,
      y:  null,       // d3会自动写入这些值
      vx: null,
      vy: null,
      fx: null,
      fy: null,
    },
    edge: {             // 连线边参数
      shape: {          // 类型，目前支持line, multiLine类型
        type: 'line'    // 每种类型支持的参数略有不同，参考各个edge类型文档的shape部分
      },
      path: [{          // 连接边的图形参数，只接受对象数组，不支持对象
        dashArray: '',  // 是否使用虚线，默认值: '', 不使用虚线
                        // 设置的值将直接赋值给 stroke-dasharray 属性
                        // 参考(https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
      }],
      hoverBoundarySpan: 10,  // 由于path渲染的线太细影响hover效果，
                              // 此参数控制hover时的线的宽度，但不影响线原有宽度的渲染
      shadow: {               // 连线的阴影参数
        enable: false,        // 默认不开启，edge shadow有非常大的性能问题，慎用
        normal: {       // 普通模式下的滤镜参数
          enable: true,
          offsetX: 2,
          offsetY: 2,
          blur: 3,
          color: 'rgba(0,0,0,.3)',
        },
        hover: {        // hover模式下滤镜参数
          enable: true,
          offsetX: 2,
          offsetY: 2,
          blur: 3,
          color: 'rgba(0,0,0,.5)',
        },
      },
      tooltip: {        // tooltip参数
        enable: true,   // 默认开启
        formatter: (d) => {  // tooltip内容格式，参数d是edge[i]索引
          return `${d.source} -> ${d.target}: ${d.value}`
        }
        // 对于多条线的场景，参数d存在扩展属性`hoverTarget`，标明被点击的是哪条线。
        // hoverTarget = {
        //   index: 2,       // number，是edge.shape.lines的下标的索引
        //   name: 'redLine' // 如果使用key索引，则name是key的值，否则是lines[index]的值
        // }
        // 其他参数参考options.tooltip部分
      },
    },
    tooltip: {        // tooltip 参数，可被 node.tooltip 和 edge.tooltip 的参数覆盖
                      // tooltip参数优先级：nodes.node.tooltip > options.node.tooltip > options.tooltip
                      // node与edge的tooltip参数不会发生覆盖
      gap: 20,        // tooltip与鼠标点的距离
      border: '0 solid rgb(51, 51, 51)',    // tooltip框的样式 html css
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
    },
    zoom: {           // 缩放平移参数
      enable: true,   // 默认开启
      scaleExtent: [1 / 4, 8],  // 缩放范围，只在thumbnails.enable=false时有限
      translateExtent: null,    // 平移范围，默认不限制
      filter: () => {,          // zoom行为的过滤器
        if (options.zoom.thumbnails.enable) {
          return event.type !== 'wheel' &&    // 当thumbnails.enable = true时
            event.type !== 'dblclick' &&      // 只响应左键的拖拽
            event.button === 0  // 左键
        }
        return !event.button
      }
      thumbnails: {         // 缩略图参数
        enable: true,       // 默认开启
        width: 200,         // 宽度，不支持配置，会根据实际图大小计算
        height: 200,        // 高度，不支持配置
        maxWidth: 200,      // 最大宽度，只能是数据，不能是字符串，防止缩略图过大
        minWidth: 150,      // 最小宽度，防止缩略图过小，高度不做限制
        scale: 1 / 6,       // 缩略图与原图的比例，原图size * scale = 缩略图size
        spread: {           // 缩略图是否完全展开显示，防止缩略图过大遮盖大片的原图区域
          always: false,    // 默认使用小缩略图，hover时放大
          rect: {           // 小缩略图区域大小,  html css
            width: '40px',
            height: '40px',
          },
        },
        style: {            // 缩略图样式, html css
          width: 0,
          height: 0,
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
        hover: {},          // 配合小缩略图hover时的样式，此参数不支持配置
        brush: {            // 指的是原图的可视区域在缩略图中的区域
          minSize: 20,      // 必须是数字，防止brush缩放过小
          position: 'absolute',    // html css
          background: '#bcbcbc',
          border: '1px dashed #aaa',
          cursor: 'move',
          opacity: 0.3
        }
      },
    },
    resize: {               // 拓扑图自适应参数
      enable: true,         // 默认支持自适应，响应的window.resize事件，
                            // 因此当window未发生resize，但拓扑图发生size的变化，
                            // 无法自适应，需要手动调用resize()方法
      action: {             // resize时的动作
        redraw: false,      // 默认是发生缩放，false => zoom， true => 重绘
        zoomBase: 'width',  // 当zoom以width还是以height为缩放基准
                            // resize时width和height并不是等比的，因此需要指定一个基础
      },
    },
    filter: {               // 拓扑图的滤镜参数, 默认提供两个，开启shadow时会自动添加shadow的滤镜
      brighter: {           // 颜色变亮滤镜，一般用于hover图片时的效果
        value: 1,           // 亮度系数
      },
      darker: {             // 颜色变暗滤镜，一般用于hover图片时的效果
        value: 1            // 变暗系数
      },
      custom: {}            // 自定义滤镜，需要提供完整的滤镜结构体，参考helper/README中filter部分
    },
    simulation: {           // 物理模拟参数
      enable: true,         // 默认开启
      speed: {
        alpha: null,          // alpha 初值，仿真速度，与d3-simulation参数值相同
        alphaMin: 0.5,        // alpha 最小值
        alphaTarget: null,    // alpha 目标值，与d3-simulation参数值相同
        alphaDecay: null,     // alpha 衰减系数，与d3-simulation参数值相同
        velocityDecay: null,  // 速度衰减系数，摩擦力，与d3-simulation参数值相同
        onTick: null,
        onEnd: null,
      },
      force: {
        nBody: {
          enable: true,
          strength: null,     // 引力强度，重力模型、电荷力模型，与d3-simulation参数值相同
          theta: null,        // Barnes-Hut 相关，与d3-simulation参数值相同
          distanceMin: null,  // 最小距离，与d3-simulation参数值相同
          distanceMax: null,  // 最大距离，与d3-simulation参数值相同
        },
        link: {
          enable: true,
          distance: 60,       // 两点距离
          strength: link => { // 连线的弹力强度
            const srcL = link.source._edges.length
            const dstL = link.target._edges.length
            const min = Math.min(srcL, dstL)
            if (min === 1) {
              return 2.2
            } else if (min === 2) {
              return 1.5
            } else {
              return 1 / Math.max(srcL, dstL)
            }
          },
          iterations: null,   // 迭代次数，与d3-simulation参数值相同
          id: d => d.id,      // node索引函数
        },
        collide: {
          enable: true,
          radius: 15,         // 碰撞半径
          strength: null,     // 碰撞强度，与d3-simulation参数值相同
          iterations: null,   // 迭代次数，与d3-simulation参数值相同
        },
        center: {
          enable: true,
          x: null,            // 中心X坐标，自动计算容器中心
          y: null,            // 中心Y坐标，自动计算容器中心
        },
      }
    },
  }
  ```
  **样式的修改可通过传递需要修改的样式`{key:value}`即可，
  如果需要删除默认的样式，则传递{key:null}即可删除。**

  其中 `label`, `thumbnails`, `tooltip`是通过HTML DOM渲染，
  因此使用 HTML CSS 规范，
  其他的节点通过SVG DOM渲染，因此样式应该使用SVG支持的CSS规范，两个略有差异。

  theme

  ```javascript
  const normal = {
    color: '#333',
    bgColor: '#e8e8e8',
    bdColor: '#666',
    pathColor: '#337ab7',
  }

  const hover = {
    color: '#3492ff',
    bgColor: '#eee',
    bdColor: '#777',
    pathColor: '#5bc0de',
  }
  ```

  node.shape.type = circle

  ```javascript
  circleTheme = {
    shape: {                      // svg css
      style: {
        cursor: 'pointer',
        stroke: normal.bdColor,
        'stroke-width': 0.8,
        fill: normal.bgColor,
      },
      class: '',
      hover: {
        style: {
          stroke: hover.bdColor,
          fill: hover.bgColor,
        },
        class: '',
      },
    },
    label: {                    // html css
      style: {
        display: 'flex',
        color: normal.color,
        'justify-content': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'padding-top': '5px',
        'font-size': '13px',
        'box-sizing': 'border-box',
      },
      class: '',
      // TODO: hover: not support
    }
  }

  node = {
    shape: {
      r: 20,
      cx: null,     // 如果渲染时未提供，则置为r
      cy: null,     // 如果渲染时未提供，则置为r
      ...circleTheme.shape,
    },
    label: {
      x: null,  // 如果未提供，则置为 shape.cx
      y: null,  // 如果未提供，则置为 shape.cy + shape.r
      width: null, // 如果渲染时未提供，则置为 100
      height: null,
      transform: null, // 如果渲染时未提供，则设置 translate(-50, 0)
      ...circleTheme.label,
    }
  }
  ```

  node.shape.type = rect

  ```javascript
  rectTheme = {
    shape: {
      style: {                            // svg css
        cursor: 'pointer',
        stroke: normal.bdColor,
        'stroke-width': 0.8,
        fill: normal.bgColor,
      },
      class: '',
      hover: {
        style: {
          stroke: hover.bdColor,
          fill: hover.bgColor,
        },
        class: '',
      }
    },
    label: {                              // html css
      style: {
        display: 'flex',
        height: '100%',
        padding: '5px',
        color: normal.color,
        'justify-content': 'center',
        'align-items': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'font-size': '13px',
        'box-sizing': 'border-box',
      },
      class: '',
      // TODO: hover: not support
    },
  }

  node = {
    shape: {
      x: 0,
      y: 0,
      rx: 5,
      ry: 5,
      width: 100,
      height: 36,
      ...rectTheme.shape,
    },
    label: {
      x: 0,
      y: 0,
      width: 100,
      height: 30,
      ...rectTheme.label,
    }
  }
  ```

  node.shape.type = image

  ```javascript
  imageTheme = {
    shape: {                          // svg css
      style: {
        cursor: 'pointer',
        fill: normal.bgColor,
      },
      class: '',
      hover: {
        style: {
          filter: 'url(#brighter)'
        },
        class: '',
      },
    },
    label: {                        // html css
      style: {
        display: 'flex',
        color: normal.color,
        'justify-content': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'padding-top': '5px',
        'font-size': '13px',
        'box-sizing': 'border-box',
      },
      class: '',
      // TODO: hover: not support
    },
  }

  node = {
    shape: {
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      ...imageTheme.shape,
    },
    label: {
      x: null,      // 如果渲染时未提供，则置为 shape.x + shape.width / 2
      y: null,      // 如果渲染时未提供，则置为 shape.y + shape.height
      width: null,  // 如果渲染时未提供，则置为 100
      height: null,
      transform: null, // 如果渲染时未提供，则设置 translate(-shape.width / 2, 0)
      ...imageTheme.label,
    }
  }
  ```

  node.shape.type = text

  ```javascript
  textTheme = {
    shape: {  // 用于hover占位的虚拟框，以及发生拖拽时绘制被拖拽的虚拟图形
      style: {                // svg css
        cursor: 'pointer',
        fill: normal.bgColor,
      },
    },
    label: {                  // html css
      style: {
        display: 'flex',
        height: '100%',
        color: normal.color,
        'justify-content': 'center',
        'align-items': 'center',
        'word-break': 'break-all',
        'line-height': '1.2em',
        'font-size': '13px',
        'box-sizing': 'border-box',
      },
      class: '',
      hover: {
        style: {
          color: hover.color,
        },
        class: '',
      },
    }
  }

  node = {
    shape: {
      x: 0,
      y: 0,
      rx: 5,
      ry: 5,
      width: null,
      height: null,
      ...textTheme.shape,
    },
    label: {
      x: 0,
      y: 0,
      width: 100,
      height: null,
      ...textTheme.label,
    }
  }
  ```
  ```javascript
  pathTheme = {
    style: {
      stroke: normal.pathColor,
      'stroke-width': 2,
      cursor: 'pointer',
    },
    class: '',
    hover: {
      style: {
        stroke: hover.pathColor,
        'stroke-width': 3
      },
      class: '',
    }
  }
  ```
  edge.path.type = line

  ```javascript
  edge = {
    shape: {}
    path: [{
      ...pathTheme
    }]
  }
  ```
  edge.path.type = multiLine

  ```javascript
  edge = {
    shape: {
      total: 6,   // 最多有几条线，默认6条，
      lines: [0], // 当前edge使用哪几条path渲染，使用edge.path中的数据。
                  // 支持两种格式
                  // 1、index序号，edge.path数组下标，
                  // 2、key索引，如果edge.path[]提供了key属性，则优先使用key索引，
                  //    如果索引失败，则认为是index
    },
    path: [{
      key: 'string', // 用于lines索引的key，非必填，
      ...pathTheme,
    }, {              // 其他path
      key: 'string',
      ...pathTheme,
    },
    // ...            // 最多可以有shape.total条，多余的无法索引
    ]
  }
  ```
### 方法

+ render({ nodes = [], edges = [] }) 渲染拓扑图

  + nodes 节点集，可配置属性与`opiotns.node`相同，但需要多一个`id`做唯一的key

    可以是Array类型

    ```javascript
      nodes: [{
        id: 'node1',   // 必填
        // other attr 参考options.node部分
      }, {
        id: 'node2',
        //
      }]
    ```
    也可以是Object类型

    ```javascript
      nodes: {
        node1: {       // item.key 做 node.id
          // other attr 参考options.node部分
        },
        node2: {}
      }
    ```
  + edges 边集，可配置属性与`opiotns.edge`相同，
    但需要多一个`id`做唯一的key，以及`source`, `target`做节点的索引

    可以是Array类型

    ```javascript
      edges: [{
        id: 'edge2',      // 必填，边的ID
        source: 'node1',  // 必填，起始节点ID
        target: 'node2',  // 必填，终止节点ID
        // other attr 参考options.edge部分
      }]
    ```
    也可以是Object类型

    ```javascript
      edges: {
        edge2: {        // item.key 做 node.id
          source: 'node1',
          target: 'node2',
          // other attr 参考options.edge部分
        }
      }
    ```
  拓扑图在渲染过程中会实时更新节点和边的信息，尤其在力学模拟场景中，
  每一个tick都会更新节点和边的位置信息，为了方便实时获取这些信息，
  `render`方法采用引用的方式传递参数，因此在调用render方法后，
  可配合事件接口通过读取传入参数的引用来获取拓扑图中节点和边的所有信息。

  **注意**

  拓扑图在渲染时会通过`querySelector()`方法读取`node.id`和`edge.id`，
  因此`id`必须符合`querySelector`语法，否则会抛出`SYNTAX_ERR`异常。

  常见的非法`id`包括

  + 以数字开始的
  + 数字之间以`.`(半角点)连接的 【如ip地址】
  + 其他非法字符

+ setOptions(options) 设置(重置)拓扑图参数

  + options 同构造函数的options

+ getOptionsRef() 获取当前options引用值

+ resize() 强制执行resize

+ on(names, handler) 注册事件回调

  + names: 事件名，可注册事件参考事件的文档

    names可以是字符串，也可以是字符串数组。
    字符串数组表示同时为多个事件注册相同的回调函数。

  + handler 事件回调

  同一个事件可被注册多次，拓扑图内部维护着一个事件队列，
  同一事件先注册的回调函数先被执行

+ off(names, handler) 注销事件回调

  + names: 事件名，可注册事件参考事件的文档

  + handler 事件回调

    注销的handler必须与注册时的handler是相同的函数引用，否则无法注销

  注册的事件需要在不再使用时及时注销，避免造成内存泄漏

+ destroy() 销毁实例资源

### 事件

node相关

+ node.hover(d, i, nodes)：hover节点时派发

  参数说明参考[d3-selection.event](https://github.com/d3/d3-selection# Handling Events)

+ node.click(d, i, nodes)：click节点时派发

  参数说明参考[d3-selection.event](https://github.com/d3/d3-selection# Handling Events)

edge相关

+ edge.hover(d, i, nodes)：hover节点时派发

  参数说明参考[d3-selection.event](https://github.com/d3/d3-selection# Handling Events)

+ edge.click(d, i, nodes)：click节点时派发

  参数说明参考[d3-selection.event](https://github.com/d3/d3-selection# Handling Events)

drag相关

+ drag.create()：drag实例创建完派发

  无参数

+ drag.start(event, d): 转发d3.drag.event.start事件

  + event: 参考[d3-drag.event](https://github.com/d3/d3-drag#Drag Events)

  + d: 被拖拽节点的data引用

+ drag.dragging(event, d): 转发d3.drag.event.drag事件

  + event: 参考[d3-drag.event](https://github.com/d3/d3-drag#Drag Events)

  + d: 被拖拽节点的data引用

+ drag.end(event, d): 转发d3.drag.event.end事件

  + event: 参考[d3-drag.event](https://github.com/d3/d3-drag#Drag Events)

  + d: 被拖拽节点的data引用

+ drag.destroy(): drag实例销毁后派发

  无参数

tooltip相关

+ tooltip.create()： 创建实例完成后派发

  无参数

+ tooltip.show()： tooltip.formatter执行前派发

  无参数

+ tooltip.update()： tooltip位置更新后派发

  无参数

+ tooltip.hide()：tooltip隐藏后派发

  无参数

+ tooltip.destroy()：tooltip销毁后派发

  无参数


simulation相关

+ simulation.create(): 创建实例完成后派发

  无参数

+ simulation.start(): 重启模拟前派发

  无参数

+ simulation.restart(): 重启模拟时派发

  无参数

+ simulation.stop(): 终止模拟时派发

  无参数

+ simulation.tick(): 每次simulation.tick事件更新完DOM后派发

  无参数

+ simulation.end(): simulation.end事件更新完DOM后派发，
  当`simulation.enable=false`，调用`update`后立刻派发

  无参数

+ simulation.destroy(): 实例销毁后派发

  无参数


zoom相关

+ zoom.create(): 创建实例完成后派发

  无参数

+ zoom.update(): 调用`update`函数后派发

  无参数

+ zoom.start(event, transform): 转发d3.zoom.event.start事件

  + event: 参考[d3-zoom.event](https://github.com/d3/d3-zoom#Zoom Events)

  + transform: 拓扑图当前transform值

+ zoom.zooming(): 转发d3.zoom.event.zoom事件

  + event: 参考[d3-zoom.event](https://github.com/d3/d3-zoom#Zoom Events)

  + transform: 拓扑图当前transform值

+ zoom.end(): 转发d3.zoom.event.end事件

  + event: 参考[d3-zoom.event](https://github.com/d3/d3-zoom#Zoom Events)

  + transform: 拓扑图当前transform值

+ zoom.destroy(): 销毁实例后派发

  无参数


thumbnails相关

+ thumbnails.create(): 创建实例完成后派发

  无参数

+ thumbnails.update(): 更新完缩略图后派发，更新brush也会派发

  无参数

+ thumbnails.hover(): hover到缩略图时派发

  无参数

+ thumbnails.zoom(transform): 在缩略图上使用滚轮控制缩放时派发

  + transform 拓扑图当前transform值

+ thumbnails.zoomend(): 在缩略图上使用滚轮控制缩放结束后派发

  无参数

+ thumbnails.drag(transform): 在缩略图时使用左键控制平移时派发

  + transform 拓扑图当前transform值

+ thumbnails.dragend: 在缩略图时使用左键控制平移结束后派发

  无参数

+ thumbnails.destroy: thumbnails销毁后派发

  无参数

