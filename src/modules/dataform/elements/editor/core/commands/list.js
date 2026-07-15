import { resolve } from '../model/resolve.js'
import { TextSelection } from '../state/selection.js'
import {
  wrapInList,
  liftListItem,
  sinkListItem,
  splitListItem,
  inListOfType,
  wrapInNode,
  unwrapNode,
  insertBlockAt,
} from '../transform/list.js'
import {
  addTableColumn,
  addTableRow,
  deleteTableColumn,
  deleteTableRow,
  deleteTable as deleteTableTr,
  mergeCellRight,
  mergeCellDown,
  splitCell,
  inTable,
} from '../transform/table.js'

// Commands that drive the structural list operations. Each list transform returns
// { doc, caret }; these wrap that in a transaction via the low-level setDoc.

function applyResult(state, dispatch, result) {
  if (!result) return false
  if (dispatch) {
    dispatch(state.tr.setDoc(result.doc, TextSelection.create(result.doc, result.caret)))
  }
  return true
}

// Toggle a list on/off: wrap the selection when not already in this list type,
// otherwise lift the current item out.
export function toggleList(listType, itemType) {
  return (state, dispatch) => {
    const { from, to } = state.selection
    if (inListOfType(state.doc, from, listType)) {
      return applyResult(state, dispatch, liftListItem(state.doc, from))
    }
    return applyResult(state, dispatch, wrapInList(state.doc, from, to, listType, itemType))
  }
}

export function indentListItem(state, dispatch) {
  return applyResult(state, dispatch, sinkListItem(state.doc, state.selection.from))
}

export function outdentListItem(state, dispatch) {
  return applyResult(state, dispatch, liftListItem(state.doc, state.selection.from))
}

// Enter inside a list item.
export function splitListItemCommand(state, dispatch) {
  if (!state.selection.empty) return false
  return applyResult(state, dispatch, splitListItem(state.doc, state.selection.from))
}

// Backspace at the very start of a list item lifts it out of the list.
export function listBackspace(state, dispatch) {
  const { selection } = state
  if (!selection.empty) return false
  const $pos = resolve(state.doc, selection.from)
  if ($pos.depthOfType('list_item') < 1) return false
  if ($pos.parentOffset !== 0) return false
  if ($pos.index($pos.depthOfType('list_item')) !== 0) return false
  return applyResult(state, dispatch, liftListItem(state.doc, selection.from))
}

export function isInList(state, listType) {
  return inListOfType(state.doc, state.selection.from, listType)
}

// ---- blockquote / horizontal rule / tables ----

export function toggleBlockquote(state, dispatch) {
  const bq = state.schema.nodes.blockquote
  if (!bq) return false
  const $pos = resolve(state.doc, state.selection.from)
  if ($pos.depthOfType('blockquote') >= 1) {
    return applyResult(state, dispatch, unwrapNode(state.doc, state.selection.from, 'blockquote'))
  }
  return applyResult(state, dispatch, wrapInNode(state.doc, state.selection.from, state.selection.to, bq))
}

export function isInBlockquote(state) {
  return resolve(state.doc, state.selection.from).depthOfType('blockquote') >= 1
}

export function insertHorizontalRule(state, dispatch) {
  const hr = state.schema.nodes.horizontal_rule
  if (!hr) return false
  return applyResult(state, dispatch, insertBlockAt(state.doc, state.selection.from, hr.create()))
}

export function insertTable(rows = 3, cols = 3) {
  return (state, dispatch) => {
    const { table, table_row, table_cell, paragraph } = state.schema.nodes
    if (!table) return false
    const makeRow = () =>
      table_row.create(null, Array.from({ length: cols }, () => table_cell.create(null, [paragraph.create()])))
    const node = table.create(null, Array.from({ length: rows }, makeRow))
    const result = insertBlockAt(state.doc, state.selection.from, node)
    if (!result) return false
    if (dispatch) {
      // caret into the first cell: table-open + row-open + cell-open + paragraph-open
      const caret = result.insertedStart + 4
      dispatch(state.tr.setDoc(result.doc, TextSelection.create(result.doc, caret)))
    }
    return true
  }
}

function cellCaretPositions(table, tableStart) {
  const positions = []
  let rowPos = tableStart + 1
  table.content.forEach((row) => {
    let cellPos = rowPos + 1
    row.content.forEach((cell) => {
      positions.push(cellPos + 2) // inside the cell's first paragraph
      cellPos += cell.nodeSize
    })
    rowPos += row.nodeSize
  })
  return positions
}

function moveCell(state, dispatch, dir) {
  const $pos = resolve(state.doc, state.selection.from)
  const tableDepth = $pos.depthOfType('table')
  if (tableDepth < 1) return false
  const positions = cellCaretPositions($pos.node(tableDepth), $pos.before(tableDepth))
  const caret = state.selection.from
  let i = -1
  for (let k = 0; k < positions.length; k++) {
    if (positions[k] <= caret) i = k
    else break
  }
  const target = i < 0 ? null : positions[i + dir]
  if (target == null) return false
  if (dispatch) dispatch(state.tr.setSelection(TextSelection.create(state.doc, target)))
  return true
}

export function tableNextCell(state, dispatch) {
  return moveCell(state, dispatch, 1)
}
export function tablePrevCell(state, dispatch) {
  return moveCell(state, dispatch, -1)
}

// ---- table editing ----

export function isInTable(state) {
  return inTable(state.doc, state.selection.from)
}

export function tableAddColumnBefore(state, dispatch) {
  return applyResult(state, dispatch, addTableColumn(state.doc, state.selection.from, false))
}
export function tableAddColumnAfter(state, dispatch) {
  return applyResult(state, dispatch, addTableColumn(state.doc, state.selection.from, true))
}
export function tableAddRowBefore(state, dispatch) {
  return applyResult(state, dispatch, addTableRow(state.doc, state.selection.from, false))
}
export function tableAddRowAfter(state, dispatch) {
  return applyResult(state, dispatch, addTableRow(state.doc, state.selection.from, true))
}
export function tableDeleteColumn(state, dispatch) {
  return applyResult(state, dispatch, deleteTableColumn(state.doc, state.selection.from))
}
export function tableDeleteRow(state, dispatch) {
  return applyResult(state, dispatch, deleteTableRow(state.doc, state.selection.from))
}
export function tableDeleteTable(state, dispatch) {
  return applyResult(state, dispatch, deleteTableTr(state.doc, state.selection.from))
}
export function tableMergeRight(state, dispatch) {
  return applyResult(state, dispatch, mergeCellRight(state.doc, state.selection.from))
}
export function tableMergeDown(state, dispatch) {
  return applyResult(state, dispatch, mergeCellDown(state.doc, state.selection.from))
}
export function tableSplitCell(state, dispatch) {
  return applyResult(state, dispatch, splitCell(state.doc, state.selection.from))
}
