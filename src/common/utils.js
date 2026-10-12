import {
  DIR_UP,
  DIR_RIGHT,
  DIR_DOWN,
  DIR_LEFT,
  DIR_NONE,
  GRID_SPAN
} from './constants.js'

/**
 * Cell positions travel around as a single packed number (row * span + col)
 * instead of `{ row, col }` objects. The board is only 14x14 so everything
 * fits in one byte, which lets both the grid and the snake body be typed
 * arrays - opaque to the reactive walk and one byte per cell.
 */
export function encCell(row, col) {
  return row * GRID_SPAN + col
}

export function encRow(code) {
  return Math.floor(code / GRID_SPAN)
}

export function encCol(code) {
  return code % GRID_SPAN
}

/**
 * In the upstream direction numbering the two opposites always differ by 2
 * (up/down = 0/2, left/right = 3/1), which makes this a single subtraction.
 */
export function isOpposite(a, b) {
  return Math.abs(a - b) === 2
}

export function isValidDir(dir) {
  return dir === 0 || dir === 1 || dir === 2 || dir === 3
}

export function clamp(value, low, high) {
  if (value < low) {
    return low
  }
  if (value > high) {
    return high
  }
  return value
}

/**
 * Maps a swipe direction onto the internal direction code. Both the string
 * form used by the watch touch layer and a plain numeric form are accepted so
 * the page never has to care which one arrives.
 */
export function swipeToDir(raw) {
  if (typeof raw === 'number') {
    return isValidDir(raw) ? raw : DIR_NONE
  }
  if (raw === 'up') {
    return DIR_UP
  }
  if (raw === 'right') {
    return DIR_RIGHT
  }
  if (raw === 'down') {
    return DIR_DOWN
  }
  if (raw === 'left') {
    return DIR_LEFT
  }
  return DIR_NONE
}
