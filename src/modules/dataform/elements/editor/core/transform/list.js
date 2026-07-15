import { Fragment } from '../model/fragment.js'
import { resolve, sharedDepth } from '../model/resolve.js'
import { replaceContentAtDepth, deleteRange, replaceRange } from './transform.js'
import { sliceInline, inlineFragment } from './inline.js'

// Structural list operations. Each returns { doc, caret } (a new document and a
// suggested caret position), or null when it doesn't apply. They rely on the
// general resolve() so they work whether the list is at the top level or nested.

function itemContext(doc, pos) {
  const $pos = resolve(doc, pos)
  const itemDepth = $pos.depthOfType('list_item')
  if (itemDepth < 1) return null
  return { $pos, itemDepth, listDepth: itemDepth - 1 }
}

// Wrap the block(s) covered by [from, to] into a list of the given type.
export function wrapInList(doc, from, to, listType, itemType) {
  const $from = resolve(doc, from)
  const $to = resolve(doc, to)
  let cd, i, j
  if ($from.parent === $to.parent && $from.parent.isTextblock) {
    cd = $from.depth - 1
    i = j = $from.index(cd)
  } else {
    cd = sharedDepth($from, $to)
    i = $from.index(cd)
    j = $to.index(cd)
  }
  const parent = $from.node(cd)
  const items = []
  for (let k = i; k <= j; k++) {
    const block = parent.child(k)
    // Already-listed blocks are wrapped as a single item each.
    items.push(itemType.create(null, Fragment.from([block])))
  }
  const list = listType.create(null, Fragment.from(items))
  const arr = parent.content.content.slice()
  arr.splice(i, j - i + 1, list)
  const newDoc = replaceContentAtDepth($from, cd, Fragment.from(arr))
  return { doc: newDoc, caret: from + 2 }
}

// Lift the current list item out of its list (outdent).
//   - Nested list: the item becomes a sibling right after its parent item in the
//     grandparent list.
//   - Top-level list: the item's blocks are unwrapped into the list's container,
//     splitting the list around it.
export function liftListItem(doc, pos) {
  const ctx = itemContext(doc, pos)
  if (!ctx) return null
  const { $pos, listDepth } = ctx
  const list = $pos.node(listDepth)
  const itemIndex = $pos.index(listDepth)
  const item = list.child(itemIndex)
  const containerDepth = listDepth - 1
  const container = $pos.node(containerDepth)

  const before = list.content.content.slice(0, itemIndex)
  const after = list.content.content.slice(itemIndex + 1)

  if (container.type.name === 'list_item') {
    // Nested list → promote the item to the grandparent list.
    const listIndexInItem = $pos.index(containerDepth)
    const remaining = [...before, ...after]
    const parentKids = container.content.content.slice()
    if (remaining.length) parentKids[listIndexInItem] = list.copy(Fragment.from(remaining))
    else parentKids.splice(listIndexInItem, 1)
    const newParentItem = container.copy(Fragment.from(parentKids))

    const grandListDepth = containerDepth - 1
    const grandKids = $pos.node(grandListDepth).content.content.slice()
    grandKids.splice($pos.index(grandListDepth), 1, newParentItem, item)
    const newDoc = replaceContentAtDepth($pos, grandListDepth, Fragment.from(grandKids))
    return { doc: newDoc, caret: pos - 2 }
  }

  // Top-level list → unwrap the item's blocks into the container.
  const replacement = []
  if (before.length) replacement.push(list.copy(Fragment.from(before)))
  replacement.push(...item.content.content)
  if (after.length) replacement.push(list.copy(Fragment.from(after)))
  const arr = container.content.content.slice()
  arr.splice($pos.index(containerDepth), 1, ...replacement)
  const newDoc = replaceContentAtDepth($pos, containerDepth, Fragment.from(arr))

  const beforeSize = before.reduce((s, n) => s + n.nodeSize, 0)
  return { doc: newDoc, caret: pos - 2 + (before.length ? beforeSize : 0) }
}

// Sink the current list item into the previous sibling's sublist (indent).
export function sinkListItem(doc, pos) {
  const ctx = itemContext(doc, pos)
  if (!ctx) return null
  const { $pos, listDepth } = ctx
  const list = $pos.node(listDepth)
  const itemIndex = $pos.index(listDepth)
  if (itemIndex === 0) return null // nothing to nest under
  const item = list.child(itemIndex)
  const prev = list.child(itemIndex - 1)

  const prevKids = prev.content.content.slice()
  const last = prevKids[prevKids.length - 1]
  let newPrev
  if (last && last.type === list.type) {
    prevKids[prevKids.length - 1] = last.copy(Fragment.from([...last.content.content, item]))
    newPrev = prev.copy(Fragment.from(prevKids))
  } else {
    const sub = list.type.create(list.attrs, Fragment.from([item]))
    newPrev = prev.copy(Fragment.from([...prevKids, sub]))
  }
  const items = list.content.content.slice()
  items.splice(itemIndex - 1, 2, newPrev)
  const newDoc = replaceContentAtDepth($pos, listDepth, Fragment.from(items))
  return { doc: newDoc, caret: pos + 2 }
}

// Enter inside a list: split the current item into two items. On an empty item
// this exits the list instead (via lift).
export function splitListItem(doc, pos) {
  const ctx = itemContext(doc, pos)
  if (!ctx) return null
  const { $pos, itemDepth } = ctx
  const block = $pos.parent
  if (!block.isTextblock) return null
  const item = $pos.node(itemDepth)

  if (block.content.size === 0 && item.childCount === 1) {
    return liftListItem(doc, pos)
  }

  const blockIndex = $pos.index(itemDepth)
  const left = block.copy(inlineFragment(sliceInline(block.content, 0, $pos.parentOffset)))
  const right = block.copy(inlineFragment(sliceInline(block.content, $pos.parentOffset, block.content.size)))
  const curItem = item.copy(Fragment.from([...item.content.content.slice(0, blockIndex), left]))
  const nextItem = item.type.create(item.attrs, Fragment.from([right, ...item.content.content.slice(blockIndex + 1)]))

  const list = $pos.node(itemDepth - 1)
  const itemIndex = $pos.index(itemDepth - 1)
  const items = list.content.content.slice()
  items.splice(itemIndex, 1, curItem, nextItem)
  const newDoc = replaceContentAtDepth($pos, itemDepth - 1, Fragment.from(items))
  return { doc: newDoc, caret: pos + 4 }
}

// Is the caret inside a list of the given type?
export function inListOfType(doc, pos, listType) {
  const $pos = resolve(doc, pos)
  const d = $pos.depthOfType('list_item')
  return d >= 1 && $pos.node(d - 1).type === listType
}

// ---- generic block wrapping / insertion (blockquote, hr, tables) ----------

// Determine the container depth + child index range covered by [from, to].
function blockRange($from, $to) {
  if ($from.parent === $to.parent && $from.parent.isTextblock) {
    const cd = $from.depth - 1
    return { cd, i: $from.index(cd), j: $from.index(cd) }
  }
  const cd = sharedDepth($from, $to)
  return { cd, i: $from.index(cd), j: $to.index(cd) }
}

// Wrap the block(s) covered by [from, to] into a single wrapper (e.g. blockquote).
export function wrapInNode(doc, from, to, wrapperType) {
  const $from = resolve(doc, from)
  const $to = resolve(doc, to)
  const { cd, i, j } = blockRange($from, $to)
  const parent = $from.node(cd)
  const wrapped = wrapperType.create(null, Fragment.from(parent.content.content.slice(i, j + 1)))
  const arr = parent.content.content.slice()
  arr.splice(i, j - i + 1, wrapped)
  return { doc: replaceContentAtDepth($from, cd, Fragment.from(arr)), caret: from + 1 }
}

// Unwrap the nearest ancestor of the given type, lifting its children up a level.
export function unwrapNode(doc, pos, typeName) {
  const $pos = resolve(doc, pos)
  const d = $pos.depthOfType(typeName)
  if (d < 1) return null
  const wrapper = $pos.node(d)
  const containerDepth = d - 1
  const container = $pos.node(containerDepth)
  const arr = container.content.content.slice()
  arr.splice($pos.index(containerDepth), 1, ...wrapper.content.content)
  return { doc: replaceContentAtDepth($pos, containerDepth, Fragment.from(arr)), caret: pos - 1 }
}

// Split the current textblock and insert a block node (hr, table) between the
// halves. Returns { doc, caret } with the caret at the start of the trailing half.
export function insertBlockAt(doc, pos, node) {
  const $pos = resolve(doc, pos)
  if (!$pos.parent.isTextblock) return null
  const D = $pos.depth
  const block = $pos.parent
  const left = block.copy(inlineFragment(sliceInline(block.content, 0, $pos.parentOffset)))
  const right = block.copy(inlineFragment(sliceInline(block.content, $pos.parentOffset, block.content.size)))
  const container = $pos.node(D - 1)
  const arr = container.content.content.slice()
  arr.splice($pos.index(D - 1), 1, left, node, right)
  return {
    doc: replaceContentAtDepth($pos, D - 1, Fragment.from(arr)),
    caret: pos + node.nodeSize + 2,
    insertedStart: pos + 1, // position just before the inserted node's open token
  }
}

// Insert a list of block nodes at the selection (used by rich HTML paste). The
// first pasted block merges into the caret's block; the last absorbs the trailing
// inline content.
export function pasteBlocks(doc, from, to, blocks) {
  if (!blocks.length) return null
  const base = from === to ? doc : deleteRange(doc, from, to)
  const pos = Math.min(from, to)

  // A single textblock pastes as inline content.
  if (blocks.length === 1 && blocks[0].isTextblock) {
    const newDoc = replaceRange(base, pos, pos, blocks[0].content.content)
    return { doc: newDoc, caret: Math.min(pos + blocks[0].content.size, newDoc.content.size - 1) }
  }

  const $pos = resolve(base, pos)
  if (!$pos.parent.isTextblock) return null
  const D = $pos.depth
  const block = $pos.parent
  const container = $pos.node(D - 1)
  const leftInline = sliceInline(block.content, 0, $pos.parentOffset)
  const rightInline = sliceInline(block.content, $pos.parentOffset, block.content.size)
  const first = blocks[0]
  const last = blocks[blocks.length - 1]

  const out = []
  if (first.isTextblock) out.push(block.copy(inlineFragment([...leftInline, ...first.content.content])))
  else out.push(block.copy(inlineFragment(leftInline)), first)
  for (let i = 1; i < blocks.length - 1; i++) out.push(blocks[i])
  if (last.isTextblock) out.push(last.copy(inlineFragment([...last.content.content, ...rightInline])))
  else out.push(last, block.copy(inlineFragment(rightInline)))

  const arr = container.content.content.slice()
  arr.splice($pos.index(D - 1), 1, ...out)
  const newDoc = replaceContentAtDepth($pos, D - 1, Fragment.from(arr))
  const pastedSize = blocks.reduce((s, n) => s + n.nodeSize, 0)
  return { doc: newDoc, caret: Math.min(pos + pastedSize, newDoc.content.size - 1) }
}
