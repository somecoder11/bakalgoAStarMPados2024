import { isSolvedSudoku, deepcopy } from "./utils.js"

export class Recorder {
    /** @type {TimelineEntry[]} */
    #timeline = []
    #givens
    #expertMode
    #callback

    constructor(expertMode, givens, callback) {
        this.#expertMode = expertMode
        this.#givens = givens
        this.#callback = callback
    }

    record(squares, groups, givens, line, comment) {
        if (line !== -1) return
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
        squares.forEach(sq => board[sq.r][sq.c] = sq.value)

        const possibilities = [
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
        squares.forEach(sq => possibilities[sq.r][sq.c] = sq.possibilities)

        const counters = []
        groups.forEach(group => counters.push(group.counters))

        this.#timeline.push({
            board: board,
            possibilities: possibilities,
            counters: counters,
            isSolved: isSolvedSudoku(board),
            givens: givens,
            index: this.#timeline.length,
            line: line,
            comment: comment
        })
    }

    get timeline() {
        return deepcopy(this.#timeline)
    }

    record2(state, line, comment, problem = { row: -1, column: -1 }) {
        if (this.#expertMode) {
            if (line.includes(-1)) {
                return
            }
        } else {
            if (line.some(l => l !== 0 && l !== -1 && l !== 24)) {
                return
            }
        }


        const stateCopy = deepcopy(state)
        const possibilities = []
        for (let i = 0; i < 9; i++) {
            const row = []
            for (let j = 0; j < 9; j++) {
                const field = []
                for (let k = 0; k < 9; k++) {
                    if (stateCopy.possibilities[i][j][k] === 1) {
                        field.push(k + 1)
                    }
                }
                row.push(field)
            }
            possibilities.push(row)
        }

        this.#timeline.push({
            board: stateCopy.board,
            possibilities: possibilities,
            counters: stateCopy.counters,
            isSolved: isSolvedSudoku(stateCopy.board),
            givens: this.#givens,
            index: this.#timeline.length,
            line: line,
            // comment: comment.map(c => c.replace(/(\d+)/g, `<span style="font-weight: bold;">$1</span>`))
            comment: comment,
            from: stateCopy.from,
            reason: stateCopy.reason,
            problem: problem
        })

        if (this.#timeline.length === 1 || this.#timeline.length % 1000 === 0) {
            this.#callback()
        }
    }
}

