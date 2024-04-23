import { deepcopy, isSolvedSudoku } from "./utils.js"
import { Recorder } from "./recorder.js"

export class Solver {
    #recorder
    #expertMode
    constructor(expertMode) {
        this.#expertMode = expertMode
    }

    #findNextEmpty(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    return [i, j]
                }
            }
        }
        return [-1, -1]
    }


    #validate(board) {
        for (let number = 1; number <= 9; number++) {
            for (let i = 0; i < 9; i++) {
                let rowSet = new Set();
                let colSet = new Set();
                let squareSet = new Set();

                for (let j = 0; j < 9; j++) {
                    // Check row
                    if (board[i][j] === number) {
                        if (rowSet.has(number)) return false;
                        rowSet.add(number);
                    }

                    // Check column
                    if (board[j][i] === number) {
                        if (colSet.has(number)) return false;
                        colSet.add(number);
                    }

                    // Check 3x3 square
                    let squareRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
                    let squareCol = 3 * (i % 3) + (j % 3);
                    if (board[squareRow][squareCol] === number) {
                        if (squareSet.has(number)) return false;
                        squareSet.add(number);
                    }
                }
            }
        }
        return true;
    }

    #firstSolution = true
    #firstSolutionIndex = -1
    #unique = true


    #solve(state) {
        const [r, c] = this.#findNextEmpty(state.board)
        if (r === -1) {
            if (this.#firstSolution) {
                this.#firstSolution = false
                this.#firstSolutionIndex = this.#recorder.timeline.length - 1
                return false
            } else {
                this.#unique = false
                return true
            }
        }
        const copy = deepcopy(state)
        for (let nr = 1; nr < 10; nr++) {
            if (state.possibilities[r][c][nr - 1] === 0) continue
            // this.#recorder.record2(state, [18], [`Try nr ${nr} in sq(${r}, ${c}) with FIX-SQUARE`])
            state.reason = `backtracking ${r} ${c}`
            this.#fixSquare(r, c, nr, state, "backtracking")

            if (this.#checkIfSolutionStillPossible(state)) {
                // ========== for code comment start ==========
                // const [r, c] = this.#findNextEmpty(state.board)
                // if (r === -1) {

                // } else {
                //     this.#recorder.record2(state, [19], [`Recursive BACKTRACK on sq(${r}, ${c})`])
                // }
                // ========== for code comment end ==========
                if (this.#solve(state)) {
                    return true
                }
            }
            const { board, counters, possibilities } = deepcopy(copy)
            state.board = board
            state.counters = counters
            state.possibilities = possibilities
        }
        return false
    }

    #checkIfSolutionStillPossible(state) {
        // check for no valid solution
        for (let i = 0; i < 27; i++) { // go through all groups
            if (state.counters[i].some(counter => counter < 1)) { // check if any counter in group smaller one
                return false
            }
        }

        // validate sudoku
        if (!this.#validate(state.board)) {
            return false
        }

        // check if any field has 0 possibilities
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (state.board[i][j] === 0 && state.possibilities[i][j].filter(n => n === 1).length === 0) {
                    return false
                }
            }
        }
        return true
    }

    #fixSquare(r, c, nr, state, from) {
        const idiv = (a, b) => Math.floor(a / b)
        const b = idiv(r, 3) * 3 + idiv(c, 3)

        state.board[r][c] = nr
        state.from[r][c] = from
        // this.#recorder.record2(state, [1], [`Assigned nr ${nr} to sq(${r + 1}, ${c + 1}).`])


        // row
        for (let nr0 = 1; nr0 < 10; nr0++) {
            if (nr0 !== nr && state.possibilities[r][c][nr0 - 1]) {
                state.counters[r][nr0 - 1] -= 1
            }
        }
        // this.#recorder.record2(state, [4], [`Decremented counters for row G of sq(${r + 1}, ${c + 1}).`])

        // column
        for (let nr0 = 1; nr0 < 10; nr0++) {
            if (nr0 !== nr && state.possibilities[r][c][nr0 - 1]) {
                state.counters[9 + c][nr0 - 1] -= 1
            }
        }
        // this.#recorder.record2(state, [4], [`Decremented counters for col G of sq(${r + 1}, ${c + 1}).`])

        // block
        for (let nr0 = 1; nr0 < 10; nr0++) {
            if (nr0 !== nr && state.possibilities[r][c][nr0 - 1]) {
                state.counters[18 + b][nr0 - 1] -= 1
            }
        }
        // this.#recorder.record2(state, [4], [`Decremented counters for block G of sq(${r + 1}, ${c + 1}).`])


        state.possibilities[r][c] = state.possibilities[r][c].map(() => 0)

        // row
        let r0 = r
        for (let c0 = 0; c0 < 9; c0++) {
            if (!(r === r0 && c === c0) && state.possibilities[r0][c0][nr - 1]) {
                state.possibilities[r0][c0][nr - 1] = 0
                const b0 = idiv(r0, 3) * 3 + idiv(c0, 3)

                state.counters[9 + c0][nr - 1] -= 1
                state.counters[18 + b0][nr - 1] -= 1
            }
        }
        // this.#recorder.record2(state, [5, 6, 7, 8], ["", `Removed nr ${nr} from all sqs in row G ${r0 + 1}.`, "", `Decremented counters for col and block G'.`])


        // column
        let c0 = c
        for (let r0 = 0; r0 < 9; r0++) {
            if (!(r === r0 && c === c0) && state.possibilities[r0][c0][nr - 1]) {
                state.possibilities[r0][c0][nr - 1] = 0
                const b0 = idiv(r0, 3) * 3 + idiv(c0, 3)

                state.counters[r0][nr - 1] -= 1
                state.counters[18 + b0][nr - 1] -= 1
            }
        }
        // this.#recorder.record2(state, [5, 6, 7, 8], ["", `Removed nr ${nr} from all sqs in col G ${c0 + 1}.`, "", `Decremented counters for row and block G'.`])

        // block
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let r0 = idiv(r, 3) * 3 + i
                let c0 = idiv(c, 3) * 3 + j
                if (!(r === r0 && c === c0) && state.possibilities[r0][c0][nr - 1]) {
                    state.possibilities[r0][c0][nr - 1] = 0

                    state.counters[r0][nr - 1] -= 1
                    state.counters[9 + c0][nr - 1] -= 1
                }
            }
        }
        // this.#recorder.record2(state, [5, 6, 7, 8], ["", `Removed nr ${nr} from all sqs in block G ${b + 1}.`, "", `Decremented counters for row and col G'.`])

        this.#recorder.record2(state, [-1], [`Set sq(${r}, ${c}) to nr ${nr}`])

        if (this.#checkIfSolutionStillPossible(state) === false) {
            return false
        }


        // not fixed and only one possibility
        for (let i = 0; i < 9; i++) { // go through all rows
            for (let j = 0; j < 9; j++) { // go through all columns
                if (state.board[i][j] > 0) continue // sq already set
                if (state.possibilities[i][j].filter(n => n === 1).length !== 1) continue // sq more than 1 possibility
                const k = state.possibilities[i][j].findIndex(n => n === 1) // find nr k+1 which is possible
                // this.#recorder.record2(state, [10], [`Single possible nr ${k + 1} for unassigned sq(${i + 1}, ${j + 1})`])
                state.reason = `possibility ${i} ${j}`
                if (this.#fixSquare(i, j, k + 1, state, "implication") === false) return false
            }
        }

        // counter has been reduced to 1
        for (let g = 0; g < 27; g++) { // go through all groups
            for (let n = 0; n < 9; n++) { // go through all counters of group
                if (state.counters[g][n] === 1) { // check if nr n+1 has counter of 1
                    if (g < 9) { // if group is row
                        loop: for (let j = 0; j < 9; j++) { // go through all sq in row
                            if (state.possibilities[g][j][n] === 1) { // found sq where nr n+1 is allowed
                                // this.#recorder.record2(state, [13], [`row ${g + 1}: Counter reduced to 1; sq(${g + 1}, ${j + 1}) potential for nr ${n + 1}.`])
                                state.reason = `row ${g} ${n}`
                                if (this.#fixSquare(g, j, n + 1, state, "implication") === false) return false
                                break loop
                            }
                        }
                    } else if (g < 18) { // if group is column
                        const g1 = g - 9
                        loop: for (let j = 0; j < 9; j++) { // go through all sq in column
                            if (state.possibilities[j][g1][n] === 1) { // found sq where nr n+1 is allowed
                                // this.#recorder.record2(state, [13], [`column ${g1 + 1}: Counter reduced to 1; sq(${j + 1}, ${g1 + 1}) potential for nr ${n + 1}.`])
                                state.reason = `col ${g1} ${n}`
                                if (this.#fixSquare(j, g1, n + 1, state, "implication") === false) return false
                                break loop
                            }
                        }
                    }
                    else { // if group is block
                        const g1 = g - 18
                        loop: for (let j = 0; j < 3; j++) { // go through all sq in block
                            for (let k = 0; k < 3; k++) { // go through all sq in block
                                if (state.possibilities[idiv(g1, 3) * 3 + j][(g1 % 3) * 3 + k][n] === 1) { // found sq where nr n+1 is allowed
                                    // this.#recorder.record2(state, [13], [`block ${g1 + 1}: Counter reduced to 1; target sq(${idiv(g1, 3) * 3 + j + 1}, ${(g1 % 3) * 3 + k + 1}) for nr ${n + 1}.`])
                                    state.reason = `block ${g1} ${n}`
                                    if (this.#fixSquare(idiv(g1, 3) * 3 + j, (g1 % 3) * 3 + k, n + 1, state, "implication") === false) return false
                                    break loop
                                }
                            }
                        }
                    }
                }
            }
        }
        return true
    }


    solve(givens, callback) {
        this.#recorder = new Recorder(this.#expertMode, givens,
            () => callback(
                [deepcopy(this.#recorder.timeline), isSolvable, isBacktracked,
                    backtrackingIndex, this.#unique, this.#firstSolutionIndex, true]
            ))
        const board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]


        const counters = []
        for (let i = 0; i < 27; i++) {
            counters.push([9, 9, 9, 9, 9, 9, 9, 9, 9])
        }

        const countersUsed = []
        for (let i = 0; i < 27; i++) {
            countersUsed.push([1, 1, 1, 1, 1, 1, 1, 1, 1])
        }

        const possibilities = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                row.push([1, 1, 1, 1, 1, 1, 1, 1, 1])
            }
            possibilities.push(row)
        }

        const from = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                row.push("unset")
            }
            from.push(row)
        }


        const state = {
            board: board, counters: counters, possibilities: possibilities, from: from,
            countersUsed: countersUsed, reason: null
        }

        this.#recorder.record2(state, [24], ["Initialization."])


        // const givens = [
        //     [0, 0, 0, 0, 1, 9, 0, 0, 4],
        //     [0, 2, 0, 0, 0, 8, 0, 0, 0],
        //     [0, 6, 0, 0, 0, 0, 3, 0, 0],
        //     [0, 0, 9, 4, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 5, 0, 7, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 9, 1],
        //     [0, 1, 0, 0, 0, 0, 4, 0, 0],
        //     [0, 3, 0, 0, 0, 0, 0, 0, 0],
        //     [6, 0, 0, 0, 8, 0, 0, 0, 2],
        // ]

        let isSolvable = true
        loop: for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (givens[i][j] > 0) {
                    state.reason = `given ${i} ${j}`
                    isSolvable = this.#fixSquare(i, j, givens[i][j], state, "given")
                    if (isSolvable === false) {
                        break loop
                    }

                }
            }
        }

        const [r, c] = this.#findNextEmpty(state.board)
        let isBacktracked = false
        const backtrackingIndex = this.#recorder.timeline.length - 1
        if (r !== -1 && isSolvable) {
            this.#recorder.record2(state, [26], ["Puzzle not solved, apply BACKTRACKING."])
            isBacktracked = true
            this.#solve(state)
        }

        // If its unique you would use the this.#unique
        // otherwise it just found before backtracking (so firstSolutionIndex is -1)
        // or you had to backtrack, but you found out that the firstSolution is the only solution
        if (this.#firstSolutionIndex === -1) {
            isSolvable = isSolvedSudoku(this.#recorder.timeline[this.#recorder.timeline.length - 1].board)
        } else {
            isSolvable = isSolvedSudoku(this.#recorder.timeline[this.#firstSolutionIndex].board)
        }

        return [deepcopy(this.#recorder.timeline), isSolvable, isBacktracked,
            backtrackingIndex, this.#unique, this.#firstSolutionIndex, false]

    }


}



function isValidSudoku(board) {
    // Check rows
    for (let row of board) {
        if (!isValidSet(row)) {
            return false;
        }
    }

    // Check columns
    for (let col = 0; col < board[0].length; col++) {
        let column = [];
        for (let row = 0; row < board.length; row++) {
            column.push(board[row][col]);
        }
        if (!isValidSet(column)) {
            return false;
        }
    }

    // Check 3x3 sub-grids
    for (let row = 0; row < 9; row += 3) {
        for (let col = 0; col < 9; col += 3) {
            let square = [];
            for (let i = row; i < row + 3; i++) {
                for (let j = col; j < col + 3; j++) {
                    square.push(board[i][j]);
                }
            }
            if (!isValidSet(square)) {
                return false;
            }
        }
    }

    return true;
}

function isValidSet(nums) {
    let numSet = new Set();
    for (let num of nums) {
        if (num !== 0 && numSet.has(num)) {
            return false;
        }
        numSet.add(num);
    }
    return true;
}
