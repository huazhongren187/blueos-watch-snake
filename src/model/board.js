import {
  BOARD_SIZE,
  GRID_SPAN,
  CELL_EMPTY,
  CELL_SNAKE,
  CELL_FOOD,
  FOOD_TRY_LIMIT
} from '../common/constants.js'
import { encCell } from '../common/utils.js'

/**
 * The grid keeps a one cell wall ring, exactly like the upstream game: the
 * playable area is 1..BOARD_SIZE on both axes and the border is pre-marked as
 * snake so the move code never needs an explicit bounds check.
 *
 * It is a flat Int8Array rather than an array of arrays on purpose. Whatever
 * the page keeps in `data` gets walked and wrapped by the reactive layer, and
 * the old shape handed it 14 sub-arrays plus 196 numbers on every single
 * reset. A typed array is opaque to that walk and costs 196 bytes total.
 */
export function createGrid() {
  const grid = new Int8Array(GRID_SPAN * GRID_SPAN)
  for (let row = 0; row < GRID_SPAN; row++) {
    for (let col = 0; col < GRID_SPAN; col++) {
      const isWall =
        row === 0 || col === 0 || row === GRID_SPAN - 1 || col === GRID_SPAN - 1
      grid[encCell(row, col)] = isWall ? CELL_SNAKE : CELL_EMPTY
    }
  }
  return grid
}

/**
 * Drops food on a random empty cell.
 *
 * Returns the packed cell code, or -1 when the board is full - the upstream
 * project treats "nowhere left to spawn" as a win, and so does this port.
 * The try limit is what keeps a nearly full board from freezing the watch
 * instead of ending the game.
 */
export function placeFood(grid, rand) {
  for (let tries = 0; tries < FOOD_TRY_LIMIT; tries++) {
    const row = 1 + Math.floor(rand() * BOARD_SIZE)
    const col = 1 + Math.floor(rand() * BOARD_SIZE)
    const code = encCell(row, col)
    if (grid[code] === CELL_EMPTY) {
      grid[code] = CELL_FOOD
      return code
    }
  }
  return -1
}
