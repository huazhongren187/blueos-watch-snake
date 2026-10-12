import {
  BOARD_SIZE,
  GRID_SPAN,
  CELL_EMPTY,
  CELL_SNAKE,
  CELL_FOOD,
  DIR_NONE,
  ROW_SHIFT,
  COL_SHIFT,
  START_ROW,
  START_COL,
  START_DIR,
  START_LEN,
  SKIN_EMPTY,
  SKIN_BODY,
  SKIN_HEAD,
  SKIN_FOOD
} from '../common/constants.js'
import {
  isOpposite,
  isValidDir,
  encCell,
  encRow,
  encCol
} from '../common/utils.js'
import { createGrid, placeFood } from './board.js'

const CAPACITY = GRID_SPAN * GRID_SPAN

// Step results are shared singletons. A tick used to allocate one result
// object and 156 row objects; on a watch that churn is what shows up as
// stutter, so nothing in the hot path allocates at all.
const IDLE = { moved: false, dead: false, ate: false }
const MOVED = { moved: true, dead: false, ate: false }
const ATE = { moved: true, dead: false, ate: true }
const DEAD = { moved: false, dead: true, ate: false }

function defaultRand() {
  return Math.random()
}

/**
 * Body is kept head first (index 0) inside one Uint8Array with an explicit
 * length, so growing and shrinking the snake never allocates. The upstream
 * project walks a doubly linked list and recycles the tail node as the new
 * head; a plain typed array does the same job here because the board is
 * repainted in place instead of moving DOM nodes around.
 */
export function createGame(rand) {
  const pick = rand || defaultRand
  const grid = createGrid()
  const body = new Uint8Array(CAPACITY)
  let len = 0
  for (let i = 0; i < START_LEN; i++) {
    const code = encCell(START_ROW, START_COL - i)
    grid[code] = CELL_SNAKE
    body[len] = code
    len += 1
  }
  const food = placeFood(grid, pick)
  return {
    grid: grid,
    body: body,
    len: len,
    food: food,
    dir: START_DIR,
    queued: DIR_NONE,
    eaten: 0,
    alive: true,
    won: food < 0
  }
}

/**
 * Queues a turn. At most one turn is buffered, so two fast taps in the same
 * tick still both register - that is the upstream "premove" behaviour.
 * Reversing onto your own neck is rejected.
 */
export function turn(game, dir) {
  if (!game || !isValidDir(dir)) {
    return false
  }
  const current = game.queued !== DIR_NONE ? game.queued : game.dir
  if (isOpposite(dir, current) || dir === current) {
    return false
  }
  game.queued = dir
  return true
}

export function step(game, rand) {
  if (!game || !game.alive || game.won) {
    return IDLE
  }

  if (game.queued !== DIR_NONE) {
    game.dir = game.queued
    game.queued = DIR_NONE
  }

  const head = game.body[0]
  const row = encRow(head) + ROW_SHIFT[game.dir]
  const col = encCol(head) + COL_SHIFT[game.dir]
  const code = encCell(row, col)
  const target = game.grid[code]

  if (target === CELL_SNAKE) {
    game.alive = false
    return DEAD
  }

  const ate = target === CELL_FOOD
  if (ate) {
    game.eaten += 1
  } else {
    const tail = game.len - 1
    game.len = tail
    game.grid[game.body[tail]] = CELL_EMPTY
  }

  // Unshift by shifting the segment one slot to the right. At most 144 byte
  // moves, no allocation, no object churn.
  for (let i = game.len; i > 0; i--) {
    game.body[i] = game.body[i - 1]
  }
  game.body[0] = code
  game.len += 1
  game.grid[code] = CELL_SNAKE

  if (ate) {
    const next = placeFood(game.grid, rand || defaultRand)
    if (next >= 0) {
      game.food = next
    } else {
      game.food = -1
      game.won = true
    }
  }

  return ate ? ATE : MOVED
}

/**
 * Builds the row objects once. The page keeps these for the whole lifetime of
 * the game and only repaints them, so the reactive layer wraps this array a
 * single time instead of 156 new objects on every tick.
 *
 * Each cell carries one skin class name only - the geometry class lives on the
 * node itself, so no two classes ever fight over the same property.
 */
export function createRows() {
  const rows = []
  for (let row = 1; row <= BOARD_SIZE; row++) {
    const cells = []
    for (let col = 1; col <= BOARD_SIZE; col++) {
      cells.push({ skin: SKIN_EMPTY })
    }
    rows.push({ cells: cells })
  }
  return rows
}

/**
 * Repaints the existing row objects in place. Only cells whose skin actually
 * changed are written, so a normal tick touches four properties - the old head
 * becomes a body cell, the new head appears, the tail clears and the food
 * moves - instead of rebuilding the whole board.
 */
export function paintRows(rows, game) {
  if (!rows || !game) {
    return
  }
  const head = game.body[0]
  for (let row = 1; row <= BOARD_SIZE; row++) {
    const cells = rows[row - 1].cells
    for (let col = 1; col <= BOARD_SIZE; col++) {
      const code = encCell(row, col)
      const value = game.grid[code]
      let skin = SKIN_EMPTY
      if (value === CELL_FOOD) {
        skin = SKIN_FOOD
      } else if (value === CELL_SNAKE) {
        skin = code === head ? SKIN_HEAD : SKIN_BODY
      }
      const cell = cells[col - 1]
      if (cell.skin !== skin) {
        cell.skin = skin
      }
    }
  }
}
