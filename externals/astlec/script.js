
// random seed

class Vertex {
    static lastAssignedId = 0;
    constructor(x, y, isStart = false, isDest = false) {
        this.name = this.assignName();
        this.x = x;
        this.y = y;
        this.isStart = isStart;
        this.isDest = isDest;
        this.isWeightGiven = false;
        this.incomingEdges = [];
        this.outgoingEdges = [];
        this.shortestDistanceToStartVertex = Infinity;
        this.euclidToDest = Infinity;
        this.totalCost = Infinity;
        this.shortestParentToStartVertex = null;
        this.nextVertex = null;
    }

    assignName() {
        const name = String.fromCharCode(65 + Vertex.lastAssignedId); // 65 is the ASCII for 'A'
        Vertex.lastAssignedId++;
        return name;
    }

    get coordinates() {
        return `(${this._x}, ${this._y})`;
    }

    euclideanDistanceTo(vertex) {
        return Math.sqrt(Math.pow(this.x - vertex.x, 2) + Math.pow(this.y - vertex.y, 2));
    }


    addEdge(toVertex) {
        const edge = new Edge(this, toVertex, this.euclideanDistanceTo(toVertex));
        this.outgoingEdges.push(edge);
        toVertex.incomingEdges.push(edge);
        return edge;
    }
}

class Edge {
    constructor(from, to, distance) {
        this.from = from; // Starting vertex of the edge
        this.to = to; // Ending vertex of the edge
        this.distance = distance; // Distance between from and to vertices
    }
}

function as(){

}
function main() {

    // create vertices (x,y position, mark dest, mark start, mark isEuclidToDest(weight) given by input, shortest distance from start vertex(initaial set to infinity), next shortest vertex, shortest parent to start vertex = null, euclidian distance to destination vertex, diatance to start + euclid distance to dest(weight)
    // create edges (from, to, distance)
    // define starting vertex todo
    // define destination vertex todo
    let vertices = [];
    let edges = [];


    let vertexA = new Vertex(0, 0, true); // Starting vertex
    let vertexB = new Vertex(1, 2);
    let vertexC = new Vertex(4, 6, false, true); // Destination vertex

    vertices.push(vertexA, vertexB, vertexC);

    edges.push(vertexA.addEdge(vertexB));
    edges.push(vertexB.addEdge(vertexC));

    vertices.forEach(vertex => {
        console.log(`Vertex at ${vertex.coordinates} has ${vertex.outgoingEdges.length} outgoing edges`);
    });

    as();
}


main();


//do while non visited edge exists or destination is reached
    // check one ring neighbourhood of current vertex
        // calculate the distance to start vertex by startdistance of parent vortex + distsance euclidian distance to parent
            // if new distance of checked vertex to start vertex is shorter than previous, set parent vertex to current vertex
        //calculate euclidean distances of checked vertex to destination vertex, calculate the total distance
            // if total distance of checked vertex is shorter than total distance of parents next vertex, or parents next vertex is null, set parents next vertex to checked vertex.
    // set parent vertex in current vertex next vertex to current vertex
    // set current vertex to current vertexes next vertex

