import { Plugin } from '../state/plugin.js'

// Bind key combinations to commands. Use 'Mod' for the platform primary modifier
// (Cmd on macOS, Ctrl elsewhere): e.g. { 'Mod-b': toggleMark(strong) }.

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')

export function keymap(bindings) {
  const normalized = {}
  for (const key in bindings) normalized[normalizeKeyName(key)] = bindings[key]

  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        const command = normalized[eventKeyName(event)]
        if (command && command(view.state, view.dispatch, view)) {
          event.preventDefault()
          return true
        }
        return false
      },
    },
  })
}

function normalizeKeyName(name) {
  const parts = name.split(/-(?!$)/)
  const key = parts[parts.length - 1]
  const mods = { alt: false, ctrl: false, shift: false, meta: false }
  for (let i = 0; i < parts.length - 1; i++) {
    const mod = parts[i].toLowerCase()
    if (mod === 'mod') mods[isMac ? 'meta' : 'ctrl'] = true
    else if (mod === 'cmd' || mod === 'meta' || mod === 'm') mods.meta = true
    else if (mod === 'alt' || mod === 'option' || mod === 'a') mods.alt = true
    else if (mod === 'ctrl' || mod === 'control' || mod === 'c') mods.ctrl = true
    else if (mod === 'shift' || mod === 's') mods.shift = true
    else throw new RangeError(`Unknown modifier '${parts[i]}' in key '${name}'`)
  }
  return buildName(mods, key)
}

function eventKeyName(event) {
  return buildName(
    { alt: event.altKey, ctrl: event.ctrlKey, shift: event.shiftKey, meta: event.metaKey },
    event.key,
  )
}

function buildName(mods, key) {
  let name = ''
  if (mods.alt) name += 'Alt-'
  if (mods.ctrl) name += 'Ctrl-'
  if (mods.meta) name += 'Meta-'
  if (mods.shift) name += 'Shift-'
  return name + baseKey(key)
}

function baseKey(key) {
  // Single printable characters are matched case-insensitively (Shift is a modifier).
  if (key.length === 1) return key.toLowerCase()
  return key
}
