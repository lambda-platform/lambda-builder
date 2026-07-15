import { resolve } from '../model/resolve.js'
import { markActiveInRange } from '../transform/transform.js'
import { TextSelection } from '../state/selection.js'

// The textblock containing the caret, resolved at any nesting depth (inside
// table cells, list items, blockquotes), or null on a non-text position.
function caretTextblock(state) {
  const $pos = resolve(state.doc, state.selection.from)
  return $pos.parent.isTextblock ? $pos.parent : null
}

// Caret position at the end of the last textblock inside `node` (whose open
// token sits at `start`), or null when it has none.
function endOfLastTextblock(node, start) {
  let result = null
  ;(function walk(n, s) {
    let p = s
    n.content.forEach((child) => {
      if (child.isTextblock) result = p + 1 + child.content.size
      else if (!child.isLeaf && !child.isText) walk(child, p + 1)
      p += child.nodeSize
    })
  })(node, start + 1)
  return result
}

// Caret position at the start of the first textblock inside `node`.
function startOfFirstTextblock(node, start) {
  let result = null
  ;(function walk(n, s) {
    let p = s
    n.content.forEach((child) => {
      if (result != null) return
      if (child.isTextblock) result = p + 1
      else if (!child.isLeaf && !child.isText) walk(child, p + 1)
      p += child.nodeSize
    })
  })(node, start + 1)
  return result
}

// Commands have the signature (state, dispatch?, view?) => boolean.
// They return whether they apply; when `dispatch` is provided they perform the
// change by dispatching a transaction. Toolbars and keymaps call the same set.

export function chainCommands(...commands) {
  return (state, dispatch, view) => {
    for (const command of commands) {
      if (command(state, dispatch, view)) return true
    }
    return false
  }
}

export function toggleMark(markType, attrs = null) {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection
    if (empty) {
      if (dispatch) {
        const current = state.storedMarks || state.tr.marksAt(from)
        const has = current.some((m) => m.type === markType)
        const mark = markType.create(attrs)
        const next = has ? mark.removeFromSet(current) : mark.addToSet(current)
        dispatch(state.tr.setStoredMarks(next))
      }
      return true
    }
    if (dispatch) {
      const mark = markType.create(attrs)
      const active = markActiveInRange(state.doc, from, to, markType)
      const tr = state.tr
      active ? tr.removeMark(mark, from, to) : tr.addMark(mark, from, to)
      dispatch(tr)
    }
    return true
  }
}

export function setBlockType(nodeType, attrs = null) {
  return (state, dispatch) => {
    if (dispatch) {
      dispatch(state.tr.setBlockType(nodeType, attrs, state.selection.from, state.selection.to))
    }
    return true
  }
}

// Set to `type` unless already `type` (with matching attrs), in which case revert
// to `fallback`. Used for heading buttons.
export function toggleBlockType(nodeType, attrs, fallback) {
  return (state, dispatch) => {
    const active = isBlockActive(state, nodeType, attrs)
    const target = active ? fallback : nodeType
    const targetAttrs = active ? null : attrs
    if (dispatch) {
      dispatch(state.tr.setBlockType(target, targetAttrs, state.selection.from, state.selection.to))
    }
    return true
  }
}

export function splitBlock(state, dispatch) {
  if (dispatch) {
    const block = caretTextblock(state)
    const paragraph = state.schema.nodes.paragraph
    // Enter inside a heading starts a plain paragraph; otherwise continue the type.
    const secondType = block && block.type.name === 'heading' ? paragraph : block ? block.type : paragraph
    const secondAttrs = secondType === (block && block.type) ? block.attrs : null
    dispatch(state.tr.splitBlock(secondType, secondAttrs))
  }
  return true
}

export function insertHardBreak(state, dispatch) {
  const brType = state.schema.nodes.hard_break
  if (!brType) return false
  if (dispatch) dispatch(state.tr.replaceSelectionWith([brType.create()]))
  return true
}

export function deleteBackward(state, dispatch) {
  const sel = state.selection
  if (!sel.empty) {
    if (dispatch) dispatch(state.tr.delete(sel.from, sel.to))
    return true
  }
  const from = sel.from
  const $pos = resolve(state.doc, from)
  if (!$pos.parent.isTextblock) return false
  if ($pos.parentOffset > 0) {
    if (dispatch) dispatch(state.tr.delete(from - 1, from))
    return true
  }
  // At the start of a textblock. If a leaf block (e.g. horizontal rule) sits just
  // before it, delete that; otherwise join with the previous block by removing
  // the close+open token pair between them.
  const container = $pos.node($pos.depth - 1)
  const idx = $pos.index($pos.depth - 1)
  const prev = idx > 0 ? container.child(idx - 1) : null
  if (prev && prev.isLeaf) {
    if (dispatch) dispatch(state.tr.delete(from - 2, from - 1))
    return true
  }
  if (prev && prev.type.name === 'table') {
    // Don't merge into the table — move the caret into its last cell instead.
    const target = endOfLastTextblock(prev, from - 1 - prev.nodeSize)
    if (dispatch && target != null) {
      dispatch(state.tr.setSelection(TextSelection.create(state.doc, target)))
    }
    return true
  }
  if (from < 2) return false
  if (dispatch) dispatch(state.tr.delete(from - 2, from))
  return true
}

export function deleteForward(state, dispatch) {
  const sel = state.selection
  if (!sel.empty) {
    if (dispatch) dispatch(state.tr.delete(sel.from, sel.to))
    return true
  }
  const from = sel.from
  const $pos = resolve(state.doc, from)
  if (!$pos.parent.isTextblock) return false
  if ($pos.parentOffset < $pos.parent.content.size) {
    if (dispatch) dispatch(state.tr.delete(from, from + 1))
    return true
  }
  // At the end of a textblock: delete a following leaf block, else join with next.
  const container = $pos.node($pos.depth - 1)
  const idx = $pos.index($pos.depth - 1)
  const next = idx < container.childCount - 1 ? container.child(idx + 1) : null
  if (next && next.isLeaf) {
    if (dispatch) dispatch(state.tr.delete(from + 1, from + 2))
    return true
  }
  if (next && next.type.name === 'table') {
    // Don't merge the table into this block — move the caret into its first cell.
    const target = startOfFirstTextblock(next, from + 1)
    if (dispatch && target != null) {
      dispatch(state.tr.setSelection(TextSelection.create(state.doc, target)))
    }
    return true
  }
  if (from + 2 > state.doc.content.size) return false
  if (dispatch) dispatch(state.tr.delete(from, from + 2))
  return true
}

// Apply (or update) a mark with attributes across the selection — used by color,
// font-size, and font-family pickers where re-applying should replace, not toggle.
export function applyMark(markType, attrs) {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection
    if (empty) {
      if (dispatch) {
        const current = state.storedMarks || state.tr.marksAt(from)
        dispatch(state.tr.setStoredMarks(markType.create(attrs).addToSet(current)))
      }
      return true
    }
    if (dispatch) dispatch(state.tr.addMark(markType.create(attrs), from, to))
    return true
  }
}

export function removeMarkType(markType) {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection
    if (empty) {
      if (dispatch) {
        const current = (state.storedMarks || state.tr.marksAt(from)).filter((m) => m.type !== markType)
        dispatch(state.tr.setStoredMarks(current))
      }
      return true
    }
    if (dispatch) dispatch(state.tr.removeMark(markType.create(), from, to))
    return true
  }
}

export function setAlign(align) {
  return (state, dispatch) => {
    if (dispatch) dispatch(state.tr.setBlockAttr({ align }, state.selection.from, state.selection.to))
    return true
  }
}

export function setLineHeight(lineHeight) {
  return (state, dispatch) => {
    if (dispatch) dispatch(state.tr.setBlockAttr({ lineHeight }, state.selection.from, state.selection.to))
    return true
  }
}

export function clearFormatting(state, dispatch) {
  const { from, to, empty } = state.selection
  if (empty) {
    if (dispatch) dispatch(state.tr.setStoredMarks([]))
    return true
  }
  if (dispatch) dispatch(state.tr.clearMarks(from, to))
  return true
}

export function insertImage(attrs) {
  return (state, dispatch) => {
    const imageType = state.schema.nodes.image
    if (!imageType) return false
    if (dispatch) dispatch(state.tr.replaceSelectionWith([imageType.create(attrs)]))
    return true
  }
}

export function setLink(href) {
  return (state, dispatch) => {
    const linkType = state.schema.marks.link
    if (!linkType) return false
    const { from, to } = state.selection
    if (from === to) return false
    if (dispatch) {
      const tr = state.tr
      href ? tr.addMark(linkType.create({ href }), from, to) : tr.removeMark(linkType.create(), from, to)
      dispatch(tr)
    }
    return true
  }
}

export function selectAll(state, dispatch) {
  if (dispatch) {
    dispatch(state.tr.setSelection(TextSelection.create(state.doc, 1, state.doc.content.size - 1)))
  }
  return true
}

// --- query helpers for UI state ---

export function isMarkActive(state, markType) {
  const { from, to, empty } = state.selection
  if (empty) {
    const marks = state.storedMarks || state.tr.marksAt(from)
    return marks.some((m) => m.type === markType)
  }
  return markActiveInRange(state.doc, from, to, markType)
}

export function isBlockActive(state, nodeType, attrs = null) {
  const block = caretTextblock(state)
  if (!block || block.type !== nodeType) return false
  if (attrs) return Object.keys(attrs).every((k) => block.attrs[k] === attrs[k])
  return true
}

// The textblock node containing the caret (for reflecting UI state like the
// current block type and alignment), at any nesting depth.
export function currentBlock(state) {
  return caretTextblock(state)
}
