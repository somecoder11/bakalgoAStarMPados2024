
// random seed
var XGRIDSIZE = 300;
var YGRIDSIZE = 300;
class Node {
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
        this.shortestDistanceToStartNode = Infinity;
        this.euclidToDest = Infinity;
        this.totalCost = Infinity;
        this.shortestParentToStartNode = null;
        this.nextNode = null;
    }

    assignName() {
        const name = String.fromCharCode(65 + Node.lastAssignedId); // 65 is the ASCII for 'A'
        Node.lastAssignedId++;
        return name;
    }

    get coordinates() {
        return `(${this._x}, ${this._y})`;
    }

    euclideanDistanceTo(node) {
        return Math.sqrt(Math.pow(this.x - node.x, 2) + Math.pow(this.y - node.y, 2));
    }


    addEdge(toNode) {

        if (this.outgoingEdges.some(edge => edge.to.name === toNode.name)) {
            return null;
        }

        const edge = new Edge(this, toNode, this.euclideanDistanceTo(toNode));
        this.outgoingEdges.push(edge);
        toNode.incomingEdges.push(edge);
        return edge;
    }

    setStart()
    {
        this.isStart = true;
        this.shortestDistanceToStartNode = 0;
    }
}

class Edge {
    constructor(from, to, distance) {
        this.from = from; // Starting node of the edge
        this.to = to; // Ending node of the edge
        this.distance = distance; // Distance between from and to vertices
    }
}

function addRandomNodesEdges(nodes, edges, numNodes)
{
    for(let i = 0; i < numNodes; i++)
    {

        const x = Math.floor(Math.random() * XGRIDSIZE);
        const y = Math.floor(Math.random() * YGRIDSIZE);
        nodes.push(new Node(x, y));
    }

    nodes.forEach(node => {
        const numEdges = Math.floor(Math.random() * numNodes) + 1;
        for (let i = 0; i < numEdges; i++)
        {
            let nodeB = nodes[Math.floor(Math.random() * numNodes)];
            const edge = node.addEdge(nodeB);
            if (edge !== null) {
                edges.push(edge);
            }
        }
    })
    let startNodeIndex = Math.floor(Math.random() * numNodes);
    let destNodeIndex = Math.floor(Math.random() * numNodes);

    while (startNodeIndex === destNodeIndex) {
        destNodeIndex = Math.floor(Math.random() * numNodes);
    }
    nodes[startNodeIndex].setStart();
    nodes[destNodeIndex].isDest = true;
    return {start: nodes[startNodeIndex], dest: nodes[destNodeIndex]};

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
            edge.to.euclidToDest = edge.to.euclideanDistanceTo(dest); //maybe unneccecary to preform multiple times
            // calculate the distance of reaching the node from start node (current node distanceToStart + distance current node - checked node) and total distance
            let currentDistance = currentNode.shortestDistanceToStartNode + edge.distance;

            // if distance in checked node is lower than previous distance,
            if( currentDistance < edge.to.shortestDistanceToStartNode) {
                // add checked node to priority queue
                edge.to.shortestDistanceToStartNode = currentDistance;
                // set checked nodes parent node to current node
                edge.to.shortestParentToStartNode = currentNode;
                edge.to.totalCost = edge.to.shortestDistanceToStartNode + edge.to.euclidToDest; //create internal function for this?
                pq.push(edge.to);
            }

        })
    }
}
function main() {

    // create vertices (x,y position, mark dest, mark start, mark isEuclidToDest(weight) given by input,
            // shortest distance from start node(initaial set to infinity), next shortest node, shortest parent to start node = null, euclidian distance to destination node, diatance to start + euclid distance to dest(weight)
    // create edges (from, to, distance)
    // define starting node todo
    // define destination node todo
    let vertices = [];
    let edges = [];

    let numNodes = 10;
    const startdest = addRandomNodesEdges(vertices, edges, numNodes);


    vertices.forEach(node => {
        console.log(`Node at ${node.coordinates} has ${node.outgoingEdges.length} outgoing edges`);
    });

    as(startdest.start, startdest.dest);
}


main();

// wrong algorithm, for now I want to leave it here because it inspiries me and I want to think about it later
//do while non visited edge exists or destination is reached
    // check one ring neighbourhood of current node
        // calculate the distance to start node by startdistance of parent vortex + distsance euclidian distance to parent
            // if new distance of checked node to start node is shorter than previous, set parent node to current node
        //calculate euclidean distances of checked node to destination node, calculate the total distance
            // if total distance of checked node is shorter than total distance of parents next node, or parents next node is null, set parents next node to checked node.
    // set parent node in current node next node to current node
    // set current node to current nodees next node


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

