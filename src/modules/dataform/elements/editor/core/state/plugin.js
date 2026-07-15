// A Plugin bundles optional editor state, view props (event handlers), and a
// hook to append follow-up transactions. Every batteries-included feature
// (keymap, history, ...) is built on this one interface.

let keyCounter = 0

export class PluginKey {
  constructor(name = 'plugin') {
    this.key = `${name}$${++keyCounter}`
  }
  getState(state) {
    return state.pluginStateByKey(this.key)
  }
}

export class Plugin {
  constructor(spec) {
    this.spec = spec
    this.props = spec.props || {}
    this.stateSpec = spec.state || null
    this.appendTransaction = spec.appendTransaction || null
    this.view = spec.view || null
    // Stateful plugins should pass a PluginKey so commands can find their state.
    this.key = spec.key instanceof PluginKey ? spec.key.key : spec.key || `plugin$${++keyCounter}`
  }

  getState(state) {
    return state.pluginStateByKey(this.key)
  }
}
