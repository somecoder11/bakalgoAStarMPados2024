export class Square {
    /** @type {number} */
    #r

    /** @type {number} */
    #c

    /** @type {number} */
    #value = 0

    /** @type {Set<number>} */
    #possibilities

    /** @type {Array<Group>} */
    groups



    /**
      * Constructor can also be used to create a copy of an existing Square
      * @param {number | Square} r - Row number for a new Square or an existing Square to copy
      * @param {number} [c] - Column number for a new Square
      */
    constructor(r, c) {
        if (r instanceof Square) {
            // Copying from an existing Square instance
            const squareToCopy = r;
            this.#r = squareToCopy.r;
            this.#c = squareToCopy.c;
            this.#value = squareToCopy.value;
            this.#possibilities = new Set(squareToCopy.possibilities);
            this.groups = [];  // Not copying the groups to avoid cyclic issues
        } else {
            // Original constructor logic
            this.#r = r;
            this.#c = c;
            this.#value = 0;
            this.#possibilities = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            this.groups = [];
        }
    }

    /**
     * 
     * @param {number} nr 
     */
    set(nr) {
        this.#value = nr
    }

    /**
     * 
     * @param {number} nr 
     */
    remove(nr) {
        this.#possibilities.delete(nr)
    }

    /**
     * 
     * @param {number} nr 
     * @returns true or false
     */
    isPossible(nr) {
        return this.value === 0 && this.#possibilities.has(nr)
    }

    get possibilities() {
        return Array.from(this.#possibilities)
    }

    get value() {
        return this.#value
    }

    get r() {
        return this.#r
    }

    get c() {
        return this.#c
    }
}