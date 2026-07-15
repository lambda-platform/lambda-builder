import { Plugin, PluginKey } from '../state/plugin.js'
import { TextSelection } from '../state/selection.js'

// Snapshot-based undo/redo. Because documents are immutable, "remembering" a
// previous document is free — we just keep a reference. Each state-changing
// transaction pushes the pre-change snapshot onto the `done` stack.

export const historyKey = new PluginKey('history')

export function history({ depth = 100 } = {}) {
  return new Plugin({
    key: historyKey,
    state: {
      init() {
        return { done: [], undone: [] }
      },
      apply(tr, value, oldState) {
        const restored = tr.getMeta(historyKey)
        if (restored) return restored // undo/redo supplies the rebuilt stacks
        if (!tr.docChanged || tr.getMeta('addToHistory') === false) return value
        const done = value.done.concat([{ doc: oldState.doc, selection: oldState.selection }])
        if (done.length > depth) done.shift()
        return { done, undone: [] }
      },
    },
  })
}

export function undo(state, dispatch) {
  const hist = historyKey.getState(state)
  if (!hist || hist.done.length === 0) return false
  if (dispatch) {
    const snapshot = hist.done[hist.done.length - 1]
    const stacks = {
      done: hist.done.slice(0, -1),
      undone: hist.undone.concat([{ doc: state.doc, selection: state.selection }]),
    }
    dispatchRestore(state, dispatch, snapshot, stacks)
  }
  return true
}

export function redo(state, dispatch) {
  const hist = historyKey.getState(state)
  if (!hist || hist.undone.length === 0) return false
  if (dispatch) {
    const snapshot = hist.undone[hist.undone.length - 1]
    const stacks = {
      done: hist.done.concat([{ doc: state.doc, selection: state.selection }]),
      undone: hist.undone.slice(0, -1),
    }
    dispatchRestore(state, dispatch, snapshot, stacks)
  }
  return true
}

function dispatchRestore(state, dispatch, snapshot, stacks) {
  const selection = TextSelection.create(snapshot.doc, snapshot.selection.anchor, snapshot.selection.head)
  const tr = state.tr.setDoc(snapshot.doc, selection)
  tr.setMeta(historyKey, stacks)
  tr.setMeta('addToHistory', false)
  dispatch(tr)
}
