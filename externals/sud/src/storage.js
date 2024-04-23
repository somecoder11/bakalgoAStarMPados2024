import { deepcopy } from "./utils/utils.js"

export class StorageManager {
    #model
    #view
    #controller
    #givens = []
    #flags

    constructor(model, view, controller, flags) {
        this.#model = model
        this.#view = view
        this.#controller = controller
        this.#flags = flags

        this.#load()
        this.#initListeners()
        this.#render()
    }

    #initListeners() {
        document.querySelector("#overlay").addEventListener("click", () => {
            document.querySelector("#storage").style.display = "none"
            document.querySelector("#overlay").style.display = "none"
            this.#flags.storageActive = false
        })

        document.querySelector("#storageBtn").addEventListener("click", () => {
            document.querySelector("#storage").style.display = "flex"
            document.querySelector("#overlay").style.display = "flex"
            this.#flags.storageActive = true
        })

        document.querySelector("#storageAddBtn").addEventListener("click", () => {
            const title = prompt("Title for saved Givens (Required)")
            if (title.length > 0) {
                this.#add(title)
                this.#render()
            }
        })

        document.querySelector("#storageClose").addEventListener("click", () => {
            document.querySelector("#storage").style.display = "none"
            document.querySelector("#overlay").style.display = "none"
            this.#flags.storageActive = false
        })

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                if (this.#flags.storageActive) {
                    document.querySelector("#storage").style.display = "none"
                    document.querySelector("#overlay").style.display = "none"
                    this.#flags.storageActive = false
                }
            }
        })
    }

    #load() {
        if (localStorage.getItem("sud-storage")) {
            this.#givens = JSON.parse(localStorage.getItem("sud-storage"))
        } else {
            this.#givens = []
        }
        for (const given of this.#givens) {
            given.created = new Date(given.created)
        }

        // if (this.#givens.length === 0) {
        //     this.#givens.push({
        //         title: "Buggy Givens (from email)",
        //         created: new Date("2023-12-11T15:59:00"),
        //         board: [
        //             [1, 3, 4, 0, 0, 0, 2, 0, 0],
        //             [5, 6, 7, 3, 0, 2, 0, 1, 0],
        //             [9, 8, 2, 0, 0, 1, 0, 0, 3],
        //             [0, 2, 0, 5, 0, 6, 1, 3, 0],
        //             [0, 1, 0, 2, 4, 3, 0, 0, 0],
        //             [0, 0, 3, 1, 0, 7, 0, 0, 2],
        //             [0, 0, 1, 0, 3, 0, 6, 2, 8],
        //             [2, 0, 0, 0, 1, 0, 3, 4, 5],
        //             [3, 0, 0, 0, 2, 0, 9, 7, 1],
        //         ],
        //         erasable: false
        //     })
        // }
    }

    #add(title) {
        this.#givens.push({
            title: title,
            created: new Date(),
            board: deepcopy(this.#model.givens),
            erasable: true
        })
        localStorage.setItem("sud-storage", JSON.stringify(this.#givens))
    }

    #remove(given) {
        this.#givens = this.#givens.filter(obj => obj !== given)
        localStorage.setItem("sud-storage", JSON.stringify(this.#givens))
    }

    #render() {
        const root = document.querySelector("#storageEntries")
        root.innerHTML = ""

        for (const given of this.#givens) {
            // Base setup
            const element = document.createElement("div")
            element.classList.add("storageEntry")
            element.classList.add("unselectable")
            root.appendChild(element)

            element.addEventListener("click", () => {
                this.#controller.stop()
                this.#model.setGivens(given.board)
                this.#view.render(this.#model.state)
            })

            const divEl = document.createElement("div")
            divEl.classList.add("storageContent")
            element.appendChild(divEl)

            const titleEl = document.createElement("span")
            titleEl.classList.add("storageEntryTitle")
            divEl.appendChild(titleEl)
            const datetimeEl = document.createElement("span")
            datetimeEl.classList.add("storageEntryDateTime")
            divEl.appendChild(datetimeEl)

            const iconsEl = document.createElement("div")
            iconsEl.classList.add("storageIcons")
            element.appendChild(iconsEl)

            // const copyEl = this.#getCopyEl(given)
            // iconsEl.appendChild(copyEl)

            if (given.erasable) {
                const trashEl = this.#getTrashEl(given)
                iconsEl.appendChild(trashEl)
            }


            // Fill data
            if (given.title.length > 25) {
                titleEl.innerText = given.title.slice(0, 25) + "..."
                titleEl.title = given.title
            } else {
                titleEl.innerText = given.title
            }

            datetimeEl.innerText = this.#formatDate(given.created)
        }
    }

    #formatDate(date) {
        const pad = (n) => n < 10 ? '0' + n : n
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]

        let day = pad(date.getDate())
        let month = months[date.getMonth()]
        let year = date.getFullYear()
        let hour = pad(date.getHours())
        let minute = pad(date.getMinutes())
        let seconds = pad(date.getSeconds())
        return `${day}. ${month} ${year} ${hour}:${minute}:${seconds}`
    }

    #getTrashEl(given) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("fill", "none")

        // Create and append title element
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
        title.textContent = "delete saved givens"
        svg.appendChild(title)

        // Create path elements
        const paths = [
            { d: "M10 12V17", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
            { d: "M14 12V17", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
            { d: "M4 7H20", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
            { d: "M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
            { d: "M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z", stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }
        ]

        // Append paths to SVG
        paths.forEach(function (pathInfo) {
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", pathInfo.d)
            path.setAttribute("stroke", pathInfo.stroke)
            path.setAttribute("stroke-width", pathInfo.strokeWidth)
            path.setAttribute("stroke-linecap", pathInfo.strokeLinecap)
            path.setAttribute("stroke-linejoin", pathInfo.strokeLinejoin)
            svg.appendChild(path)
        })

        svg.addEventListener("click", (event) => {
            event.stopPropagation()
            this.#remove(given)
            this.#render()
        })

        return svg
    }

    #getCopyEl(given) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("fill", "none")

        // Create and append title element
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
        title.textContent = "share givens as url"
        svg.appendChild(title)

        // Create path elements
        const paths = [
            {
                d: "M9 6L12 3M12 3L15 6M12 3V13M7.00023 10C6.06835 10 5.60241 10 5.23486 10.1522C4.74481 10.3552 4.35523 10.7448 4.15224 11.2349C4 11.6024 4 12.0681 4 13V17.8C4 18.9201 4 19.4798 4.21799 19.9076C4.40973 20.2839 4.71547 20.5905 5.0918 20.7822C5.5192 21 6.07899 21 7.19691 21H16.8036C17.9215 21 18.4805 21 18.9079 20.7822C19.2842 20.5905 19.5905 20.2839 19.7822 19.9076C20 19.4802 20 18.921 20 17.8031V13C20 12.0681 19.9999 11.6024 19.8477 11.2349C19.6447 10.7448 19.2554 10.3552 18.7654 10.1522C18.3978 10 17.9319 10 17 10",
                stroke: "#000000", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round"
            },

        ]

        // Append paths to SVG
        paths.forEach(function (pathInfo) {
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path")
            path.setAttribute("d", pathInfo.d)
            path.setAttribute("stroke", pathInfo.stroke)
            path.setAttribute("stroke-width", pathInfo.strokeWidth)
            path.setAttribute("stroke-linecap", pathInfo.strokeLinecap)
            path.setAttribute("stroke-linejoin", pathInfo.strokeLinejoin)
            svg.appendChild(path)
        })

        svg.addEventListener("click", (event) => {
            event.stopPropagation()

            let urlGivens = ""
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    urlGivens += given.board[r][c]
                }
            }
            const currentURL = window.location.href;
            const urlWithoutParameters = currentURL.split('?')[0];
            const url = `${urlWithoutParameters}?algo=11&givens=${urlGivens}`
            this.#copyToClipboard(url)
            alert("URL for sharing has been copied to the clipboard.")

            this.#render()
        })

        return svg
    }

    #copyToClipboard(text) {
        // Create a temporary input element
        var tempInput = document.createElement('input');
        tempInput.value = text;

        // Append the input element to the DOM (it doesn't need to be visible)
        document.body.appendChild(tempInput);

        // Select the text in the input element
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); // For mobile devices

        // Copy the selected text to the clipboard
        document.execCommand('copy');

        // Remove the temporary input element
        document.body.removeChild(tempInput);
    }
}