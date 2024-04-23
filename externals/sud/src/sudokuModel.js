import { deepcopy, getNewGivens, isValidBoard } from "./utils/utils.js"

export class SudokuModel {
    /** @type {number[][]} */
    #givens
    /** @type {TimelineEntry[]} */
    #timeline = []
    /** @type {Boolean} */
    #isSolvable = true
    /** @type {boolean} */
    #isBacktracked = false
    /** @type {number} */
    #currentStateIndex = 0
    /** @type {boolean} */
    #moreDetails = false
    #inExpertMode = false
    #backtrackingIndex = 0
    #highlightedGroups = { r: -1, c: -1, b: -1 }
    #highlightedField = []
    #unique = true
    #firstSolutionIndex
    #worker
    #callback
    #analyzing = false
    #simpleBacktrackingMode = false
    #cachedTimelines = {}

    constructor(callback) {
        this.#callback = callback
        let success = true
        try {
            const givens = localStorage.getItem("sud-givens")
            if (givens) {
                this.#givens = JSON.parse(givens);
            } else {
                success = false
            }
        } catch (error) {
            success = false
        }

        if (success) {
            this.solve()
        } else {
            this.reset()
        }
    }

    #arrayToGivensStr(array2d) {
        let strGivens = ""
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                strGivens += array2d[r][c]
            }
        }
        return strGivens
    }

    #applyWorkerData(data) {
        const [timeline, isSolvable, isBacktracked, backtrackingIndex, unique, firstSolutionIndex, analyzing] = data
        this.#timeline = timeline
        this.#isSolvable = isSolvable
        this.#isBacktracked = isBacktracked
        this.#backtrackingIndex = backtrackingIndex
        this.#firstSolutionIndex = firstSolutionIndex
        this.#unique = unique
        this.#analyzing = analyzing
        this.#callback(this.state)
    }

    solve() {
        localStorage.setItem("sud-givens", JSON.stringify(this.#givens))
        if (window.Worker) {
            if (this.#worker) {
                this.#worker.terminate();
            }
            this.#worker = new Worker("/externals/sud/src/utils/worker.js", { type: 'module' })

            this.#currentStateIndex = 0
            const strGivens = this.#arrayToGivensStr(this.#givens)
            if ((strGivens + this.#simpleBacktrackingMode) in this.#cachedTimelines) {
                this.#applyWorkerData(this.#cachedTimelines[strGivens + this.#simpleBacktrackingMode])
            } else {
                this.#analyzing = true
                this.#worker.postMessage({ givens: this.#givens, mode: this.#simpleBacktrackingMode })
                this.#worker.onmessage = (e) => {
                    const [timeline, isSolvable, isBacktracked, backtrackingIndex, unique, firstSolutionIndex, analyzing, simpleBacktrackingMode] = e.data
                    if (analyzing === false) {
                        const strGivens = this.#arrayToGivensStr(this.#givens)
                        this.#cachedTimelines[strGivens + simpleBacktrackingMode] = e.data
                    }
                    this.#applyWorkerData(e.data)
                }
            }
        }
        // const solver = new Solver(this.#inExpertMode)
        // const [timeline, isSolvable, isBacktracked, backtrackingIndex, unique, firstSolutionIndex] = solver.solve(this.#givens)
        // this.#timeline = timeline
        // this.#isSolvable = isSolvable
        // this.#isBacktracked = isBacktracked
        // this.#backtrackingIndex = backtrackingIndex
        // this.#firstSolutionIndex = firstSolutionIndex
        // this.#currentStateIndex = 0
        // this.#unique = unique
    }

    nextState() {
        if (this.#currentStateIndex < this.#realLength) {
            this.#currentStateIndex += 1
        }
    }

    previousState() {
        if (this.#currentStateIndex > 0) {
            this.#currentStateIndex -= 1
        }
    }

    firstState() {
        this.#currentStateIndex = 0
    }

    get #realLength() {
        if (this.#unique && this.#firstSolutionIndex !== -1) {
            return this.#firstSolutionIndex
        } else {
            return this.#timeline.length - 1
        }
    }

    lastState() {
        this.#currentStateIndex = this.#realLength
    }

    isLastState() {
        return this.#realLength === this.#currentStateIndex
    }

    /**
     * 
     * @param {number} row 
     * @param {number} column 
     * @param {number} value 
     */
    setGiven(row, column, value) {
        value = value.replace(/[^1-9]/g, '') // Remove any non-numeric characters
        if (value.length > 1) { // Limit the input value to one digit
            value = value.slice(0, 1)
        }
        value = value ? parseInt(value) : 0

        const oldValue = this.#givens[row][column]
        this.#givens[row][column] = value
        // ?
        if (!isValidBoard(this.#givens)) {
            this.#givens[row][column] = oldValue
        }
        localStorage.setItem("sud-givens", JSON.stringify(this.#givens))
    }

    randomize(level) {
        this.#givens = getNewGivens(level)
        // this.#givens = [
        //     [3, 0, 0, 0, 0, 8, 0, 2, 9],
        //     [7, 8, 0, 4, 6, 0, 0, 1, 0],
        //     [0, 0, 6, 5, 0, 0, 0, 4, 8],
        //     [6, 9, 0, 2, 0, 0, 0, 8, 7],
        //     [0, 0, 5, 1, 0, 0, 0, 0, 0],
        //     [4, 0, 0, 8, 9, 0, 0, 3, 0],
        //     [9, 6, 2, 3, 0, 0, 0, 0, 0],
        //     [0, 7, 3, 9, 0, 1, 4, 6, 0],
        //     [1, 4, 8, 6, 2, 7, 0, 0, 3]
        // ]
        this.solve()
    }

    setLectureGivens() {
        this.#givens = [
            [0, 0, 0, 0, 1, 9, 0, 0, 4],
            [0, 2, 0, 0, 0, 8, 0, 0, 0],
            [5, 6, 0, 0, 0, 0, 3, 0, 0],
            [0, 0, 9, 4, 0, 0, 0, 0, 0],
            [0, 0, 0, 5, 0, 7, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 9, 1],
            [0, 1, 0, 0, 0, 0, 4, 0, 0],
            [0, 3, 0, 0, 0, 0, 0, 0, 0],
            [6, 0, 0, 0, 8, 0, 0, 0, 2],
        ]
        this.solve()
    }

    reset() {
        this.#givens = [
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
        this.solve()
    }

    setExpertMode(value) {
        this.#inExpertMode = value
    }

    setMoreDetails(value) {
        this.#moreDetails = value
    }

    toggleBacktrackingMode() {
        this.#simpleBacktrackingMode = !this.#simpleBacktrackingMode
    }

    setCurrentIndex(value) {
        this.#currentStateIndex = value
    }

    setBacktrackingIndex() {
        this.#currentStateIndex = this.#backtrackingIndex
    }

    setFirstSolutionIndex() {
        this.#currentStateIndex = this.#firstSolutionIndex
    }

    setSudokuMouseover(r, c) {
        if (r === -1 || c === -1) {
            this.#highlightedGroups = { r: -1, c: -1, b: -1 }
        } else {
            const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
            this.#highlightedGroups = { r: r, c: c, b: b }
        }
    }

    setTableMouseover(data) {
        this.#highlightedField = data
    }

    get givens() {
        return deepcopy(this.#givens)
    }

    setGivens(givens) {
        this.#givens = deepcopy(givens)
        this.solve()
    }

    get state() {
        return {
            moreDetails: this.#moreDetails,
            inExpertMode: this.#inExpertMode,
            isSolvable: this.#isSolvable,
            isBacktracked: this.#isBacktracked,
            gamestate: deepcopy(this.#timeline[this.#currentStateIndex]),
            length: this.#timeline.length,
            currentIndex: this.#currentStateIndex,
            backtrackingIndex: this.#backtrackingIndex,
            highlightedGroups: this.#highlightedGroups,
            highlightedField: this.#highlightedField,
            givens: this.#givens,
            unique: this.#unique,
            firstSolutionIndex: this.#firstSolutionIndex,
            realLength: this.#realLength,
            analyzing: this.#analyzing,
            next: this.#currentStateIndex < this.#realLength ? this.#timeline[this.#currentStateIndex + 1].reason : "",
            simpleBacktrackingMode: this.#simpleBacktrackingMode
        }
    }
}
