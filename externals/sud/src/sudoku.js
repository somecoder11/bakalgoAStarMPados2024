import { SudokuModel } from "./sudokuModel.js"
import { SudokuView } from "./sudokuView.js"
import { SudokuController } from "./sudokuController.js"
import { StorageManager } from "./storage.js"

export class Sudoku {
    /** @type {SudokuModel} */
    #model
    /** @type {SudokuView} */
    #view
    /** @type {SudokuController} */
    #controller
    #storageManager
    #flags = { storageActive: false }

    constructor() { }

    initialize() {
        this.#view = new SudokuView()
        this.#model = new SudokuModel((state) => requestAnimationFrame(() => this.#view.render(state)))
        this.#controller = new SudokuController(this.#model, this.#view, this.#flags)
        this.#storageManager = new StorageManager(this.#model, this.#view, this.#controller, this.#flags)
    }
}