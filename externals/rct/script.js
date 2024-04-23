function RandomColorTrial() {
    this.active = false;
    var normalWidth = 840;
    var height = 640;
  
    var contentDiv;
    var contentDiv_right;
    var infoDiv;
    var algoDiv;
  
    var canvas;
    var context;

    var canvas_right;
    var context_right;
  
  
    var execInterval = 50;  //ms
    var speed = 5;
  
    var dottedRectangleColor = "#000000";
  
    var stepCount = 0;
    var pointLimit = 260;
    var pointCount = 0;
  
    var vertices = new Array();
    var edges = new Array();
    var possibleNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
    var selectedVertex = undefined;
    var startingVertex = null;
    var movingPoint = undefined;
  
    var edgeColor = "#000088";
    var drawingEdgeColor = "#FF8A00";
    var deletingEdgeColor = "#FF0000";

    var color_green = "#32CD32";
    var color_red = "#FF0000";
  
  
    var dottedThickness = 2;
    var radius = 15
    var minObjectDistance = 20;
  
    var tableWidth = 300;
    var tableXOff = (normalWidth-tableWidth-dottedThickness+10);
    var tableElemHeight = 20;
    var rect_height = 2*tableElemHeight-dottedThickness;
  
    var drawNewEdgeActive = false;

    var background_color = "#c5cfd6"

    var remember_random_choices = false;

    // "0" is for points (draw or move)
    // "1" is for edges
    // "2" is for choosing a color for a point
    var drawingPolicy = "0";

    var draw_color_amethyst = "#F0A3FF";
    var draw_color_blue = "#0075DC";
    var draw_color_caramel = "#993F00";
    var draw_color_damson = "#4C005C";
    var draw_color_ebony = "#191919";
    var draw_color_forest = "#005C31";
    var draw_color_green = "#2BCE48";
    var draw_color_honeydew = "#FFCC99";
    var draw_color_iron = "#808080";
    var draw_color_jade = "#94FFB5";
    var draw_color_khaki = "#8F7C00";
    var draw_color_lime = "#9DCC00";
    var draw_color_mallow = "#C20088";
    var draw_color_navy = "#003380";
    var draw_color_orpiment = "#FFA405";
    var draw_color_pink = "#FFA8BB";
    var draw_color_quagmire = "#426600";
    var draw_color_red = "#FF0010";
    var draw_color_sky = "#5EF1F2";
    var draw_color_turquoise = "#00998F";
    var draw_color_uranium = "#E0FF66";
    var draw_color_violet = "#FFFFFF";
    var draw_color_wine = "#990000";
    var draw_color_xanthin = "#FFFF80";
    var draw_color_yellow = "#FFE100";
    var draw_color_zinnia = "#FF5005";

    var draw_colors = [draw_color_red, draw_color_blue, draw_color_green, draw_color_yellow,
      draw_color_pink, draw_color_zinnia, draw_color_khaki, draw_color_navy, draw_color_mallow, draw_color_turquoise,
      draw_color_amethyst, draw_color_caramel, draw_color_damson, draw_color_honeydew, draw_color_ebony, draw_color_jade,
      draw_color_forest, draw_color_violet, draw_color_iron, draw_color_uranium, draw_color_quagmire, draw_color_sky,
      draw_color_orpiment, draw_color_wine, draw_color_xanthin, draw_color_lime];

    var available_colors_change = 0;
    var available_colors_general = [];
    var draw_mode_color = true;

    // step in nextStep
    // 0: show random color to try
    // 1: show if successful or not and update available colors
    var currentStep = 0;

    // every element has two elements
    // [array of vertices at that point, array of edges at that point]
    // previousSteps can be indexed by stepCount
    // example: get edges if you go back once -> previousStates[stepCount - 1][1]
    var previousStates = [];

    var statistics_interval;

    var isDeg = false;
  
  
    //global algorithm variables
    var FINISHED = false;
    var ISPAUSED = true;
    var DRAW = true;
    var FAILED = false;
  
  
    this.initialize = function() {
      contentDiv = document.getElementById("content")
      contentDiv_right = document.getElementById("content_right")

      infoDiv = document.getElementById("info")
      algoDiv = document.getElementById("algo")
  
      canvas = document.createElement("canvas")
      canvas.setAttribute("id", "canvas");
      canvas.width = normalWidth;
      canvas.height = height;
      context = canvas.getContext("2d");
      contentDiv.appendChild(canvas);

      canvas_right = document.createElement("canvas")
      canvas_right.setAttribute("id", "canvas_right");
      context_right = canvas_right.getContext("2d");
      contentDiv_right.appendChild(canvas_right);
  
      contentDiv.setAttribute("style","width:" + normalWidth + "px");
      contentDiv.style.width=normalWidth + 'px';
      contentDiv_right.setAttribute("align", "left");
      infoDiv.setAttribute("style","width:" + (normalWidth+10) + "px");
      infoDiv.style.width=(normalWidth+10) + 'px';
      algoDiv.setAttribute("style","width:" + (normalWidth+10) + "px");
      algoDiv.style.width=(normalWidth+10) + 'px';
  
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

      colWidth = (tableWidth-10);
      context.strokeStyle = dottedRectangleColor;
      context.lineWidth = dottedThickness;
      context.fillStyle = color_green;
      num_rects = 5;
      for (i = 0; i < num_rects; i++)
      {
        if (i == 2) {
          continue;
        }
        context.beginPath();
        context.rect(tableXOff, dottedThickness/2 + minObjectDistance + rect_height * i,
                tableWidth - 10, 2*tableElemHeight-dottedThickness);
        
        if (i == currentStep && !FINISHED && !(currentStep == 1 && FAILED))
        {
          context.fill();
        }
        else if (i == num_rects - 2 && FINISHED)
        {
          context.fill();
        }
        else if (i == num_rects -1 && FAILED && currentStep == 1)
        {
          context.fillStyle = color_red;
          context.fill();
          context.fillStyle = color_green;
        }
        context.stroke();
      }
      context.fillStyle = dottedRectangleColor;
      context.font = "20px Consolas";
      context.textAlign = "center";

      rect_texts = ["Choose random color", "Take or update",
      "", "Finished", "Failed"];
      for (i = 0; i < num_rects; i++)
      {
        context.fillText(rect_texts[i], tableXOff + tableWidth / 2, dottedThickness/2 + minObjectDistance + 25 + rect_height * i);
      }
    }

    this.drawNewLegend = function() {
      var x_off = 50;
      var y_off = 50;
      canvas_right.width = x_off + (radius + 2)  * 1.5 * 2 * (available_colors_general.length + 1) + 100;
      canvas_right.height = y_off + rect_height * (vertices.length + 2);
      context_right.fillStyle = dottedRectangleColor;
      context_right.font = "20px Consolas";
      context_right.textAlign = "left";
      context_right.fillText("Available colors", x_off, y_off);
      if (draw_mode_color)
      {
        y = y_off + rect_height;
        text = "All";
        context_right.fillStyle = "black";
        context_right.fillText(text, x_off - 15, y);
        for (j = 0; j < available_colors_general.length; j++)
        {
          context_right.beginPath();
          context_right.strokeStyle = edgeColor;
          context_right.arc(x_off + radius * 1.5 * 2 * (j + 1), y - 7, radius, 0, 2*Math.PI);
          context_right.stroke();
          context_right.fillStyle = draw_colors[available_colors_general[j] - 1];
          context_right.fill();
        }
        for (i = 0; i < vertices.length; i++)
        {
          y = y_off + rect_height * (i + 2);
          text = vertices[i].letter.toString();
          context_right.fillStyle = "black";
          context_right.fillText(text, x_off, y + 7);
          if (vertices[i].color_set != -1)
          {
            continue;
          }
          for (j = 0; j < vertices[i].available_colors.length; j++)
          {
            context_right.beginPath();
            context_right.strokeStyle = edgeColor;
            context_right.arc(x_off + radius * 1.5 * 2 * (j + 1), y, radius, 0, 2*Math.PI);
            context_right.stroke();
            context_right.fillStyle = draw_colors[vertices[i].available_colors[j] - 1];
            context_right.fill();
          }
        }
      }
      else
      {
        y = y_off + rect_height;
        text = "All\t\t[ ";
        for (j = 0; j < available_colors_general.length; j++)
        {
          text += available_colors_general[j];
          if (j + 1 != available_colors_general.length)
          {
            text += ", ";
          }
        }
        text += " ]";
        context_right.fillText(text, x_off - 15, y);
        for (i = 0; i < vertices.length; i++)
        {
          y = y_off + rect_height * (i + 2);
          text = vertices[i].letter.toString() + "\t\t[ ";
          for (j = 0; j < vertices[i].available_colors.length; j++)
          {
            text += vertices[i].available_colors[j];
            if (j + 1 != vertices[i].available_colors.length)
            {
              text += ", ";
            }
          }
          text += " ]";
          context_right.fillText(text, x_off, y);
        }
      }
    }
  
    this.stepForward = function() {
      if (vertices.length == 0)
      {
        FINISHED = false;
        FAILED = false;
        this.redrawCanvas();
        return;
      }

      FINISHED = this.isFinished();
      if(FINISHED)
      {
        this.redrawCanvas();
        return;
      }

      FAILED = this.isFailed();
      if (FAILED && currentStep == 1)
      {
        this.redrawCanvas();
        return;
      }

      if (remember_random_choices && stepCount + 1 < previousStates.length)
      {
        stepCount++;
        this.loadState(stepCount);
        currentStep++;
        if (currentStep > 1)
        {
          currentStep = 0;
        }
        FINISHED = this.isFinished();
        FAILED = this.isFailed();
        this.redrawCanvas();
        return;
      }

      neighbours = this.buildUpNeighbours();
      this.updateAvailableColorsArrays(neighbours);

      if (stepCount == previousStates.length)
      {
        this.saveState();
      }

      if (currentStep == 0) // choose color to try
      {
        this.chooseColorToTry();
      }
      else if (currentStep == 1) // set color if successful
      {
        this.setColorIfSuccessful(neighbours);
        this.resetColorTry();
      }

      stepCount++;
      currentStep++;
      if (currentStep > 1)
      {
        currentStep = 0;
      }

      FINISHED = this.isFinished();
      FAILED = this.isFailed();

      this.redrawCanvas();
    }

    this.compareVertices = function(v1, v2) {
      if (v1.x == v2.x && v1.y == v2.y) {
        return true;
      }
      return false;
    }

    this.buildUpNeighbours = function()
    {
      neighbours = []
      for (i = 0; i < vertices.length; i++)
      {
        var neighbours_row = [];
        for (j = 0; j < edges.length; j++)
        {
          if (this.compareVertices(edges[j][0], vertices[i]))
          {
            neighbours_row.push(edges[j][1]);
          }
          else if (this.compareVertices(edges[j][1], vertices[i]))
          {
            neighbours_row.push(edges[j][0]);
          }
        }
        neighbours.push(neighbours_row);
      }
      return neighbours;
    }

    this.updateAvailableColorsArrays = function(neighbours)
    {
      if (isDeg)
      {
        this.setAvailableColorsDeg();
        return;
      }
      var number_of_available_colors = this.determineNumberOfAvailableColors();
      var all_colors = [];
      for (i = 1; i <= number_of_available_colors; i++)
      {
        all_colors.push(i);
      }
      available_colors_general = all_colors;

      for (i = 0; i < vertices.length; i++)
      {
        vertices[i].available_colors = all_colors;

        for (j = 0; j < neighbours[i].length; j++)
        {
          var neighbour_color_set = neighbours[i][j].color_set;
          if (neighbour_color_set == -1)
          {
            continue;
          }

          for (k = 0; k < vertices[i].available_colors.length; k++)
          {
            if (vertices[i].available_colors[k] == neighbour_color_set)
            {
              var updated_available_colors = [];
              for (l = 0; l < vertices[i].available_colors.length; l++)
              {
                if (l != k)
                {
                  updated_available_colors.push(vertices[i].available_colors[l]);
                }
              }
              vertices[i].available_colors = updated_available_colors;
              break;
            }
          }
        }
      }
    }

    this.resetColorTry = function()
    {
      for (i = 0; i < vertices.length; i++)
      {
        vertices[i].color_try = -1;
      }
    }

    this.resetEdgeIsProblem = function()
    {
      for (i = 0; i < edges.length; i++)
      {
        edges[i].is_problem = false;
      }
    }

    this.setEdgeIsProblem = function()
    {
      for (i = 0; i < edges.length; i++)
      {
        if (edges[i][0].color_try == edges[i][1].color_try && edges[i][0].color_try != -1)
        {
          edges[i].is_problem = true;
        }
      }
    }

    this.setColorIfSuccessful = function(neighbours)
    {
      for (i = 0; i < vertices.length; i++)
      {
        if (vertices[i].color_set != -1)
        {
          continue;
        }
        var can_take_color = true;
        for (j = 0; j < neighbours[i].length; j++)
        {
          if (neighbours[i][j].color_try == vertices[i].color_try)
          {
            can_take_color = false;
            break;
          }
        }

        if (can_take_color)
        {
          vertices[i].color_set = vertices[i].color_try;
        }
        else
        {
          vertices[i].color_set = -1;
        }
      }
    }

    this.chooseColorToTry = function()
    {
      for (i = 0; i < vertices.length; i++)
      {
        if (vertices[i].color_set != -1)
        {
          vertices[i].color_try = -1;
        }
        else
        {
          var color_try_index = Math.floor(Math.random() * vertices[i].available_colors.length);
          vertices[i].color_try = vertices[i].available_colors[color_try_index];
        }
      }
    }

    this.isFinished = function() {
      for (i = 0; i < vertices.length; i++)
      {
        if (vertices[i].color_set == -1)
        {
          return false;
        }
      }
      return true;
    }

    this.isFailed = function() {
      let neighbours = this.buildUpNeighbours();
      this.updateAvailableColorsArrays(neighbours);
      for (i = 0; i < neighbours.length; i++)
      {
        for (j = 0; j < neighbours[i].length; j++)
        {
          if (vertices[i].color_set != -1)
          {
            continue;
          }
          if (vertices[i].available_colors.length == 1
            && neighbours[i][j].available_colors.length == 1
            && vertices[i].available_colors[0] == neighbours[i][j].available_colors[0])
          {
            return true;
          }
        }
      }
      return false;
    }

    this.determineDeltaPlusOne = function() {
      var delta = 0;
      for (i = 0; i < vertices.length; i++)
      {
        var delta_current_vertex = 0;
        for (j = 0; j < edges.length; j++)
        {
          if (edges[j][0] == vertices[i] || edges[j][1] == vertices[i])
          {
            delta_current_vertex++;
          }
        }
        delta = Math.max(delta, delta_current_vertex);
      }
      return delta + 1;
    }

    this.determineNumberOfAvailableColors = function() {
      let number_of_available_colors = this.determineDeltaPlusOne();
      number_of_available_colors += available_colors_change;
      if (number_of_available_colors < 1)
      {
        number_of_available_colors = 1;
      }
      return number_of_available_colors;
    }

    this.changeAvailableColors = function(is_decrement) {
      ISPAUSED = true;
      available_colors_change = available_colors_change - is_decrement + !is_decrement;
      let delta_plus_one = this.determineDeltaPlusOne();
      if (delta_plus_one + available_colors_change < 1)
      {
        available_colors_change = -(delta_plus_one - 1);
      }
      else if (delta_plus_one + available_colors_change > pointLimit)
      {
        available_colors_change = pointLimit - delta_plus_one;
      }

      FAILED = this.isFailed();
      this.redrawCanvas();
    }

    this.resetAvailableColors = function() {
      isDeg = false;
      ISPAUSED = true;
      available_colors_change = 0;

      FAILED = this.isFailed();
      this.redrawCanvas();
    }

    this.setDegBool = function() {
      isDeg = true;
      ISPAUSED = true;
      available_colors_change = 0;
      this.redrawCanvas(); // redrawCanvas calls setAvailableColorsDeg
    }

    this.setDeg = function() {
      for (let vt of vertices)
      {
        vt.deg = 0;
      }
      for (i = 0; i < edges.length; i++)
      {
        edges[i][0].deg++;
        edges[i][1].deg++;
      }
    }

    this.setAvailableColorsDeg = function() {
      this.setDeg();
      let number_of_available_colors = this.determineNumberOfAvailableColors();
      let all_colors = [];
      for (i = 1; i <= number_of_available_colors; i++)
      {
        all_colors.push(i);
      }
      available_colors_general = all_colors;

      for (let vt of vertices)
      {
        vt.available_colors = [];
        let colors_num = vt.deg + 1 + available_colors_change;
        if (colors_num < 1)
        {
          colors_num = 1;
        }
        for (i = 0; i < colors_num; i++)
        {
          vt.available_colors.push(all_colors[i]);
        }
      }

      for (let eg of edges)
      {
        if (eg[0].color_set != -1 && eg[1].color_set == -1)
        {
          eg[1].available_colors = eg[1].available_colors.filter(function (letter) {
            return letter !== eg[0].color_set;
          });
        }
        else if (eg[0].color_set == -1 && eg[1].color_set != -1)
        {
          eg[0].available_colors = eg[0].available_colors.filter(function (letter) {
            return letter !== eg[1].color_set;
          });
        }
      }
    }

    this.toggleRememberRandomChoices = function(button) {
      remember_random_choices = !remember_random_choices;
      if (remember_random_choices)
      {
        button.innerText = "Enabled";
      }
      else
      {
        button.innerText = "Disabled";
        while (previousStates.length > stepCount) {
          previousStates.pop();
        }
      }
    }

    this.switchToColorBlind = function() {
      let button = document.getElementById("draw-mode-btn");
      draw_mode_color = false;
      button.value = "false";
      button.innerText = "Colorblind Mode ACTIVE";

    }

    this.updateDrawMode = function(button) {
      if (button.value == "true")
      {
        draw_mode_color = false;
        button.value = "false";
        button.innerText = "Colorblind Mode ACTIVE";
      }
      else
      {
        draw_mode_color = true;
        button.value = "true";
        button.innerText = "Colorblind Mode";
      }
      this.redrawCanvas();
    }

    this.assignNameToPoints = function()
    {
      for (i = 0; i < vertices.length; i++)
      {
        if (i < possibleNames.length){
          vertices[i].letter = possibleNames[i];
        }
        else
        {
          let quotient = Math.floor(i / possibleNames.length);
          let remainder = i % possibleNames.length;
          vertices[i].letter = possibleNames[remainder] + quotient;
        }
      }
    }

    this.saveState = function() {
      let v = [];
      let e = [];
      for (i = 0; i < vertices.length; i++)
      {
        // let point = randomColorTrial.Point(vertices[i].x, vertices[i].y);
        // point.color_try = vertices[i].color_try;
        // point.color_set = vertices[i].color_set;
        // point.available_colors = [...vertices[i].available_colors];
        let point = {...vertices[i], available_colors : [...vertices[i].available_colors]};

        v.push(point);
      }

      for (i = 0; i < edges.length; i++)
      {
        // find points in v array
        let j = 0;
        for (; j < v.length; j++)
        {
          if (edges[i][0].x == v[j].x && edges[i][0].y == v[j].y) {
            break;
          }
        }
        let k = 0;
        for (; k < v.length; k++)
        {
          if (edges[i][1].x == v[k].x && edges[i][1].y == v[k].y) {
            break;
          }
        }
        let edge = randomColorTrial.Edge(v[j], v[k]);
        e.push(edge);
      }
      previousStates.push([v, e]);
    }

    this.loadState = function(index) {
      let vertices_shallow = previousStates[index][0];
      let edges_shallow = previousStates[index][1];
      vertices = [];
      edges = [];
      for (i = 0; i < vertices_shallow.length; i++)
      {
        let v = randomColorTrial.Point(vertices_shallow[i].x, vertices_shallow[i].y);
        v.color_try = vertices_shallow[i].color_try;
        v.color_set = vertices_shallow[i].color_set;
        v.available_colors = [...vertices_shallow[i].available_colors];
        vertices.push(v);
      }

      for (i = 0; i < edges_shallow.length; i++)
      {
        let j = 0;
        for (; j < vertices.length; j++)
        {
          if (edges_shallow[i][0].x == vertices[j].x && edges_shallow[i][0].y == vertices[j].y) {
            break;
          }
        }
        let k = 0;
        for (; k < vertices.length; k++)
        {
          if (edges_shallow[i][1].x == vertices[k].x && edges_shallow[i][1].y == vertices[k].y) {
            break;
          }
        }
        let edge = randomColorTrial.Edge(vertices[j], vertices[k]);
        edges.push(edge);
      }
    }
  
    this.stepBackward = function() {
      ISPAUSED = true;
      FINISHED = false;
      if(stepCount <= 0) {
        stepCount = 0;
        FAILED = this.isFailed();
        this.redrawCanvas();
        return;
      }
      currentStep--;
      if (currentStep < 0) {
        currentStep = 1;
      }
      if (stepCount >= previousStates.length)
      {
        this.saveState();
      }
      stepCount = Math.max(stepCount-1, 0);
      this.loadState(stepCount);
      DRAW = false;
      if (!remember_random_choices)
      {
        while (previousStates.length > stepCount) {
          previousStates.pop();
        }
      }
      DRAW = true;
      FAILED = this.isFailed();
      this.redrawCanvas();
    }

    this.manualColorForPoint = function(point) {
      neighbours = this.buildUpNeighbours();
      this.updateAvailableColorsArrays(neighbours);
      let i = point.color_set;
      if (i == -1) {
        i = 1;
      } else {
        i++;
      }
      for (; i <= available_colors_general.length; i++) {
        index = point.available_colors.indexOf(i);
        if (index == -1 ) continue;
        point.color_set = point.available_colors[index];
        this.updateAvailableColorsArrays(neighbours);
        return;
      }
      point.color_set = -1;
    }
  
    this.draw = function(evt) {
      var rect = canvas.getBoundingClientRect();
      var pos = {
          x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
          y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
      };
  
      var point = randomColorTrial.Point(pos.x, pos.y)
  
  
      //check if click is outside the min object distance from every other dot and the border
      if(randomColorTrial.minDistancesValid(point) && (evt.button == 0 && drawingPolicy == "0")) {
        if(pointCount == pointLimit) {
          alert("Sorry, the number of vertices is limited to " + pointLimit + ".")
          return;
        }
  
        pointCount++;
  
        if(startingVertex == null) {
          startingVertex = point;
        }
  
        vertices.push(point);
        randomColorTrial.redrawCanvas();
      } else {
        evt.preventDefault();
        var clickedPoint = null;
        var clickedPointIndex = -1;
  
        for(i = 0; i < vertices.length; i++) {
          if(randomColorTrial.euclideanDistance(vertices[i], point) <= minObjectDistance) {
            clickedPoint = vertices[i];
            clickedPointIndex = i;
            break;
          }
        }
  
        if(clickedPoint == null) {
          return;
        }

        if (drawingPolicy == "2") { // choose color
          randomColorTrial.manualColorForPoint(clickedPoint);
          randomColorTrial.redrawCanvas();
        } else if(evt.button == 1 || (evt.button == 0 && drawingPolicy == "1")) { //middle mouse button
          drawNewEdgeActive = true;
  
          selectedVertex = clickedPoint;
          startingVertex = selectedVertex;
  
        } else if(evt.button == 2) { //right mouse button
          randomColorTrial.redrawCanvas();
  
          randomColorTrial.deletePoint(clickedPoint, clickedPointIndex);
  
          ISPAUSED = true;
          randomColorTrial.redrawCanvas();
        } else {
          ISPAUSED = true;
          movingPoint = clickedPoint;
        }
      }
      FAILED = randomColorTrial.isFailed();
      FINISHED = randomColorTrial.isFinished();
      randomColorTrial.redrawCanvas();
    }
  
    this.movePoint = function(evt) {
      if (drawingPolicy == "2") return;
      if(drawNewEdgeActive) {
        var rect = canvas.getBoundingClientRect();
        var pos = {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
        };
  
        var point = randomColorTrial.Point(pos.x, pos.y)
  
        if(randomColorTrial.minDistancesValid(point)) {
  
          randomColorTrial.redrawCanvas();
  
          edge = {
            0: selectedVertex,
            1: point,
          }
  
          randomColorTrial.drawCanvasBoundingBox();
          randomColorTrial.drawEdge(edge, drawingEdgeColor)
        } else {
          randomColorTrial.redrawCanvas();
  
          var hoveringVertex = null;
  
          for(i = 0; i < vertices.length; i++) {
            if(randomColorTrial.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
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
  
            randomColorTrial.drawCanvasBoundingBox();
  
            if(newEdge) {
              randomColorTrial.drawEdge(edge, drawingEdgeColor);
            } else {
              randomColorTrial.drawEdge(edge, deletingEdgeColor);
            }
          }
        }
      } else {
        if(movingPoint == undefined) {
          randomColorTrial.redrawCanvas();
          return;
        }
  
        if(stepCount > 0) {
          randomColorTrial.redrawCanvas();
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
  
          if(randomColorTrial.euclideanDistance(vertices[i], pos) < minObjectDistance) {
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
      }
    }
  
    this.releasePoint = function(evt) {
      if (drawingPolicy == "2");
      movingPoint = undefined;
      drawNewEdgeActive = false;
  
      if(evt.button == 1 || (evt.button == 0 && drawingPolicy == "1")) {
        evt.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var pos = {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
        };
  
        var point = randomColorTrial.Point(pos.x, pos.y)
        var hoveringVertex = null;
  
        for(i = 0; i < vertices.length; i++) {
          if(randomColorTrial.euclideanDistance(vertices[i], point) <= minObjectDistance && vertices[i] != selectedVertex) {
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
            edge = randomColorTrial.Edge(selectedVertex, hoveringVertex);
            if(edge != null &&
              !(selectedVertex.color_set != -1 && selectedVertex.color_set == hoveringVertex.color_set)
            ) {
              edges.push(edge);
            }
          }
        }
  
        if(selectedVertex != undefined) {
          selectedVertex = undefined;
        }
      }
      FAILED = randomColorTrial.isFailed();
      FINISHED = randomColorTrial.isFinished();
      randomColorTrial.redrawCanvas();
    }
  
    this.deletePoint = function(point, index) {
      getNewStartPoint = false;
      removedPoint = vertices.splice(index, 1);
      if(removedPoint[0] == startingVertex) {
        getNewStartPoint = true;
      }
  
      tmpPoints = vertices;
      tmpEdges = edges;
  
      tmpStartingVertex = startingVertex;
      randomColorTrial.clearRandomColorTrial();
  
      for(index = 0; index < tmpPoints.length; index++) {
        point = tmpPoints[index]
  
        pointCount++;
  
        vertices.push(point);
        if(point == tmpStartingVertex) {
          startingVertex = point;
        }
      }
  
      for(index = 0; index < tmpEdges.length; index++) {
        edge = tmpEdges[index];
  
        if(edge[0] != removedPoint[0] && edge[1] != removedPoint[0]) {
          edges.push(edge);
        }
      }
  
      if(getNewStartPoint && vertices.length > 0) {
        startingVertex = vertices[Math.floor(Math.random()*vertices.length)]
      }

      FAILED = randomColorTrial.isFailed();
      FINISHED = randomColorTrial.isFinished();
      randomColorTrial.redrawCanvas();
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
        if(randomColorTrial.euclideanDistance(currPoint, point) <= minObjectDistance) {
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
        if (this.determineNumberOfAvailableColors() > 26)
        {
          this.switchToColorBlind();
        }
        this.assignNameToPoints();
        this.updateAvailableColorsArrays(this.buildUpNeighbours());
        this.setEdgeIsProblem();

        this.drawCanvasBoundingBox();
        this.drawTable();
        this.drawNewLegend();
  
        this.drawGraph();

        this.resetEdgeIsProblem();
      }
    }
  
    this.drawGraph = function() {
      context.save();
      context.setLineDash([4, 4]);
      context.lineWidth = "1";
      context.restore();
  
      edges.forEach(function(edge) {
        randomColorTrial.drawEdge(edge, edgeColor)
      })
  
      vertices.forEach(function(point) {
        randomColorTrial.drawPoint(point)
      })
    }
  
    this.drawPoint = function(point) {
      context.font="15px Consolas";
      context.textAlign="center";
      if (draw_mode_color)
      {
        context.beginPath();
        context.strokeStyle = edgeColor;
        context.arc(point.x, point.y, radius, 0, 2*Math.PI);
        context.stroke();
        if (point.color_set != -1)
        {
          context.fillStyle = draw_colors[point.color_set - 1];
          context.fill();
        }
        else
        {
          context.fillStyle = background_color;
          context.fill();
        }
        if (point.color_try != -1)
        {
          context.beginPath();
          context.strokeStyle = edgeColor;
          context.arc(point.x, point.y - radius - 10, radius / 2, 0, 2*Math.PI);
          context.stroke();
          context.fillStyle = draw_colors[point.color_try - 1];
          context.fill();
        }
      }
      else
      {
        context.beginPath();
        context.strokeStyle = edgeColor;
        context.arc(point.x, point.y, radius, 0, 2*Math.PI);
        context.stroke();
        context.fillStyle = background_color;
        context.fill();
        context.fillStyle = "#000000";
    
        if (point.color_set != -1)
        {
          context.fillText(point.color_set, point.x, point.y + 5);
        }
        if (point.color_try != -1)
        {
          context.fillText(point.color_try, point.x + 7, point.y - radius - 5);
        }
      }
      context.fillStyle = "black";
      context.fillText(point.letter, point.x - radius - 10, point.y - 5);
    }
  
    this.drawEdge = function(edge, color) {
  
      context.beginPath()
      context.strokeStyle = color;
      if (edge.is_problem)
      {
        context.strokeStyle = draw_color_red;
      }
      context.moveTo(edge[0].x, edge[0].y)
      context.lineTo(edge[1].x, edge[1].y)
      context.stroke()
      return;
    }
  
  
    this.Point = function(x_coord, y_coord) {
      var newPoint = {
        x : x_coord,
        y : y_coord,
        color_try : -1, // used to check if other vertices have the same color_try
        color_set : -1, // -1 when not colored; number of color otherwise
        available_colors : [],
        letter : "",
        deg : 0
        };
      return newPoint;
    }
  
    this.Edge = function(startPoint, endPoint) {  
      var newEdge = {
        0 : startPoint,
        1 : endPoint,
        is_problem : false
      };
      return newEdge;
    }
  
    this.runInterval = function() {
      if(randomColorTrial.active) {
        if(!ISPAUSED) {
          randomColorTrial.stepForward();
        }
        clearInterval(randomColorTrial.interval);
          runspeed = execInterval*speed;
          randomColorTrial.interval = setInterval(randomColorTrial.runInterval, runspeed);
      }
    }
    this.interval = setInterval(this.runInterval, execInterval*speed);
  
    this.runAlgorithm = function() {
      if(vertices.length > 0 && !FINISHED && !FAILED)
        ISPAUSED = false;
    }
  
    this.pauseAlgorithm = function() {
      ISPAUSED = true;
    }
  
    this.updateSpeed = function(newSpeed) {
      speed = (11-newSpeed);
    }

    this.updateDrawingPolicy = function(button) {
      if(button.value == "1") {
        drawingPolicy = "2";
        button.value = "2";
        button.innerText = "Choose Color";
      } else if (button.value == "0") {
        drawingPolicy = "1";
        button.value = "1";
        button.innerText = "Draw Edge";
      } else if (button.value == "2") {
        drawingPolicy = "0";
        button.value = "0";
        button.innerText = "Draw / Move Point";
      }
    }
  
    this.resetRandomColorTrial = function() {
      if(stepCount <= 0) {
        stepCount = 0;
        FAILED = this.isFailed();
        this.redrawCanvas();
        return;
      }

      stepCount = 0;
      currentStep = 0;

      this.loadState(stepCount);

      if (!remember_random_choices)
      {
        previousStates = [];
      }
  
      drawNewEdgeActive = false;
  
      FINISHED = false;
      DRAW = true;
      ISPAUSED = true;
      FAILED = false;
  
      this.redrawCanvas();
    }
  
    this.clearRandomColorTrial = function() {
      stepCount = 0;
      currentStep = 0;

      previousStates = [];
  
      edges = new Array();
      vertices = new Array();

      selectedVertex = undefined;
      startingVertex = null;
      drawNewEdgeActive = false;
  
      pointCount = 0;
  
      FINISHED = false;
      DRAW = true;
      ISPAUSED = true;
      FAILED = false;
  
      this.redrawCanvas();
    }
  
    this.finishRandomColorTrial = function() {
      ISPAUSED = true;
      DRAW = false;
      while(!FINISHED && !(FAILED && currentStep == 1)) {
        this.stepForward();
      }
      DRAW = true;
      this.redrawCanvas();
    }

    this.loadExampleStateBasic = function() {
      let v = [];
      let e = [];
      
      let x_pusher = -25;
      v1 = randomColorTrial.Point(200 + x_pusher, 200);
      v2 = randomColorTrial.Point(400 + x_pusher, 200);
      v3 = randomColorTrial.Point(200 + x_pusher, 400);
      v4 = randomColorTrial.Point(400 + x_pusher, 400);
      v5 = randomColorTrial.Point(100 + x_pusher, 300);
      v6 = randomColorTrial.Point(500 + x_pusher, 300);
      

      v.push(v5);
      v.push(v1);
      v.push(v3);
      v.push(v2);
      v.push(v4);
      v.push(v6);

      pointCount = 6;

      e.push(randomColorTrial.Edge(v1, v2));
      e.push(randomColorTrial.Edge(v1, v3));
      e.push(randomColorTrial.Edge(v1, v4));
      e.push(randomColorTrial.Edge(v2, v3));
      e.push(randomColorTrial.Edge(v2, v4));
      e.push(randomColorTrial.Edge(v3, v4));
      e.push(randomColorTrial.Edge(v1, v5));
      e.push(randomColorTrial.Edge(v3, v5));
      e.push(randomColorTrial.Edge(v2, v6));
      e.push(randomColorTrial.Edge(v4, v6));

      FINISHED = false;
      ISPAUSED = true;
      DRAW = true;
      FAILED = false;

      vertices = v;
      edges = e;
      previousStates = [];
      this.redrawCanvas();
    }

    this.loadExampleStateSparse = function() {
      let v = [];
      let e = [];
      
      let x_pusher = 25;
      v1 = randomColorTrial.Point(250 + x_pusher, 300);
      v2 = randomColorTrial.Point(150 + x_pusher, 300);
      v3 = randomColorTrial.Point(150 + x_pusher, 200);
      v4 = randomColorTrial.Point(250 + x_pusher, 200);
      v5 = randomColorTrial.Point(350 + x_pusher, 200);
      v6 = randomColorTrial.Point(350 + x_pusher, 300);
      v7 = randomColorTrial.Point(350 + x_pusher, 400);
      v8 = randomColorTrial.Point(250 + x_pusher, 400);
      v9 = randomColorTrial.Point(150 + x_pusher, 400);
      
      v.push(v1);
      v.push(v2);
      v.push(v3);
      v.push(v4);
      v.push(v5);
      v.push(v6);
      v.push(v7);
      v.push(v8);
      v.push(v9);

      pointCount = 9;

      e.push(randomColorTrial.Edge(v1, v2));
      e.push(randomColorTrial.Edge(v1, v3));
      e.push(randomColorTrial.Edge(v1, v4));
      e.push(randomColorTrial.Edge(v1, v5));
      e.push(randomColorTrial.Edge(v1, v6));
      e.push(randomColorTrial.Edge(v1, v7));
      e.push(randomColorTrial.Edge(v1, v8));
      e.push(randomColorTrial.Edge(v1, v9));

      FINISHED = false;
      ISPAUSED = true;
      DRAW = true;
      FAILED = false;

      vertices = v;
      edges = e;
      previousStates = [];
      this.redrawCanvas();
    }

    this.loadExampleStateCircle = function() {
      let v = [];
      let e = [];
      
      let x_pusher = 50;
      v1 = randomColorTrial.Point(90 + x_pusher, 300);
      v2 = randomColorTrial.Point(170 + x_pusher, 300);
      v3 = randomColorTrial.Point(250 + x_pusher, 300);
      v4 = randomColorTrial.Point(330 + x_pusher, 300);
      v5 = randomColorTrial.Point(330 + x_pusher, 400);
      v6 = randomColorTrial.Point(250 + x_pusher, 400);
      v7 = randomColorTrial.Point(170 + x_pusher, 400);
      v8 = randomColorTrial.Point(90 + x_pusher, 400);
      
      v.push(v1);
      v.push(v2);
      v.push(v3);
      v.push(v4);
      v.push(v5);
      v.push(v6);
      v.push(v7);
      v.push(v8);

      pointCount = 8;

      e.push(randomColorTrial.Edge(v1, v2));
      e.push(randomColorTrial.Edge(v2, v3));
      e.push(randomColorTrial.Edge(v3, v4));
      e.push(randomColorTrial.Edge(v4, v5));
      e.push(randomColorTrial.Edge(v5, v6));
      e.push(randomColorTrial.Edge(v6, v7));
      e.push(randomColorTrial.Edge(v7, v8));
      e.push(randomColorTrial.Edge(v8, v1));

      FINISHED = false;
      ISPAUSED = true;
      DRAW = true;
      FAILED = false;

      vertices = v;
      edges = e;
      previousStates = [];
      this.redrawCanvas();
    }

    this.loadExampleStateComplete = function() {
      let v = [];
      let e = [];

      let center_x = 275;
      let center_y = 300;

      let example_connected_points = 26;
      let r = 200;

      for (i = 0; i < example_connected_points; i++)
      {
        let theta = ((2 * Math.PI) / example_connected_points) * i
        v.push(randomColorTrial.Point(center_x + r * Math.cos(theta), center_y + r * Math.sin(theta)));
      }

      pointCount = example_connected_points;

      for (i = 0; i < example_connected_points; i++)
      {
        for (j = i + 1; j < example_connected_points; j++)
        {
          e.push(randomColorTrial.Edge(v[i], v[j]));
        }
      }

      FINISHED = false;
      ISPAUSED = true;
      DRAW = true;
      FAILED = false;

      vertices = v;
      edges = e;
      previousStates = [];
      this.redrawCanvas();
    }

    // statistics code

    var statistics_vertices = new Array();
    var statistics_edges = new Array();

    var statistics_iteration_count;
    var statistics_plot_percentage_colored;
    var statistics_plot_iteration;

    var statistics_current_run;
    var statistics_max_run;

    var statistics_delta_plus_one;

    var statistics_graph_type = 0;

    var statistics_available_colors_used = 0;

    this.statisticsPoint = function() {
      var newPoint = {
        color_try : -1, // used to check if other vertices have the same color_try
        color_set : -1, // -1 when not colored; number of color otherwise
        available_colors : new Set(),
        has_problem : false, // set to true if one neighbor has same color_try
        num_edges : 0 // for statisticsDetermineDeltaPlusOne
      };
      return newPoint;
    }
  
    this.statisticsEdge = function(startPoint, endPoint) {  
      var newEdge = {
        0 : startPoint,
        1 : endPoint,
      };
      return newEdge;
    }

    this.statisticsGenerateEdgarGilbert = function(num_vertices, percentage_edge) {
      for (i = 0; i < num_vertices; i++)
      {
        statistics_vertices.push(randomColorTrial.statisticsPoint());
      }

      for (i = 0; i < num_vertices; i++)
      {
        for (j = i + 1; j < num_vertices; j++)
        {
          if (Math.floor(Math.random() * 100) < percentage_edge)
          {
            statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices[j]));
          }
        }
      }
    }

    this.statisticsGenerateMinusOneEdge = function(num_vertices) {
      this.statisticsGenerateEdgarGilbert(num_vertices, 100);
      statistics_edges.pop(); // does not fail if empty
    }

    this.statisticsMakeTwoCliques = function(num_vertices) {
      if (num_vertices % 2 != 0) { // you should only call this function with an even amount of vertices
        return;
      }

      let half_num_vertices = num_vertices / 2; // must be integer

      for (i = 0; i < half_num_vertices; i++)
      {
        for (j = i + 1; j < half_num_vertices; j++)
        {
          statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices[j]));
        }
      }

      for (i = half_num_vertices; i < num_vertices; i++)
      {
        for (j = i + 1; j < num_vertices; j++)
        {
          statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices[j]));
        }
      }
    }

    this.statisticsGenerateTwoCliqueWithPerfectMatching = function(num_vertices) {
      let generate_text = document.getElementById("statistics-generate-text");

      if (num_vertices % 2 != 0)
      {
        generate_text.innerText = "For this kind of graph, enter an even amount of vertices";
        statistics_vertices = [];
        statistics_edges = [];
        return 1;
      }
      
      for (i = 0; i < num_vertices; i++)
      {
        statistics_vertices.push(randomColorTrial.statisticsPoint());
      }

      this.statisticsMakeTwoCliques(num_vertices);

      let half_num_vertices = num_vertices / 2;

      for (i = 0; i < half_num_vertices; i++)
      {
        let j = i + half_num_vertices;
        statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices[j]));
      }

      return 0;
    }

    this.statisticsGenerateRunaway = function(num_vertices) {
      let generate_text = document.getElementById("statistics-generate-text");

      if (num_vertices % 2 != 0)
      {
        generate_text.innerText = "For this kind of graph, enter an even amount of vertices";
        statistics_vertices = [];
        statistics_edges = [];
        return 1;
      }

      if (num_vertices < 4) {
        generate_text.innerText = "For this kind of graph, use at least 4 vertices";
        statistics_vertices = [];
        statistics_edges = [];
        return 1;
      }

      let num_clique_vertices = num_vertices - 2;

      // all the clique vertices
      for (i = 0; i < num_clique_vertices; i++)
      {
        statistics_vertices.push(randomColorTrial.statisticsPoint());
      }

      this.statisticsMakeTwoCliques(num_clique_vertices);

      // two vertices that don't belong to cliques
      statistics_vertices.push(randomColorTrial.statisticsPoint());
      statistics_vertices.push(randomColorTrial.statisticsPoint());

      let half_num_clique_vertices = num_clique_vertices / 2;
      let quarter_num_clique_vertices = Math.floor(half_num_clique_vertices / 2);
      if (half_num_clique_vertices % 2 == 0) {
        for (i = 0; i < num_clique_vertices; i++) {
          if (i < quarter_num_clique_vertices || (i >= half_num_clique_vertices && i < half_num_clique_vertices + quarter_num_clique_vertices)) {
            statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices.at(-2)));
          } else {
            statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices.at(-1)));
          }
        }
      } else {
        for (i = 0; i < num_clique_vertices; i++) {
          if (i <= quarter_num_clique_vertices || (i >= half_num_clique_vertices && i < half_num_clique_vertices + quarter_num_clique_vertices)) {
            statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices.at(-2)));
          } else {
            statistics_edges.push(randomColorTrial.statisticsEdge(statistics_vertices[i], statistics_vertices.at(-1)));
          }
        }
      }

      return 0;
    }

    this.statisticsGenerate = function() {
      this.statisticsClearHTML();
      // generate Edgar Gilbert Random Graph
      statistics_vertices = [];
      statistics_edges = [];
      let num_vertices = document.getElementById("statistics_num_vertices").value;
      let percentage_edge = document.getElementById("statistics_percentage_edge").value;
      num_vertices = Math.floor(num_vertices);
      percentage_edge = Math.floor(percentage_edge);

      let generate_text = document.getElementById("statistics-generate-text");

      if (num_vertices < 1)
      {
        generate_text.innerText = "You need at least one vertex";
        return;
      }

      if (statistics_graph_type == 0 && (percentage_edge < 0 || percentage_edge > 100))
      {
        generate_text.innerText = "Enter a percentage between 0 and 100";
        return;
      }

      let graph_generate_return_code = 0;
      switch (statistics_graph_type)
      {
        case 0:
          this.statisticsGenerateEdgarGilbert(num_vertices, percentage_edge);
          break;
        case 1:
          this.statisticsGenerateMinusOneEdge(num_vertices);
          break;
        case 2:
          graph_generate_return_code = this.statisticsGenerateTwoCliqueWithPerfectMatching(num_vertices);
          break;
        case 3:
          graph_generate_return_code = this.statisticsGenerateRunaway(num_vertices);
      }

      if (graph_generate_return_code != 0) {
        return;
      }

      statistics_delta_plus_one = this.statisticsDetermineDeltaPlusOne();
      let text = "You generated a graph with " +
        num_vertices.toString() + " vertices and " + statistics_edges.length.toString() +
        " edges (out of " + this.maximumNumberOfEdges(num_vertices).toString() +
        " maximum). The highest degree of the graph is " +
        (statistics_delta_plus_one - 1).toString() + ".";
      generate_text.innerText = text;

      let statistics_change_available_colors = document.getElementById("statistics_num_colors");
      statistics_change_available_colors.value = statistics_delta_plus_one;

      let statistics_delta_plus_one_info = document.getElementById("statistics-delta-plus-one-info");
      statistics_delta_plus_one_info.innerText = "Delta + 1 is " + statistics_delta_plus_one;
    }

    this.statisticsRunLoop = function() {
      randomColorTrial.statisticsChooseRandomColor(); // O(n * d)
      randomColorTrial.statisticsCheckAndTakeColor(); // O(n + m)
      randomColorTrial.statisticsResetHasProblemAndColorTry(); // O(n)
      randomColorTrial.statisticsUpdateAvailableColors(); // O(m * log(d)) TODO: for every edge just once
      statistics_iteration_count[statistics_current_run]++;
      let percentage_colored = (randomColorTrial.statisticsGetNumOfColoredVertices() / statistics_vertices.length) * 100
      statistics_plot_percentage_colored[statistics_current_run].push(percentage_colored); // O(n)
      statistics_plot_iteration[statistics_current_run].push(statistics_iteration_count[statistics_current_run]);
      let statistics_run_progress_bar = document.getElementById("statistics-run-progress");
      statistics_run_progress_bar.value = percentage_colored;

      let statistics_is_failed = randomColorTrial.statisticsIsFailed(); // O(m)
      if (statistics_is_failed)
      {
        statistics_iteration_count[statistics_current_run] = -1; // flag for failed
      }

      if (randomColorTrial.statisticsIsFinished() || statistics_is_failed) // O(n)
      {
        statistics_run_progress_bar.value = 100; // in case it failed
        statistics_current_run++;
        if (statistics_current_run < statistics_max_run)
        {
          randomColorTrial.statisticsReset(); // O(n)
          statistics_delta_plus_one = randomColorTrial.statisticsDetermineDeltaPlusOne(); // O(n + m)
          randomColorTrial.statisticsSetupAvailableColors(statistics_delta_plus_one); // O(n * d)
        }
        else
        {
          randomColorTrial.statisticsRunAfterLoop();
          clearInterval(statistics_interval);
        }
        return;
      }
      let run_text_finished = document.getElementById("statistics-run-text");
      run_text_finished.innerText = percentage_colored.toFixed(2) + " % colored after " + statistics_iteration_count[statistics_current_run].toString() + " iterations";
    }

    this.statisticsRunAfterLoop = function() {
      // randomColorTrial.statisticsCheckIfImplementationWorked(); // O(m)

      randomColorTrial.printAfterLoop();

      let statistics_plot = document.getElementById("statistics-plot");

      let layout = {
        margin: {t: 10},
        xaxis: {
          title: 'Iteration'
        },
        yaxis: {
          title: 'Percentage of colored vertices'
        }
      };

      let traces = new Array();

      for (i = 0; i < statistics_max_run; i++)
      {
        if (statistics_iteration_count[i] == -1)
        {
          continue;
        }
        let trace = {
          x: statistics_plot_iteration[i],
          y: statistics_plot_percentage_colored[i],
          type: 'scatter'
        };

        traces.push(trace);
      }

      if (traces.length > 0)
      {
        Plotly.newPlot(statistics_plot, traces, layout);
      }
      else
      {
        statistics_plot.innerHTML = "";
      }
    }

    this.statisticsRun = function() {
      // time complexity of functions is in comments
      // n = number of vertices
      // m = number of edges
      // d = delta

      if (statistics_vertices.length == 0)
      {
        document.getElementById("statistics-generate-text").innerText = "You have to generate a graph first";
        return;
      }

      statistics_max_run = document.getElementById("statistics_num_runs").value;
      statistics_max_run = Math.floor(statistics_max_run);
      if (statistics_max_run < 1)
      {
        document.getElementById("statistics-run-text").innerText = "The algorithm must run at least once";
        return;
      }

      let statistics_change_available_colors = document.getElementById("statistics_num_colors");
      let cap = statistics_change_available_colors.value;
      cap = Math.floor(cap);
      if (cap < 1) {
        document.getElementById("statistics-run-text").innerText = "Use at least 1 color";
        return;        
      }
      statistics_available_colors_used = cap;

      this.statisticsReset(); // O(n)

      this.statisticsSetupAvailableColors(cap); // O(n * d)

      statistics_current_run = 0;

      statistics_iteration_count = new Array();
      statistics_plot_percentage_colored = new Array();
      statistics_plot_iteration = new Array();
      for (i = 0; i < statistics_max_run; i++)
      {
        statistics_iteration_count.push(0);
        statistics_plot_percentage_colored.push([0]);
        statistics_plot_iteration.push([0]);
      }
      statistics_interval = setInterval(this.statisticsRunLoop);
    }

    this.statisticsStop = function() {
      let run_text_finished = document.getElementById("statistics-run-text");
      this.statisticsClearHTML();
      run_text_finished.innerText = "Aborted";
      clearInterval(statistics_interval);
    }

    this.statisticsClearHTML = function() {
      document.getElementById("statistics-run-text").innerText = "";
      document.getElementById("statistics-run-progress").value = 0;
      document.getElementById("statistics-plot").innerHTML = "";
    }

    this.statisticsToggleGraphType = function(button) {
      let percentage_input = document.getElementById("statistics_percentage_edge");
      if (button.value == "0")
      {
        statistics_graph_type = 1;
        button.value = "1";
        button.innerText = "Clique with one edge missing";
        percentage_input.disabled = true;
      }
      else if (button.value == "1")
      {
        statistics_graph_type = 2;
        button.value = "2";
        button.innerText = "Two cliques connected with perfect matching";
        percentage_input.disabled = true;
      }
      else if (button.value == "2")
      {
        statistics_graph_type = 3;
        button.value = "3";
        button.innerText = "Runaway";
        percentage_input.disabled = true;
      }
      else
      {
        statistics_graph_type = 0;
        button.value = "0";
        button.innerText = "Edgar Gilbert Random Graph";
        percentage_input.disabled = false;
      }
    }

    this.arrayAverage = function(array) {
      if (array.length == 0)
      {
        return 0;
      }
      let sum = 0;
      for (let num of array)
      {
        sum += num;
      }
      return sum / array.length;
    }

    this.arrayMin = function(array) {
      if (array.length == 0)
      {
        return 0;
      }
      let min = array[0];
      for (let num of array)
      {
        min = Math.min(num, min);
      }
      return min;
    }

    this.arrayMax = function(array) {
      if (array.length == 0)
      {
        return 0;
      }
      let max = array[0];
      for (let num of array)
      {
        max = Math.max(num, max);
      }
      return max;
    }

    this.arrayStandardDeviation = function(array, average) {
      let sum = 0;
      for (let num of array)
      {
        sum += Math.pow(num - average, 2);
      }
      if (array.length == 0)
      {
        return 0;
      }
      let frac = sum / array.length;
      let retval = Math.sqrt(frac);
      return retval;
    }

    this.printAfterLoop = function() {
      let run_text_finished = document.getElementById("statistics-run-text");
      let statistics_iteration_count_without_failed = statistics_iteration_count.filter(i => i != -1);
      let avg = this.arrayAverage(statistics_iteration_count_without_failed).toFixed(2);
      let min = this.arrayMin(statistics_iteration_count_without_failed);
      let max = this.arrayMax(statistics_iteration_count_without_failed);
      let std_deviation = this.arrayStandardDeviation(statistics_iteration_count_without_failed, avg).toFixed(2);
      let failed_num = statistics_iteration_count.reduce((acc, num) => acc + (num == -1), 0);
      let success_num = statistics_iteration_count.length - failed_num;
      let text = "";
      text += String(statistics_available_colors_used) + " available colors."
      text += "\nFailed " + failed_num + " times | Succeeded " + success_num +
        " times\nIt took on average " + avg +
        " iterations\n Min: " + min + " | Max: " + max + " | Standard Deviation: " + std_deviation +
        "\nRespectively\n[";
      
      for (i = 0; i < statistics_iteration_count_without_failed.length; i++)
      {
        text += statistics_iteration_count_without_failed[i];
        if (i + 1 == statistics_iteration_count_without_failed.length)
        {
          text += "]";
        }
        else if (i != 0 && i % 25 == 0)
        {
          text += "\n";
        }
        else
        {
          text += ", ";
        }
      }
      if (statistics_iteration_count_without_failed.length == 0)
      {
        text += "]";
      }
      run_text_finished.innerText = text;
    }

    this.statisticsGetNumOfColoredVertices = function() {
      let num_colored = 0;
      for (i = 0; i < statistics_vertices.length; i++)
      {
        if (statistics_vertices[i].color_set != -1)
        {
          num_colored++;
        }
      }
      return num_colored;
    }

    this.statisticsReset = function() {
      for (i = 0; i < statistics_vertices.length; i++)
      {
        statistics_vertices[i].color_set = -1;
        statistics_vertices[i].color_try = -1;
        statistics_vertices[i].available_colors = new Set();
        statistics_vertices[i].has_problem = false;
        statistics_vertices[i].num_edges = 0;
      }
    }

    this.statisticsCheckIfImplementationWorked = function() {
      for (i = 0; i < statistics_edges.length; i++)
      {
        let color_set_0 = statistics_edges[i][0].color_set;
        let color_set_1 = statistics_edges[i][1].color_set;
        if (color_set_0 == color_set_1)
        {
          throw new Error("problematic edge detected");
        }
      }
    }

    this.statisticsUpdateAvailableColors = function() {
      for (i = 0; i < statistics_edges.length; i++)
      {
        let color_set_0 = statistics_edges[i][0].color_set;
        let color_set_1 = statistics_edges[i][1].color_set;
        if (color_set_0 == -1 && color_set_1 != -1)
        {
          statistics_edges[i][0].available_colors.delete(color_set_1);
        }
        else if (color_set_1 == -1 && color_set_0 != -1)
        {
          statistics_edges[i][1].available_colors.delete(color_set_0);
        }
      }
    }

    this.statisticsIsFinished = function() {
      for (i = 0; i < statistics_vertices.length; i++)
      {
        if (statistics_vertices[i].color_set == -1)
        {
          return false;
        }
      }
      return true;
    }

    this.statisticsIsFailed = function() {
      for (let eg of statistics_edges)
      {
        if (eg[0].color_set != -1 || eg[1].color_set != -1)
        {
          continue;
        }

        if (eg[0].available_colors.size == 1 && eg[1].available_colors.size == 1 && eg[0].available_colors.values().next().value == eg[1].available_colors.values().next().value)
        {
          return true;
        }
      }
      return false;
    }

    this.statisticsResetHasProblemAndColorTry = function() {
      for (i = 0; i < statistics_vertices.length; i++)
      {
        statistics_vertices[i].has_problem = false;
        statistics_vertices[i].color_try = -1;
      }
    }

    this.statisticsCheckAndTakeColor = function() {
      for (i = 0; i < statistics_edges.length; i++)
      {
        if (statistics_edges[i][0].color_try == statistics_edges[i][1].color_try)
        {
          statistics_edges[i][0].has_problem = true;
          statistics_edges[i][1].has_problem = true;
        }
      }

      for (i = 0; i < statistics_vertices.length; i++)
      {
        if (!statistics_vertices[i].has_problem && statistics_vertices[i].color_set == -1)
        {
          statistics_vertices[i].color_set = statistics_vertices[i].color_try;
        }
      }
    }

    this.statisticsChooseRandomColor = function() {
      for (i = 0; i < statistics_vertices.length; i++)
      {
        if (statistics_vertices[i].color_set != -1)
        {
          statistics_vertices[i].color_try = -1;
          continue;
        }
        let len = statistics_vertices[i].available_colors.size;
        let j = Math.floor(Math.random() * len);
        statistics_vertices[i].available_colors.forEach(element => {
          if (j == 0)
          {
            statistics_vertices[i].color_try = element;
          }
          j--;
        });
      }
    }

    this.statisticsSetupAvailableColors = function() {
      let statistics_change_available_colors = document.getElementById("statistics_num_colors");
      let cap = statistics_change_available_colors.value;

      for (i = 0; i < statistics_vertices.length; i++)
      {
        for (j = 0; j < cap; j++)
        {
          statistics_vertices[i].available_colors.add(j);
        }
      }
    }

    this.maximumNumberOfEdges = function(num_vertices) {
      return (num_vertices * (num_vertices - 1)) / 2
    }

    this.statisticsDetermineDeltaPlusOne = function() {
      for (i = 0; i < statistics_vertices.length; i++)
      {
        statistics_vertices[i].num_edges = 0;
      }

      for (i = 0; i < statistics_edges.length; i++)
      {
        statistics_edges[i][0].num_edges++;
        statistics_edges[i][1].num_edges++;
      }

      let delta = 0;
      for (i = 0; i < statistics_vertices.length; i++)
      {
        delta = Math.max(delta, statistics_vertices[i].num_edges);
      }
      return delta + 1;
    }
  };
  
  randomColorTrial = new RandomColorTrial();
  