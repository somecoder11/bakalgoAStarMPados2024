import { sudokuGenerator } from "./generator.js"

/**
 * 
 * @param {Object} obj 
 * @returns Deepcopy of the object
 */
export function deepcopy(obj) {
    return structuredClone(obj)
    // return JSON.parse(JSON.stringify(obj))
}

export function getNewGivens(level) {
    const s = sudokuGenerator.generate(level)
    const givens = []
    for (let i = 0; i < 9; i++) {
        const row = []
        for (let j = 0; j < 9; j++) {
            if (s[i * 9 + j] === ".") {
                row.push(0)
            } else {
                row.push(parseInt(s[i * 9 + j]))
            }
        }
        givens.push(row)
    }
    return givens
}

/**
 * 
 * @param {number[][]} board 
 * @returns true or false
 */
export function isSolvedSudoku(board) {
    // Check for 0 (empty cells)
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) {
                return false
            }
        }
    }
    return isValidBoard(board)
}


/**
 * 
 * @param {number[][]} board 
 * @returns true or false
 */
export function isValidBoard(board) {
    // Check rows
    for (let i = 0; i < 9; i++) {
        const rowSet = new Set();
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) continue
            if (rowSet.has(board[i][j])) return false
            rowSet.add(board[i][j])
        }
    }

    // Check columns
    for (let j = 0; j < 9; j++) {
        const colSet = new Set();
        for (let i = 0; i < 9; i++) {
            if (board[i][j] === 0) continue
            if (colSet.has(board[i][j])) return false
            colSet.add(board[i][j])
        }
    }

    // Check 3x3 sub-grids
    for (let row = 0; row < 9; row += 3) {
        for (let col = 0; col < 9; col += 3) {
            const boxSet = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const val = board[row + i][col + j]
                    if (val === 0) continue
                    if (boxSet.has(val)) return false
                    boxSet.add(val)
                }
            }
        }
    }
    return true
}