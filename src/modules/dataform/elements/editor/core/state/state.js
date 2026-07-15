import { Transaction } from './transaction.js'
import { TextSelection } from './selection.js'

// EditorState is the immutable snapshot of everything the editor needs: the
// document, the selection, pending stored marks, and each plugin's state slice.
// Applying a transaction yields a brand-new EditorState.

export class EditorState {
  constructor(config) {
    this.schema = config.schema
    this.plugins = config.plugins
    this.doc = config.doc
    this.selection = config.selection
    this.storedMarks = config.storedMarks || null
    this.pluginStates = config.pluginStates || Object.create(null)
  }

  static create({ schema, doc, selection, plugins = [], storedMarks = null }) {
    doc = doc || defaultDoc(schema)
    selection = selection || TextSelection.atEnd(doc)
    const pluginStates = Object.create(null)
    const state = new EditorState({ schema, doc, selection, storedMarks, plugins, pluginStates })
    for (const plugin of plugins) {
      if (plugin.stateSpec) {
        pluginStates[plugin.key] = plugin.stateSpec.init({ schema, doc, selection }, state)
      }
    }
    return state
  }

  get tr() {
    return new Transaction(this)
  }

  pluginStateByKey(key) {
    return this.pluginStates[key]
  }

  // Produce the next state from a transaction, running plugin state reducers and
  // the appendTransaction hook.
  apply(tr) {
    let newState = this.stateFromTransaction(tr)
    for (const plugin of this.plugins) {
      if (!plugin.appendTransaction) continue
      const appended = plugin.appendTransaction(tr, this, newState)
      if (appended && appended.docChanged) {
        newState = newState.stateFromTransaction(appended)
      }
    }
    return newState
  }

  stateFromTransaction(tr) {
    const pluginStates = Object.create(null)
    const newState = new EditorState({
      schema: this.schema,
      doc: tr.doc,
      selection: tr.selection,
      storedMarks: tr.storedMarks,
      plugins: this.plugins,
      pluginStates,
    })
    for (const plugin of this.plugins) {
      if (plugin.stateSpec) {
        pluginStates[plugin.key] = plugin.stateSpec.apply(tr, this.pluginStates[plugin.key], this, newState)
      }
    }
    return newState
  }

  toJSON() {
    return { doc: this.doc.toJSON(), selection: this.selection.toJSON() }
  }
}

export function defaultDoc(schema) {
  return schema.node('doc', null, [schema.node(schema.spec.defaultBlock || 'paragraph')])
}
