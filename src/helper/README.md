# d3辅助函数模块

## 数据集

> ./dataSet.js

dataSet并不创建新的数据对象，而是采用存储原始数据引用的方式，
因此对于dataSet中任何数据做修改均会引发原始数据的修改。

**构造函数参数**

+ 无

**属性**

+ nodes 节点集，可读可写

  说明：

  + 写入时：同时生成enter集、update集、exit集
  + 读取时：返回写入时的所有值，可能会大于 enter + update，因为有未变化的数据

+ edges 边集，可读可写

  说明：

  + 写入时：同时生成enter集、update集、exit集
  + 读取时：返回写入时的所有值，等于 enter + update，
  egde的位置信息需要根据node动态计算，因此，认为edge每次写入都需要更新，
  不存在未变化的数据

**特殊说明** nodes的写入必须先于edges的写入，因为edge信息依赖node

+ links 边集，只读

  说明：只包含source和target的边集，用于simulation。
  由于d3.simulation会修改links的值，所以不能使用edges作为simulation的参数。

+ nodeMap 节点表，只读

  说明：以`node.id`做key的表

+ edgeMap 边表，只读

  说明： 以`edge.id`做key的表

+ exitNodes 删除的节点集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set nodes重新生成

+ exitEdges 删除的边集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set edges重新生成

+ updateNodes 更新的节点集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set nodes重新生成

+ updateEdges 更新的边集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set edges重新生成

+ enterNodes 新增的节点集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set nodes重新生成

+ enterEdges 新增的边集，只读

  说明：只能读取一次，读取一次后被清空，直到再次 set edges重新生成


关于 enter update exit 的使用参考
[d3-selection.data](https://github.com/d3/d3-selection/blob/master/README.md#joining-data)

**方法**

+ clear() 清空数据集内所有数据

## 事件模块

> ./event.js

**构造函数参数**

+ 无

**方法**

+ on(name, handler)

  注册事件，用于响应emit触发的事件

  + name : 事件名，同一个事件名可以注册多个handler，
    每一个事件名维护一个独立的事件队列

  + handler(...args): 事件回调，当执行`emit('name', ...args)`时，
    依次回调此name下的事件队列，并将emit除name外的所有参数传递给handler回调

+ off(name, handler)

  销毁事件回调，每个注册过的事件回调必须手动销毁，或等待执行destroy方法执行，
  否则会造成内存泄漏。

  + name ： 事件名

  + handler : **必填**，如果未提供则无法销毁任何事件回调

+ emit(name, ...args)

  派发事件，执行通过`on(name, handler)`注册的整个事件队列中的所有回调函数

  + name ： 事件名

  + ...args : 事件回调参数

+ destroy()

  销毁所有的事件回调，事件模块内部维护了一个map，执行`destroy`后，
  事件模块将释放所有回调函数，因此一般用于拓扑图销毁时执行。

+ bind(handlers)

  对DOM绑定事件回调，是对`d3.select.on`的封装，方便同时绑定多个事件。
  （注意：d3的event未采用事件队列的模式，同一个事件名只能存在一个回调，
  后注册的事件会覆盖之前注册的事件）

  + handlers : 事件对象，以`Object`方式传递多个需要注册的事件

    ```javascript
    {
      eventName1: function handler(d, i, nodes) {},
      eventName2: function handler(d, i, nodes) {}
    }
    ```
    `handler(d, i, nodes)`与`d3.select.on`回调的参数一致

    > When a specified event is dispatched on a selected element,
    > the specified listener will be evaluated for the element,
    > being passed the current datum (d), the current index (i),
    > and the current group (nodes),
    > with `this` as the current DOM element (nodes[i])

  + 返回值：`$selector => {}`

    返回一个支持被`d3.selection.call`调用的参数，但只支持`$selector`一个参数

    > invokes the specified function exactly once,
    > passing in this selection along with any optional arguments.
    > Returns this selection. This is equivalent to invoking the function by hand
    > but facilitates method chaining

+ unBind(handlers)

  销毁DOM事件回调，是对`d3.select.on`的封装，方便同时销毁多个事件。

  + handlers : 事件对象，以`Object`方式传递多个需要注册的事件

    主要使用`handlers.key`字段，因为 d3 event 的销毁使用`on(name, null)`

  + 返回值：`$selector => {}`


## 拖拽模块

> ./drag.js

drag.js是对d3-drag模块的封装，定义了发生拖拽时页面呈现的形式和交互

drag.js是利用工厂模式的类，new 实例时传入相关的`options`，
然后使用`create`方法完成drag对象的创建，最后使用`destroy`销毁这个实例

**构造函数参数**

`constructor(options)` options 有两种使用模式

1. 独立使用模式，options即是此模块的options，用于一次性渲染场景
2. 作为其他模块的子模块，options是上级模块的options，
  `options.drag`用于此模块，即使用引用的方式管理options，用于多次动态渲染场景。

在多次动态渲染的场景中，显示调用`setOptions`略显笨重和繁琐，
因此使用上级模块的options引用的方式，在上级模块options发生改变时，
子模块options也会发生变化。

+ enable: 是否能拖拽

  默认值: `true`

+ mode: 拖拽表现形式，默认使用虚拟节点，此参数暂不支持配置

  默认值: `virtualNode`

  拖拽时根据实际的节点生成虚拟节点，当拖拽结束时更新实际节点和关联连线的位置,
  并销毁虚拟节点

+ virtualNode: 虚拟节点的参数，目前只支持配置`style`

  默认值:

  ```javascript
  virtualNode: {
    style: {
      cursor: 'move',
      opacity: 0.5,
      stroke: '#aaa',
      fill: '#666',
      'stroke-dasharray': 2,
      'stroke-width': 1,
      filter: null,
    }
  }
  ```

**方法**

+ create($zoomWrapper, eventer, update)

  完成drag实例的创建，**必须调用**，否则drag实例不能使用

  + $zoomWrapper

    类型：d3.selection

    说明：由于拖拽需要动态添加虚拟节点，且需要计算节点的位置，
    因此需要与实际的节点位于相同的坐标系内，即需要相同的相对偏移DOM节点。
    一般是用于控制zoom的那层节点。

  + eventer

    类型：d3Helper.Eventer 实例

    说明：用于派发本模块事件和响应其他模块的事件

  + update

    类型：fuction

    说明：用于更新图表的回调函数，drag结束后需要更新实际的节点和连接

+ bind(opts) 对DOM绑定drag行为

  + opts

    ```javascript
    opts = {
      enable: true // boolean
    }
    ```
    类型：Object

    返回值：$selector => {}，用于`d3.selection.call`的参数

    说明: 目前只支持`enable`字段，`true` => 绑定，`false` => 不绑定。

    usage：

    ```javascript
    // 绑定拖拽行为
    $selector.call(dragger.bind({ enable: true }))
    ```
+ destroy()

  销毁拖拽实例，只会销毁drag行为的回调函数，但不会销毁绑定到dom上的事件回调。

  由于在`bind`执行时将d3-drag模块绑定到DOM上，在d3-drag模块内部是对DOM
  做了一系列的事件绑定，这部分绑定d3-drag并未提供释放的方式，因此，
  此模块是无法销毁DOM的事件回调的。
  （参考[d3-drag](https://github.com/d3/d3-drag/blob/master/src/drag.js#L39)）

**事件**

+ drag.create：drag实例创建完派发
+ drag.start: 转发d3.drag.event.start事件
+ drag.dragging: 转发d3.drag.event.drag事件
+ drag.end: 转发d3.drag.event.end事件
+ drag.destroy: drag实例销毁后派发

## tooltip模块

> ./tooltip.js

tooltip.js是利用工厂模式的类，new 实例时传入相关的`options`，
然后使用`create`方法完成drag对象的创建，最后使用`destroy`销毁这个实例

**构造函数参数**

`constructor(options)` options 有两种使用模式

1. 独立使用模式，options即是此模块的options，用于一次性渲染场景
2. 作为其他模块的子模块，options是上级模块的options，
  `options.tooltip`用于此模块，即使用引用的方式管理options，用于多次动态渲染场景。

在多次动态渲染的场景中，显示调用`setOptions`略显笨重和繁琐，
因此使用上级模块的options引用的方式，在上级模块options发生改变时，
子模块options也会发生变化。

+ enable: 是否支持tooltip

  默认值: `true`

+ gap: tooltip与鼠标点的距离

  默认值: `20`

+ formatter(data): tooltip内容生成器

  默认值: `d => ${d.value}`

+ style: tooltip的最外层DIV的样式

  默认值:

  ```javascript
  style = {
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
  ```

**方法**

+ create($viewer, ds, eventer)

  完成tooltip实例的创建，**必须调用**，否则tooltip实例不能使用

  + $viewer

    类型：d3.selection

    说明：tooltip创建需要添加DIV节点，并且需要绝对定位控制显示的位置，
    因此需要一个定位的父级元素，`$viewer`就是这个父级元素

  + eventer

    类型：d3Helper.Eventer 实例

    说明：用于派发本模块事件和响应其他模块的事件

      当发生`drag.start`事件，隐藏tooltip

      当放生`drag.end`事件，显示tooltip

  + ds

    类型：d3Helper.DataSet 实例

    说明：非必填，默认的`tooltip.formatter`在显示edge信息时需要通过ds
    获取相关node的信息，如果不使用默认的`formatter`则此字段不需要

+ show(d) 显示tooltip

  + d

    ```javascript
    // 可以是一个完整节点数据结构，一般用于模式2，作为其他模块的子模块
    d = {
      tooltip: {
        enable: true,          // boolean, required
        formatter: d => d,     // function, optional
      },
      shape: {},
      label: {},
    }
    // 也可以是只包含tooltip数据的结构，一般用于独立模块
    d = {
      enable: true,
      formatter: d => d
    }
    ```
    类型：Object, 类似通过`d3.selection.data()`绑定的data的数据结构

    说明：当`enable=false`,即是调用show也不会显示tooltip。

    函数内部会执行`tooltip.formatter(d)`，如果formatter返回空字符串也不会显示tooltip。

    formatter的结果会以html方式添加到dom上，注意防范`xss`攻击

+ update() 更新tooltip位置

  默认已经添加多内容，不更新内容，因此此方法必须在`show`调用后再调用，
  不能在`hide`调用后调用

+ hide() 隐藏tooltip

  只是修改样式`display: nonde`，不做其他操作

+ destroy() 销毁tooltip实例

  只删除通过create创建的DOM结构，不释放触发tooltip回调。
  因此，`tooltip.destroy`应该在相关hover事件回调释放后再执行，否则可能会出现异常。

**事件**

+ tooltip.create： 创建实例完成后派发
+ tooltip.show： tooltip.formatter执行前派发
+ tooltip.update： tooltip位置更新后派发
+ tooltip.hide：tooltip隐藏后派发
+ tooltip.destroy：tooltip销毁后派发

## 物理模拟

> ./simulation.js

simulation.js是利用工厂模式的类，new 实例时传入相关的`options`，
然后使用`create`方法完成simulation对象的创建，最后使用`destroy`销毁这个实例

**构造函数参数**

`constructor(options)` options 有两种使用模式

1. 独立使用模式，options即是此模块的options，用于一次性渲染场景
2. 作为其他模块的子模块，options是上级模块的options，
  `options.simulation`用于此模块，即使用引用的方式管理options，用于多次动态渲染场景。

在多次动态渲染的场景中，显示调用`setOptions`略显笨重和繁琐，
因此使用上级模块的options引用的方式，在上级模块options发生改变时，
子模块options也会发生变化。

+ enable: 是否开启simulation

  默认值：`true`,

+ speed: 模拟速度

  默认值：

  ```javascript
  speed =  {
    alpha: null,          // alpha 初值，仿真速度，与d3-simulation参数值相同
    alphaMin: 0.5,        // alpha 最小值
    alphaTarget: null,    // alpha 目标值，与d3-simulation参数值相同
    alphaDecay: null,     // alpha 衰减系数，与d3-simulation参数值相同
    velocityDecay: null,  // 速度衰减系数，摩擦力，与d3-simulation参数值相同
    onTick: null,
    onEnd: null,
  },
  ```

+ force: 力模型参数

  默认值：

  ```javascript
  force = {
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
  ```
**方法**

+ create($graph, eventer, update)

  完成simulation实例的创建，**必须调用**，否则simulation实例不能使用

  + $graph svg节点引用

    类型：d3.selection

    说明：force.center的 `x`, `y`如果未指定，需要根据此节点计算。

    为了增加simulation.tick渲染DOM的性能，
    需要在simulation过程中删除一些非必须的节点，结束后再添加回来，
    因此，$graph引用也是必须的。

  + eventer

    类型：d3Helper.Eventer 实例

    说明：用于派发本模块事件和响应其他模块的事件

  + update `simulation.tick` 和 `simulation.end`的回调

    类型：Object

    ```javascript
    update = {
      nodes: function() {}
      edges: function() {}
    }
    ```

    说明：simulation.js只提供物理模型，不做实际DOM的更细，
    因此，需要在create时提供更新DOM的回调

+ update(nodes, links)  更新物理模型的节点和连线

  + nodes

    类型： Array

    ```javascript
    nodes = [{
      // node data
    }, {
      // node data
    }]
    ```
  + links

    类型：Array

    ```javascript
    links = [{
      source: '1' // string or number, required
      target: 2   // string or number, required
    }, {
      source: {   // or object
        id: '1'   // id is required
      },
      target: {
        id: 2
      }
    }]
    ```
  说明：`update`不仅是更新物理模拟需要的数据，同时会重启模拟过程。
  如果options.enable更新为`false`后调用`update`,则会直接终止模拟过程。

+ restart() 重启模拟

+ stop() 停止模拟

+ tick() 手动模拟tick 参考
[d3.simulation.tick](https://github.com/d3/d3-force/blob/master/README.md#simulation_tick)

+ destroy() 销毁simulation实例

**事件**

+ simulation.create: 创建实例完成后派发
+ simulation.start: 重启模拟前派发
+ simulation.restart: 重启模拟时派发
+ simulation.stop: 终止模拟时派发
+ simulation.tick: 每次simulation.tick事件更新完DOM后派发
+ simulation.end: simulation.end事件更新完DOM后派发，
  当`simulation.enable=false`，调用`update`后立刻派发
+ simulation.destroy: 实例销毁后派发

## 缩放模块

> ./zoom.js

> ./thumbnails.js

zoom.js是利用工厂模式的类，new 实例时传入相关的`options`，
然后使用`create`方法完成zoom对象的创建，最后使用`destroy`销毁这个实例

**构造函数参数**

`constructor(options)`  options 有两种使用模式

1. 独立使用模式，options即是此模块的options，用于一次性渲染场景
2. 作为其他模块的子模块，options是上级模块的options，
  `options.zoom`用于此模块，即使用引用的方式管理options，用于多次动态渲染场景。

在多次动态渲染的场景中，显示调用`setOptions`略显笨重和繁琐，
因此使用上级模块的options引用的方式，在上级模块options发生改变时，
子模块options也会发生变化。

+ enable: 是否开启zoom功能

  默认值：`true`

+ transform: `$zoomWrapper.transform`属性值

  默认值: `{ x: 0, y: 0, k: 1 }`

  说明: 如果未提供默认是不偏移不缩放，如果提供则会渲染到$zoomWrapper的transform属性

+ scaleExtent: 缩放范围

  默认值: `[1 / 4, 8]`

  说明：控制最小和最大缩放倍数，只在`thumbnails.enable=false`时有效。
  如果开启缩略图，缩放由缩略图控制

+ translateExtent: 平移范围

  默认值：`null`

  说明：控制整体平移的范围，默认不控制

+ filter: zoom使能过滤器

  默认值：

  ```javascript
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

  ```
  说明：如果使用缩略图，只响应左键点击动作，否则使用d3.zoom默认filter。
  参考 [d3-zoom.js](https://github.com/d3/d3-zoom/blob/master/src/zoom.js#L12)

+ thumbnails: 缩略图参数

  默认值：参考thumbnails部分

**方法**

+ create($root, $subscriber, $zoomWrapper, eventer)

  完成zoom实例的创建，**必须调用**，否则zoom实例不能使用。
  调用此函数会同时创建thumbnails实例，即使`opts.thumbnails.enable = false`，

  + $root

    类型：d3.selection

    说明：添加缩略图的父节点，一般是顶级节点

  + $subscriber

    类型：d3.selection

    说明：响应zoom事件的订阅对象，一般是SVG对象应用

  + $zoomWrapper

    类型：d3.selection

    说明：实现svg缩放需要在svg标签内添加一层顶级的wrapper，
    通过transform属性来控制，此参数即是这个wrapper的引用

  + eventer

    类型：d3Helper.Eventer 实例

    说明：用于派发本模块事件和响应其他模块的事件

+ update() 重新绑定zoom事件对象

  说明：一般用于更新options后更新zoom行为，如果提供了`options.transform`参数，
  还会更新DOM中$zoomWrapper的transform属性

+ resizeZoom(scale, rect)

  当视窗发生resize时，调用此函数使图形做出相应的zoom

  + scale 新的缩放系数, 必填

    类型: number

  + rect 当前视窗的大小

    类型：Object

    ```javascript
    {
      width: 123,   // number, required
      height: 234,  // number, required
    }
    ```
    说明：当使用thumbnails时必填，需要利用此参数计算缩略图大小

+ destroy() 销毁zoom实例

  说明：会联动执行`thumbnails.destroy()`，销毁缩略图，同时释放zoom事件回调

**事件**

+ zoom.create: 创建实例完成后派发
+ zoom.update: 调用`update`函数后派发
+ zoom.start: 转发d3.zoom.event.start事件
+ zoom.zooming: 转发d3.zoom.event.zoom事件
+ zoom.end: 转发d3.zoom.event.end事件
+ zoom.destroy: 销毁实例后派发

> ./thumbnails.js

thumbnails.js是利用工厂模式的类，new 实例时传入相关的`options`，
然后使用`create`方法完成thumbnails对象的创建，最后使用`destroy`销毁这个实例

**构造函数参数**

`constructor(options, transform)`  options 有两种使用模式

+ options

  1. 独立使用模式，options即是此模块的options，用于一次性渲染场景
  2. 作为其他模块的子模块，options是上级模块的options，
    `options.zoom.thumbnails`用于此模块，即使用引用的方式管理options，
    用于多次动态渲染场景。

  在多次动态渲染的场景中，显示调用`setOptions`略显笨重和繁琐，
  因此使用上级模块的options引用的方式，在上级模块options发生改变时，
  子模块options也会发生变化。

  + enable: 是否开启zoom功能

    默认值：`true`

  + with: 缩略图宽

    默认值：`200`

    类型：number

    说明：此参数暂不支持配置，缩略图的实际大小会根据原图的大小生成

  + height: 缩略图高

    默认值: `200`

    类型: number

    说明：此参数暂不支持配置，缩略图的实际大小会根据原图的大小生成

  + maxWidth: 缩略图最大宽度

    默认值: `200`

    类型: number，必须是数字，不能是字符串，否则会抛出异常。
    SVG元素不需要指定单位，默认是px。参考[SVG 单位](https://www.w3.org/TR/SVG/coords.html#Units)

    说明：缩略图太大会遮盖原图，因此需要限制最大宽度，但不限制最大高度

  + minWidth: 缩略图最小宽度

    默认值: `150`

    类型：number

  + scale: 缩略图使用多大的缩放比，即缩略图时原图的scale倍，

    默认值：`1 / 6`

    说明：超出 `maxWidth` 或 `minWidth` 会再次调整，

  + spread：是否使用大缩略图

    默认值:

    ```javascript
    spread = {
      always: false,    // 默认使用小缩略图，hover时放大
      rect: {           // 小缩略图区域大小
        width: '40px',
        height: '40px',
      },
    },

    ```
    说明：由于缩略图占用一定的空间，会遮挡原图，
    因此提供小缩略图策略，当hover到小缩略图时再展开成大缩略图。

  + style: 缩略图样式

    默认值：

    ```javascript
    style = {       // 缩略图使用DIV元素，因此使用的CSS控制样式
      width: 0,     // 不建议配置，会导致初始样式出问题
      height: 0,    // 不建议配置，会导致初始样式出问题
      display: 'block',
      overflow: 'hidden',
      position: 'absolute',
      top: '5px',
      right: '5px',
      border: '0px solid #fff',
      'box-shadow': '0 0 10px rgba(255, 255, 255, .1)',
      'background-color': 'rgb(63, 67, 71)',
      'background-size': '100%',
      'background-repeat': 'no-repeat',
      'background-position': 'center',
      transition: 'height .3s, width .3s',
    },

    ```

    说明：`width` 和 `height` 不建议直接配置，在渲染过程中这两个值会自动计算赋值。

  + hover: 配置小缩略图模式，控制hover时的样式，不支持配置

  + brush：指实际的可视区域在缩略图中的区域

    默认值：

    ```javascript
    brush = {
      minSize: 20 // brush最小宽度或高度，防止brush区域过小
      style: {    // brush使用DIV元素，因此使用CSS控制样式
        position: 'absolute',
        background: '#666',
        border: '1px dashed #999',
        cursor: 'move',
        opacity: 0.3
      }
    }
    ```
    说明：缩略图通过调整brush大小控制原图的缩放，为防止brush太小看不清，
    需要指定minSize控制brush最小尺寸。

+ transform $zoomWrapper.transform 属性值

  默认值: `{ x: 0, y: 0, k: 1 }`

  说明：在模式2中使用options.tranform格式传递，只用在读取optiosn.transform失败时，
  才使用此参数。

**方法**

+ create($parent, $graph, $zoomWrapper, eventer)

  完成thumbnails实例的创建，**必须调用**，否则thumbnails实例不能使用。
  调用此函数后会在`$parent`节点下添加一个DIV子节点，
  然后立刻调用`update`生成缩略图的图片。

  + $parent 缩略图父元素

    类型：d3.selection

    说明：缩略图采用决定定位，因此需要一个定位的父级元素来决定出现的位置

  + $graph 原图的引用

    类型：d3.selection

    说明；缩略图的生成依赖原图

  + $zoomWrapper 控制原图zoom功能的节点引用

    类型：d3.selection

    说明：缩略图需要控制原图的zoom，因此需要原图中控制zoom的节点引用

  + eventer

    类型：d3Helper.Eventer 实例

    说明：用于派发本模块事件和响应其他模块的事件

+ upadte() 重新生成缩略图

  说明：在发生拖拽，重绘后需要重新缩略图

+ updateBrushPositon() 更新brush位置及大小

  说明：当原图不是通过缩略图控制的zoom发生时，无论是平移还是缩放均需要更新brush。

+ destroy() 销毁thumbnails实例

  说明：会移除create时创建的DOM节点，并释放绑定其上的所有事件

**事件**

+ thumbnails.create: 创建实例完成后派发
+ thumbnails.update: 更新完缩略图后派发，更新brush也会派发
+ thumbnails.hover: hover到缩略图时派发
+ thumbnails.zoom: 在缩略图上使用滚轮控制缩放时派发
+ thumbnails.zoomend: 在缩略图上使用滚轮控制缩放结束后派发
+ thumbnails.drag: 在缩略图时使用左键控制平移时派发
+ thumbnails.dragend: 在缩略图时使用左键控制平移结束后派发
+ thumbnails.destroy: thumbnails销毁后派发

## 滤镜模块
> ./filter.js

此模块用于管理渲染filter的数据，数据结构如下

```javascript
{
  // name: 顶级节点是filter，因此顶级无name属性
  attr: {   // 应用于当前节点的属性
    id: 'shadow',
    width: '200%',
    height: '200%',
    x: '-50%',
    y: '-50%',
  },
  subNodes: [{    // 子节点数组，每级子节点的结构够相同，呈递归形态
    name: 'feDropShadow',   // 节点名称
    attr: {                 // 节点属性
      dx: 4,
      dy: 4,
      stdDeviation: 10,
      'flood-color': 'rgba(0, 0, 0, 0.3)'
    }
    subNodes: [{  // 下一级子节点数据

    }]
  }, {          // 可存在多个子节点

  }]
}

```

**构造函数参数**

+ 无

**方法**

+ use(filter) 注册一个filter，可多次注册

  + filter

    类型：Object 参考上面的数据结构

  说明:

  filter对象以`filter.attr.id`做唯一标识，相同时会发生覆盖，
  当读取属性`data`时返回已注册的filters，直到再次注册新的filter。

  新注册的filter会和已注册的filter根据`filter.attr.id`做diff，
  如果相同则使用已有的filter，不会发生覆盖

  在一些重新渲染场景中，每次渲染filter可能会发生变化，也可能没有变，
  因此对每次渲染需要重新注册filter，相同`ID`的直接复用，
  废弃的`ID`丢弃，新增的`ID`重新渲染

+ render(filter)

  渲染一个filter，并返回一个类型是`[object SVGGElement]`的filter节点。

  + filter

    类型：Object 参考上面的数据结构

  usage：

  ```javascript
  $defs.append(() => filter.render(filterData))
  ```
+ clear() 清空所有filter数据

**属性**

+ data 获取注册的所有filter，只读

> ./shadow.js

此模块是对阴影滤镜的封装，提供便捷的生成阴影滤镜的函数

**函数**

+ genShadow(options, filter) 生成并注册到filter，返回filter url

  + options

    ```javascript
    options = {
      normal: {                   // 普通模式的阴影
        enable: true,             // false 则不注册，也无返回值
        offsetX: 2,               // X偏移
        offsetY: 2,               // Y偏移
        blur: 3,                  // 模糊度
        color: 'rgba(0,0,0,.3)',  //阴影颜色
      },
      hover: {                // hover状态的阴影
        enable: true,         // false 则不注册，也无返回值
        offsetX: 2,
        offsetY: 2,
        blur: 3,
        color: 'rgba(0,0,0,.5)',
      },
    }
    ```
    说明： 目前只提供普通和hover两种状态的阴影生成和注册

  + filter

    类型：Filter实例对象

    说明：用于注册生成的filter

  + 返回值

    ```javascript
    {
      style: 'url(#filter_id)', // 根据options.normal生成的filter url
      hover: 'url(#filter_id)', // 根据options.hover生成的filter url
    }
    ```

    说明：filter_id生成规则是

    ```javascript
    'shadow'
      + (offsetX || '_')
      + (offsetY || '_')
      + (blur || '_')
      + (color.r || '_')
      + (color.g || '_')
      + (color.b || '_')
      + (color.opacity * 100 || '_')
    ```

> ./colorFilter.js

此模块是变色滤镜的封装，用于改变原色值的亮度，不改变色域及饱和度

**方法**

+ genColorFilter(id, value) 生成一个颜色滤镜

  ```javascript
  return {
    attr: {
      id: id
    },
    subNodes: [{
      name: 'feColorMatrix',
      attr: {
        type: 'matrix',
        in: 'SourceGraphic',
        values: `${value} 0 0 0 0 `
              + `0 ${value} 0 0 0 `
              + `0 0 ${value} 0 0 `
              + `0 0 0 ${value} 0`
      }
    }]
  }
  ```

+ darkerFilter(k = 1) 返回一个变暗的filter

  `k` 是调节暗度的系数

  ```javascript
  return genColorFilter('darker', 0.7 ** k)
  ```

+ brighterFilter(k = 1) 返回一个变亮的filter

  `k` 是调节亮度的系数

  ```javascript
  return genColorFilter('brighter', (1 / 0.7) ** k)
  ```

## 工具
> ./util.js

直接参考源码

