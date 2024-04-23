import "./utils/globalTypeDefs.js"
import { deepcopy, isValidBoard } from "./utils/utils.js"

export class SudokuView {
    /** @type {HTMLInputElement[][]} */
    #inputsOutput
    /** @type {HTMLInputElement[][]} */
    #inputs
    /** @type {HTMLElement[][]} */
    #fields
    /** @type {HTMLElement[][]} */
    #rowTable
    /** @type {HTMLElement[][]} */
    #columnTable
    /** @type {HTMLElement[][]} */
    #blockTable
    #givens
    #style
    #dom = {}

    constructor() {
        this.#drawSudoku()
        this.#rowTable = this.#drawTable(document.querySelector("#sud-group-counter-row"), "Row")
        this.#columnTable = this.#drawTable(document.querySelector("#sud-group-counter-col"), "Col")
        this.#blockTable = this.#drawTable(document.querySelector("#sud-group-counter-block"), "Block")
        document.documentElement.className = localStorage.getItem("sud-theme") || "theme1";

        this.#dom[".analyzing"] = document.querySelector(".analyzing")
        this.#dom["#backtrackingModeBtn"] = document.querySelector("#backtrackingModeBtn")
        this.#dom["#sud-status-backtracking-yes"] = document.querySelector("#sud-status-backtracking-yes")
        this.#dom["#sud-status-backtracking-no"] = document.querySelector("#sud-status-backtracking-no")
        this.#dom["#sud-status-backtracking-jein"] = document.querySelector("#sud-status-backtracking-jein")
        this.#dom["#sud-status-backtracking-yes-and"] = document.querySelector("#sud-status-backtracking-yes-and")
        this.#dom["#sud-status"] = document.querySelector("#sud-status")
        this.#dom["#currentStep"] = document.querySelector("#currentStep")
        this.#dom["#allSteps"] = document.querySelector("#allSteps")
        this.#dom["#analyzing-status"] = document.querySelector("#analyzing-status")
        this.#dom["#newMarkerLabels>:nth-child(1)"] = document.querySelector("#newMarkerLabels>:nth-child(1)")
        this.#dom["#newMarkerLabels>:nth-child(2)"] = document.querySelector("#newMarkerLabels>:nth-child(2)")
        this.#dom["#newMarkerLabels>:nth-child(3)"] = document.querySelector("#newMarkerLabels>:nth-child(3)")
        this.#dom["#newMarkerLabels>:nth-child(4)"] = document.querySelector("#newMarkerLabels>:nth-child(4)")
        this.#dom["#newMarkers>:nth-child(2)"] = document.querySelector("#newMarkers>:nth-child(2)")
        this.#dom["#newMarkers>:nth-child(3)"] = document.querySelector("#newMarkers>:nth-child(3)")
        this.#dom["#newMarkers>:nth-child(4)"] = document.querySelector("#newMarkers>:nth-child(4)")
        this.#dom["#newMarkers>:nth-child(5)"] = document.querySelector("#newMarkers>:nth-child(5)")
        this.#dom["#stepRange"] = document.querySelector("#stepRange")
        this.#dom["#nGivens"] = document.querySelector("#nGivens")
    }

    /**
     * 
     * @param {State} state 
     */
    render({ gamestate, isSolvable, isBacktracked, inExpertMode,
        moreDetails, length, currentIndex, backtrackingIndex, highlightedGroups,
        highlightedField, givens, unique, firstSolutionIndex, realLength, analyzing,
        next, simpleBacktrackingMode }) {

        this.#style = getComputedStyle(document.documentElement);
        this.#dom["#backtrackingModeBtn"].innerText = simpleBacktrackingMode ? "Slow Backtracking" : "Fast Backtracking"
        this.#givens = deepcopy(givens) // for error msg

        // ===================
        const state = gamestate
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (state.board[i][j] === 0) {
                    this.#inputsOutput[i][j].replaceWith(this.#fields[i][j])
                    for (let k = 0; k < 9; k++) {
                        this.#fields[i][j].children[k].innerHTML = ""
                    }
                    if (state.possibilities[i][j].length === 0) {
                        this.#fields[i][j].style.backgroundColor = "#ef4444"
                    } else if (state.problem.row !== -1 && state.problem.column !== -1) {
                        this.#fields[state.problem.row][state.problem.column].style.backgroundColor = "#ef4444"
                    } else {
                        this.#fields[i][j].style.backgroundColor = "#fff"
                    }
                    state.possibilities[i][j].forEach(nr => {
                        this.#fields[i][j].children[nr - 1].innerHTML = nr
                    })
                } else {
                    this.#fields[i][j].replaceWith(this.#inputsOutput[i][j])
                    this.#inputsOutput[i][j].innerText = state.board[i][j]
                }

                if (state.givens[i][j]) {
                    this.#inputs[i][j].value = state.givens[i][j]
                } else {
                    this.#inputs[i][j].value = ""
                }
                // this.#inputs[i][j].style.color = state.givens[i][j] ? "#ef4444" : ""
                // this.#inputs[i][j].style.backgroundColor = state.givens[i][j] ? "#fee2e2" : "#fff"
                if (state.from[i][j] === "given") {
                    this.#inputsOutput[i][j].style.backgroundColor = "#d1d5db"
                    this.#inputsOutput[i][j].style.fontWeight = "bold"
                } else {
                    this.#inputsOutput[i][j].style.backgroundColor = "#fff"
                    this.#inputsOutput[i][j].style.fontWeight = ""
                }
                this.#inputs[i][j].style.backgroundColor = state.givens[i][j] ? "#d1d5db" : "#fff"
                this.#inputs[i][j].style.fontWeight = state.givens[i][j] ? "bold" : ""
            }
        }

        const pairs = [
            [state.counters.slice(0, 9), this.#rowTable],
            [state.counters.slice(9, 18), this.#columnTable],
            [state.counters.slice(18, 27), this.#blockTable]]

        for (const [counters, table] of pairs) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (counters[i][j] <= -1) {
                        table[i][j].innerText = "-"
                    } else {
                        table[i][j].innerText = counters[i][j]
                    }
                    table[i][j].style.backgroundColor = counters[i][j] === 0 ? "#fee2e2" : ""
                    table[i][j].style.color = counters[i][j] === 0 ? "#ef4444" : ""
                    table[i][j].style.fontWeight = counters[i][j] === 0 ? "bold" : ""
                }
            }
        }
        // this.#applyState(gamestate, next)

        this.#dom[".analyzing"].style.display = analyzing ? "flex" : "none"

        this.#dom["#sud-status-backtracking-yes"].style.display = "none"
        this.#dom["#sud-status-backtracking-no"].style.display = "none"
        this.#dom["#sud-status-backtracking-jein"].style.display = "none"
        this.#dom["#sud-status-backtracking-yes-and"].style.display = "none"

        if (unique) {
            // document.querySelector("#secondSolutionSolutionText").innerText = isSolvable ? "Solution" : "Problematic State"
            this.#dom["#sud-status"].innerText = isSolvable ? "Solvable" : "NOT solvable"
            this.#dom["#sud-status"].className = isSolvable ? "solvable-text" : "not-solvable-text"


            if (isSolvable) {
                if (isBacktracked) {
                    if (backtrackingIndex !== 0) {
                        this.#dom["#sud-status-backtracking-jein"].style.display = "inline"
                        this.#dom["#sud-status-backtracking-yes-and"].style.display = "inline"
                    } else {
                        this.#dom["#sud-status-backtracking-yes"].style.display = "inline"
                    }
                } else {
                    this.#dom["#sud-status-backtracking-no"].style.display = "inline"
                }
            }
        } else {
            // document.querySelector("#secondSolutionSolutionText").innerText = "Solution"
            this.#dom["#sud-status"].innerText = "NOT unique"
            this.#dom["#sud-status"].className = "not-solvable-text"
        }

        this.#dom["#currentStep"].innerText = currentIndex
        this.#dom["#allSteps"].innerText = realLength
        this.#dom["#analyzing-status"].style.display = analyzing ? "none" : "flex"

        const markerLabel1 = this.#dom["#newMarkerLabels>:nth-child(1)"]
        const markerLabel2 = this.#dom["#newMarkerLabels>:nth-child(2)"]
        const markerLabel3 = this.#dom["#newMarkerLabels>:nth-child(3)"]
        const markerLabel4 = this.#dom["#newMarkerLabels>:nth-child(4)"]

        const marker1 = this.#dom["#newMarkers>:nth-child(2)"]
        const marker2 = this.#dom["#newMarkers>:nth-child(3)"]
        const marker3 = this.#dom["#newMarkers>:nth-child(4)"]
        const marker4 = this.#dom["#newMarkers>:nth-child(5)"]

        const getColor = (c) => {
            let color
            let bgColor
            if (c === "gray") {
                color = "#1f2937"
                bgColor = "#f3f4f6"
            } else if (c === "red") {
                color = this.#style.getPropertyValue('--error-color').trim()
                bgColor = "#fef2f2"
            }
            else if (c === "blue") {
                color = this.#style.getPropertyValue('--backtracking-color').trim()
                bgColor = "#eff6ff"
            }
            else if (c === "green") {
                color = this.#style.getPropertyValue('--success-color').trim()
                bgColor = "#f0fdf4"
            }
            else if (c === "orange") {
                color = this.#style.getPropertyValue('--first-solution-color').trim()
                bgColor = "#ffedd5"
            } else if (c === "violet") {
                color = this.#style.getPropertyValue('--fix-square-color').trim()
                bgColor = "#ede9fe"
            } else {
                color = "#000"
                bgColor = "#f9fafb"
            }
            return [color, bgColor]
        }

        const slider = this.#dom["#stepRange"]
        const width = slider.clientWidth - 15

        const setMarkerText = (markerLabel, c, text, step) => {
            markerLabel.style.display = "flex"
            const [color, bgColor] = getColor(c)
            markerLabel.children[0].style.backgroundColor = color
            markerLabel.children[1].style.color = color
            // markerLabel.addEventListener('mouseover', () => markerLabel.style.backgroundColor = "#f3f4f6");
            // markerLabel.addEventListener('mouseout', () => markerLabel.style.backgroundColor = this.#style.getPropertyValue('--background-color').trim());

            if (currentIndex === step) {
                markerLabel.children[0].style.height = "100%"
            } else {
                markerLabel.children[0].style.height = "6px"
            }

            markerLabel.querySelector(".newMarkerLabel").innerText = text
            markerLabel.querySelector(".newMarkerLabelSteps").innerText = `(step ${step})`
        }

        const updateMarker = (marker, c, step) => {
            marker.style.display = "flex"
            const [color, bgColor] = getColor(c)
            marker.style.backgroundColor = color
            const left = step / realLength * width
            marker.style.left = `${left}px`
        }

        const updateSlider = (currentIndex, maxValue) => {
            slider.max = maxValue
            slider.value = currentIndex
        }

        const hideMarker = (marker, markerLabel) => {
            marker.style.display = "none"
            markerLabel.style.display = "none"
        }

        hideMarker(marker1, markerLabel1)
        hideMarker(marker2, markerLabel2)
        hideMarker(marker3, markerLabel3)
        hideMarker(marker4, markerLabel4)
        updateSlider(currentIndex, realLength)

        if (backtrackingIndex !== 0) {
            setMarkerText(markerLabel1, "violet", "Start of Fix-Square", 0)
            updateMarker(marker1, "violet", 0)
        }
        if (unique) {
            if (analyzing) {
                setMarkerText(markerLabel4, "gray", "Analyzing...", realLength)
                updateMarker(marker4, "gray", realLength)
            }
            else if (isSolvable) {
                setMarkerText(markerLabel4, "green", "Solution", realLength)
                updateMarker(marker4, "green", realLength)
            } else {
                setMarkerText(markerLabel4, "red", "Problematic State", realLength)
                updateMarker(marker4, "red", realLength)
            }
        } else {
            setMarkerText(markerLabel3, "orange", "First Solution", firstSolutionIndex)
            updateMarker(marker3, "orange", firstSolutionIndex)
            setMarkerText(markerLabel4, "red", "Second Solution", realLength)
            updateMarker(marker4, "red", realLength)
        }

        if (isBacktracked) {
            setMarkerText(markerLabel2, "blue", "Start of Backtracking", backtrackingIndex)
            updateMarker(marker2, "blue", backtrackingIndex)
        }


        if ((highlightedGroups.r > -1 && highlightedGroups.c > -1 && highlightedGroups.b > -1)) {
            for (let i = 0; i < 9; i++) {
                for (let c = 0; c < 9; c++) {
                    if (i === highlightedGroups.r) {
                        this.#rowTable[i][c].style.opacity = 1
                    } else {
                        this.#rowTable[i][c].style.opacity = 0.1
                    }
                    if (i === highlightedGroups.c) {
                        this.#columnTable[i][c].style.opacity = 1
                    } else {
                        this.#columnTable[i][c].style.opacity = 0.1
                    }
                    if (i === highlightedGroups.b) {
                        this.#blockTable[i][c].style.opacity = 1
                    } else {
                        this.#blockTable[i][c].style.opacity = 0.1
                    }
                }
            }
        } else {
            for (let i = 0; i < 9; i++) {
                for (let c = 0; c < 9; c++) {
                    this.#rowTable[i][c].style.opacity = 1
                    this.#columnTable[i][c].style.opacity = 1
                    this.#blockTable[i][c].style.opacity = 1
                }
            }
        }

        for (let i = 0; i < 9; i++) {
            for (let k = 0; k < 9; k++) {
                this.#fields[k][i].style.opacity = 1
                this.#inputsOutput[k][i].style.opacity = 1
            }
        }

        // TODO: Improvements
        if (highlightedField && highlightedField.length) {
            for (let i = 0; i < 9; i++) {
                for (let k = 0; k < 9; k++) {
                    this.#fields[k][i].style.opacity = 0.5
                    this.#inputsOutput[k][i].style.opacity = 0.5
                }
            }

            for (const data of highlightedField) {
                if (data.name.length > 0 && data.g > -1) {
                    if (data.name.includes("Row")) {
                        for (let i = 0; i < 9; i++) {
                            for (let k = 0; k < 9; k++) {
                                if (data.g === i) {
                                    this.#fields[i][k].style.opacity = 1
                                    this.#inputsOutput[i][k].style.opacity = 1
                                }
                            }

                        }
                    } else if (data.name.includes("Col")) {
                        for (let i = 0; i < 9; i++) {
                            for (let k = 0; k < 9; k++) {
                                if (data.g === i) {
                                    this.#fields[k][i].style.opacity = 1
                                    this.#inputsOutput[k][i].style.opacity = 1
                                }
                            }
                        }
                    } else {
                        const r = Math.floor(data.g / 3)
                        const c = data.g % 3
                        for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < 3; j++) {
                                this.#fields[r * 3 + i][c * 3 + j].style.opacity = 1
                                this.#inputsOutput[r * 3 + i][c * 3 + j].style.opacity = 1
                            }
                        }
                    }
                }
            }
        }

        let nGivens = 0
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (givens[i][j] !== 0) {
                    nGivens += 1
                }
            }
        }
        this.#dom["#nGivens"].innerText = `(${nGivens} givens)`

        // ==============
        const lst = next.split(" ")
        if (lst[0] === "given") {
            const i = Number(lst[1])
            const j = Number(lst[2])
            this.#inputs[i][j].style.backgroundColor = "#ddd6fe"
        } else if (lst[0] === "block") {
            const g = Number(lst[1])
            const n = Number(lst[2])
            this.#blockTable[g][n].style.backgroundColor = "#ddd6fe"
        } else if (lst[0] === "row") {
            const g = Number(lst[1])
            const n = Number(lst[2])
            this.#rowTable[g][n].style.backgroundColor = "#ddd6fe"
        } else if (lst[0] === "col") {
            const g = Number(lst[1])
            const n = Number(lst[2])
            this.#columnTable[g][n].style.backgroundColor = "#ddd6fe"
        } else if (lst[0] === "possibility") {
            const i = Number(lst[1])
            const j = Number(lst[2])
            this.#fields[i][j].style.backgroundColor = "#ddd6fe"
        } else if (lst[0] === "backtracking") {
            const i = Number(lst[1])
            const j = Number(lst[2])
            this.#fields[i][j].style.backgroundColor = "#bfdbfe"
            this.#inputsOutput[i][j].style.backgroundColor = "#bfdbfe"
        }
        // this.#applyNext(next)
    }

    // #applyNext(next) {
    //     const lst = next.split(" ")
    //     if (lst[0] === "given") {
    //         const i = Number(lst[1])
    //         const j = Number(lst[2])
    //         this.#inputs[i][j].style.backgroundColor = "#ddd6fe"
    //     } else if (lst[0] === "block") {
    //         const g = Number(lst[1])
    //         const n = Number(lst[2])
    //         this.#blockTable[g][n].style.backgroundColor = "#ddd6fe"
    //     } else if (lst[0] === "row") {
    //         const g = Number(lst[1])
    //         const n = Number(lst[2])
    //         this.#rowTable[g][n].style.backgroundColor = "#ddd6fe"
    //     } else if (lst[0] === "col") {
    //         const g = Number(lst[1])
    //         const n = Number(lst[2])
    //         this.#columnTable[g][n].style.backgroundColor = "#ddd6fe"
    //     } else if (lst[0] === "possibility") {
    //         const i = Number(lst[1])
    //         const j = Number(lst[2])
    //         this.#fields[i][j].style.backgroundColor = "#ddd6fe"
    //     } else if (lst[0] === "backtracking") {
    //         const i = Number(lst[1])
    //         const j = Number(lst[2])
    //         this.#fields[i][j].style.backgroundColor = "#bfdbfe"
    //         this.#inputsOutput[i][j].style.backgroundColor = "#bfdbfe"
    //     }

    // }


    /**
     * 
     * @param {TimelineEntry} state 
     */
    // #applyState(state, next) {
    //     for (let i = 0; i < 9; i++) {
    //         for (let j = 0; j < 9; j++) {
    //             if (state.board[i][j] === 0) {
    //                 this.#inputsOutput[i][j].replaceWith(this.#fields[i][j])
    //                 for (let k = 0; k < 9; k++) {
    //                     this.#fields[i][j].children[k].innerHTML = ""
    //                 }
    //                 if (state.possibilities[i][j].length === 0) {
    //                     this.#fields[i][j].style.backgroundColor = "#ef4444"
    //                 } else if (state.problem.row !== -1 && state.problem.column !== -1) {
    //                     this.#fields[state.problem.row][state.problem.column].style.backgroundColor = "#ef4444"
    //                 } else {
    //                     this.#fields[i][j].style.backgroundColor = "#fff"
    //                 }
    //                 state.possibilities[i][j].forEach(nr => {
    //                     this.#fields[i][j].children[nr - 1].innerHTML = nr
    //                 })
    //             } else {
    //                 this.#fields[i][j].replaceWith(this.#inputsOutput[i][j])
    //                 this.#inputsOutput[i][j].innerText = state.board[i][j]
    //             }

    //             if (state.givens[i][j]) {
    //                 this.#inputs[i][j].value = state.givens[i][j]
    //             } else {
    //                 this.#inputs[i][j].value = ""
    //             }
    //             // this.#inputs[i][j].style.color = state.givens[i][j] ? "#ef4444" : ""
    //             // this.#inputs[i][j].style.backgroundColor = state.givens[i][j] ? "#fee2e2" : "#fff"
    //             if (state.from[i][j] === "given") {
    //                 this.#inputsOutput[i][j].style.backgroundColor = "#d1d5db"
    //                 this.#inputsOutput[i][j].style.fontWeight = "bold"
    //             } else {
    //                 this.#inputsOutput[i][j].style.backgroundColor = "#fff"
    //                 this.#inputsOutput[i][j].style.fontWeight = ""
    //             }
    //             this.#inputs[i][j].style.backgroundColor = state.givens[i][j] ? "#d1d5db" : "#fff"
    //             this.#inputs[i][j].style.fontWeight = state.givens[i][j] ? "bold" : ""
    //         }
    //     }

    //     const pairs = [
    //         [state.counters.slice(0, 9), this.#rowTable],
    //         [state.counters.slice(9, 18), this.#columnTable],
    //         [state.counters.slice(18, 27), this.#blockTable]]

    //     for (const [counters, table] of pairs) {
    //         for (let i = 0; i < 9; i++) {
    //             for (let j = 0; j < 9; j++) {
    //                 if (counters[i][j] <= -1) {
    //                     table[i][j].innerText = "-"
    //                 } else {
    //                     table[i][j].innerText = counters[i][j]
    //                 }
    //                 table[i][j].style.backgroundColor = counters[i][j] === 0 ? "#fee2e2" : ""
    //                 table[i][j].style.color = counters[i][j] === 0 ? "#ef4444" : ""
    //                 table[i][j].style.fontWeight = counters[i][j] === 0 ? "bold" : ""
    //             }
    //         }
    //     }
    // }



    #drawSudoku() {
        this.#inputsOutput = new Array(9).fill(null).map(() => new Array(9).fill(null))
        this.#inputs = new Array(9).fill(null).map(() => new Array(9).fill(null))
        this.#fields = new Array(9).fill(null).map(() => new Array(9).fill(null))

        const root = document.querySelector("#sud-sudoku")

        for (let i = 0; i < 9; i++) {
            const block = document.createElement("div")
            block.classList.add("sud-sudoku-block")
            root.appendChild(block)

            const rowIndex = Math.floor(i / 3)
            const columnIndex = i % 3
            for (let j = 0; j < 9; j++) {
                const field = document.createElement("div")
                field.classList.add("sud-sudoku-field")
                block.appendChild(field)

                const inputElementOutput = document.createElement("div")
                inputElementOutput.classList.add("sud-sudoku-field-input-output")
                inputElementOutput.classList.add("unselectable")

                // const clickEvent = new CustomEvent('sudokuClick', {
                //     detail: { row: rowIndex * 3 + Math.floor(j / 3), column: columnIndex * 3 + j % 3 }
                // })

                // field.addEventListener("click", () => document.dispatchEvent(clickEvent))

                const mouseOverEvent = new CustomEvent('sudokuMouseover', {
                    detail: { row: rowIndex * 3 + Math.floor(j / 3), column: columnIndex * 3 + j % 3 }
                })

                field.addEventListener("mouseover", () => document.dispatchEvent(mouseOverEvent))
                inputElementOutput.addEventListener("mouseover", () => document.dispatchEvent(mouseOverEvent))

                for (let k = 1; k < 10; k++) {
                    const number = document.createElement("span")
                    number.classList.add("sud-sudoku-number")
                    number.classList.add("unselectable")
                    number.innerText = k
                    field.appendChild(number)
                }
                this.#fields[rowIndex * 3 + Math.floor(j / 3)][columnIndex * 3 + j % 3] = field
                this.#inputsOutput[rowIndex * 3 + Math.floor(j / 3)][columnIndex * 3 + j % 3] = inputElementOutput
            }
        }

        const root_input = document.querySelector("#sud-sudoku-input")
        for (let i = 0; i < 9; i++) {
            const block = document.createElement("div")
            block.classList.add("sud-sudoku-block")
            root_input.appendChild(block)

            const rowIndex = Math.floor(i / 3)
            const columnIndex = i % 3
            for (let j = 0; j < 9; j++) {
                const inputElement = document.createElement("input")
                inputElement.title = "set given"
                inputElement.classList.add("sud-sudoku-field-input")
                block.appendChild(inputElement)

                const clickEvent = new CustomEvent('sudokuClick', {
                    detail: { row: rowIndex * 3 + Math.floor(j / 3), column: columnIndex * 3 + j % 3 }
                })

                inputElement.addEventListener("click", () => document.dispatchEvent(clickEvent))

                // const mouseOverEvent = new CustomEvent('sudokuMouseover', {
                //     detail: { row: rowIndex * 3 + Math.floor(j / 3), column: columnIndex * 3 + j % 3 }
                // })

                // inputElement.addEventListener("mouseover", () => document.dispatchEvent(mouseOverEvent))

                inputElement.addEventListener("input", () => {
                    const r = rowIndex * 3 + Math.floor(j / 3)
                    const c = columnIndex * 3 + j % 3


                    // prevents wrong input on view level (without interacting with model)
                    // should prvent bug of multiple error msgs
                    if (inputElement.value.length > 0) {
                        const number = parseInt(inputElement.value, 10);
                        if (!isNaN(number) && number >= 1 && number <= 9) {
                            const givens = deepcopy(this.#givens)
                            givens[r][c] = number
                            if (!isValidBoard(givens)) {
                                inputElement.value = ""
                                alert(`Your set number ${number} is not valid.`)
                                return
                            } else {
                            }
                        } else {
                            inputElement.value = ""
                            alert("Only numbers between 1 and 9 are allowed.")
                            return
                        }
                    }


                    document.dispatchEvent(new CustomEvent('sudokuInput', {
                        detail: { row: r, column: c, value: inputElement.value }
                    }))
                })

                this.#inputs[rowIndex * 3 + Math.floor(j / 3)][columnIndex * 3 + j % 3] = inputElement
            }
        }
    }

    /**
     * 
     * @param {HTMLElement} root 
     * @param {string} name 
     * @returns 
     */
    #drawTable(root, name) {
        const tableArray = []
        const table = document.createElement("table")
        table.classList.add("unselectable")
        root.appendChild(table)
        const thead = document.createElement("thead")
        table.appendChild(thead)

        const tr0 = document.createElement("tr")
        thead.appendChild(tr0)
        const thName = document.createElement("th")
        tr0.appendChild(thName)
        thName.innerText = name[0]
        const thCounter = document.createElement("th")
        tr0.appendChild(thCounter)
        thCounter.colSpan = 9
        thCounter.innerText = `${name} Counters`

        const tr1 = document.createElement("tr")
        thead.appendChild(tr1)
        const thHash = document.createElement("th")
        tr1.appendChild(thHash)
        thHash.innerText = "#"

        for (let i = 1; i < 10; i++) {
            const th = document.createElement("th")
            tr1.appendChild(th)
            th.innerText = i
        }

        const tbody = document.createElement("tbody")
        table.appendChild(tbody)

        for (let i = 1; i < 10; i++) {
            const tr = document.createElement("tr")
            tbody.appendChild(tr)


            tr.addEventListener("mouseover", () => document.dispatchEvent(new CustomEvent('tableMouseover', {
                detail: { name: name, g: i - 1 }
            })))
            tbody.addEventListener("mouseleave", () => document.dispatchEvent(new CustomEvent('tableMouseleave', {
                detail: { name: name, g: i - 1 }
            })))

            const tdNumber = document.createElement("td")
            tr.appendChild(tdNumber)
            tdNumber.innerText = `${name[0]}${i}`

            const tableRowArray = []
            tableArray.push(tableRowArray)

            for (let j = 0; j < 9; j++) {
                const td = document.createElement("td")
                tr.appendChild(td)
                td.innerText = 9
                tableRowArray.push(td)
            }
        }
        return tableArray
    }
}