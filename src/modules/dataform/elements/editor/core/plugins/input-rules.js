import { Plugin } from '../state/plugin.js'
import { resolve } from '../model/resolve.js'
import { TextSelection } from '../state/selection.js'
import { wrapInList, wrapInNode } from '../transform/list.js'

// Input rules run when the user types a trigger character (via the view's
// handleTextInput hook). Each rule matches the block text ending at the caret and,
// on a hit, rewrites the block — e.g. "## " becomes a heading. Because we run on
// `beforeinput`, the trigger character itself is consumed, not inserted.

export function inputRules(rules) {
  return new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        if (from !== to) return false
        const $from = resolve(view.state.doc, from)
        if (!$from.parent.isTextblock) return false
        const before = textBeforeCaret($from) + text
        for (const rule of rules) {
          const match = rule.pattern.exec(before)
          if (!match) continue
          const start = from - (match[0].length - text.length)
          if (rule.handler(view, match, { start, from })) return true
        }
        return false
      },
    },
  })
}

function textBeforeCaret($from) {
  let str = ''
  let offset = 0
  const target = $from.parentOffset
  for (const child of $from.parent.content.content) {
    if (offset >= target) break
    if (child.isText) str += child.text.slice(0, Math.min(child.text.length, target - offset))
    offset += child.nodeSize
  }
  return str
}

// Apply the matched rule as a single transaction: delete the trigger prefix, then
// run `build` to rewrite the (now collapsed) block.
function ruleTr(view, start, from, build) {
  const tr = view.state.tr.delete(start, from)
  build(tr, start)
  view.dispatch(tr)
  return true
}

// The default Markdown shortcuts.
export function markdownInputRules(schema) {
  const { heading, bullet_list, ordered_list, list_item, blockquote } = schema.nodes
  const rules = []

  if (heading) {
    rules.push({
      pattern: /^(#{1,6})\s$/,
      handler: (view, m, { start, from }) =>
        ruleTr(view, start, from, (tr, at) => tr.setBlockType(heading, { level: m[1].length }, at, at)),
    })
  }
  if (bullet_list && list_item) {
    rules.push({
      pattern: /^\s*([-*+])\s$/,
      handler: (view, m, { start, from }) =>
        ruleTr(view, start, from, (tr, at) => setDocFrom(tr, wrapInList(tr.doc, at, at, bullet_list, list_item))),
    })
  }
  if (ordered_list && list_item) {
    rules.push({
      pattern: /^\s*(\d+)[.)]\s$/,
      handler: (view, m, { start, from }) =>
        ruleTr(view, start, from, (tr, at) => setDocFrom(tr, wrapInList(tr.doc, at, at, ordered_list, list_item))),
    })
  }
  if (blockquote) {
    rules.push({
      pattern: /^\s*>\s$/,
      handler: (view, m, { start, from }) =>
        ruleTr(view, start, from, (tr, at) => setDocFrom(tr, wrapInNode(tr.doc, at, at, blockquote))),
    })
  }
  return rules
}

function setDocFrom(tr, result) {
  if (result) tr.setDoc(result.doc, TextSelection.create(result.doc, result.caret))
}
