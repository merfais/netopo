import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force'
import {
  merge,
} from './util'

const dftOptions = {
  enable: true,
  speed: {
    alpha: 1.2,            // alpha 初值，仿真速度
    alphaMin: 0.2,       // alpha 最小值
    alphaTarget: 0.15,   // alpha 目标值
    alphaDecay: 0.02,    // alpha 衰减系数
    velocityDecay: 0.95,  // 速度衰减系数，摩擦力
    onTick: null,
    onEnd: null,
  },
  force: {
    nBody: {
      enable: true,
      strength: -350,    // 引力强度，重力模型、电荷力模型
      theta: 1.5,        // Barnes-Hut 相关
      distanceMin: 60,   // 最小距离
      distanceMax: 400,  // 最大距离
    },
    link: {
      enable: true,
      distance: 100,    // 两点距离
      strength: 1.2,    // 连线的弹力强度
      iterations: 3,    // 迭代次数
      id: d => d.id,      // node索引函数
    },
    collide: {
      enable: true,
      radius: 15,       // 碰撞半径
      strength: 0.3,    // 碰撞强度
      iterations: 3,    // 迭代次数
    },
    center: {
      enable: true,
      x: null,          // 中心X坐标
      y: null,          // 中心Y坐标
    },
  }
}

const dftUpdateView = function(updateNodes, updateEdges) {
  return type => {
    updateNodes(type)
    updateEdges(type)
  }
}

const dftOnTick = function(updateView) {
  return () => updateView('tick')
}

const dftOnEnd = function(updateView) {
  return () => updateView('end')
}

function set(target, options) {
  const enable = options.enable
  delete options.enable
  _.forEach(options, (value, key) => {
    if (value !== null) {
      target[key](value)
    }
  })
  options.enable = enable
}

export default class Simulation {

  _opts = null
  _eventer = null
  _updateNodes = null
  _updateEdges = null
  _$graph = null
  _simulator = null
  _force = null

  constructor(options) {
    if (_.has(options, 'simulation')) {
      this._opts = merge({}, dftOptions, options.simulation)
      options.simulation = this._opts
    } else {
      this._opts = merge({}, dftOptions, options)
    }
    this._simulator = forceSimulation()
    this._force = {
      nBody: forceManyBody(),
      link: forceLink(),
      center: forceCenter(),
      collide: forceCollide(),
    }
  }

  create($graph, eventer, update) {
    if (update && !_.isFunction(update.nodes)) {
      throw new Error('updateNodes must be function')
    }
    if (update && !_.isFunction(update.edges)) {
      throw new Error('updateEdges must be function')
    }
    this._eventer = eventer
    this._$graph = $graph
    this._updateNodes = update.nodes
    this._updateEdges = update.edges
    return this
  }

  update(nodes, links) {
    if (this._opts.enable && !(_.isEmpty(nodes) && _.isEmpty(links))) {
      this._eventer.emit('simulation.start')
      // 更新前清除位置信息，重新生成
      // 使用旧的位置信息，会导致图形慢慢向外延展，而不会收敛
      _.forEach(nodes, node => {
        delete node.x
        delete node.y
        delete node.vx
        delete node.vy
      })
      _.forEach(links, link => {
        link.source = link.source.id || link.source
        link.target = link.target.id || link.target
      })
      this.stop()
      this._setParams()
      this._simulator.nodes(nodes)
      this._force.link.links(links)
      this.restart()
    } else {
      this.stop()
      this._simulator.on('tick', null).on('end', null)
      this._eventer.emit('graph.update')
    }
  }

  restart() {
    this._eventer.emit('simulation.restart')
    this._simulator.restart()
  }

  stop() {
    this._simulator.stop()
    this._eventer.emit('simulation.stop')
  }

  tick() {
    this._simulator.tick()
  }

  destroy() {
    this._simulator.on('tick', null).on('end', null)
    _.forEach(this._force, (force, name) => {
      this._simulator.force(name, null)
      this._force[name] = null
    })
    this._force = null
    this._updateNodes = null
    this._updateEdges = null
    this._opts = null
    this._eventer.emit('simulation.destroy')
    this._eventer = null
  }

  _setParams() {
    set(this._simulator, this._opts.speed)
    _.forEach(this._force, (force, name) => {
      if (this._opts.force[name].enable) {
        if (name === 'center' && (this._opts.force.center.x === null ||
          this._opts.force.center.y === null)
        ) {
          const rect = this._$graph.node().getBoundingClientRect()
          set(force, {
            x: rect.width / 2,
            y: rect.height / 2,
          })
        } else {
          set(force, this._opts.force[name])
        }
        this._simulator.force(name, force)
      } else {
        this._simulator.force(name, null)
      }
    })
    this._simulator.on('tick', null).on('end', null)
    if (this._opts.enable) {
      // filter 会影响 simulation 效率，所以开始simulation前去掉所有的filter
      // 结束后再添加回来
      const $filters = this._$graph.selectAll('filter').remove()
      const updateView = dftUpdateView(this._updateNodes, this._updateEdges)
      const onTick = dftOnTick(updateView)
      const onEnd = dftOnEnd(updateView)
      this._simulator.on('tick', () => {
        if (_.isFunction(this._opts.onTick)) {
          this._opts.onTick(onTick)
        } else {
          onTick()
        }
        this._eventer.emit('simulation.tick')
      }).on('end', () => {
        if (_.isFunction(this._opts.onEnd)) {
          this._opts.onEnd(onEnd)
        } else {
          onEnd()
        }
        // 将删除的filter添加回DOM
        $filters.nodes().forEach(node => {
          this._$graph.select('defs').append(() => node)
        })
        this._eventer.emit('simulation.end')
      })
    }
  }
}
