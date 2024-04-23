/**
 * @typedef {Object} TimelineEntry
 * @property {number[][]} board
 * @property {number[][][]} possibilities
 * @property {number[][]} counters
 * @property {boolean} isSolved
 * @property {boolean} isValid
 * @property {number[][]} givens
 * @property {number} index
 * @property {number[]} line
 * @property {string} comment
 * @property {Coordinates} problem
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} row
 * @property {number} column
 */

/**
 * @typedef {Object} Actions
 * @property {string} errorMessage
 * @property {Coordinates} focused
 */


/**
 * @typedef {Object} State
 * @property {TimelineEntry} gamestate
 * @property {Actions} actions
 * @property {Boolean} isSolvable
 * @property {Boolean} isBacktracked
 * @property {Boolean} inExpertMode
 */