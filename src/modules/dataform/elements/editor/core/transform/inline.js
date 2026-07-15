import { Fragment } from '../model/fragment.js'
import { Mark } from '../model/mark.js'

// Helpers that operate on a block's inline content (a Fragment of text/leaf
// nodes). All are pure and return plain arrays of nodes or new Fragments.

// Extract the inline nodes between two content offsets, slicing text nodes.
export function sliceInline(fragment, from, to) {
  const out = []
  if (from >= to) return out
  let cur = 0
  for (let i = 0; i < fragment.childCount; i++) {
    const child = fragment.child(i)
    const size = child.nodeSize
    const cEnd = cur + size
    if (cEnd <= from) {
      cur = cEnd
      continue
    }
    if (cur >= to) break
    const sFrom = Math.max(from, cur)
    const sTo = Math.min(to, cEnd)
    if (child.isText) {
      out.push(child.cut(sFrom - cur, sTo - cur))
    } else if (sFrom <= cur && sTo >= cEnd) {
      out.push(child) // whole inline leaf (e.g. hard_break)
    }
    cur = cEnd
  }
  return out
}

// Merge adjacent text nodes that share the same mark set and drop empty text.
export function normalizeInline(nodes) {
  const out = []
  for (const node of nodes) {
    if (node.isText) {
      if (node.text.length === 0) continue
      const last = out[out.length - 1]
      if (last && last.isText && Mark.sameSet(last.marks, node.marks)) {
        out[out.length - 1] = last.withText(last.text + node.text)
        continue
      }
    }
    out.push(node)
  }
  return out
}

export function inlineFragment(nodes) {
  return Fragment.from(normalizeInline(nodes))
}

// Apply a mark transformation to every text node overlapping [from, to),
// splitting boundary text nodes as needed.
export function mapInlineMarks(fragment, from, to, applyToTextNode) {
  const out = []
  let cur = 0
  for (let i = 0; i < fragment.childCount; i++) {
    const child = fragment.child(i)
    const size = child.nodeSize
    const cEnd = cur + size
    if (cEnd <= from || cur >= to || !child.isText) {
      out.push(child)
      cur = cEnd
      continue
    }
    const a = Math.max(from, cur) - cur
    const b = Math.min(to, cEnd) - cur
    if (a > 0) out.push(child.cut(0, a))
    out.push(applyToTextNode(child.cut(a, b)))
    if (b < size) out.push(child.cut(b, size))
    cur = cEnd
  }
  return normalizeInline(out)
}

// Collect the union/intersection of marks present across an inline range.
// `mode` is 'every' (mark present on all text in range) or 'some'.
export function marksInRange(fragment, from, to, markType, mode = 'every') {
  let sawText = false
  let result = mode === 'every'
  let cur = 0
  for (let i = 0; i < fragment.childCount; i++) {
    const child = fragment.child(i)
    const size = child.nodeSize
    const cEnd = cur + size
    if (cEnd <= from || cur >= to) {
      cur = cEnd
      continue
    }
    if (child.isText) {
      sawText = true
      const has = child.marks.some((m) => m.type === markType)
      if (mode === 'every') result = result && has
      else result = result || has
    }
    cur = cEnd
  }
  return sawText ? result : false
}
