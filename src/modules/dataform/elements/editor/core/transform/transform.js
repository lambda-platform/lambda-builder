import { Fragment } from '../model/fragment.js'
import { resolve, sharedDepth } from '../model/resolve.js'
import { sliceInline, inlineFragment, mapInlineMarks, marksInRange } from './inline.js'

// Depth-general document transformations. Every function takes a doc and returns
// a NEW doc (the tree is immutable). These work at any nesting depth, so the
// same primitives drive editing inside paragraphs, list items, and blockquotes.

// ---- tree rebuild helpers -------------------------------------------------

// Replace the content Fragment of the node at `depth` on a resolved path and
// propagate the change up to a new root doc.
export function replaceContentAtDepth($pos, depth, newContent) {
  let node = $pos.node(depth).copy(newContent)
  for (let d = depth - 1; d >= 0; d--) {
    node = $pos.node(d).copy($pos.node(d).content.replaceChild($pos.index(d), node))
  }
  return node
}

// Keep only the part of the subtree at depth d that lies BEFORE the resolved pos.
function keepBefore($pos, d) {
  if (d > $pos.depth) return null
  const node = $pos.node(d)
  const index = $pos.index(d)
  if (d === $pos.depth) {
    if (node.isTextblock) return node.copy(inlineFragment(sliceInline(node.content, 0, $pos.parentOffset)))
    return node.copy(node.content.cutByIndex(0, index))
  }
  const kept = node.content.content.slice(0, index)
  const child = keepBefore($pos, d + 1)
  if (nonEmpty(child)) kept.push(child)
  return node.copy(Fragment.from(kept))
}

// Keep only the part of the subtree at depth d that lies AFTER the resolved pos.
function keepAfter($pos, d) {
  if (d > $pos.depth) return null
  const node = $pos.node(d)
  const index = $pos.index(d)
  if (d === $pos.depth) {
    if (node.isTextblock) return node.copy(inlineFragment(sliceInline(node.content, $pos.parentOffset, node.content.size)))
    return node.copy(node.content.cutByIndex(index, node.childCount))
  }
  const child = keepAfter($pos, d + 1)
  const rest = node.content.content.slice(index + 1)
  const kept = []
  if (nonEmpty(child)) kept.push(child)
  kept.push(...rest)
  return node.copy(Fragment.from(kept))
}

function nonEmpty(node) {
  return node && (node.isTextblock || node.isLeaf || node.content.size > 0)
}

// Join two (truncated) boundary nodes: textblocks merge inline content, matching
// containers merge recursively at their own boundary, everything else stays split.
function mergeNodes(a, b, inlineNodes = []) {
  if (a && b && a.isTextblock && b.isTextblock) {
    return [a.copy(inlineFragment([...a.content.content, ...inlineNodes, ...b.content.content]))]
  }
  if (a && b && a.type === b.type && !a.isText && !a.isLeaf) {
    const aKids = a.content.content.slice()
    const bKids = b.content.content.slice()
    const boundary = mergeNodes(aKids.pop(), bKids.shift(), inlineNodes)
    return [a.copy(Fragment.from([...aKids, ...boundary, ...bKids]))]
  }
  const out = []
  if (a) out.push(a)
  if (b) out.push(b)
  return out
}

// ---- replace / delete / insert / split -----------------------------------

export function replaceRange(doc, from, to, inlineNodes = []) {
  const $from = resolve(doc, from)
  const $to = resolve(doc, to)

  // Fast path: both ends in the same textblock.
  if ($from.parent === $to.parent && $from.parent.isTextblock) {
    const block = $from.parent
    const left = sliceInline(block.content, 0, $from.parentOffset)
    const right = sliceInline(block.content, $to.parentOffset, block.content.size)
    const merged = inlineFragment([...left, ...inlineNodes, ...right])
    return ensureNonEmpty(replaceContentAtDepth($from, $from.depth, merged))
  }

  // General path: cut both sides at their shared ancestor and merge the boundary.
  const cd = sharedDepth($from, $to)
  const parent = $from.node(cd)
  const i = $from.index(cd)
  const j = $to.index(cd)
  const leftChild = keepBefore($from, cd + 1)
  const rightChild = keepAfter($to, cd + 1)
  const middle = mergeNodes(leftChild, rightChild, inlineNodes)
  // When `to` lands exactly on child j's left boundary, child j is NOT part of
  // the range and must be kept; otherwise it's replaced by its truncated tail.
  const removeCount = (rightChild != null ? j + 1 : j) - i
  const arr = parent.content.content.slice()
  arr.splice(i, removeCount, ...middle)
  return ensureNonEmpty(replaceContentAtDepth($from, cd, Fragment.from(arr)))
}

export function deleteRange(doc, from, to) {
  return from === to ? doc : replaceRange(doc, from, to, [])
}

export function insertInline(doc, pos, inlineNodes) {
  return replaceRange(doc, pos, pos, inlineNodes)
}

// Split the textblock containing `pos` into two, inside its immediate parent.
export function splitBlock(doc, pos, secondType = null, secondAttrs = null) {
  const $pos = resolve(doc, pos)
  const block = $pos.parent
  if (!block.isTextblock) return doc
  const D = $pos.depth
  const left = block.copy(inlineFragment(sliceInline(block.content, 0, $pos.parentOffset)))
  const type = secondType || block.type
  const attrs = secondAttrs || (type === block.type ? block.attrs : null)
  const right = type.create(attrs, inlineFragment(sliceInline(block.content, $pos.parentOffset, block.content.size)))
  const container = $pos.node(D - 1)
  const arr = container.content.content.slice()
  arr.splice($pos.index(D - 1), 1, left, right)
  return replaceContentAtDepth($pos, D - 1, Fragment.from(arr))
}

function ensureNonEmpty(doc) {
  if (doc.content.childCount > 0) return doc
  const para = doc.type.schema.nodes[doc.type.schema.spec.defaultBlock || 'paragraph']
  return doc.copy(Fragment.from([para.create()]))
}

// ---- block-level and mark transforms (depth-general) ----------------------

// Visit every textblock overlapping [from, to] at any depth and replace it with
// fn(block, localFrom, localTo).
function mapTextblocks(doc, from, to, fn) {
  function recurse(node, contentStart) {
    let pos = contentStart
    let changed = false
    const out = []
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i)
      const childStart = pos
      const childEnd = childStart + child.nodeSize
      let next = child
      if (!child.isText && !child.isLeaf) {
        if (child.isTextblock) {
          const cs = childStart + 1
          const ce = childEnd - 1
          const affected = from === to ? cs <= from && from <= ce : childStart < to && childEnd > from
          if (affected) {
            const lf = Math.max(0, Math.max(from, cs) - cs)
            const lt = Math.max(lf, Math.min(to, ce) - cs)
            next = fn(child, lf, lt) || child
          }
        } else {
          const overlaps = from === to ? childStart < from && childEnd > from : childStart < to && childEnd > from
          if (overlaps) next = recurse(child, childStart + 1)
        }
      }
      if (next !== child) changed = true
      out.push(next)
      pos = childEnd
    }
    return changed ? node.copy(Fragment.from(out)) : node
  }
  return recurse(doc, 0)
}

export function setBlockType(doc, from, to, type, attrs = null) {
  return mapTextblocks(doc, from, to, (block) => type.create(attrs, block.content))
}

export function setBlockAttr(doc, from, to, patch) {
  return mapTextblocks(doc, from, to, (block) => block.type.create({ ...block.attrs, ...patch }, block.content))
}

export function addMark(doc, from, to, mark) {
  return mapTextblocks(doc, from, to, (block, lf, lt) =>
    lt > lf ? block.copy(Fragment.from(mapInlineMarks(block.content, lf, lt, (t) => t.mark(mark.addToSet(t.marks))))) : block,
  )
}

export function removeMark(doc, from, to, mark) {
  return mapTextblocks(doc, from, to, (block, lf, lt) =>
    lt > lf ? block.copy(Fragment.from(mapInlineMarks(block.content, lf, lt, (t) => t.mark(mark.removeFromSet(t.marks))))) : block,
  )
}

export function clearMarks(doc, from, to) {
  return mapTextblocks(doc, from, to, (block, lf, lt) =>
    lt > lf ? block.copy(Fragment.from(mapInlineMarks(block.content, lf, lt, (t) => t.mark([])))) : block,
  )
}

export function markActiveInRange(doc, from, to, markType) {
  let every = true
  let sawAny = false
  function recurse(node, contentStart) {
    let pos = contentStart
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i)
      const childStart = pos
      const childEnd = childStart + child.nodeSize
      if (childStart < to && childEnd > from && !child.isText && !child.isLeaf) {
        if (child.isTextblock) {
          const cs = childStart + 1
          const ce = childEnd - 1
          const lf = Math.max(from, cs) - cs
          const lt = Math.min(to, ce) - cs
          if (lt > lf) {
            sawAny = true
            every = every && marksInRange(child.content, lf, lt, markType, 'every')
          }
        } else {
          recurse(child, childStart + 1)
        }
      }
      pos = childEnd
    }
  }
  recurse(doc, 0)
  return sawAny ? every : false
}
