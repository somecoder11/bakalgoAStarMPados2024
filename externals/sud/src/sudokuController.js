import { SudokuModel } from "./sudokuModel.js";
import { SudokuView } from "./sudokuView.js";

export class SudokuController {
    /** @type {number} */
    static maxIntervalTimeMs = 1000

    /** @type {SudokuModel} */
    #model
    /** @type {SudokuView} */
    #view
    /** @type {number} */
    #intervalID
    /** @type {boolean} */
    #isRunning = false
    #flags

    /**
     * 
     * @param {SudokuModel} model 
     * @param {SudokuView} view 
     */
    constructor(model, view, flags) {
        this.#model = model
        this.#view = view
        this.#flags = flags

        // this.#view.render(this.#model.state)

        document.querySelector("#runBtn").addEventListener("click", () => {
            this.#run()
        })

        document.querySelector("#pauseBtn").addEventListener("click", () => {
            this.stop()
        })

        document.querySelector("#backBtn").addEventListener("click", () => {
            this.stop()
            this.#model.previousState()
            this.#draw()
        })

        document.querySelector("#stepBtn").addEventListener("click", () => {
            this.stop()
            this.#next()
        })

        document.addEventListener('keydown', (event) => {
            this.stop()
            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                this.#model.previousState()
            } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                this.#next()
                return
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                this.#model.firstState()
            } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                this.#model.lastState()
            } else if (event.key === 'c' || event.key === 'C') {
                event.preventDefault()
                if (!this.#flags.storageActive) {
                    this.#model.reset()
                }
            } else if (event.key === 'r' || event.key === 'R') {
                event.preventDefault()
                // const choices = ["easy", "medium", "hard", "very hard", "insane", "17"]
                // const index = Math.floor(Math.random() * choices.length);
                // this.#randomize(choices[index])
                this.#randomize("17")
                return
            } else if (event.key === 'l' || event.key === "L") {
                event.preventDefault()
                this.#model.setLectureGivens()
            }
            this.#draw()
        })


        document.querySelector("#startBtn").addEventListener("click", () => {
            this.stop()
            this.#model.firstState()
            this.#draw()
        })

        document.querySelector("#endBtn").addEventListener("click", () => {
            this.stop()
            this.#model.lastState()
            this.#draw()
        })

        document.querySelector("#clearBtn").addEventListener("click", () => {
            this.stop()
            this.#model.reset()
            this.#draw()
        })

        document.querySelector("#randomizeBtn").addEventListener("click", () => {
            // const choices = ["easy", "medium", "hard", "very hard", "insane", "17"]
            // const index = Math.floor(Math.random() * choices.length);
            // this.#randomize(choices[index])
            this.#randomize("17")
        })

        document.querySelector("#lectureBtn").addEventListener("click", () => {
            this.stop()
            this.#model.setLectureGivens()
            this.#draw()
        })

        document.querySelector("#speedRange").addEventListener('input', (event) => {
            if (this.#isRunning === true) {
                clearInterval(this.#intervalID)
                const interval = (1 - event.target.value) * SudokuController.maxIntervalTimeMs
                this.#intervalID = setInterval(() => {
                    this.#next()
                }, interval)
            }
        })

        document.querySelector("#newMarkers #stepRange").addEventListener('input', (event) => {
            this.stop()
            const index = Number(event.target.value)
            this.#model.setCurrentIndex(index)
            this.#draw()
        })

        document.querySelector("#backtrackingModeBtn").addEventListener('click', (event) => {
            this.stop()
            this.#model.toggleBacktrackingMode()
            this.#model.solve()
            this.#draw()
        })

        // document.querySelector("#toggleSteps").addEventListener('change', (event) => {
        //     let isChecked = event.target.checked;
        //     this.#stop()
        //     this.#model.setExpertMode(isChecked)
        //     this.#model.solve()
        //     this.#view.render(this.#model.state)
        // })

        // document.querySelector(".expert-toggle-container").addEventListener('click', () => {
        //     let checkbox = document.querySelector("#toggleSteps"); // Select the checkbox
        //     checkbox.checked = !checkbox.checked
        //     const event = new Event('change');
        //     checkbox.dispatchEvent(event);
        // })

        document.addEventListener("sudokuClick", (event) => {
            this.stop()
            // this.#model.solve()
            // this.#view.render(this.#model.state)
        })

        document.addEventListener("sudokuInput", (event) => {
            this.stop()
            this.#model.setGiven(event.detail.row, event.detail.column, event.detail.value)
            this.#model.solve()
            this.#draw()
        })

        document.querySelector("#newMarkerLabels>:nth-child(1)").addEventListener("click", () => {
            this.stop()
            this.#model.firstState()
            this.#draw()
        })

        document.querySelector("#newMarkerLabels>:nth-child(2)").addEventListener("click", () => {
            this.stop()
            this.#model.setBacktrackingIndex()
            this.#draw()
        })


        document.querySelector("#newMarkerLabels>:nth-child(3)").addEventListener("click", () => {
            this.stop()
            this.#model.setFirstSolutionIndex()
            this.#draw()
        })

        document.querySelector("#newMarkerLabels>:nth-child(4)").addEventListener("click", () => {
            this.stop()
            this.#model.lastState()
            this.#draw()
        })

        document.querySelector(".newMarker:nth-child(2)").addEventListener("click", () => {
            this.stop()
            this.#model.firstState()
            this.#draw()
        })

        document.querySelector(".newMarker:nth-child(3)").addEventListener("click", () => {
            this.stop()
            this.#model.setBacktrackingIndex()
            this.#draw()
        })


        document.querySelector(".newMarker:nth-child(4)").addEventListener("click", () => {
            this.stop()
            this.#model.setFirstSolutionIndex()
            this.#draw()
        })

        document.querySelector(".newMarker:nth-child(5)").addEventListener("click", () => {
            this.stop()
            this.#model.lastState()
            this.#draw()
        })

        document.querySelector("#sud-status").addEventListener("click", () => {
            this.stop()
            this.#model.lastState()
            this.#draw()
        })

        document.querySelector("#sud-status-backtracking-yes").addEventListener("click", () => {
            this.stop()
            this.#model.setBacktrackingIndex()
            this.#draw()
        })

        document.querySelector("#sud-status-backtracking-yes-and").addEventListener("click", () => {
            this.stop()
            this.#model.setBacktrackingIndex()
            this.#draw()
        })

        document.querySelector("#sud-status-backtracking-no").addEventListener("click", () => {
            this.stop()
            this.#model.firstState()
            this.#draw()
        })

        document.querySelector("#sud-status-backtracking-jein").addEventListener("click", () => {
            this.stop()
            this.#model.firstState()
            this.#draw()
        })

        // document.querySelector("#randomizeEasy").addEventListener("click", () => {
        //     this.#randomize("easy")
        // })
        // document.querySelector("#randomizeMedium").addEventListener("click", () => {
        //     this.#randomize("medium")
        // })
        // document.querySelector("#randomizeHard").addEventListener("click", () => {
        //     this.#randomize("hard")
        // })
        // document.querySelector("#randomizeVeryHard").addEventListener("click", () => {
        //     this.#randomize("very hard")
        // })
        // document.querySelector("#randomizeInsane").addEventListener("click", () => {
        //     this.#randomize("insane")
        // })
        // document.querySelector("#randomizeInhuman").addEventListener("click", () => {
        //     this.#randomize("17")
        // })

        document.addEventListener("sudokuMouseover", (event) => {
            this.#model.setSudokuMouseover(event.detail.row, event.detail.column)
            this.#model.setTableMouseover([{ name: "Row", g: event.detail.row },
            { name: "Column", g: event.detail.column },
            { name: "Block", g: Math.floor(event.detail.row / 3) * 3 + Math.floor(event.detail.column / 3) }])
            this.#draw()
        })

        document.querySelector("#sud-sudoku").addEventListener("mouseleave", (event) => {
            this.#model.setSudokuMouseover(-1, -1)
            this.#model.setTableMouseover(null)
            this.#draw()
        })

        document.querySelector("#sud-sudoku-input").addEventListener("mouseleave", (event) => {
            this.#model.setSudokuMouseover(-1, -1)
            this.#model.setTableMouseover(null)
            this.#draw()
        })

        document.addEventListener("tableMouseover", (event) => {
            this.#model.setTableMouseover([{ name: event.detail.name, g: event.detail.g }])
            this.#draw()
        })
        document.addEventListener("tableMouseleave", (event) => {
            this.#model.setTableMouseover(null)
            this.#draw()
        })

        // document.querySelector(".infobox-dimmer").addEventListener("click", () => {
        //     document.querySelector(".infobox-dimmer").style.display = "none"
        //     document.querySelectorAll(".infobox").forEach(el => el.style.display = "none")
        // })

        // document.querySelector("#helpBtn").addEventListener("click", () => {
        //     document.querySelector(".infobox-dimmer").style.display = "flex"
        //     document.querySelectorAll(".infobox").forEach(el => el.style.display = "block")
        // })

        document.getElementById('themeBtn').addEventListener('click', () => {
            if (document.documentElement.className === "theme2") {
                document.documentElement.className = "theme1";
                localStorage.setItem("sud-theme", "theme1")
            } else {
                document.documentElement.className = "theme2";
                localStorage.setItem("sud-theme", "theme2")
            }
            this.#draw()
        });

        document.querySelector("#codeBlockTitleFixSquare").addEventListener("click", () => {
            const el = document.querySelector("#codeBlockFixSquare")
            const svg = document.querySelector("#codeBlockTitleFixSquare").querySelector("svg")
            if (el.style.display === "none") {
                el.style.display = "flex"
                svg.style.transform = "rotate(90deg)";
            } else {
                el.style.display = "none"
                svg.style.transform = "";
            }
        })

        document.querySelector("#codeBlockTitleBacktracking").addEventListener("click", () => {
            const el = document.querySelector("#codeBlockBacktracking")
            const svg = document.querySelector("#codeBlockTitleBacktracking").querySelector("svg")
            if (el.style.display === "none") {
                el.style.display = "flex"
                svg.style.transform = "rotate(90deg)";
            } else {
                el.style.display = "none"
                svg.style.transform = "";
            }
        })
    }

    #randomize(level) {
        this.stop()
        this.#model.randomize(level)
        this.#draw()
    }

    #next() {
        this.#model.nextState()
        this.#draw()
    }

    stop() {
        clearInterval(this.#intervalID)
        this.#isRunning = false
    }

    #run() {
        if (this.#isRunning === false) {
            if (this.#model.isLastState()) return
            this.#next()
            const interval = (1 - document.querySelector("#speedRange").value) * SudokuController.maxIntervalTimeMs
            this.#isRunning = true
            this.#intervalID = setInterval(() => {
                if (this.#model.isLastState()) return
                this.#next()
            }, interval)
        }
    }

    #draw() {
        requestAnimationFrame(() => this.#view.render(this.#model.state))
    }
}