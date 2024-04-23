import { deepcopy } from "./utils.js"

export class Group {
    /** @type {string} */
    #name

    /** @type {Array<number>} */
    #counters

    /** @type {Array<Square>} */
    squares

    /**
     * Constructor can also be used to create a copy of an existing Group
     * @param {number | Group} i - Index for a new Group or an existing Group to copy
     */
    constructor(i) {
        if (i instanceof Group) {
            this.#name = i.name;
            this.#counters = i.counters;
            this.squares = [];
        } else {
            if (0 <= i && i < 9) {
                this.#name = `Row ${i}`
            } else if (9 <= i && i < 18) {
                this.#name = `Column ${i - 9}`
            } if (18 <= i && i < 27) {
                this.#name = `Box ${i - 18}`
            }

            this.#counters = Array(9).fill(9)
            this.squares = []
        }
    }

    /**
     * 
     * @param {number} nr 
     */
    reduceCountersExcept(nr) {
        this.#counters[nr - 1] = 1
        for (let i = 1; i <= 9; i++) {
            if (i !== nr) {
                this.#counters[i - 1]--
            }
        }
    }

    /**
     * 
     * @param {number} nr 
     */
    reduceCounter(nr) {
        this.#counters[nr - 1]--
    }

    /**
     * 
     * @param {number} nr 
     */
    reduceCounterToZero(nr) {
        this.#counters[nr - 1] = 0
    }

    /**
     * 
     * @param {number} nr 
     */
    counterOf(nr) {
        return this.#counters[nr - 1]
    }

    get name() {
        return this.#name
    }

    get counters() {
        return deepcopy(this.#counters)
    }
}