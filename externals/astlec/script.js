
// random seed

class Vertex {
    static lastAssignedId = 0;

    constructor(x, y, isStart = false, isDest = false) {
        this.name = this.assignName();
        this.x = x;
        this.y = y;
        this.isStart = isStart;
        this.isDest = isDest;
        this.isVisited = false;
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

        if (this.outgoingEdges.some(edge => edge.to.name === toVertex.to.name)) {
            return null;
        }

        const edge = new Edge(this, toVertex, this.euclideanDistanceTo(toVertex));
        this.outgoingEdges.push(edge);
        toVertex.incomingEdges.push(edge);
        return edge;
    }

    setStart()
    {
        this.isStart = true;
        this.shortestDistanceToStartVertex = 0;
    }
}

class Edge {
    constructor(from, to, distance) {
        this.from = from; // Starting vertex of the edge
        this.to = to; // Ending vertex of the edge
        this.distance = distance; // Distance between from and to vertices
    }
}

function addRandomVerticesEdges(vertices, edges, numVertices)
{
    for(let i = 0; i < numVertices; i++)
    {

        const x = Math.floor(Math.random() * XGRIDSIZE);
        const y = Math.floor(Math.random() * YGRIDSIZE);
        vertices.push(new Vertex(x, y));
    }

    vertices.forEach(vertex => {
        const numEdges = Math.floor(Math.random() * numVertices) + 1;
        for (let i = 0; i < numEdges; i++)
        {
            let vertexB = vertices[Math.floor(Math.random() * numVertices)];
            const edge = vertex.addEdge(vertexB);
            if (edge !== null) {
                edges.push(edge);
            }
        }
    })
    let startVertexIndex = Math.floor(Math.random() * numVertices);
    let destVertexIndex = Math.floor(Math.random() * numVertices);

    while (startVertexIndex === destVertexIndex) {
        destVertexIndex = Math.floor(Math.random() * numVertices);
    }
    vertices[startVertexIndex].setStart();
    vertices[destVertexIndex].isDest = true;
    return {start: vertices[startVertexIndex], dest: vertices[destVertexIndex]};

}
function as(start, dest){
    let pq = [];
    // add start to priority queue
    pq.push(start);
    let currentNode = start;

    // while pq not empty or dest found
    while(pq.length !== 0 ) {
        // take the first element in the pq (delete it from the queue and save it to currentnode)
        let indexWithMinValue = pq.reduce((minIndex, item, index, array) => {
            return item.totalCost < array[minIndex].totalCost ? index : minIndex;
        }, 0);
        currentNode = pq[indexWithMinValue];
        pq.splice(indexWithMinValue, 1);
        if (currentNode.isDest) {
            break;
        }
        // for outgoing edge from current node
        currentNode.outgoingEdges.forEach(edge => {
            // calculate the weight (euclidian distance to end node) of the checked node
            edge.to.euclidToDest = edge.euclidToDest(dest); //maybe unneccecary to preform multiple times
            // calculate the distance of reaching the node from start node (current node distanceToStart + distance current node - checked node) and total distance
            let currentDistance = currentNode.shortestDistanceToStartVertex + edge.distance;

            // if distance in checked node is lower than previous distance,
            if( currentDistance < edge.to.shortestDistanceToStartVertex) {
                // add checked node to priority queue
                edge.to.shortestDistanceToStartVertex = currentDistance;
                // set checked nodes parent node to current node
                edge.to.shortestParentToStartVertex = currentNode;
                edge.to.totalCost = edge.to.shortestDistanceToStartVertex + edge.to.euclidToDest; //create internal function for this?
                pq.push(edge.to);
            }

        })
    }



    let currentVertex = start;
    while(vertices.some(vertex => vertex.isVisited === false) || currentVertex.isDest === true)
    {
        currentVertex.outgoingEdges.forEach(edge => {
            // calculate the distance to start vertex by startdistance of parent vortex + distsance euclidian distance to parent
            let currentDistance = currentVertex.shortestDistanceToStartVertex + edge.distance;
            // if new distance of checked vertex to start vertex is shorter than previous, set parent vertex to current vertex
            if( currentDistance < edge.to.shortestDistanceToStartVertex) {
                edge.to.shortestDistanceToStartVertex = currentDistance;
                edge.to.shortestParentToStartVertex = currentVertex;
            }
            //calculate Euclidean distances of checked vertex to destination vertex, calculate the total distance
            edge.to.euclidToDest = edge.euclidToDest(dest);
            edge.to.totalCost = edge.to.shortestDistanceToStartVertex + edge.to.euclidToDest;
            // if total distance of checked vertex is shorter than total distance of current next vertex, or current next vertex is null, set parents next vertex to checked vertex.
            if(currentVertex.nextVertex === null || currentVertex.nextVertex > edge.to.totalCost)
            {
                currentVertex.nextVertex = edge.to;
            }
        })
    }//not visited vertex exist or destination is reached
//do while non visited vertex exists or destination is reached
    // check one ring neighbourhood of current vertex
    // calculate the distance to start vertex by startdistance of parent vortex + distsance euclidian distance to parent
            // if new distance of checked vertex to start vertex is shorter than previous, set parent vertex to current vertex
        //calculate euclidean distances of checked vertex to destination vertex, calculate the total distance
            // if total distance of checked vertex is shorter than total distance of parents next vertex, or parents next vertex is null, set parents next vertex to checked vertex.
    // set parent vertex in current vertex next vertex to current vertex
    // set current vertex to current vertexes next vertex

}
function main() {

    // create vertices (x,y position, mark dest, mark start, mark isEuclidToDest(weight) given by input,
            // shortest distance from start vertex(initaial set to infinity), next shortest vertex, shortest parent to start vertex = null, euclidian distance to destination vertex, diatance to start + euclid distance to dest(weight)
    // create edges (from, to, distance)
    // define starting vertex todo
    // define destination vertex todo
    let vertices = [];
    let edges = [];


    const stasrtdest = addRandomVerticesEdges(vertices, edges, numVertices);


    vertices.forEach(vertex => {
        console.log(`Vertex at ${vertex.coordinates} has ${vertex.outgoingEdges.length} outgoing edges`);
    });

    as();
}


main();

// wrong algorithm, for now I want to leave it here because it inspiries me and I want to think about it later
//do while non visited edge exists or destination is reached
    // check one ring neighbourhood of current vertex
        // calculate the distance to start vertex by startdistance of parent vortex + distsance euclidian distance to parent
            // if new distance of checked vertex to start vertex is shorter than previous, set parent vertex to current vertex
        //calculate euclidean distances of checked vertex to destination vertex, calculate the total distance
            // if total distance of checked vertex is shorter than total distance of parents next vertex, or parents next vertex is null, set parents next vertex to checked vertex.
    // set parent vertex in current vertex next vertex to current vertex
    // set current vertex to current vertexes next vertex


// add start to priority queue
// while pq not empty or dest found
    // take the first element in the pq (delete it from the que and save it to currentnode)
    // for outgoing edge from current node
        // calculate the weight (euclidian distance to end node) of the checked node
        // calculate the distance of reaching the node from start node (current node distanceToStart + distance current node - checked node) and total distance
        // if distance in checked node is lower than previous distance,
            // add checked node to priority queue
            // set checked nodes parent node to current node
    // set node with lowest total distance value to current node

