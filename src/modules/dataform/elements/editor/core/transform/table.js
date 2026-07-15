import { Fragment } from '../model/fragment.js'
import { resolve } from '../model/resolve.js'
import { replaceContentAtDepth } from './transform.js'

// Structural table-editing transforms, colspan/rowspan aware. Each returns
// { doc, caret } or null when the operation does not apply. They rebuild the
// whole table immutably and splice it back into its container.

function tableContext(doc, pos) {
  const $pos = resolve(doc, pos)
  const tableDepth = $pos.depthOfType('table')
  if (tableDepth < 0) return null
  return {
    $pos,
    tableDepth,
    table: $pos.node(tableDepth),
    rowIndex: $pos.index(tableDepth),
    cellIndex: $pos.index(tableDepth + 1),
  }
}

function emptyCell(table) {
  const schema = table.type.schema
  return schema.nodes.table_cell.create(null, [schema.nodes.paragraph.create()])
}

function setSpan(cell, colspan, rowspan) {
  return cell.type.create({ ...cell.attrs, colspan, rowspan }, cell.content)
}

function replaceTable($pos, tableDepth, newNodes) {
  const containerDepth = tableDepth - 1
  const container = $pos.node(containerDepth)
  const arr = container.content.content.slice()
  arr.splice($pos.index(containerDepth), 1, ...newNodes)
  return replaceContentAtDepth($pos, containerDepth, Fragment.from(arr))
}

// Map the table onto a rectangular grid so spanning cells resolve to their
// grid rectangle. grid[r][c] points at the entry of the cell covering that
// slot; `cells` lists each cell once with its DOM location and grid corner.
function buildMap(table) {
  const height = table.childCount
  const grid = Array.from({ length: height }, () => [])
  const cells = [] // { cell, row, index, top, left, colspan, rowspan }
  for (let r = 0; r < height; r++) {
    const rowNode = table.child(r)
    let c = 0
    for (let i = 0; i < rowNode.childCount; i++) {
      const cell = rowNode.child(i)
      while (grid[r][c]) c++
      const colspan = cell.attrs.colspan || 1
      const rowspan = cell.attrs.rowspan || 1
      const entry = { cell, row: r, index: i, top: r, left: c, colspan, rowspan }
      cells.push(entry)
      for (let dr = 0; dr < rowspan && r + dr < height; dr++) {
        for (let dc = 0; dc < colspan; dc++) grid[r + dr][c + dc] = entry
      }
      c += colspan
    }
  }
  let width = 0
  for (const row of grid) width = Math.max(width, row.length)
  return { grid, cells, width, height }
}

function caretEntry(map, rowIndex, cellIndex) {
  return map.cells.find((e) => e.row === rowIndex && e.index === cellIndex) || null
}

// DOM insertion index in row `r` for a new cell that should sit at grid
// column `col`: the number of cells starting in that row further left.
function domIndexAt(map, r, col) {
  let n = 0
  for (const e of map.cells) if (e.row === r && e.left < col) n++
  return n
}

// Caret position inside the first paragraph of cell (rowIndex, cellIndex).
function cellCaret(table, tableStart, rowIndex, cellIndex) {
  let pos = tableStart + 1
  for (let r = 0; r < rowIndex && r < table.childCount; r++) pos += table.child(r).nodeSize
  pos += 1
  const row = table.child(Math.min(rowIndex, table.childCount - 1))
  for (let i = 0; i < cellIndex && i < row.childCount; i++) pos += row.child(i).nodeSize
  return pos + 2
}

// Rebuild the table from row specs ({ node?, cells }, null cells are dropped)
// and splice it back. Caret lands in (caretRow, caretIndex) when given.
function finish(ctx, rowSpecs, caretRow = null, caretIndex = 0) {
  const { $pos, table, tableDepth } = ctx
  const rowType = table.type.schema.nodes.table_row
  const rowNodes = rowSpecs.map((spec) => {
    const cells = spec.cells.filter(Boolean)
    return spec.node ? spec.node.copy(Fragment.from(cells)) : rowType.create(null, Fragment.from(cells))
  })
  const newTable = table.copy(Fragment.from(rowNodes))
  const tableStart = $pos.before(tableDepth)
  let caret = tableStart + 4
  if (
    caretRow != null &&
    caretRow < newTable.childCount &&
    newTable.child(caretRow).childCount > 0
  ) {
    caret = cellCaret(newTable, tableStart, caretRow, Math.min(caretIndex, newTable.child(caretRow).childCount - 1))
  }
  return { doc: replaceTable($pos, tableDepth, [newTable]), caret }
}

function rowSpecsOf(table) {
  const specs = []
  table.content.forEach((row) => specs.push({ node: row, cells: row.content.content.slice() }))
  return specs
}

export function addTableColumn(doc, pos, after) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  const col = after ? me.left + me.colspan : me.left
  const specs = rowSpecsOf(ctx.table)
  const widened = new Set()
  for (let r = 0; r < map.height; r++) {
    const slot = col < map.width ? map.grid[r][col] : null
    if (slot && slot.left < col) {
      // a spanning cell crosses the boundary: widen it once, skip its rows
      if (!widened.has(slot)) {
        widened.add(slot)
        specs[slot.row].cells[slot.index] = setSpan(slot.cell, slot.colspan + 1, slot.rowspan)
      }
      continue
    }
    specs[r].cells.splice(domIndexAt(map, r, col), 0, emptyCell(ctx.table))
  }
  return finish(ctx, specs, me.row, domIndexAt(map, me.row, col))
}

export function addTableRow(doc, pos, after) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  const ri = after ? me.top + me.rowspan : me.top
  const specs = rowSpecsOf(ctx.table)
  const newCells = []
  if (ri >= map.height) {
    for (let c = 0; c < map.width; c++) newCells.push(emptyCell(ctx.table))
  } else {
    const deepened = new Set()
    for (let c = 0; c < map.width; c++) {
      const slot = map.grid[ri][c]
      if (slot && slot.top < ri) {
        // a spanning cell crosses the boundary: deepen it once, skip its columns
        if (!deepened.has(slot)) {
          deepened.add(slot)
          specs[slot.row].cells[slot.index] = setSpan(slot.cell, slot.colspan, slot.rowspan + 1)
        }
        c = slot.left + slot.colspan - 1
        continue
      }
      newCells.push(emptyCell(ctx.table))
    }
  }
  specs.splice(ri, 0, { node: null, cells: newCells })
  return finish(ctx, specs, ri, 0)
}

export function deleteTableColumn(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  if (map.width <= 1) return deleteTable(doc, pos)
  const col = me.left
  const specs = rowSpecsOf(ctx.table)
  const handled = new Set()
  for (let r = 0; r < map.height; r++) {
    const slot = map.grid[r][col]
    if (!slot || handled.has(slot)) continue
    handled.add(slot)
    specs[slot.row].cells[slot.index] =
      slot.colspan > 1 ? setSpan(slot.cell, slot.colspan - 1, slot.rowspan) : null
  }
  return finish(ctx, specs)
}

export function deleteTableRow(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  if (map.height <= 1) return deleteTable(doc, pos)
  const r = me.top
  const specs = rowSpecsOf(ctx.table)
  const relocated = []
  for (const e of map.cells) {
    if (e.top < r && e.top + e.rowspan > r) {
      // spans across the deleted row from above: shrink it
      specs[e.row].cells[e.index] = setSpan(e.cell, e.colspan, e.rowspan - 1)
    } else if (e.row === r && e.rowspan > 1 && r + 1 < map.height) {
      // starts in the deleted row and extends below: move it down, shrunk
      relocated.push({ left: e.left, node: setSpan(e.cell, e.colspan, e.rowspan - 1) })
    }
  }
  if (relocated.length) {
    const target = specs[r + 1].cells
    const lefts = map.cells.filter((e) => e.row === r + 1).map((e) => e.left)
    for (const rel of relocated.sort((a, b) => a.left - b.left)) {
      let idx = 0
      while (idx < lefts.length && lefts[idx] < rel.left) idx++
      target.splice(idx, 0, rel.node)
      lefts.splice(idx, 0, rel.left)
    }
  }
  specs.splice(r, 1)
  return finish(ctx, specs)
}

export function deleteTable(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const { $pos, table, tableDepth } = ctx
  const paragraph = table.type.schema.nodes.paragraph.create()
  const caret = $pos.before(tableDepth) + 1
  return { doc: replaceTable($pos, tableDepth, [paragraph]), caret }
}

// Merge the caret cell with the one directly to its right. Only allowed when
// both cells start on the same row and span the same rows.
export function mergeCellRight(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  const at = me.left + me.colspan
  const target = at < map.width ? map.grid[me.top][at] : null
  if (!target || target.top !== me.top || target.rowspan !== me.rowspan) return null
  const specs = rowSpecsOf(ctx.table)
  specs[me.row].cells[me.index] = me.cell.type.create(
    { ...me.cell.attrs, colspan: me.colspan + target.colspan },
    me.cell.content.append(target.cell.content)
  )
  specs[target.row].cells[target.index] = null
  return finish(ctx, specs, me.row, me.index)
}

// Merge the caret cell with the one directly below it. Only allowed when both
// cells start on the same column and span the same columns.
export function mergeCellDown(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me) return null
  const at = me.top + me.rowspan
  const target = at < map.height ? map.grid[at][me.left] : null
  if (!target || target.left !== me.left || target.colspan !== me.colspan) return null
  const specs = rowSpecsOf(ctx.table)
  specs[me.row].cells[me.index] = me.cell.type.create(
    { ...me.cell.attrs, rowspan: me.rowspan + target.rowspan },
    me.cell.content.append(target.cell.content)
  )
  specs[target.row].cells[target.index] = null
  return finish(ctx, specs, me.row, me.index)
}

// Split a merged cell back into 1x1 cells; the content stays in the top-left.
export function splitCell(doc, pos) {
  const ctx = tableContext(doc, pos)
  if (!ctx) return null
  const map = buildMap(ctx.table)
  const me = caretEntry(map, ctx.rowIndex, ctx.cellIndex)
  if (!me || (me.colspan === 1 && me.rowspan === 1)) return null
  const specs = rowSpecsOf(ctx.table)
  specs[me.row].cells[me.index] = setSpan(me.cell, 1, 1)
  const extras = Array.from({ length: me.colspan - 1 }, () => emptyCell(ctx.table))
  specs[me.row].cells.splice(me.index + 1, 0, ...extras)
  for (let r = me.top + 1; r < me.top + me.rowspan && r < map.height; r++) {
    const fill = Array.from({ length: me.colspan }, () => emptyCell(ctx.table))
    specs[r].cells.splice(domIndexAt(map, r, me.left), 0, ...fill)
  }
  return finish(ctx, specs, me.row, me.index)
}

export function inTable(doc, pos) {
  return resolve(doc, pos).depthOfType('table') >= 0
}
