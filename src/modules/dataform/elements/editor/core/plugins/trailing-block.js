import { Plugin } from '../state/plugin.js'
import { Fragment } from '../model/fragment.js'

const TRAP_TYPES = ['table', 'horizontal_rule']

// Append an empty paragraph when the document ends with a block the caret
// cannot enter from below (a table or rule). Returns the same doc when no
// fix-up is needed.
export function ensureTrailingBlock(schema, doc, types = TRAP_TYPES) {
  const last = doc.content.lastChild
  if (!last || !types.includes(last.type.name)) return doc
  return doc.copy(doc.content.append(Fragment.from([schema.nodes.paragraph.create()])))
}

// Keeps that guarantee as content changes, so there is always somewhere to
// type at the end of the document.
export function trailingBlock(types = TRAP_TYPES) {
  return new Plugin({
    appendTransaction(tr, oldState, newState) {
      const fixed = ensureTrailingBlock(newState.schema, newState.doc, types)
      if (fixed === newState.doc) return null
      return newState.tr.setDoc(fixed, newState.selection)
    },
  })
}
