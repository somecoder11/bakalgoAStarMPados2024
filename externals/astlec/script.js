
// random seed
// create vertices (x,y position, mark dest, mark start, mark isEuclidToDest(weight) given by input, shortest distance from start vertex(initaial set to infinity), next shortest vertex, shortestparent to start edge = null, euclidian distance to destination vertex, diatance to start + euclid distance to dest(weight)
// create edges (from, to, distance)
// define starting vertex
// define destination vertex

//do while non visited edge exists or destination is reached
    // check one ring neighbourhood of current vertex
        // calulate the distance to start vertex by startdistance of parent voertex + distsance euclidian distance to parent
            // if new distance of checked vertex to start vertex is shorter than previous, set parent vertex to current vertex
        //calculate euclidean distances of checked vertex to destination vertex, calculate the total distance
            // if total distance of checked vertex is shorter than total distance of parents next vertex, or parents next vertex is null, set parents next vertex to checked vertex.
    // set paretn vertex in current vertex next vertex to current vertex
    // set current vertex to current vertexes next vertex