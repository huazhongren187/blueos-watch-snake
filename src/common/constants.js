/**
 * Shared geometry and rule constants.
 *
 * Rule values (direction numbering, food value, try limit) are inherited from
 * the upstream project patorjk/JavaScript-Snake so the port stays faithful.
 */

export const BOARD_SIZE = 10
export const WALL_RING = 1
export const GRID_SPAN = BOARD_SIZE + WALL_RING * 2

export const CELL_EMPTY = 0
export const CELL_SNAKE = 1
export const CELL_FOOD = -1

export const DIR_UP = 0
export const DIR_RIGHT = 1
export const DIR_DOWN = 2
export const DIR_LEFT = 3
export const DIR_NONE = -1

export const ROW_SHIFT = [-1, 0, 1, 0]
export const COL_SHIFT = [0, 1, 0, -1]

export const START_ROW = 5
export const START_COL = 3
export const START_DIR = DIR_RIGHT
export const START_LEN = 3

export const TICK_MS = 320
export const MIN_TICK_MS = 170
export const SPEED_STEP = 10
export const MAX_CATCHUP = 3
export const INPUT_GUARD_MS = 120
export const FIRST_TICK_MS = 120
export const FOOD_TRY_LIMIT = 20000

export const STATE_READY = 'ready'
export const STATE_RUNNING = 'running'
export const STATE_OVER = 'over'

export const SKIN_EMPTY = 'sk-empty'
export const SKIN_BODY = 'sk-body'
export const SKIN_HEAD = 'sk-head'
export const SKIN_FOOD = 'sk-food'
