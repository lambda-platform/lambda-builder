// Position helpers for the v1 "flat" document model, where a document is
//   doc > [ textblock, textblock, ... ] > [ inline, inline, ... ]
// i.e. every block is a direct child of the doc and holds inline content.
//
// The whole editor is built so that nested block containers (blockquote, lists)
// can be added later by generalizing these helpers, without changing the layers
// above them.

// Resolve a document position to the block that contains it.
// Returns { blockIndex, block, blockStart, offset } where:
//   - blockStart is the position just before the block's opening token,
//   - offset is the offset inside the block's inline content (0..content.size).
// A position on a block boundary snaps to the start (offset 0) of the following
// block, which is where a caret should sit after splitting/among blocks.
export function locate(doc, pos) {
  const blocks = doc.content
  if (blocks.childCount === 0) return { blockIndex: 0, block: null, blockStart: 0, offset: 0 }

  let cur = 0
  for (let i = 0; i < blocks.childCount; i++) {
    const block = blocks.child(i)
    const start = cur
    const size = block.nodeSize
    const contentEnd = start + size - 1 // position just before the closing token
    if (pos <= start) {
      return { blockIndex: i, block, blockStart: start, offset: 0 }
    }
    if (pos <= contentEnd) {
      return { blockIndex: i, block, blockStart: start, offset: pos - (start + 1) }
    }
    cur += size
  }

  // Past the end: clamp to the end of the last block's content.
  const last = blocks.childCount - 1
  const block = blocks.child(last)
  return {
    blockIndex: last,
    block,
    blockStart: doc.content.size - block.nodeSize,
    offset: block.content.size,
  }
}

// The document position of the start of a block's inline content.
export function blockContentStart(doc, blockIndex) {
  let cur = 0
  for (let i = 0; i < blockIndex; i++) cur += doc.content.child(i).nodeSize
  return cur + 1
}

// Clamp a raw position into the valid range [0, doc.content.size].
export function clampPos(doc, pos) {
  return Math.max(0, Math.min(pos, doc.content.size))
}

// Locate an inline offset inside a block's content Fragment.
// Returns { index, inlineOffset } where index is the inline child and
// inlineOffset is the character offset within it (for text nodes).
export function locateInline(fragment, offset) {
  let cur = 0
  for (let i = 0; i < fragment.childCount; i++) {
    const child = fragment.child(i)
    const end = cur + child.nodeSize
    if (offset < end) return { index: i, inlineOffset: offset - cur }
    if (offset === end) {
      // boundary after child i
      if (i === fragment.childCount - 1) return { index: i, inlineOffset: child.nodeSize }
      return { index: i + 1, inlineOffset: 0 }
    }
    cur = end
  }
  return { index: 0, inlineOffset: 0 }
}
