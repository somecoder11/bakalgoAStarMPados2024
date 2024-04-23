import { data } from '../../data/examples.js';

class Generator {
    #sudokus
    constructor() {
        this.#sudokus = {
            "easy": [],
            "medium": [],
            "hard": [],
            "very hard": [],
            "insane": [],
            "17": []
        }
        for (let key = 17; key <= 81; key++) {
            if (key in data) {
                if (key === 17) {
                    this.#sudokus["17"] = this.#sudokus["17"].concat(data[key])
                } else if (key < 23) {
                    this.#sudokus["insane"] = this.#sudokus["insane"].concat(data[key])
                } else if (key < 29) {
                    this.#sudokus["very hard"] = this.#sudokus["very hard"].concat(data[key])
                } else if (key < 33) {
                    this.#sudokus["hard"] = this.#sudokus["hard"].concat(data[key])
                } else if (key < 37) {
                    this.#sudokus["medium"] = this.#sudokus["medium"].concat(data[key])
                } else {
                    this.#sudokus["easy"] = this.#sudokus["easy"].concat(data[key])
                }
            }
        }
    }

    generate(level) {
        const randomIndex = Math.floor(Math.random() * this.#sudokus[level].length)
        return JSON.parse(JSON.stringify(this.#sudokus[level][randomIndex]))
    }
}

export const sudokuGenerator = new Generator()