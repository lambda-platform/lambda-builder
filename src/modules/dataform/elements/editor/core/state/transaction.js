import { TextSelection } from './selection.js'
import { Mark } from '../model/mark.js'
import { locateInline } from '../model/position.js'
import { resolve } from '../model/resolve.js'
import * as T from '../transform/transform.js'

// A Transaction records edits against a starting state and produces the next
// document + selection. It is a mutable builder (chainable), but the documents
// it references are immutable, so nothing observable changes until the state
// applies it.

export class Transaction {
  constructor(state) {
    this.startState = state
    this.schema = state.schema
    this.doc = state.doc
    this.selection = state.selection
    this.storedMarks = state.storedMarks
    this.docChanged = false
    this._meta = Object.create(null)
  }

  setMeta(key, value) {
    this._meta[typeof key === 'string' ? key : key.key] = value
    return this
  }

  getMeta(key) {
    return this._meta[typeof key === 'string' ? key : key.key]
  }

  // Explicit selection move (click, arrow keys). Clears stored marks, matching
  // the intuition that moving the caret forgets a pending "next char is bold".
  setSelection(selection) {
    this.selection = selection
    this.storedMarks = null
    return this
  }

  setStoredMarks(marks) {
    this.storedMarks = marks
    return this
  }

  ensureMarks(marks) {
    if (!Mark.sameSet(this.storedMarks || this.marksAt(this.selection.from), marks)) {
      this.setStoredMarks(marks)
    }
    return this
  }

  // Low-level document replacement, used by history restore.
  setDoc(doc, selection) {
    this.doc = doc
    this.docChanged = true
    if (selection) this.selection = selection
    return this
  }

  insertText(text, from = this.selection.from, to = this.selection.to) {
    if (!text) return from !== to ? this.delete(from, to) : this
    const marks = this.storedMarks || this.marksAt(from)
    this.doc = T.replaceRange(this.doc, from, to, [this.schema.text(text, marks)])
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, from + text.length)
    this.storedMarks = null
    return this
  }

  delete(from, to) {
    if (from === to) return this
    this.doc = T.deleteRange(this.doc, from, to)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, Math.min(from, to))
    this.storedMarks = null
    return this
  }

  // Replace the current selection with inline nodes (e.g. a hard_break).
  replaceSelectionWith(inlineNodes) {
    const { from, to } = this.selection
    const size = inlineNodes.reduce((s, n) => s + n.nodeSize, 0)
    this.doc = T.replaceRange(this.doc, from, to, inlineNodes)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, from + size)
    this.storedMarks = null
    return this
  }

  splitBlock(secondType = null, secondAttrs = null) {
    let pos = this.selection.from
    if (!this.selection.empty) {
      this.delete(this.selection.from, this.selection.to)
      pos = this.selection.from
    }
    this.doc = T.splitBlock(this.doc, pos, secondType, secondAttrs)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, pos + 2)
    this.storedMarks = null
    return this
  }

  setBlockType(type, attrs = null, from = this.selection.from, to = this.selection.to) {
    const doc = T.setBlockType(this.doc, from, to, type, attrs)
    if (doc === this.doc) return this
    this.doc = doc
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, this.selection.anchor, this.selection.head)
    return this
  }

  setBlockAttr(patch, from = this.selection.from, to = this.selection.to) {
    const doc = T.setBlockAttr(this.doc, from, to, patch)
    if (doc === this.doc) return this
    this.doc = doc
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, this.selection.anchor, this.selection.head)
    return this
  }

  clearMarks(from = this.selection.from, to = this.selection.to) {
    if (from >= to) return this
    this.doc = T.clearMarks(this.doc, from, to)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, this.selection.anchor, this.selection.head)
    return this
  }

  addMark(mark, from = this.selection.from, to = this.selection.to) {
    if (from >= to) return this
    this.doc = T.addMark(this.doc, from, to, mark)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, this.selection.anchor, this.selection.head)
    return this
  }

  removeMark(mark, from = this.selection.from, to = this.selection.to) {
    if (from >= to) return this
    this.doc = T.removeMark(this.doc, from, to, mark)
    this.docChanged = true
    this.selection = TextSelection.create(this.doc, this.selection.anchor, this.selection.head)
    return this
  }

  // The mark set that newly typed text at `pos` should inherit (the marks of the
  // character to the left of the caret).
  marksAt(pos) {
    const $pos = resolve(this.doc, pos)
    const block = $pos.parent
    const offset = $pos.parentOffset
    if (!block.isTextblock || offset === 0) return Mark.none
    const { index, inlineOffset } = locateInline(block.content, offset)
    const node = inlineOffset > 0 ? block.content.maybeChild(index) : block.content.maybeChild(index - 1)
    return node && node.isText ? node.marks : Mark.none
  }
}
