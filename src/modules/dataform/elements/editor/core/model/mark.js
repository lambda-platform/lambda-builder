// A Mark is a piece of inline formatting (strong, em, link, ...) attached to text.
// Marks are immutable value objects; a "mark set" is a plain, deduped array of Marks.

export class Mark {
  constructor(type, attrs = {}) {
    this.type = type // MarkType
    this.attrs = attrs
  }

  eq(other) {
    return (
      this === other ||
      (this.type === other.type && shallowEqualAttrs(this.attrs, other.attrs))
    )
  }

  // Return a new mark set with this mark added. A mark replaces any existing
  // mark of the same type (so re-applying a link updates its href), and drops
  // any mark this type excludes (e.g. superscript excludes subscript).
  addToSet(set) {
    const excludes = this.type.excludes || []
    const out = []
    let placed = false
    for (const m of set) {
      if (m.type === this.type) {
        placed = true
        out.push(this)
      } else if (excludes.includes(m.type.name)) {
        // dropped: this mark excludes it
      } else {
        out.push(m)
      }
    }
    if (!placed) out.push(this)
    return out
  }

  removeFromSet(set) {
    return set.filter((m) => m.type !== this.type)
  }

  isInSet(set) {
    return set.some((m) => this.eq(m))
  }

  toJSON() {
    const json = { type: this.type.name }
    if (Object.keys(this.attrs).length) json.attrs = this.attrs
    return json
  }

  // --- static helpers over mark sets ---

  static none = []

  static sameSet(a, b) {
    if (a === b) return true
    if (a.length !== b.length) return false
    return a.every((m, i) => m.eq(b[i]))
  }

  static setFrom(marks) {
    return marks && marks.length ? marks.slice() : Mark.none
  }
}

export function shallowEqualAttrs(a, b) {
  if (a === b) return true
  const ak = Object.keys(a)
  const bk = Object.keys(b)
  if (ak.length !== bk.length) return false
  return ak.every((k) => a[k] === b[k])
}
