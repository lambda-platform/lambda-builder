import {
  chainCommands,
  splitBlock,
  insertHardBreak,
  deleteBackward,
  deleteForward,
  selectAll,
} from '../commands/commands.js'
import {
  splitListItemCommand,
  indentListItem,
  outdentListItem,
  listBackspace,
  tableNextCell,
  tablePrevCell,
} from '../commands/list.js'
import { undo, redo } from './history.js'

// The minimum keymap that makes the editor usable. List-aware commands are tried
// first and fall through to the plain block commands when not in a list.
export const baseKeymap = {
  Enter: chainCommands(splitListItemCommand, splitBlock),
  'Shift-Enter': insertHardBreak,
  Backspace: chainCommands(listBackspace, deleteBackward),
  Delete: deleteForward,
  Tab: chainCommands(tableNextCell, indentListItem),
  'Shift-Tab': chainCommands(tablePrevCell, outdentListItem),
  'Mod-a': selectAll,
  'Mod-z': undo,
  'Mod-y': redo,
  'Shift-Mod-z': redo,
}
