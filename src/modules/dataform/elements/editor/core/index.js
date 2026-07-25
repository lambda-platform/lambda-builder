// @lambda-editor/core — public API surface.
// Framework wrappers (Vue, React, ...) build only on top of these exports.

// model
export { Schema, NodeType, MarkType, Node, TextNode, Fragment, Mark } from './model/index.js'

// state
export { EditorState, Transaction, TextSelection, Plugin, PluginKey } from './state/index.js'

// view
export { EditorView, serializeHTML, parseHTML } from './view/index.js'

// commands
export {
  chainCommands,
  toggleMark,
  setBlockType,
  toggleBlockType,
  splitBlock,
  insertHardBreak,
  deleteBackward,
  deleteForward,
  setLink,
  applyMark,
  removeMarkType,
  setAlign,
  setLineHeight,
  clearFormatting,
  insertImage,
  selectAll,
  isMarkActive,
  isBlockActive,
  currentBlock,
  toggleList,
  indentListItem,
  outdentListItem,
  isInList,
  toggleBlockquote,
  isInBlockquote,
  insertHorizontalRule,
  insertEmbed,
  insertTable,
  tableNextCell,
  tablePrevCell,
  isInTable,
  tableAddColumnBefore,
  tableAddColumnAfter,
  tableAddRowBefore,
  tableAddRowAfter,
  tableDeleteColumn,
  tableDeleteRow,
  tableDeleteTable,
  tableMergeRight,
  tableMergeDown,
  tableSplitCell,
} from './commands/index.js'

// plugins
export {
  keymap,
  history,
  undo,
  redo,
  historyKey,
  baseKeymap,
  inputRules,
  markdownInputRules,
  trailingBlock,
  ensureTrailingBlock,
} from './plugins/index.js'

// schema
export { basicSchema } from './schema/index.js'
