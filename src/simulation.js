import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force'
import options from './options'
import eventer from './event'
import {
  merge,
} from './util'

const dftOptions = {
  enable: false,
  speed: {
    alpha: 1,            // alpha 初值，仿真速度
    alphaMin: 0.4,       // alpha 最小值
    alphaTarget: 0.15,   // alpha 目标值
    alphaDecay: 0.01,    // alpha 衰减系数
    velocityDecay: 0.9,  // 速度衰减系数，摩擦力
    onTick: null,
    onEnd: null,
  },
  force: {
    nBody: {
      enable: true,
      strength: -250,    // 引力强度，重力模型、电荷力模型
      theta: 1.5,        // Barnes-Hut 相关
      distanceMin: 80,   // 最小距离
      distanceMax: 400,  // 最大距离
    },
    link: {
      enable: true,
      distance: 120,    // 两点距离
      strength: 0.2,    // 连线的弹力强度
      iterations: 5,    // 迭代次数
      id: d => d.id,      // node索引函数
    },
    collide: {
      enable: true,
      radius: 25,       // 碰撞半径
      strength: 0.3,    // 碰撞强度
      iterations: 5,    // 迭代次数
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

class Simulation {

  constructor(options) {
    this._opts = options
    this._updateNodes = null
    this._updateEdges = null
    this._$viewer = null
    this._simulater = forceSimulation()
    this._force = {
      nBody: forceManyBody(),
      link: forceLink(),
      center: forceCenter(),
      collide: forceCollide(),
    }
  }

  create(updateNodes, updateEdges, $viewer) {
    this._$viewer = $viewer
    if (!_.isFunction(updateNodes)) {
      throw new Error('updateNodes must be function')
    }
    if (!_.isFunction(updateEdges)) {
      throw new Error('updateEdges must be function')
    }
    this._updateNodes = updateNodes
    this._updateEdges = updateEdges
  }

  update(nodes, links) {
    if (this._opts.enable) {
      eventer.emit('simulation.start')
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
      this._simulater.nodes(nodes)
      this._force.link.links(links)
      this.restart()
    }
  }

  restart() {
    eventer.emit('simulation.restart')
    this._simulater.restart()
  }

  stop() {
    this._simulater.stop()
    eventer.emit('simulation.stop')
  }

  tick() {
    this._simulater.tick()
  }

  destroy() {
    this._simulater.on('tick', null).on('end', null)
    _.forEach(this._force, (force, name) => {
      this._simulater.force(name, null)
      this._force[name] = null
    })
    this._force = null
    this._updateNodes = null
    this._updateEdges = null
    this._opts = null
    eventer.emit('simulation.destroy')
  }

  _setParams() {
    set(this._simulater, this._opts.speed)
    _.forEach(this._force, (force, name) => {
      if (this._opts.force[name].enable) {
        if (name === 'center' && (this._opts.force.center.x === null ||
          this._opts.force.center.y === null)
        ) {
          const rect = this._$viewer.node().getBoundingClientRect()
          set(force, {
            x: rect.width / 2,
            y: rect.height / 2,
          })
        } else {
          set(force, this._opts.force[name])
        }
        this._simulater.force(name, force)
      } else {
        this._simulater.force(name, null)
      }
    })
    this._simulater.on('tick', null).on('end', null)
    if (this._opts.enable) {
      // filter 会影响 simulation 效率，所以开始simulation前去掉所有的filter
      // 结束后再添加回来
      const $filters = this._$viewer.selectAll('filter').remove()
      const updateView = dftUpdateView(this._updateNodes, this._updateEdges)
      const onTick = dftOnTick(updateView)
      const onEnd = dftOnEnd(updateView)
      this._simulater.on('tick', () => {
        if (_.isFunction(this._opts.onTick)) {
          this._opts.onTick(onTick)
        } else {
          onTick()
        }
        eventer.emit('simulation.tick')
      }).on('end', () => {
        if (_.isFunction(this._opts.onEnd)) {
          this._opts.onEnd(onEnd)
        } else {
          onEnd()
        }
        // 将删除的filter添加回DOM
        $filters.nodes().forEach(node => {
          this._$viewer.select('defs').append(() => node)
        })
        eventer.emit('simulation.end')
      })
    }
  }
}

options.simulation = merge({}, dftOptions, options.simulation)
const simulation = new Simulation(options.simulation)

export default simulation
