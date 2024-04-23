import { Solver } from "./solver.js"

onmessage = (e) => {
    const solver = new Solver(false)
    const data = solver.solve(e.data, postMessage)
    postMessage(data)
}