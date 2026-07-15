// A Fragment is an immutable, ordered list of child nodes. It caches its total
// size (in the flat position coordinate system) so position math is cheap.

export class Fragment {
  constructor(content, size) {
    this.content = content // Node[]
    this.size = size == null ? content.reduce((s, n) => s + n.nodeSize, 0) : size
  }

  get childCount() {
    return this.content.length
  }

  child(i) {
    const node = this.content[i]
    if (!node) throw new RangeError(`Index ${i} out of range for fragment`)
    return node
  }

  maybeChild(i) {
    return this.content[i] || null
  }

  get firstChild() {
    return this.content[0] || null
  }

  get lastChild() {
    return this.content[this.content.length - 1] || null
  }

  // Locate the child that contains content position `pos`.
  // Returns { index, offset } where `offset` is the start position of `index`.
  // A position exactly on a child boundary resolves to the following child.
  findIndex(pos) {
    if (pos <= 0) return { index: 0, offset: 0 }
    if (pos >= this.size) return { index: this.content.length, offset: this.size }
    let cur = 0
    for (let i = 0; i < this.content.length; i++) {
      const end = cur + this.content[i].nodeSize
      if (pos < end) return { index: i, offset: cur }
      if (pos === end) return { index: i + 1, offset: end }
      cur = end
    }
    return { index: this.content.length, offset: this.size }
  }

  // Structural helpers (return new fragments; never mutate).
  replaceChild(index, node) {
    const copy = this.content.slice()
    copy[index] = node
    return new Fragment(copy)
  }

  cutByIndex(from, to) {
    if (from === to) return Fragment.empty
    return new Fragment(this.content.slice(from, to))
  }

  append(other) {
    if (!other.size) return this
    if (!this.size) return other
    return new Fragment(this.content.concat(other.content))
  }

  forEach(fn) {
    let pos = 0
    for (let i = 0; i < this.content.length; i++) {
      const child = this.content[i]
      fn(child, pos, i)
      pos += child.nodeSize
    }
  }

  toJSON() {
    return this.content.map((n) => n.toJSON())
  }

  static from(nodes) {
    if (!nodes) return Fragment.empty
    if (nodes instanceof Fragment) return nodes
    if (Array.isArray(nodes)) {
      return nodes.length ? new Fragment(nodes) : Fragment.empty
    }
    return new Fragment([nodes]) // a single node
  }

  static empty = new Fragment([], 0)
}
