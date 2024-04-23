function AlphaBetaPruning() {
  this.active = false;
  var width = 1250;
  var height = 640;
  var pruningoccured = 0;
  var currentNodeIndex = 0;
  var previousNodeIndex = 0;
  var stepCount = 0;
  var execInterval = 50;  //ms
  var speed = 5;
  var skip = 0;
  var algoType = true;
  var currentNodeAlpha = Number.NEGATIVE_INFINITY;
  var currentNodeBeta = Number.POSITIVE_INFINITY;
  var finished = false;
  var paused = true;
  var alphaLocationIndex = 0;
  var betaLocationIndex = 0;

  maximiser = true;
  var maxlevelLabels = ['MAX', 'MIN', 'MAX'];
  var minlevelLabels = ['MIN', 'MAX', 'MIN'];

  var content_div;
  var info_div;
  var algo_div;

  var canvas;
  var context;
  var drawOrEdit = false; 
  var dotted_thickness = "2";
  var dotted_rectangle_color = "#000000";
  var min_object_distance = 20;

  var allNodes = new Array();
  var Level0 = new Array();
  var Level1 = new Array();
  var Level2 = new Array();
  var Level3 = new Array();
  var visitingmap = new Map();

  const rootNode = {
    level: 0,
    x: width/2,
    y: 50,
    value: '',
    children: [],
    parentnode: 6895263,
    alpha: Number.NEGATIVE_INFINITY,
    beta: Number.POSITIVE_INFINITY,
    pruned: 0
  };

  this.initialize = function () {
    content_div = document.getElementById("content")
    info_div = document.getElementById("info")
    algo_div = document.getElementById("algo")
    canvas = document.createElement("canvas")
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("class", "unselectable");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    content_div.appendChild(canvas);

    content_div.setAttribute("style","width:" + width + "px");
    content_div.style.width=width + 'px';
    info_div.setAttribute("style","width:" + (width+10) + "px");
    info_div.style.width=(width+10) + 'px';
    algo_div.setAttribute("style","width:" + (width+10) + "px");
    algo_div.style.width=(width+10) + 'px';

    canvas.addEventListener('mousedown', this.draw, true);

    $("canvas#canvas").on("mouseover",function() {$(this).css('cursor', 'url(res/crosshair.png), auto');}).mouseout(function(){$(this).css('cursor', 'auto');});
    $("canvas#canvas").on("contextmenu", function(e){ return false; });
    this.levels();
    this.drawNode(rootNode);
    this.redrawCanvas();
  }

  this.draw = function(evt){
    currentNodeIndex = 0;
    finished = false
    paused = true
    visitingmap = new Map();
    stepCount = 0;
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].children.length > 0){
        allNodes[i].value = ''
      }
      allNodes[i].pruned = 0
      allNodes[i].alphaIndex = 0
      allNodes[i].betaIndex = 0
      allNodes[i].alpha = Number.NEGATIVE_INFINITY
      allNodes[i].beta = Number.POSITIVE_INFINITY
    }

    var clickedNode;
    var clickedNodeIndex = -1;
    var rect = canvas.getBoundingClientRect();
    var pos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width + 12,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height + 12
    };

    for(i = 0; i < allNodes.length; i++) {
      var point1 = alphaBetaPruning.Point(allNodes[i].x, allNodes[i].y)
      if(alphaBetaPruning.euclideanDistance(point1, pos) <= min_object_distance) {
        clickedNode = allNodes[i];
        clickedNodeIndex = i;
        break;
      }
    }
    if(clickedNode.children.length + 1 > 4 && evt.button === 0){
      return;
    }
    if(Level3.length > 31 && evt.button === 0 && clickedNode.level == 2)
    {
      window.alert("Maximum amount of leaves on the lowest level is 32")
      return;
    }
    if (clickedNodeIndex != -1 && allNodes[clickedNodeIndex].children.length > 0 && drawOrEdit == false && evt.button === 0){
      var newNode = {
        level: clickedNode.level + 1,
        x: clickedNode.x + 50,
        y: clickedNode.y + 140,
        value: '   0',
        children: [],
        parentnode: clickedNodeIndex,
        alpha: Number.NEGATIVE_INFINITY,
        beta: Number.POSITIVE_INFINITY,
        pruned: 0
      };
      
      allNodes.push(newNode)
      allNodes[clickedNodeIndex].children.push(allNodes.length-1);
      alphaBetaPruning.redrawCanvas();
    }
    else if(drawOrEdit == false && evt.button === 0){
      if(clickedNodeIndex != -1 && clickedNode.level + 1 > 3){
        window.alert("Maximum depth is 3");
        return;
      }
      if (clickedNodeIndex != -1) {
        var newNode = {
        level: clickedNode.level + 1,
        x: clickedNode.x,
        y: clickedNode.y + 140,
        value: '   0',
        children: [],
        parentnode: clickedNodeIndex,
        alpha: Number.NEGATIVE_INFINITY,
        beta: Number.POSITIVE_INFINITY,
        pruned: 0
      };
      
      
      context.beginPath();
      context.moveTo(clickedNode.x, clickedNode.y);
      context.lineTo(newNode.x, newNode.y);
      context.stroke();
      alphaBetaPruning.drawNode(newNode);
      allNodes[clickedNodeIndex].value = ''
      allNodes[clickedNodeIndex].children.push(allNodes.length-1);
    }
    }
    else if(drawOrEdit == true && evt.button === 0 && clickedNodeIndex != -1)
    {
      
      if(clickedNode.children.length == 0)
      {
        var userInput = window.prompt("Enter a value for the node: ");
        if(userInput === null || isNaN(userInput) || userInput.indexOf(' ') >= 0 || userInput === "" || userInput.indexOf('0') === 0 || userInput.indexOf('.') >= 0){
          userInput = 0
        }
        if(userInput < 10 & userInput >= 0){
          clickedNode.value = "   " + userInput;
        }
        else if(userInput < 100 & userInput >= -9){
          clickedNode.value = "  " + userInput;
        }
        else if(userInput < 1000 & userInput >= -99){
          clickedNode.value = " " + userInput;
        }
        else if(userInput < 1000 & userInput >= -999){
          clickedNode.value = userInput;
        }
        else if(userInput < -999){
          window.alert("Min value is -999");
        }
        else {
          window.alert("Max value is 999");
        }
      }
      else{
        window.alert("Only nodes without children can have values");
      }
      
    }
    if(evt.button === 2)
    {
      if(clickedNodeIndex != -1)
      {
        alphaBetaPruning.deleteNode(clickedNodeIndex)    
      }
      
    }
    alphaBetaPruning.redrawCanvas();
  }

  this.deleteNode = function(nodeIndex) {

    if (allNodes[nodeIndex].children.length > 0) {
      for (var i = allNodes[nodeIndex].children.length - 1; i >= 0; i--) {
        this.deleteNode(allNodes[nodeIndex].children[i]);
      }
    }
  
    if (allNodes[allNodes[nodeIndex].parentnode].children.length > 1) { 
      allNodes[allNodes[nodeIndex].parentnode].children.splice(allNodes[allNodes[nodeIndex].parentnode].children.indexOf(nodeIndex), 1);
    } else {
      allNodes[allNodes[nodeIndex].parentnode].children = [];
    }

    for (var j = 0; j < allNodes.length; j++) {

      if(allNodes[j].parentnode > nodeIndex)
      {
        allNodes[j].parentnode--;
      }
      allNodes[j].children.forEach(function(element, index, array) {
        if(allNodes[j].children[index] > nodeIndex)
        {
          allNodes[j].children[index] = element - 1;
        }
      });
    }
    if(allNodes[allNodes[nodeIndex].parentnode].children.length === 0){
      allNodes[allNodes[nodeIndex].parentnode].value = "   " + 0
    }
    allNodes.splice(nodeIndex, 1);

    alphaBetaPruning.redrawCanvas();
  };

  this.drawNode = function(node) {
    context.beginPath();
    context.arc(node.x, node.y, 19, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.stroke();

    context.fillStyle = 'black';
    context.font = 'bold 16px Arial';
    context.fillText(node.value, node.x - 19, node.y + 5);
    allNodes.push(
      {
        level: node.level,
        x: node.x,
        y: node.y,
        value: '   0',
        children: [],
        parentnode: node.parentnode,
        alpha: Number.NEGATIVE_INFINITY,
        beta: Number.POSITIVE_INFINITY,
        pruned: 0
      });
  }

  this.redrawNode = function(node) {
    context.beginPath();
    context.arc(node.x, node.y, 19, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.stroke();
    context.fillStyle = 'black';
    context.font = 'bold 16px Arial';
    context.fillText(node.value, node.x - 19, node.y + 5);
    node.children.forEach((index)=>{alphaBetaPruning.redrawNode(allNodes[index])});
  }
  this.redrawNodePaths2 = function(node) {
    node.children.forEach((index)=>{
      alphaBetaPruning.redrawNodePaths(node, allNodes[index]); 
      alphaBetaPruning.redrawNodePaths2(allNodes[index])});

  }
  
  this.reconfigureLevels = function(){
    Level0 = new Array(); // may not even be needed
    Level1 = new Array();
    Level2 = new Array();
    Level3 = new Array();
    //Level3draw = new Array(20).fill(0);
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].level === 0){
        Level0.push(i)
      }
    }
    for (var i = 0; i < Level0.length; i++) {
      for(var g = 0; g < allNodes[Level0[i]].children.length; g++){
        Level1.push(allNodes[Level0[i]].children[g])
      }
    }
    for (var i = 0; i < Level1.length; i++) {
      for(var g = 0; g < allNodes[Level1[i]].children.length; g++){
        Level2.push(allNodes[Level1[i]].children[g])
      }
    } 
    for (var i = 0; i < Level2.length; i++) {
      for(var g = 0; g < allNodes[Level2[i]].children.length; g++){
        Level3.push(allNodes[Level2[i]].children[g])
      }
    }
    
    if(Level1.length > 0){
      var spacing = width / Level1.length;
      var increment = spacing/2;
      for(var i = 0; i < Level1.length; i++){

      }
      Level1.forEach((index)=>{allNodes[index].x = increment; increment = increment + spacing});
    }

    if(Level2.length > 0){
      for(var i = 0; i < Level1.length; i++){
       var xstart = (width/Level1.length * i) //+ 20
       var xend = (width/Level1.length * (i+1)) //- 20
       var spacing = (xend - xstart)/allNodes[Level1[i]].children.length
       var increment = xstart
       
       if(allNodes[Level1[i]].children.length === 4){
        increment = allNodes[Level1[i]].x - (1.5 * spacing)
      }
      if(allNodes[Level1[i]].children.length === 3){
        increment = allNodes[Level1[i]].x - spacing
      }
      if(allNodes[Level1[i]].children.length === 2){
        increment = allNodes[Level1[i]].x - (0.5 * spacing)
      }
      if(allNodes[Level1[i]].children.length === 1){
        increment = allNodes[Level1[i]].x
      }
       for(var g = 0; g < allNodes[Level1[i]].children.length; g++){
        allNodes[allNodes[Level1[i]].children[g]].x = increment
        increment = increment + spacing
       }
      }
    }

    var longest = 0;
    var longestIndexL1 = 0;
    for(var i = 0; i < Level1.length; i++)
    {
     if(longest < allNodes[Level1[i]].children.length){
      longest = allNodes[Level1[i]].children.length;
      longestIndexL1 = Level1[i]
     }
    }

    if(Level3.length > 0){
      for(var i = 0; i < Level2.length; i++){

        if(longestIndexL1 != allNodes[Level2[i]].parentnode){
          longest = allNodes[allNodes[Level2[i]].parentnode].children.length;
        }

        var spacing = 40;
        var increment = 25;
        if(allNodes[Level2[i]].children.length === 1){
          increment = allNodes[Level2[i]].x
        }
        if(allNodes[Level2[i]].children.length === 2){
          increment = allNodes[Level2[i]].x - (spacing/2)
        }
        if(allNodes[Level2[i]].children.length === 3){
          increment = allNodes[Level2[i]].x - (spacing/2) - 20
        }
        if(allNodes[Level2[i]].children.length === 4){
          increment = allNodes[Level2[i]].x - (spacing/2) - 40
        }

        var L2mean = 0;
        for(var g = 0; g < allNodes[Level2[i]].children.length; g++){
          allNodes[allNodes[Level2[i]].children[g]].x = increment
          L2mean = L2mean + allNodes[allNodes[Level2[i]].children[g]].x
          increment = increment + spacing
        }
      }
      for(var i = 0; i < Level3.length; i++){
        if(allNodes[Level3[i]].x < 20)
        {
          allNodes[Level3[i]].x = 20
        }
        if(allNodes[Level3[i]].x > width - 20)
        {
          allNodes[Level3[i]].x = width - 20
        }
        while(i > 0 && (alphaBetaPruning.xdistance(allNodes[Level3[i-1]].x, allNodes[Level3[i]].x) < 39 || allNodes[Level3[i-1]].x > allNodes[Level3[i]].x)){
          allNodes[Level3[i]].x++
        }
      }
      for(var i = Level3.length - 1; i > 0; i--){
        if(allNodes[Level3[i]].x < 20)
        {
          allNodes[Level3[i]].x = 20
        }
        if(allNodes[Level3[i]].x > width - 20)
        {
          allNodes[Level3[i]].x = width - 20
        }
        while(i > 0 && (alphaBetaPruning.xdistance(allNodes[Level3[i-1]].x, allNodes[Level3[i]].x) < 39 || allNodes[Level3[i-1]].x > allNodes[Level3[i]].x)){
          allNodes[Level3[i-1]].x--
        }
      }
    }
  }

  this.reconfigureTree = function(index) {
    if (allNodes[index].level == 0){
      incrementer = 370;
    }
    if (allNodes[index].level == 1){
      incrementer = 117;
    }
    if (allNodes[index].level == 2){
      incrementer = 39;
    }
    if (allNodes[index].level == 3){
      incrementer = 1;
    }
    if(allNodes[index].children.length == 1){
      allNodes[allNodes[index].children[0]].x = allNodes[index].x;
    }

    if(allNodes[index].children.length == 2){
      allNodes[allNodes[index].children[0]].x = allNodes[index].x - incrementer;
      allNodes[allNodes[index].children[1]].x = allNodes[index].x + incrementer;
    }

    if(allNodes[index].children.length == 3){
      allNodes[allNodes[index].children[0]].x = allNodes[index].x - incrementer;
      allNodes[allNodes[index].children[1]].x = allNodes[index].x;
      allNodes[allNodes[index].children[2]].x = allNodes[index].x + incrementer;
    }

    if(allNodes[index].children.length == 4){
      allNodes[allNodes[index].children[0]].x = allNodes[index].x - incrementer;
      allNodes[allNodes[index].children[1]].x = allNodes[index].x - incrementer*0.4;
      allNodes[allNodes[index].children[2]].x = allNodes[index].x + incrementer*0.4;
      allNodes[allNodes[index].children[3]].x = allNodes[index].x + incrementer;
    }
  }
  this.drawX = function(x, y){
    context.beginPath();

    context.moveTo(x - 15, y - 15);
    context.lineTo(x + 15, y + 15);

    context.moveTo(x + 15, y - 15);
    context.lineTo(x - 15, y + 15);
    context.stroke();
}
  this.redrawNodePaths = function(node, nodechild) {
    context.beginPath();
    context.moveTo(node.x, node.y);
    context.lineTo(nodechild.x, nodechild.y);
    context.stroke();
    if(nodechild.pruned == 1)
    {
      context.strokeStyle = "red";
      prunedx = (node.x + nodechild.x) /2
      prunedy = (node.y + nodechild.y) /2
      alphaBetaPruning.drawX(prunedx, prunedy);
      context.strokeStyle = "black";
    }
  }

  this.drawCanvasBoundingBox = function() {
    context.setLineDash([5, 5]);
    
    context.beginPath();
    context.lineWidth = dotted_thickness;
    context.strokeStyle = dotted_rectangle_color;
    context.rect(
              dotted_thickness / 2,
              dotted_thickness / 2,
              canvas.width  - dotted_thickness,
              canvas.height - dotted_thickness);
    context.stroke();
    context.setLineDash([]);
  }

  this.redrawCanvas = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBox();
    alphaBetaPruning.reconfigureLevels();
    alphaBetaPruning.redrawNodePaths2(allNodes[0]);
    alphaBetaPruning.redrawNode(allNodes[0]);
    alphaBetaPruning.levels();
    context.strokeStyle = "black";
  }
  this.drawBalken = function(x, y){
    var absmaximalVal = 0
    for (var i = 0; i < allNodes.length; i++){
      if(Math.abs(allNodes[i].value) > absmaximalVal)
      {
        absmaximalVal = Math.abs(allNodes[i].value)
      }
    } 
    var min = x - 150
    var max = x + 150
    var dist = (max - min)/2
    var alpha1 = currentNodeAlpha
    var beta1 = currentNodeBeta
    if(currentNodeAlpha < -absmaximalVal)
    {
      alpha1 = -absmaximalVal
    }
    if(currentNodeBeta > absmaximalVal)
    {
      beta1 = absmaximalVal
    }
    var alphax = 0
    var betax = 0

    alphax = min + dist + ((alpha1 / absmaximalVal)*dist)
    betax = min +  dist  +  ((beta1 / absmaximalVal)*dist)

    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(min, y);
    context.lineTo(max, y);
    context.stroke();

    if(alphax < betax)
    {
      context.beginPath();
      context.lineWidth = "4"
      context.strokeStyle = "#0bf702";
      context.moveTo(alphax, y);
      context.lineTo(betax, y);
      context.stroke();
    }
    if(betax < alphax)
    {
      context.beginPath();
      context.lineWidth = "4"
      context.strokeStyle = "#f70202";
      context.moveTo(alphax, y);
      context.lineTo(betax, y);
      context.stroke();
    }

    context.beginPath();
    context.strokeStyle = "#ff33cc";
    context.lineWidth = "4"
    context.moveTo(min, y - 8);
    context.lineTo(min, y + 8);
    context.stroke();

    context.fillText("-" + absmaximalVal, min - 15, y + 30);
    context.fillText("+" + absmaximalVal, max - 20, y + 30);

    context.beginPath();
    context.strokeStyle = "#0000ff";
    context.moveTo(max, y - 8);
    context.lineTo(max, y + 8);
    context.stroke();

    context.lineWidth = dotted_thickness
    
    context.beginPath();
    context.strokeStyle = "#ff33cc";
    context.moveTo(alphax, y - 8);
    context.lineTo(alphax, y + 8);
    context.stroke();

    context.beginPath();
    context.strokeStyle = "#0000ff";
    context.moveTo(betax, y - 8);
    context.lineTo(betax, y + 8);
    context.stroke();

  }
  this.levels = function(){
    if(maximiser === true){
      var levelLabels = maxlevelLabels;
    }
    else{
      var levelLabels = minlevelLabels;
    }
    var levelLabelY = 85;
    var levelLabelSpacing = 140;
    context.font = "25px Arial";
    context.fillText("Number of steps: " + stepCount, 250, height - 80);
    if(algoType == false)
    {
    context.textAlign = "left";
    context.fillStyle = "#ff33cc";
    context.fillText("\u03B1: " + currentNodeAlpha, 50, height - 80);
    context.fillStyle = "#0000ff";
    context.fillText("\u03B2: " + currentNodeBeta, 50, height - 40);
    context.fillStyle = "black";
    alphaBetaPruning.drawBalken(405, height - 35)
    context.font = "25px Arial";
    if(alphaLocationIndex != 0){
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "#ff33cc"
      context.arc(allNodes[alphaLocationIndex].x, allNodes[alphaLocationIndex].y, 20, 0, 2 * Math.PI);
      context.stroke();
    }
    if(betaLocationIndex != 0){
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "#0000ff"
      context.arc(allNodes[betaLocationIndex].x, allNodes[betaLocationIndex].y, 20, 0, 2 * Math.PI);
      context.stroke();
    }
    context.lineWidth = dotted_thickness;
    context.strokeStyle = "black";
    context.fillStyle = "black";
    
    }
    for (var i = 0; i < levelLabels.length; i++) {
      var levelLabel = levelLabels[i];
      context.fillText(levelLabel, 5, levelLabelY);
      context.strokeStyle = "grey";
      context.beginPath();
      context.moveTo(5, levelLabelY);
      context.lineTo(width - 20, levelLabelY);
      context.stroke();
      levelLabelY += levelLabelSpacing;
    }
    context.strokeStyle = "grey";
      context.beginPath();
      context.moveTo(5, levelLabelY);
      context.lineTo(width - 20, levelLabelY);
      context.stroke();
  }

  this.euclideanDistance = function (p1, p2) {
    return Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y)));
  }
  this.xdistance = function (x1, x2) {
    return Math.abs(x2 - x1);
  }

  this.Point = function(x_coord, y_coord) {
    var newPoint = {
      x : x_coord,
      y : y_coord,
      };
     return newPoint;
  }
  //Buttons
  this.getRandomValue = function() {
    visitingmap = new Map();
    stepCount = 0;
    currentNodeIndex = 0;
    finished = false
    paused = true
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    for (let i = 0; i < allNodes.length; i++) {
      allNodes[i].pruned = 0
      allNodes[i].alphaIndex = 0
      allNodes[i].betaIndex = 0
      allNodes[i].alpha = Number.NEGATIVE_INFINITY
      allNodes[i].beta = Number.POSITIVE_INFINITY
      if(allNodes[i].children.length === 0)
      {
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        if (plusOrMinus < 0) {
          allNodes[i].value = ' ' + (Math.floor(Math.random() * 88 * plusOrMinus) - 10);
        }
        if (plusOrMinus > 0) {
          allNodes[i].value = '  ' + (Math.floor(Math.random() * 88 * plusOrMinus) + 10);
        }
        
      }
      else{
        allNodes[i].value = ''
      }
    }
    alphaBetaPruning.redrawCanvas()
  }

  this.updateDrawingPolicy = function(button) {
    if(button.value == "true") {
      drawOrEdit = false;
      button.value = "false";
      button.innerHTML = "Create Nodes";
    } else {
      drawOrEdit = true;
      button.value = "true";
      button.innerHTML = "Edit Node Values";
    }
  }

  this.updateMinMax = function(button) {
    currentNodeIndex = 0;
    finished = false
    paused = true
    visitingmap = new Map();
    stepCount = 0;
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].children.length > 0){
        allNodes[i].value = ''
      }
      allNodes[i].pruned = 0
      allNodes[i].alphaIndex = 0
      allNodes[i].betaIndex = 0
      allNodes[i].alpha = Number.NEGATIVE_INFINITY
      allNodes[i].beta = Number.POSITIVE_INFINITY
    }

    if(button.value == "true") {
      maximiser = true;
      button.value = "false";
      button.innerHTML = "Root Max";
    } else {
      maximiser = false;
      button.value = "true";
      button.innerHTML = "Root Min";
    }
    alphaBetaPruning.redrawCanvas();
  }
  this.changeType = function(button) {
    
    if(button.value == "false") {
      algoType = true //MiniMax;
      button.value = "true";
      button.innerHTML = "MinMax";
    } else {
      algoType = false; //Alpha Beta Pruning
      button.value = "false";
      button.innerHTML = "Alpha Beta Pruning";
    }
    currentNodeIndex = 0;
    finished = false
    paused = true
    visitingmap = new Map();
    stepCount = 0;
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].children.length > 0){
        allNodes[i].value = ''
      }
      allNodes[i].pruned = 0
      allNodes[i].alphaIndex = 0
      allNodes[i].betaIndex = 0
      allNodes[i].alpha = Number.NEGATIVE_INFINITY
      allNodes[i].beta = Number.POSITIVE_INFINITY
    }
    alphaBetaPruning.redrawCanvas()
  }
  this.getMaxChildVal = function(index){
    var max = -999
    for (let i = 0; i < allNodes[index].children.length; i++) {
      if(parseInt(max, 10) < allNodes[allNodes[index].children[i]].value)
      {
        max = allNodes[allNodes[index].children[i]].value
      }
    }
    return parseInt(max, 10);
  }

  this.getMinChildVal = function(index){
    var min = 9999
    for (let i = 0; i < allNodes[index].children.length; i++) {
      if(parseInt(min, 10) > allNodes[allNodes[index].children[i]].value)
      {
        min = allNodes[allNodes[index].children[i]].value
      }
    }
    return parseInt(min, 10);
  }

  this.modifyValue = function(index, value){

    if(value < 10 & value >= 0){
      allNodes[index].value = "   " + value;
    }
    else if(value < 100 & value >= -9){
      allNodes[index].value = "  " + value;
    }
    else if(value < 1000 & value >= -99){
      allNodes[index].value = " " + value;
    }
    else if(value < 1000 & value >= -999){
      clickedNode.value = value;
    }
  }
  this.getNewIndex = function(){
    context.lineWidth = 4;
    if(visitingmap.has(currentNodeIndex) == false)
    {
      visitingmap.set(currentNodeIndex,0)
    }
    if(allNodes[currentNodeIndex].children.length > visitingmap.get(currentNodeIndex)){
        if(maximiser === true && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2))
        {
          if(allNodes[currentNodeIndex].value === ''){
            val = -999
          }
          else{
            val = allNodes[currentNodeIndex].value
          }
        }
        else if(maximiser == true){
          if(allNodes[currentNodeIndex].value === ''){
            val = 999
          }
          else{
            val = allNodes[currentNodeIndex].value
          }
        }
        if(maximiser === false && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2))
        {
          if(allNodes[currentNodeIndex].value === ''){
            val = 999
          }
          else{
            val = allNodes[currentNodeIndex].value
          }
        }
        else if(maximiser == false){
          if(allNodes[currentNodeIndex].value === ''){
            val = -999
          }
          else{
            val = allNodes[currentNodeIndex].value
          }
        }
      for (let i = 0; i < visitingmap.get(currentNodeIndex); i++) {
        var nodeVal = parseInt(allNodes[allNodes[currentNodeIndex].children[i]].value, 10);
        if(maximiser === true && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2))
        {
          if(val < nodeVal)
          {
            val = nodeVal
            allNodes[currentNodeIndex].value = allNodes[allNodes[currentNodeIndex].children[i]].value
            if(allNodes[currentNodeIndex].alpha < val){
              allNodes[currentNodeIndex].alpha = val
              allNodes[currentNodeIndex].alphaIndex = allNodes[currentNodeIndex].children[i]
            }
            if(allNodes[allNodes[currentNodeIndex].children[i]].children.length == 0){
            }
          }
          if(nodeVal >= allNodes[currentNodeIndex].beta)
          {
            skip = 1
          }
        }
        else if(maximiser == true){
          if(val > nodeVal)
          {
            val = nodeVal
            allNodes[currentNodeIndex].value = allNodes[allNodes[currentNodeIndex].children[i]].value
            if(allNodes[currentNodeIndex].beta > val){
              allNodes[currentNodeIndex].beta = val
              allNodes[currentNodeIndex].betaIndex = allNodes[currentNodeIndex].children[i]
            }
            if(allNodes[allNodes[currentNodeIndex].children[i]].children.length == 0){
              betaLocationIndex = allNodes[currentNodeIndex].children[i]
            }
          }
          if(nodeVal <= allNodes[currentNodeIndex].alpha)
          {
            skip = 1
          }
        }
        if(maximiser === false && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2))
        {
          if(val > nodeVal)
          {
            val = nodeVal
            allNodes[currentNodeIndex].value = allNodes[allNodes[currentNodeIndex].children[i]].value
            allNodes[currentNodeIndex].beta = val
            allNodes[currentNodeIndex].betaIndex = allNodes[currentNodeIndex].children[i]
            if(allNodes[allNodes[currentNodeIndex].children[i]].children.length == 0){
              betaLocationIndex = allNodes[currentNodeIndex].children[i]
            }
          }
          if(val <= allNodes[currentNodeIndex].alpha)
          {
            skip = 1
          }
        }
        else if(maximiser == false){
          if(val < nodeVal)
          {
            val = nodeVal
            allNodes[currentNodeIndex].value = allNodes[allNodes[currentNodeIndex].children[i]].value
            allNodes[currentNodeIndex].alpha = val
            allNodes[currentNodeIndex].alphaIndex = allNodes[currentNodeIndex].children[i]
            if(allNodes[allNodes[currentNodeIndex].children[i]].children.length == 0){
            }
          }
          if(val >= allNodes[currentNodeIndex].beta)
          {
            skip = 1
          }
        }
      }
      currentNodeAlpha = allNodes[currentNodeIndex].alpha
      currentNodeBeta  = allNodes[currentNodeIndex].beta
      alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
      betaLocationIndex = allNodes[currentNodeIndex].betaIndex
      
      var imm = visitingmap.get(currentNodeIndex)
      var immindex = currentNodeIndex
      if(algoType == true || skip == 0)
      {
        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "red"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        currentNodeIndex = allNodes[immindex].children[visitingmap.get(immindex)]
        allNodes[currentNodeIndex].alpha = allNodes[immindex].alpha
        allNodes[currentNodeIndex].alphaIndex = allNodes[immindex].alphaIndex
        allNodes[currentNodeIndex].beta = allNodes[immindex].beta
        allNodes[currentNodeIndex].betaIndex = allNodes[immindex].betaIndex
        visitingmap.delete(immindex)
        visitingmap.set(immindex,imm+1)
      }
      else{
        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "red"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        for (let i = imm; i < allNodes[currentNodeIndex].children.length; i++) {
          allNodes[allNodes[currentNodeIndex].children[i]].pruned = 1
          pruningoccured = 1;
        }
        currentNodeIndex = allNodes[currentNodeIndex].parentnode
        visitingmap.delete(immindex)
        skip = 0
      }
      skip = 0
    }
    ////MINMAX
    else{      
      if(maximiser === true && allNodes[currentNodeIndex].children.length > 0 && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2)){
        alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMaxChildVal(currentNodeIndex))
        allNodes[currentNodeIndex].alpha = alphaBetaPruning.getMaxChildVal(currentNodeIndex)
        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        if(currentNodeIndex == 0){
          finished = true
          paused = true
        }
      }
      else if(maximiser == true && allNodes[currentNodeIndex].children.length > 0){
        alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMinChildVal(currentNodeIndex))
        allNodes[currentNodeIndex].beta = alphaBetaPruning.getMinChildVal(currentNodeIndex)
        
        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        if(currentNodeIndex == 0){
          finished = true
          paused = true
        }
      }
      if(maximiser === false && allNodes[currentNodeIndex].children.length > 0 && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2)){
        alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMinChildVal(currentNodeIndex))
        allNodes[currentNodeIndex].beta = alphaBetaPruning.getMinChildVal(currentNodeIndex)

        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        if(currentNodeIndex == 0){
          finished = true
          paused = true
        }
      }
      else if(maximiser == false && allNodes[currentNodeIndex].children.length > 0){
        alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMaxChildVal(currentNodeIndex))
        allNodes[currentNodeIndex].alpha = alphaBetaPruning.getMaxChildVal(currentNodeIndex)

        alphaBetaPruning.redrawCanvas()
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
        context.stroke();
        if(currentNodeIndex == 0){
          finished = true
          paused = true
        }
      }

      if(algoType == false && skip == 1){
        skip = 0      
        if(maximiser === true && allNodes[currentNodeIndex].children.length > 0 && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2)){
          alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMaxChildVal(currentNodeIndex))
          allNodes[currentNodeIndex].alpha = alphaBetaPruning.getMaxChildVal(currentNodeIndex)
          currentNodeAlpha = allNodes[currentNodeIndex].alpha
          currentNodeBeta  = allNodes[currentNodeIndex].beta
          alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
          betaLocationIndex = allNodes[currentNodeIndex].betaIndex
          alphaBetaPruning.redrawCanvas()
          context.lineWidth = 3.5;
          context.beginPath();
          context.strokeStyle = "green"
          context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
          context.stroke();
          if(currentNodeIndex == 0){
            finished = true
            paused = true
          }
        }
        else if(maximiser == true && allNodes[currentNodeIndex].children.length > 0){
          alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMinChildVal(currentNodeIndex))
          allNodes[currentNodeIndex].beta = alphaBetaPruning.getMinChildVal(currentNodeIndex)
          currentNodeAlpha = allNodes[currentNodeIndex].alpha
          currentNodeBeta  = allNodes[currentNodeIndex].beta
          alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
          betaLocationIndex = allNodes[currentNodeIndex].betaIndex

          alphaBetaPruning.redrawCanvas()
          context.lineWidth = 3.5;
          context.beginPath();
          context.strokeStyle = "green"
          context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
          context.stroke();
          if(currentNodeIndex == 0){
            finished = true
            paused = true
          }
        }
        if(maximiser === false && allNodes[currentNodeIndex].children.length > 0 && (allNodes[currentNodeIndex].level === 0 || allNodes[currentNodeIndex].level === 2)){
          alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMinChildVal(currentNodeIndex))
          allNodes[currentNodeIndex].beta = alphaBetaPruning.getMinChildVal(currentNodeIndex)
          currentNodeAlpha = allNodes[currentNodeIndex].alpha
          currentNodeBeta  = allNodes[currentNodeIndex].beta
          alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
          betaLocationIndex = allNodes[currentNodeIndex].betaIndex
          alphaBetaPruning.redrawCanvas()
          context.lineWidth = 3.5;
          context.beginPath();
          context.strokeStyle = "green"
          context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
          context.stroke();
          if(currentNodeIndex == 0){
            finished = true
            paused = true
          }
        }
        else if(maximiser == false && allNodes[currentNodeIndex].children.length > 0){
          alphaBetaPruning.modifyValue(currentNodeIndex, alphaBetaPruning.getMaxChildVal(currentNodeIndex))
          allNodes[currentNodeIndex].alpha = alphaBetaPruning.getMaxChildVal(currentNodeIndex)
          currentNodeAlpha = allNodes[currentNodeIndex].alpha
          currentNodeBeta  = allNodes[currentNodeIndex].beta
          alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
          betaLocationIndex = allNodes[currentNodeIndex].betaIndex
          alphaBetaPruning.redrawCanvas()
          context.lineWidth = 3.5;
          context.beginPath();
          context.strokeStyle = "green"
          context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
          context.stroke();
          if(currentNodeIndex == 0){
            finished = true
            paused = true
          }
        }
      }
      currentNodeIndex = allNodes[currentNodeIndex].parentnode
    }
  }

  this.updateSpeed = function(newSpeed) {
    speed = (11-newSpeed);
  }
 
  this.runInterval = function() {
    if(alphaBetaPruning.active) {
      if(!paused) {
        alphaBetaPruning.stepForward();
      }
      clearInterval(alphaBetaPruning.interval);
        runspeed = execInterval*speed;
        alphaBetaPruning.interval = setInterval(alphaBetaPruning.runInterval, runspeed);
    }
  }
  this.interval = setInterval(this.runInterval, execInterval*speed);

  this.runAlgorithm = function() {
    if(finished === false){
      paused = false;
    }
  }
  this.pauseAlgorithm = function() {
    paused = true;
  }

  this.stepBackward = function() {
    paused = true;
    finished = false;
    currentNodeIndex = 0;
    visitingmap = new Map()
    currentNodeAlpha = Number.NEGATIVE_INFINITY;
    currentNodeBeta = Number.POSITIVE_INFINITY;
    alphaLocationIndex = 0
    betaLocationIndex = 0
    if(stepCount <= 0) return;
    if(allNodes.length == 1)
      {
        alphaBetaPruning.redrawCanvas();
        return;
      }
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].children.length > 0){
        allNodes[i].value = ''
      }
      allNodes[i].pruned = 0
      allNodes[i].alphaIndex = 0
      allNodes[i].betaIndex = 0
      allNodes[i].alpha = Number.NEGATIVE_INFINITY
      allNodes[i].beta = Number.POSITIVE_INFINITY
    }
    var oldStep = Math.max(stepCount-1, 1);
    stepCount = 0;
    while(stepCount != oldStep) {
      this.stepForward();
    }
  }

  this.stepForward = function() {
    if(pruningoccured == 1)
    {
      pruningoccured = 0
      alphaBetaPruning.redrawCanvas();
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "red"
      context.arc(allNodes[previousNodeIndex].x, allNodes[previousNodeIndex].y, 20, 0, 2 * Math.PI);
      context.stroke();
      return;
    }
    if(finished === true) {
      alphaBetaPruning.redrawCanvas();
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "green"
      context.arc(allNodes[0].x, allNodes[0].y, 20, 0, 2 * Math.PI);
      context.stroke();
      return;
    }
    if(allNodes.length === 1)
    {
      stepCount++;
      finished = true
      alphaBetaPruning.redrawCanvas();
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "green"
      context.arc(allNodes[0].x, allNodes[0].y, 20, 0, 2 * Math.PI);
      context.stroke();
      return;
    }
    if(algoType == true)
    {
      stepCount++;
      alphaBetaPruning.redrawCanvas()
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "red"
      context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
      context.stroke();
      previousNodeIndex = currentNodeIndex
      alphaBetaPruning.getNewIndex();
      if(finished === true) {
        this.redrawCanvas();
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[0].x, allNodes[0].y, 20, 0, 2 * Math.PI);
        context.stroke();
        return;
      }
    }
    else{
      stepCount++;
      currentNodeAlpha = allNodes[currentNodeIndex].alpha
      currentNodeBeta  = allNodes[currentNodeIndex].beta
      alphaLocationIndex = allNodes[currentNodeIndex].alphaIndex
      betaLocationIndex = allNodes[currentNodeIndex].betaIndex
      alphaBetaPruning.redrawCanvas()
      context.lineWidth = 3.5;
      context.beginPath();
      context.strokeStyle = "red"
      context.arc(allNodes[currentNodeIndex].x, allNodes[currentNodeIndex].y, 20, 0, 2 * Math.PI);
      context.stroke();
      previousNodeIndex = currentNodeIndex
      alphaBetaPruning.getNewIndex();
      if(finished === true) {
        alphaBetaPruning.redrawCanvas();
        context.lineWidth = 3.5;
        context.lineWidth = 3.5;
        context.beginPath();
        context.strokeStyle = "green"
        context.arc(allNodes[0].x, allNodes[0].y, 20, 0, 2 * Math.PI);
        context.stroke();
        return;
      }
    }
    context.lineWidth = 2;
  }

  this.stepBackFill = function() {
    visitingmap = new Map();
    stepCount = 0;
    currentNodeIndex = 0;
    finished = false
    paused = true
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    for (var i = 0; i < allNodes.length; i++) {
      if(allNodes[i].children.length > 0){
        allNodes[i].value = ''
        allNodes[i].alphaIndex = 0
        allNodes[i].betaIndex = 0
        allNodes[i].alpha = Number.NEGATIVE_INFINITY
        allNodes[i].beta = Number.POSITIVE_INFINITY 
      }
      allNodes[i].pruned = 0
    }
    this.redrawCanvas();
  }
  this.stepFill = function() {
    while(!finished)
    this.stepForward();
  }

  this.clearPoints = function() {
    currentNodeAlpha = Number.NEGATIVE_INFINITY
    currentNodeBeta = Number.POSITIVE_INFINITY
    alphaLocationIndex = 0
    betaLocationIndex = 0
    currentNodeIndex = 0;
    finished = false
    paused = true
    visitingmap = new Map();
    stepCount = 0;
    allNodes = new Array();
    this.drawNode(rootNode);
    this.redrawCanvas();
  }

  this.openHelp = function(){
    var infoWindow = document.getElementById("help");
    infoWindow.style.display = "block";
  }
  
  this.closeHelp = function(){
    var infoWindow = document.getElementById("help");
    infoWindow.style.display = "none";
  }
  };
  alphaBetaPruning = new AlphaBetaPruning();
  