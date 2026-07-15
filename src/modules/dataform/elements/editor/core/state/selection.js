// A text selection expressed in model positions. `anchor` is the fixed end,
// `head` the moving end; `from`/`to` are the normalized (low/high) pair.

export class TextSelection {
  constructor(anchor, head = anchor) {
    this.anchor = anchor
    this.head = head
    this.from = Math.min(anchor, head)
    this.to = Math.max(anchor, head)
  }

  get empty() {
    return this.from === this.to
  }

  eq(other) {
    return other instanceof TextSelection && other.anchor === this.anchor && other.head === this.head
  }

  toJSON() {
    return { type: 'text', anchor: this.anchor, head: this.head }
  }

  // Clamp both ends into the valid range of `doc`.
  static create(doc, anchor, head = anchor) {
    const max = doc.content.size
    return new TextSelection(clamp(anchor, 0, max), clamp(head, 0, max))
  }

  static atStart(doc) {
    return TextSelection.create(doc, 1)
  }

  // Caret at the end of the last textblock, descending through containers (lists,
  // tables) so the default selection always lands in editable inline content.
  static atEnd(doc) {
    let pos = null
    ;(function walk(node, start) {
      let p = start
      node.content.forEach((child) => {
        if (child.isTextblock) pos = p + 1 + child.content.size
        else if (!child.isLeaf && !child.isText) walk(child, p + 1)
        p += child.nodeSize
      })
    })(doc, 0)
    return TextSelection.create(doc, pos != null ? pos : Math.max(1, doc.content.size - 1))
  }

  static fromJSON(doc, json) {
    return TextSelection.create(doc, json.anchor, json.head)
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(v, max))
}
