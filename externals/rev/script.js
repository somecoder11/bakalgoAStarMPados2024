function ReverseSearch() {
  this.active = false;
  var width = 840;
  var height = 640;
  var gridBorder = 10;

  var contentDiv;
  var infoDiv;
  var algoDiv;

  var canvas;
  var context;


  var execInterval = 50;  //ms
  var speed = 5;

  var defaultDotColor = "#222222";
  var dotCircleColor = "#BBBBBB";
  var dottedRectangleColor = "#000000";

  var stepCount = 0;
  var pointLimit = 26;
  var pointCount = 0;

  var vertices = new Array();
  var edges = new Array();
  var currentEdges = new Array();

  var vertexInMemory = undefined;
  var selectedVertex = undefined;
  var movingPoint = undefined;

  var startingVertex = null;
  var v = null;
  var j = 0;
  var count = 1;
  var visitedVertices = new Array();

  var nextVertexColor = "#009900";
  var consideredVertexColor = "#FF8A00";
  var visitedVertexColor = "#FF8A00";
  var startingVertexColor = "#FF0000";

  var edgeColor = "#000088";
  var predecessorEdgeColor = "#8A008A";
  var drawingEdgeColor = "#FF8A00";
  var deletingEdgeColor = "#FF0000";
  var boundingMemoryColor = "#888888";

  var dottedThickness = 2;
  var dotCircleThickness = 2;
  var dotRadius = 5
  var dotCircle = 20
  var minObjectDistance = 20;

  var memoryWidth = 300;
  var memoryXOff = (width-memoryWidth-dottedThickness+10);
  var memoryVOff = 320;
  var memoryRowHeight = 20;

  var reverseTraverse = true;
  var visitNextVertex = false;
  var resetJ = false;

  var drawNewEdgeActive = false;

  var useEuclideanDistancePolicy = true;
  var drawingPolicy = false;

  //global algorithm variables
  var FINISHED = false;
  var ISPAUSED = true;
  var DRAW = true;

  this.initialize = function() {
    contentDiv = document.getElementById("content")
    infoDiv = document.getElementById("info")
    algoDiv = document.getElementById("algo")

    canvas = document.createElement("canvas")
    canvas.setAttribute("id", "canvas");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    contentDiv.appendChild(canvas);

    contentDiv.setAttribute("style","width:" + width + "px");
    contentDiv.style.width=width + 'px';
    infoDiv.setAttribute("style","width:" + (width+10) + "px");
    infoDiv.style.width=(width+10) + 'px';
    algoDiv.setAttribute("style","width:" + (width+10) + "px");
    algoDiv.style.width=(width+10) + 'px';

    canvas.addEventListener('mousemove', this.movePoint, true);
    canvas.addEventListener('mousedown', this.draw, true);
    canvas.addEventListener('mouseup', this.releasePoint, true);

    $("canvas#canvas").on("mouseover",function() {$(this).css('cursor', 'url(res/crosshair.png), auto');}).mouseout(function(){$(this).css('cursor', 'auto');});
    $("canvas#canvas").on("contextmenu", function(e){ return false; });

    this.redrawCanvas();
  }

  this.drawCanvasBoundingBox = function() {
    context.setLineDash([5, 5]);

    context.beginPath();
    context.lineWidth = dottedThickness;
    context.strokeStyle = dottedRectangleColor;
    context.rect(dottedThickness/2 + minObjectDistance, dottedThickness/2 + minObjectDistance,
              canvas.width-memoryWidth-dottedThickness-2*minObjectDistance, canvas.height-dottedThickness-2*minObjectDistance);

    context.stroke();
    context.setLineDash([])
  }

  this.drawMemory = function() {

    context.beginPath();
    context.strokeStyle = dottedRectangleColor;
    context.lineWidth = dottedThickness;
    context.rect(memoryXOff, dottedThickness/2 + minObjectDistance,
              memoryWidth-20, 2*memoryRowHeight-dottedThickness);
    context.stroke();
    context.fillStyle = dottedRectangleColor;
    context.font="20px Consolas";
    context.textAlign="center";
    context.fillText("In Memory", memoryXOff + memoryWidth/2- 15, dottedThickness/2 + minObjectDistance+25);

    context.strokeStyle = dottedRectangleColor;



    if(v != null) {

      if(resetJ && !FINISHED) {
        context.font="16px Consolas";
        context.textAlign="left";
        context.fillStyle = "red";
        context.fillText("Reset 'j' via Forward Traverse", memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*2);
        context.fillStyle = "black";
      } else if(j == 0) {
        context.font="16px Consolas";
        context.textAlign="left";
        context.fillStyle = "red";
        context.fillText("Marked " + v.i + " as visited", memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*2);
        context.fillStyle = "black";
      }


      context.font="16px Consolas";
      context.textAlign="left";
      context.fillText("visited vertices 'count': " + count, memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*3);

      context.font="16px Consolas";
      context.textAlign="left";
      context.fillText("neighborhood counter 'j': " + j, memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*4);

      context.font="16px Consolas";
      context.textAlign="left";
      context.fillText("visited vertices: ", memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*6);
      context.font="12px Consolas";
      context.textAlign="left";
      context.fillText("[" + visitedVertices.map(v => v.i).join(",") + "]", memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*7);

      context.font="16px Consolas";
      context.textAlign="left";
      context.fillText("current vertex in memory: ", memoryXOff + 5, dottedThickness/2 + minObjectDistance+25 + memoryRowHeight*8);

      for(index = 0; index < v.n.length; index++) {
        neighbor = v.n[index];
        vector = {
          x : neighbor.x - v.x,
          y : neighbor.y - v.y
        };

        length = Math.sqrt((vector.x*vector.x) + (vector.y * vector.y));

        vector.x = (vector.x/length)*75;
        vector.y = (vector.y/length)*75;

        startingPoint = {
          x : memoryXOff + memoryWidth/2 - 15,
          y : memoryVOff
        };

        endPoint = {
          x : startingPoint.x + vector.x,
          y : startingPoint.y + vector.y
        };


        if(visitedVertices.includes(neighbor)) context.fillStyle = visitedVertexColor;
        if(index+1 == j && !FINISHED) context.fillStyle = nextVertexColor;

        context.setLineDash([3, 3]);
        context.beginPath()
        context.strokeStyle = context.fillStyle;
        //edge
        context.moveTo(endPoint.x, endPoint.y)
        context.lineTo(startingPoint.x, startingPoint.y)
        context.stroke()
        context.setLineDash([])

        //arrow head
        context.beginPath()
        context.moveTo(startingPoint.x, startingPoint.y)
        angle = Math.atan2(startingPoint.y - endPoint.y, startingPoint.x - endPoint.x);
        context.lineTo(startingPoint.x - 10 * Math.cos(angle - Math.PI / 6), startingPoint.y - 10 * Math.sin(angle - Math.PI / 6));
        context.moveTo(startingPoint.x, startingPoint.y);
        context.lineTo(startingPoint.x - 10 * Math.cos(angle + Math.PI / 6), startingPoint.y - 10 * Math.sin(angle + Math.PI / 6));
        context.stroke()

        vector.x = vector.x*1.2;
        vector.y = vector.y*1.2;

        endPoint = {
          x : startingPoint.x + vector.x,
          y : startingPoint.y + vector.y
        };

        context.beginPath();
        context.fillStyle = neighbor.f.color;
        if(visitedVertices.includes(neighbor)) context.fillStyle = visitedVertexColor;
        if(neighbor == startingVertex) context.fillStyle = startingVertexColor;
        if(index+1 == j && !FINISHED) context.fillStyle = nextVertexColor;
        context.arc(endPoint.x, endPoint.y, dotRadius, 0, 2*Math.PI);
        context.fill();

        context.font="15px Consolas";
        context.textAlign="center";
        context.fillText(neighbor.i, endPoint.x, endPoint.y - 8);
        context.fillText(reverseSearch.generateOrdinalSuffix(index+1), endPoint.x, endPoint.y + 18);
        context.fillStyle = "black";
      }

      context.beginPath();
      context.fillStyle = v.f.color;
      if(visitedVertices.includes(v)) context.fillStyle = visitedVertexColor;
      if(v == startingVertex) context.fillStyle = startingVertexColor;
      context.arc(memoryXOff + memoryWidth/2 - 15, memoryVOff, dotRadius, 0, 2*Math.PI);
      context.fill();

      context.font="15px Consolas";
      context.textAlign="center";
      context.fillText(v.i, memoryXOff + memoryWidth/2 - 15, memoryVOff - 8);
      context.fillText("v", memoryXOff + memoryWidth/2 - 15, memoryVOff + 16);
      context.fillStyle = "black";

      context.beginPath();
      context.setLineDash([4, 4]);
      context.strokeStyle = boundingMemoryColor;
      context.lineWidth = dotCircleThickness;
      context.arc(memoryXOff + memoryWidth/2 - 15, memoryVOff, dotCircle*6, 0, 2*Math.PI);
      context.stroke();
      context.setLineDash([]);

      reverseSearch.drawLegend();
    }
  }

  this.drawLegend = function() {
    colWidth = (memoryWidth-10)/3;

    context.beginPath();
    context.fillStyle = startingVertexColor;
    context.arc(memoryXOff + 10, memoryVOff + 96 + memoryRowHeight * 4, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Starting Vertex v0", memoryXOff + 20, memoryVOff + 100 + memoryRowHeight * 4);


    context.beginPath();
    context.fillStyle = visitedVertexColor;
    context.arc(memoryXOff + 10 + memoryWidth/2, memoryVOff + 96 + memoryRowHeight * 4, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Visited Vertex", memoryXOff + 20 + memoryWidth/2, memoryVOff + 100 + memoryRowHeight * 4);


    context.beginPath();
    context.fillStyle = nextVertexColor;
    context.arc(memoryXOff + 10, memoryVOff + 96 + memoryRowHeight * 5, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Next Vertex to visit", memoryXOff + 20, memoryVOff + 100 + memoryRowHeight * 5);
  }

  this.stepForward = function() {
    if(FINISHED) {
      this.redrawCanvas();
      return;
    }

    stepCount++;

    if(!visitNextVertex && reverseTraverse && j < v.n.length) {
      resetJ = false;

      j++;
      w = reverseSearch.getNthNeighbor(v, j);
      if(v == this.getPredecessor(w)) {
        visitNextVertex = true;
      }
    } else if(visitNextVertex) {
        visitNextVertex = false;
        v = w;
        j = 0;
        count++;

        if(!visitedVertices.includes(v)) {
          visitedVertices.push(v);
        }
    } else {
      reverseTraverse = false;

      if(startingVertex != v) {
        resetJ = true;

        w = v;
        v = this.getPredecessor(w);
        j = 1;
        while(reverseSearch.getNthNeighbor(v, j) != w) {
          j++;
        }
      }
    }

    this.redrawCanvas();

    if(startingVertex == null || (startingVertex == v && j == startingVertex.n.length && !visitNextVertex)) {
      FINISHED = true;
    } else {
      reverseTraverse = true;
    }
  }

  this.stepBackward = function() {
    ISPAUSED = true;
    if(stepCount <= 0) return;
    var destindex = Math.max(stepCount-1, 0);
    DRAW = false;
    this.resetReverseSearch();
    while(stepCount != destindex) {
      this.stepForward();
    }
    DRAW = true;
    this.redrawCanvas();
  }

  this.draw = function(evt) {
    var rect = canvas.getBoundingClientRect();
    var pos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
    };

    var point = reverseSearch.Point(pos.x, pos.y)


    //check if click is outside the min object distance from every other dot and the border
    if(reverseSearch.minDistancesValid(point) && (evt.button == 0 && !drawingPolicy)) {
      if(pointCount == pointLimit) {
        alert("Sorry, the number of vertices is limited to " + pointLimit + ".")
        return;
      }

      pointCount++;

      vertices.push(point);

      reverseSearch.resetReverseSearch();
      reverseSearch.redrawCanvas();
    } else {
      evt.preventDefault();
      var clickedPoint = null;
      var clickedPointIndex = -1;

      for(i = 0; i < vertices.length; i++) {
        if(reverseSearch.euclideanDistance(vertices[i], point) <= minObjectDistance) {
          clickedPoint = vertices[i];
          clickedPointIndex = i;
          break;
        }
      }

      if(clickedPoint == null) {
        return;
      }

      if(evt.button == 1 || (evt.button == 0 && drawingPolicy)) { //middle mouse button
        drawNewEdgeActive = true;

        //select clicked point
        if(selectedVertex != undefined) {
          selectedVertex.f.selected = false;
        }

        selectedVertex = clickedPoint;
        selectedVertex.f.selected = true;

        reverseSearch.setStartingVertex(selectedVertex);
      } else if(evt.button == 2) { //right mouse button
        reverseSearch.resetReverseSearch();
        reverseSearch.redrawCanvas();

        reverseSearch.deletePoint(clickedPoint, clickedPointIndex);

        ISPAUSED = true;

        reverseSearch.resetReverseSearch();
        reverseSearch.redrawCanvas();
      } else {
        ISPAUSED = true;
        movingPoint = clickedPoint;
      }
    }
  }

  this.movePoint = function(evt) {
    if(drawNewEdgeActive) {
      var rect = canvas.getBoundingClientRect();
      var pos = {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
      };

      var point = reverseSearch.Point(pos.x, pos.y)

      if(reverseSearch.minDistancesValid(point)) {

        reverseSearch.redrawCanvas();

        edge = {
          0: selectedVertex,
          1: point,
        }


        reverseSearch.drawCanvasBoundingBox();
        reverseSearch.drawEdge(edge, drawingEdgeColor)
      } else {
        reverseSearch.redrawCanvas();

        var hoveringVertex = null;

        for(i = 0; i < vertices.length; i++) {
          if(reverseSearch.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
            hoveringVertex = vertices[i];
            break;
          }
        }

        if(hoveringVertex != selectedVertex && hoveringVertex != null) {
          edge = {
            0: selectedVertex,
            1: hoveringVertex,
          }

          newEdge = true;
          for(i = 0; i < edges.length; i++) {
            curEdge = edges[i];
            if((curEdge[0] == hoveringVertex && curEdge[1] == selectedVertex) || (curEdge[1] == hoveringVertex && curEdge[0] == selectedVertex)) {
              newEdge = false;
            }
          }

          reverseSearch.drawCanvasBoundingBox();

          if(newEdge) {
            reverseSearch.drawEdge(edge, drawingEdgeColor);
          } else {
            reverseSearch.drawEdge(edge, deletingEdgeColor);
          }
        }
      }
    } else {
      if(movingPoint == undefined) {
        reverseSearch.redrawCanvas();
        return;
      }

      if(stepCount > 0) {
        reverseSearch.resetReverseSearch();
        reverseSearch.redrawCanvas();
      }

      var rect = canvas.getBoundingClientRect();
      var pos = {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
      };

      var pos = {x: pos.x, y: pos.y}

      var positionValid = true;
      for(i = 0; i < vertices.length; i++) {
        if(vertices[i] == movingPoint) {
          continue;
        }

        if(reverseSearch.euclideanDistance(vertices[i], pos) < minObjectDistance) {
          positionValid = false;
          break;
        }
      }

      if(pos.x < (minObjectDistance) || pos.x > (canvas.width - memoryWidth - minObjectDistance))
        positionValid = false;

      if(pos.y < (minObjectDistance) || pos.y > (canvas.height - minObjectDistance))
        positionValid = false;


      if(positionValid) {
        movingPoint.x = pos.x;
        movingPoint.y = pos.y;
      }

      reverseSearch.redrawCanvas();
    }
  }

  this.releasePoint = function(evt) {
    movingPoint = undefined;
    drawNewEdgeActive = false;

    if(evt.button == 1 || (evt.button == 0 && drawingPolicy)) {
      evt.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var pos = {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
      };

      var point = reverseSearch.Point(pos.x, pos.y)
      var hoveringVertex = null;

      for(i = 0; i < vertices.length; i++) {
        if(reverseSearch.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
          hoveringVertex = vertices[i];
          break;
        }
      }

      if(hoveringVertex != selectedVertex && hoveringVertex != null) {
        newEdge = true;
        for(i = 0; i < edges.length; i++) {
          curEdge = edges[i];
          if((curEdge[0] == hoveringVertex && curEdge[1] == selectedVertex) || (curEdge[1] == hoveringVertex && curEdge[0] == selectedVertex)) {
            selectedVertex.n.splice(selectedVertex.n.indexOf(hoveringVertex), 1);
            hoveringVertex.n.splice(hoveringVertex.n.indexOf(selectedVertex), 1);
            edges.splice(i, 1);
            newEdge = false;
          }
        }

        if(newEdge && selectedVertex != undefined) {
          edge = reverseSearch.Edge(selectedVertex, hoveringVertex);
          if(edge != null) {
            selectedVertex.n.push(hoveringVertex);
            hoveringVertex.n.push(selectedVertex);

            edges.push(edge);

            reverseSearch.drawEdge(edge);
          }
        }
      }

      if(selectedVertex != undefined) {
        selectedVertex.f.selected = false;
        selectedVertex = undefined;
      }
    }

    reverseSearch.resetReverseSearch()
    reverseSearch.redrawCanvas();
  }

  this.deletePoint = function(point, index) {
    removedPoint = vertices.splice(index, 1);

    tmpPoints = vertices;
    tmpEdges = edges;

    tmpStartingVertex = startingVertex;

    reverseSearch.clearReverseSearch();

    for(index = 0; index < tmpPoints.length; index++) {
      point = tmpPoints[index]

      pointCount++;

      elementIndex = point.n.indexOf(removedPoint[0]);
      if (elementIndex > -1) {
        point.n.splice(elementIndex, 1);
      }

      point.p = null;

      vertices.push(point);
    }

    for(index = 0; index < tmpEdges.length; index++) {
      edge = tmpEdges[index];

      if(edge[0] != removedPoint[0] && edge[1] != removedPoint[0]) {
        edges.push(edge);
      }
    }

    reverseSearch.setStartingVertex(vertices[0]);

    reverseSearch.resetReverseSearch();
    reverseSearch.redrawCanvas();
  }

  this.minDistancesValid = function(point) {
    //x
    if(point.x <= minObjectDistance || point.x >= (canvas.width - minObjectDistance - memoryWidth))
      return false;
    //y
    if(point.y <= minObjectDistance || point.y >= (canvas.height - minObjectDistance))
      return false;

    var retval = true;
    vertices.forEach(function(currPoint) {
      if(reverseSearch.euclideanDistance(currPoint, point) <= minObjectDistance) {
        retval = false;
      }
    })
    return retval;
  }

  this.euclideanDistance = function(p1, p2) {
    return Math.sqrt(((p1.x - p2.x)*(p1.x - p2.x)) + ((p1.y - p2.y)*(p1.y - p2.y)));
  }


  this.getNthNeighbor = function(point, n) {
    if(n < 0 || n > point.n.length) {
      return null;
    }

    //console.log(n + "th neighbor of " + point.i + " is " + point.n[n - 1]);
    //console.log(point.n);

    return point.n[n - 1];
  }

  this.getPredecessor = function(point) {
    return point.p;
  }

  this.setRoot = function(point) {
    point.p = point;
  }

  this.redrawCanvas = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(DRAW) {
      this.drawCanvasBoundingBox();
      this.drawMemory();

      this.drawGraph();
    }
  }

  this.drawGraph = function() {
    context.save();
    context.setLineDash([4, 4]);
    context.lineWidth = "1";
    context.restore();

    edges.forEach(function(edge) {
      reverseSearch.drawEdge(edge, edgeColor)
    })

    currentEdges.forEach(function(edge) {
      reverseSearch.drawEdge(edge, consideredVertexColor)
    })

    vertices.forEach(function(point) {
      reverseSearch.drawPoint(point)
    })
  }

  this.drawPoint = function(point) {
    context.beginPath();
    context.fillStyle = point.f.color;
    if(v != null && v.n[j-1] == point) context.fillStyle = nextVertexColor;
    if(visitedVertices.includes(point)) context.fillStyle = visitedVertexColor;
    if(point == startingVertex) context.fillStyle = startingVertexColor;
    context.arc(point.x, point.y, dotRadius, 0, 2*Math.PI);
    context.fill();

    //uncomment for debugging purposes

    context.font="15px Consolas";
    context.textAlign="center";
    context.fillText(point.i, point.x, (point.y-8));
    context.fillStyle = "black";

    if(stepCount != 0 && point != v) return;

    context.beginPath();
    context.setLineDash([4, 4]);
    context.strokeStyle = point.f.circle;
    context.lineWidth = dotCircleThickness;
    context.arc(point.x, point.y, dotCircle, 0, 2*Math.PI);
    context.stroke();
    context.setLineDash([]);
  }

  this.drawEdge = function(edge, color) {
    context.beginPath()

    var predecessor = false;
    if(this.getPredecessor(edge[0]) == edge[1]) {
      predecessor = true;
    } else if (this.getPredecessor(edge[1]) == edge[0]) {
      //swap direction
      tmp = edge[0];
      edge[0] = edge[1];
      edge[1] = tmp;
      predecessor = true;
    }

    point = edge[0];

    context.strokeStyle = color;
    if(predecessor) {
      context.strokeStyle = predecessorEdgeColor;
    } else {
      context.setLineDash([4, 4]);
    }
    if(v != null && v.n[j-1] == point) context.strokeStyle = nextVertexColor;
    if(visitedVertices.includes(point)) context.strokeStyle = visitedVertexColor;

    //edge
    context.moveTo(edge[0].x, edge[0].y);
    context.lineTo(edge[1].x, edge[1].y);

    if(predecessor) {
      //arrow head
      var angle = Math.atan2(edge[1].y - edge[0].y, edge[1].x - edge[0].x);
      context.lineTo(edge[1].x - 15 * Math.cos(angle - Math.PI / 6), edge[1].y - 15 * Math.sin(angle - Math.PI / 6));
      context.moveTo(edge[1].x, edge[1].y);
      context.lineTo(edge[1].x - 15 * Math.cos(angle + Math.PI / 6), edge[1].y - 15 * Math.sin(angle + Math.PI / 6));
    }

    context.stroke()
    context.setLineDash([]);
  }


  this.Point = function(x_coord, y_coord) {
    var newPoint = {
      x : x_coord,
      y : y_coord,
      n : new Array(),      //neighbors
      p : null,             //predecessor if root node
      i : pointCount + 1,
      f : {color: defaultDotColor,     //flags
           circle: dotCircleColor}
      };
     return newPoint;
  }

  this.Edge = function(startPoint, endPoint) {
    var newEdge = {
      0 : startPoint,
      1 : endPoint,
    };
    return newEdge;
  }

  this.runInterval = function() {
    if(reverseSearch.active) {
      if(!ISPAUSED) {
        reverseSearch.stepForward();
      }
      clearInterval(reverseSearch.interval);
        runspeed = execInterval*speed;
        reverseSearch.interval = setInterval(reverseSearch.runInterval, runspeed);
    }
  }
  this.interval = setInterval(this.runInterval, execInterval*speed);

  this.runAlgorithm = function() {
    if(vertices.length > 0 && !FINISHED)
      ISPAUSED = false;
  }

  this.pauseAlgorithm = function() {
    ISPAUSED = true;
  }

  this.updateSpeed = function(newSpeed) {
    speed = (11-newSpeed);
  }

  this.updateDrawingPolicy = function(button) {
    if(button.value == "true") {
      drawingPolicy = false;
      button.value = "false";
      button.innerHTML = "Draw / Move Point";
    } else {
      drawingPolicy = true;
      button.value = "true";
      button.innerHTML = "Draw Edge / Select Start Vertex";
    }
  }

  this.generateOrdinalSuffix = function(num) {
    tenth = num % 10;
    hundredth = num % 100;
    if (tenth == 1 && hundredth != 11) {
        return num + "st";
    }
    if (tenth == 2 && hundredth != 12) {
        return num + "nd";
    }
    if (tenth == 3 && hundredth != 13) {
        return num + "rd";
    }
    return num + "th";
  }

  this.calculatePredecessors = function() {
    if(!startingVertex || vertices.length == 0) return;
    
    queue = [...vertices];

    for(let vertex of queue) {
      vertex.dist = Infinity;
      vertex.p = null;
    }
    startingVertex.dist = 0;

    while(queue.length > 0) {
      queue.sort(function(a, b) {
        return a.dist-b.dist;
      })
      u = queue.shift();

      for(let v of u.n) {
        alt = u.dist + reverseSearch.euclideanDistance(u, v);
        if(alt < v.dist) {
          v.dist = alt;
          v.p = u;
        }
      }
    }

    startingVertex.p = startingVertex;
  }

  this.setStartingVertex = function(point) {
    for(let vertex of vertices) {
      if(vertex == point) continue;
      vertex.p = null;
    }


    if(startingVertex != null) {
      startingVertex.p = null;
    }

    startingVertex = point;
    if(startingVertex != null) startingVertex.p = startingVertex;

    v = startingVertex;
    j = 0;
    count = 1;
    visitedVertices = new Array();
    visitedVertices.push(startingVertex);
  }

  this.resetReverseSearch = function() {
    stepCount = 0;
    resetJ = false;
    visitNextVertex = false;

    for(i = 0; i < vertices.length; i++) {
      vertices[i].f.color = defaultDotColor;
    }

    currentEdges = new Array();
    for(i = 0; i < edges.length; i++) {
      edges[i].visited = false;
    }

    drawNewEdgeActive = false;

    v = startingVertex;
    j = 0;
    count = 1;
    visitedVertices = new Array();
    visitedVertices.push(startingVertex);

    this.calculatePredecessors();

    FINISHED = false;
    DRAW = true;
    ISPAUSED = true;

    this.redrawCanvas();
  }

  this.clearReverseSearch = function() {
    stepCount = 0;
    resetJ = false;
    visitNextVertex = false;

    edges = new Array();
    currentEdges = new Array();
    vertices = new Array();

    selectedVertex = undefined;

    this.setStartingVertex(null)

    pointCount = 0;

    drawNewEdgeActive = false;

    FINISHED = false;
    DRAW = true;
    ISPAUSED = true;

    this.redrawCanvas();
  }

  this.finishReverseSearch = function() {
    ISPAUSED = true;
    DRAW = false;
    while(!FINISHED) {
      this.stepForward();
    }
    DRAW = true;
    this.redrawCanvas();
  }
};

reverseSearch = new ReverseSearch();
