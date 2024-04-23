function Dijkstra() {
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
  var costFactor = 25;

  var selectedVertex = undefined;
  var startingVertex = null;
  var movingPoint = undefined;

  var currentVertexColor = "#009900";
  var consideredVertexColor = "#FF8A00";
  var visitedVertexColor = "#888888";
  var startingVertexColor = "#FF0000";

  var edgeColor = "#000088";
  var drawingEdgeColor = "#FF8A00";
  var deletingEdgeColor = "#FF0000";


  var dottedThickness = 2;
  var dotCircleThickness = 2;
  var dotRadius = 5
  var dotCircle = 20
  var minObjectDistance = 20;

  var tableWidth = 300;
  var tableXOff = (width-tableWidth-dottedThickness+10);
  var tableElemHeight = 20;

  var highlightStep = true;

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
              canvas.width-tableWidth-dottedThickness-2*minObjectDistance, canvas.height-dottedThickness-2*minObjectDistance);

    context.stroke();
    context.setLineDash([])
  }

  this.drawTable = function() {

    colWidth = (tableWidth-10)/3;

    context.beginPath();
    context.strokeStyle = dottedRectangleColor;
    context.lineWidth = dottedThickness;
    context.rect(tableXOff, dottedThickness/2 + minObjectDistance,
              colWidth-10, 2*tableElemHeight-dottedThickness);
    context.rect(tableXOff + colWidth - 10, dottedThickness/2 + minObjectDistance,
              colWidth+20, 2*tableElemHeight-dottedThickness);
    context.rect(tableXOff + 2*colWidth + 10, dottedThickness/2 + minObjectDistance,
              colWidth-10, 2*tableElemHeight-dottedThickness);
    context.stroke();
    context.fillStyle = dottedRectangleColor;
    context.font="20px Consolas";
    context.textAlign="center";
    context.fillText("Vertex", tableXOff - tableWidth/6 + colWidth*1 - 5, dottedThickness/2 + minObjectDistance+25);
    context.fillText("Distance", tableXOff - tableWidth/6 + colWidth*2, dottedThickness/2 + minObjectDistance+25);
    context.fillText("Via", tableXOff - tableWidth/6 + colWidth*3 + 5, dottedThickness/2 + minObjectDistance+25);

    for(i = 0; i < vertices.length; i++) {
      var point = vertices[i];

      context.beginPath();
      context.lineWidth = dottedThickness;
      context.strokeStyle = dottedRectangleColor;
      context.rect(tableXOff, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight, colWidth-10, tableElemHeight);
      context.rect(tableXOff + colWidth - 10, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight, colWidth+20, tableElemHeight);
      context.rect(tableXOff + 2*colWidth + 10, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight, colWidth-10, tableElemHeight);
      context.stroke();


      context.fillStyle = point.f.color;
      if(point.f.selected) context.fillStyle = consideredVertexColor;
      context.textAlign="center";

      if(context.fillStyle != defaultDotColor) {
        context.font="bold 15px Consolas";
      } else {
        context.font="15px Consolas";
      }

      pointId = String.fromCharCode(64 + point.i);
      dist = "∞";
      prev = "-";

      if(point.c < Infinity) {
        if(!highlightStep && point.cExplained != "") {
          dist = point.cExplained;
          point.cExplained = "";
        } else {
          dist = point.c.toString();
        }
      }

      if(point.p != null) {
        prev = String.fromCharCode(64 + point.p.i);
      }

      context.fillText(pointId, tableXOff - tableWidth/6 + colWidth*1 - 5, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight + 15);
      context.fillText(dist, tableXOff - tableWidth/6 + colWidth*2, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight + 15);
      context.fillText(prev, tableXOff - tableWidth/6 + colWidth*3 + 5, -dottedThickness/2 + minObjectDistance + (i+2)*tableElemHeight + 15);
    }
    context.strokeStyle = dottedRectangleColor;
  }

  this.drawLegend = function() {
    colWidth = (tableWidth-10)/3;

    context.beginPath();
    context.fillStyle = startingVertexColor;
    context.arc(tableXOff + 10, (vertices.length + 4) * tableElemHeight, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Starting Vertex", tableXOff + 20, (vertices.length + 4) * tableElemHeight+4);


    context.beginPath();
    context.fillStyle = currentVertexColor;
    context.arc(tableXOff + 10 + tableWidth/2, (vertices.length + 4) * tableElemHeight, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Current Vertex", tableXOff + 20 + tableWidth/2, (vertices.length + 4) * tableElemHeight+4);


    context.beginPath();
    context.fillStyle = consideredVertexColor;
    context.arc(tableXOff + 10, (vertices.length + 5) * tableElemHeight, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Connected Vertex", tableXOff + 20, (vertices.length + 5) * tableElemHeight+4);


    context.beginPath();
    context.fillStyle = visitedVertexColor;
    context.arc(tableXOff + 10 + tableWidth/2, (vertices.length + 5) * tableElemHeight, dotRadius/2, 0, 2*Math.PI);
    context.fill();

    context.font="12px Consolas";
    context.textAlign="left";
    context.fillText("Visited Vertex", tableXOff + 20 + tableWidth/2, (vertices.length + 5) * tableElemHeight+4);
  }


  this.stepForward = function() {
    if(FINISHED) return;

    if(stepCount == 0) {
      unvisitedVertices = vertices.slice(0);
      if(selectedVertex != undefined) {
        selectedVertex.f.selected = false;
      }
    }

    stepCount++;

    if(highlightStep) {
      unvisitedVertices.sort(function(A, B) {
        return A.c-B.c;
      })

      selectedVertex = unvisitedVertices.shift();
      selectedVertex.f.color = currentVertexColor;

      currentEdges = new Array();

      for(i = 0; i < edges.length; i++) {
        edge = edges[i];
        if((edge[0] == selectedVertex && unvisitedVertices.includes(edge[1])) || (edge[1] == selectedVertex && unvisitedVertices.includes(edge[0]))) {
          currentEdges.push(edge);
        }
      }

      for(i = 0; i < currentEdges.length; i++) {
        edge = currentEdges[i];

        otherVertex = edge[0];
        if(otherVertex == selectedVertex) {
          otherVertex = edge[1];
        }

        dist = Math.round(this.euclideanDistance(selectedVertex, otherVertex)/costFactor);
        if(edge.weight != null) {
          dist = +edge.weight;
        }

        if(otherVertex.c > (selectedVertex.c + dist)) {
          otherVertex.c = (selectedVertex.c + dist);
          if(dist < 0) {
            otherVertex.cExplained = selectedVertex.c + " - " + (Math.abs(dist));
          } else {
            otherVertex.cExplained = selectedVertex.c + " + " + dist;
          }
          otherVertex.p = selectedVertex;
        }

        otherVertex.f.color = consideredVertexColor;
      }


      highlightStep = false;
    } else {
      for(i = 0; i < currentEdges.length; i++) {
        edge = currentEdges[i];

        otherVertex = edge[0];
        if(otherVertex == selectedVertex) {
          otherVertex = edge[1];
        }

        dist = Math.round(this.euclideanDistance(selectedVertex, otherVertex)/costFactor);
        if(edge.weight != null) {
          dist = +edge.weight;
        }

        if(otherVertex.c > (selectedVertex.c + dist)) {
          otherVertex.c = (selectedVertex.c + dist);
          otherVertex.cExplained = "";
          otherVertex.p = selectedVertex;
        }

        otherVertex.f.color = defaultDotColor;
      }

      selectedVertex.f.color = visitedVertexColor;
      for(i = 0; i < currentEdges.length; i++) {
        currentEdges[i].visited = true;
      }
      currentEdges = new Array();

      highlightStep = true;

      if(unvisitedVertices.length == 0) {
        FINISHED = true;
      }
    }

    this.redrawCanvas();
  }

  this.stepBackward = function() {
    ISPAUSED = true;
    if(stepCount <= 0) return;
    var destindex = Math.max(stepCount-1, 0);
    DRAW = false;
    this.resetDijkstra();
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

    var point = dijkstra.Point(pos.x, pos.y)


    //check if click is outside the min object distance from every other dot and the border
    if(dijkstra.minDistancesValid(point) && (evt.button == 0 && !drawingPolicy)) {
      if(pointCount == pointLimit) {
        alert("Sorry, the number of vertices is limited to " + pointLimit + ".")
        return;
      }

      pointCount++;

      if(startingVertex == null) {
        point.c = 0;
        point.p = null;
        startingVertex = point;
      }

      vertices.push(point);

      dijkstra.resetDijkstra();
      dijkstra.redrawCanvas();
    } else {
      evt.preventDefault();
      var clickedPoint = null;
      var clickedPointIndex = -1;

      for(i = 0; i < vertices.length; i++) {
        if(dijkstra.euclideanDistance(vertices[i], point) <= minObjectDistance) {
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
        startingVertex.c = Infinity;
        startingVertex.p = null;
        startingVertex = selectedVertex;
        startingVertex.c = 0;
        selectedVertex.f.selected = true;

      } else if(evt.button == 2) { //right mouse button
        dijkstra.resetDijkstra();
        dijkstra.redrawCanvas();

        dijkstra.deletePoint(clickedPoint, clickedPointIndex);

        ISPAUSED = true;

        dijkstra.resetDijkstra();
        dijkstra.redrawCanvas();
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

      var point = dijkstra.Point(pos.x, pos.y)

      if(dijkstra.minDistancesValid(point)) {

        dijkstra.redrawCanvas();

        edge = {
          0: selectedVertex,
          1: point,
        }

        if(useEuclideanDistancePolicy) {
          edge.weight = Math.round(dijkstra.euclideanDistance(edge[0], edge[1])/costFactor);
        }

        dijkstra.drawCanvasBoundingBox();
        dijkstra.drawEdge(edge, drawingEdgeColor)
      } else {
        dijkstra.redrawCanvas();

        var hoveringVertex = null;

        for(i = 0; i < vertices.length; i++) {
          if(dijkstra.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
            hoveringVertex = vertices[i];
            break;
          }
        }

        if(hoveringVertex != selectedVertex && hoveringVertex != null) {
          edge = {
            0: selectedVertex,
            1: hoveringVertex,
          }

          if(useEuclideanDistancePolicy) {
            edge.weight = Math.round(dijkstra.euclideanDistance(edge[0], edge[1])/costFactor);
          }

          newEdge = true;
          for(i = 0; i < edges.length; i++) {
            curEdge = edges[i];
            if((curEdge[0] == hoveringVertex && curEdge[1] == selectedVertex) || (curEdge[1] == hoveringVertex && curEdge[0] == selectedVertex)) {
              newEdge = false;
            }
          }

          dijkstra.drawCanvasBoundingBox();

          if(newEdge) {
            dijkstra.drawEdge(edge, drawingEdgeColor);
          } else {
            dijkstra.drawEdge(edge, deletingEdgeColor);
          }
        }
      }
    } else {
      if(movingPoint == undefined) {
        dijkstra.redrawCanvas();
        return;
      }

      if(stepCount > 0) {
        dijkstra.resetDijkstra();
        dijkstra.redrawCanvas();
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

        if(dijkstra.euclideanDistance(vertices[i], pos) < minObjectDistance) {
          positionValid = false;
          break;
        }
      }

      if(pos.x < (minObjectDistance) || pos.x > (canvas.width - tableWidth - minObjectDistance))
        positionValid = false;

      if(pos.y < (minObjectDistance) || pos.y > (canvas.height - minObjectDistance))
        positionValid = false;


      if(positionValid) {
        movingPoint.x = pos.x;
        movingPoint.y = pos.y;
      }

      dijkstra.redrawCanvas();
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

      var point = dijkstra.Point(pos.x, pos.y)
      var hoveringVertex = null;

      for(i = 0; i < vertices.length; i++) {
        if(dijkstra.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
          hoveringVertex = vertices[i];
          break;
        }
      }

      if(hoveringVertex != selectedVertex && hoveringVertex != null) {
        newEdge = true;
        for(i = 0; i < edges.length; i++) {
          curEdge = edges[i];
          if((curEdge[0] == hoveringVertex && curEdge[1] == selectedVertex) || (curEdge[1] == hoveringVertex && curEdge[0] == selectedVertex)) {
            edges.splice(i, 1);
            newEdge = false;
          }
        }

        if(newEdge && selectedVertex != undefined) {
          edge = dijkstra.Edge(selectedVertex, hoveringVertex);
          if(edge != null) {
            edges.push(edge);
          }
        }
      }

      if(selectedVertex != undefined) {
        selectedVertex.f.selected = false;
        selectedVertex = undefined;
      }
    }

    dijkstra.resetDijkstra()
    dijkstra.redrawCanvas();
  }

  this.deletePoint = function(point, index) {
    getNewStartPoint = false;
    removedPoint = vertices.splice(index, 1);
    if(removedPoint[0] == startingVertex) {
      getNewStartPoint = true;
    }
    removedPoint[0].c = Infinity;
    removedPoint[0].p = null;

    tmpPoints = vertices;
    tmpEdges = edges;

    tmpStartingVertex = startingVertex;

    dijkstra.clearDijkstra();

    for(index = 0; index < tmpPoints.length; index++) {
      point = tmpPoints[index]

      pointCount++;

      vertices.push(point);
      if(point == tmpStartingVertex) {
        startingVertex = point;
        startingVertex.c = 0;
      }
    }

    for(index = 0; index < tmpEdges.length; index++) {
      edge = tmpEdges[index];

      if(edge[0] != removedPoint[0] && edge[1] != removedPoint[0]) {
        edges.push(edge);
      }
    }

    dijkstra.resetDijkstra();

    if(getNewStartPoint && vertices.length > 0) {
      startingVertex = vertices[Math.floor(Math.random()*vertices.length)]
      startingVertex.c = 0;
      startingVertex.p = null;
    }

    dijkstra.redrawCanvas();
  }

  this.minDistancesValid = function(point) {
    //x
    if(point.x <= minObjectDistance || point.x >= (canvas.width - minObjectDistance - tableWidth))
      return false;
    //y
    if(point.y <= minObjectDistance || point.y >= (canvas.height - minObjectDistance))
      return false;

    var retval = true;
    vertices.forEach(function(currPoint) {
      if(dijkstra.euclideanDistance(currPoint, point) <= minObjectDistance) {
        retval = false;
      }
    })
    return retval;
  }

  this.euclideanDistance = function(p1, p2) {
    return Math.sqrt(((p1.x - p2.x)*(p1.x - p2.x)) + ((p1.y - p2.y)*(p1.y - p2.y)));
  }

  this.redrawCanvas = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(DRAW) {
      this.drawCanvasBoundingBox();
      this.drawTable();
      this.drawLegend();

      this.drawGraph();
    }
  }

  this.drawGraph = function() {
    context.save();
    context.setLineDash([4, 4]);
    context.lineWidth = "1";
    context.restore();

    edges.forEach(function(edge) {
      dijkstra.drawEdge(edge, edgeColor)
    })

    currentEdges.forEach(function(edge) {
      dijkstra.drawEdge(edge, consideredVertexColor)
    })

    vertices.forEach(function(point) {
      dijkstra.drawPoint(point)
    })
  }

  this.drawPoint = function(point) {
    context.beginPath();
    context.fillStyle = point.f.color;
    if(point.f.selected) context.fillStyle = consideredVertexColor;
    if(point == startingVertex) context.fillStyle = startingVertexColor;
    context.arc(point.x, point.y, dotRadius, 0, 2*Math.PI);
    context.fill();

    //uncomment for debugging purposes

    context.font="15px Consolas";
    context.textAlign="center";
    context.fillText(String.fromCharCode(64 + point.i),point.x,(point.y-8));
    context.fillStyle = "black";

    if(stepCount != 0) return;

    context.beginPath();
    context.setLineDash([4, 4]);
    context.strokeStyle = point.f.circle;
    context.lineWidth = dotCircleThickness;
    context.arc(point.x, point.y, dotCircle, 0, 2*Math.PI);
    context.stroke();
    context.setLineDash([]);
  }

  this.drawEdge = function(edge, color) {
    if(edge.visited) color = visitedVertexColor;

    context.beginPath()
    context.strokeStyle = color;
    context.moveTo(edge[0].x, edge[0].y)
    context.lineTo(edge[1].x, edge[1].y)
    context.stroke()

    //draw a center circle
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.strokeStyle = "white";
    context.arc((edge[0].x + edge[1].x)/2, (edge[0].y + edge[1].y)/2, dotCircle/2, 0, 2*Math.PI);
    context.stroke();
    context.setLineDash([]);
    context.fill();
    context.globalCompositeOperation = "source-over";

    //draw the weight of the line
    context.font="15px Consolas";
    context.textAlign="center";
    context.fillStyle = color;
    if(edge.weight == null) {
      if(edge.euclidean) {
        context.fillText(Math.round(dijkstra.euclideanDistance(edge[0], edge[1])/costFactor), (edge[0].x + edge[1].x)/2, (edge[0].y + edge[1].y)/2 + 5);
      } else {
        context.fillText("-", (edge[0].x + edge[1].x)/2, (edge[0].y + edge[1].y)/2 + 5);
      }
    } else {
      context.fillText(edge.weight,(edge[0].x + edge[1].x)/2, (edge[0].y + edge[1].y)/2 + 5);
    }

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = dotCircleThickness;
    context.arc((edge[0].x + edge[1].x)/2, (edge[0].y + edge[1].y)/2, dotCircle/2, 0, 2*Math.PI);
    
    //arrow head
    source = null;
    dest = null;
    if(edge[0].p == edge[1]) {
      source = edge[1];
      dest = edge[0];
    } else if(edge[1].p == edge[0]) {
      source = edge[0];
      dest = edge[1];
    }

    if(source && dest) {
      context.moveTo(dest.x, dest.y);
      var angle = Math.atan2(dest.y - source.y, dest.x - source.x);
      context.lineTo(dest.x - 15 * Math.cos(angle - Math.PI / 6), dest.y - 15 * Math.sin(angle - Math.PI / 6));
      context.moveTo(dest.x, dest.y);
      context.lineTo(dest.x - 15 * Math.cos(angle + Math.PI / 6), dest.y - 15 * Math.sin(angle + Math.PI / 6));
    }
    context.stroke();
  }


  this.Point = function(x_coord, y_coord) {
    var newPoint = {
      x : x_coord,
      y : y_coord,
      c : Infinity,    //cost
      cExplained : "", //explained cost
      v : false,       //visited
      p : null,        //previous vertex/point
      i : pointCount + 1,
      f : {color: defaultDotColor,     //flags
           circle: dotCircleColor}
      };
     return newPoint;
  }

  this.Edge = function(startPoint, endPoint) {
    var edgeWeight = null;
    if(!useEuclideanDistancePolicy) {
      var userInput = window.prompt("Enter the weight of the edge: ");
      if (!userInput.match(/[0-9]+/)) {
        alert("The weight must be an integer!");
        return null;
      }
      edgeWeight = userInput;
    }

    var newEdge = {
      0 : startPoint,
      1 : endPoint,
      visited : false,
      euclidean : useEuclideanDistancePolicy,
      weight : edgeWeight
    };
    return newEdge;
  }

  this.runInterval = function() {
    if(dijkstra.active) {
      if(!ISPAUSED) {
        dijkstra.stepForward();
      }
      clearInterval(dijkstra.interval);
        runspeed = execInterval*speed;
        dijkstra.interval = setInterval(dijkstra.runInterval, runspeed);
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

  this.updateEdgeWeightPolicy = function(button) {
    if(button.value == "true") {
      useEuclideanDistancePolicy = false;
      button.value = "false";
      button.innerHTML = "User Prompt";
    } else {
      useEuclideanDistancePolicy = true;
      button.value = "true";
      button.innerHTML = "Euclidean Distance";
    }
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

  this.resetDijkstra = function() {
    stepCount = 0;

    for(i = 0; i < vertices.length; i++) {
      if(vertices[i].c != 0) {
        vertices[i].c = Infinity;
        vertices[i].p = null;
      }
      vertices[i].f.color = defaultDotColor;
    }
    if(startingVertex != null) {
      startingVertex.c = 0;
      startingVertex.p = null;
    }
    unvisitedVertices = null;

    currentEdges = new Array();
    unvisitedVertices = null;
    for(i = 0; i < edges.length; i++) {
      edges[i].visited = false;
    }

    highlightStep = true;

    drawNewEdgeActive = false;

    FINISHED = false;
    DRAW = true;
    ISPAUSED = true;

    this.redrawCanvas();
  }

  this.clearDijkstra = function() {
    stepCount = 0;

    edges = new Array();
    currentEdges = new Array();
    vertices = new Array();
    unvisitedVertices = null;

    selectedVertex = undefined;
    startingVertex = null;

    pointCount = 0;

    highlightStep = true;

    drawNewEdgeActive = false;

    FINISHED = false;
    DRAW = true;
    ISPAUSED = true;

    this.redrawCanvas();
  }

  this.finishDijkstra = function() {
    if(pointCount < 4) return;
    ISPAUSED = true;
    DRAW = false;
    while(!FINISHED) {
      this.stepForward();
    }
    DRAW = true;
    this.redrawCanvas();
  }
};

dijkstra = new Dijkstra();
