function Scanline() {
  this.active = false;

  //consts.
  const font_size = 24;
  const max_count = 20;
  const max_value = 99;
  const header_diff = 70;
  const cell_size = 40;
  const grid_border = 10;
  const exec_interval = 50;  //ms
  const diagram_height = 400;
  
  var canvas;
  var context;
  
  var speed = 5;
  var diagram_ratio = 0;
  var expected_sum = 0;

  var direction_indicator_thickness = "3";
  var direction_indicator_color = "#636363"
  
  var grid_thickness = "5";
  var grid_color = "#222222";

  var colors = [
    "#07FF00",  //green
    "#0FFFF0",  //turquise
    "#D700FF",  //purple
    "#FF8000",  //orange
  ];

  var default_text_color = "#222222";
  var potential_sequence_color = "#FF8A00";
  var current_selection_color = "#B22222"
  var current_comparator_color = "#FFD700"
  var sequence_color = "#0C9817"
  var finding_sequence_path_color = "#0C9817"


  var grid_Ak = [];
  var grid_k = [];

  //global algorithm variables
  var A = [];
  
  var VON = 1;
  var BIS = 1;
  var MAX = 0;
  var V = 1;
  var K = 1;
  var T = 0;
  var SUM_QUEUE = [];

  var FINISHED = false;
  var ISPAUSED = true;
    
  this.initialize = function() {
    var content_div = document.getElementById("content")
    var info_div = document.getElementById("info")
    var algo_div = document.getElementById("algo")

    canvas = document.createElement("canvas")
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("class", "unselectable");
    context = canvas.getContext("2d");
    content_div.appendChild(canvas);

    var width = cell_size * max_count + header_diff + 2 * grid_border;

    content_div.style.width=width + 'px';
    info_div.style.width=(width+10) + 'px';
    algo_div.style.width=(width+10) + 'px';
    
    this.genExample();
  }
  
  this.restrictKeyPress = function (event) {

    var keycode = event.keyCode;
    var charCode = event.charCode;

    //information source: https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

    var valid =
      (keycode >= 8 && keycode <= 46) ||     //control keys
      (charCode >= 48 && charCode <= 57) ||  //numbers
      charCode == 44 ||                     // ,
      charCode == 45;                       // -

    if (!valid)
      event.preventDefault();
    else if (keycode == 13)
      this.onBlur(document.getElementById("avals"));
  }

  // fills the Array A with the contents of the textbox
  // and draws the grid for k and A[k]
  this.validateAndUpdate = function(textbox) {
    var resStr = textbox.value.split(",");
    A = [];

    var warn = false;
    for (var i = 0; i < resStr.length && i < max_count; i++) {
      A[i] = parseInt(resStr[i]);

      if (A[i] < -max_value) {
        warn = true;
        A[i] = -max_value;
      }
      else if (A[i] > max_value) {
        warn = true;
        A[i] = max_value;
      }
      else if (A[i] === undefined) {
        warn = true;
        A[i] = 0;
      }
    }

    if (warn)
      window.alert("Some elements were cropped to be within -" + max_value + " and " + max_value + " and the total of " + max_count + " elements.");
      textbox.value = A.toString();
  }
    
  this.onBlur = function(textbox) {
    this.validateAndUpdate(textbox);
    this.calculateCells();
    this.drawCellsAll();
    this.clear();
  }

  this.clear = function () {
    VON = 1;
    BIS = 1;
    MAX = 0;
    V = 1;
    K = 1;
    T = 0;

    FINISHED = false;
    ISPAUSED = true;
    SUM_QUEUE = [];
    this.updateWrittenSum();
  }

  this.genExample = function () {
    A = [];
    var length = Math.floor(Math.random() * (max_count - 5)) + 5; //random value inbetween 5 and max_count
    for(i = 0; i < length; i++)
      A[i] = Math.floor(Math.random() * (max_value * 2)) - max_value;

    var textbox = document.getElementById("avals").value = A.toString();
    this.calculateCells();
    this.drawCellsAll();
    this.clear();
  }

  this.calculateCells = function () {

    //top left corner of the grid
    var x_off = grid_border + header_diff;
    var y_off = grid_border;

    grid_Ak.length = 0;
    grid_k.length = 0;    // actually grid_k always has the same values, only length changes, but recalculating doesn't take long
                          // and for organization sake, I keep it here.

    //for all entries...
    for(i = 0; i < A.length; i++) {
      grid_k[i] = this.CellValue(
        x_off + (i * cell_size),    //x offset = left-offset of the grid + (current index * cell size)
        y_off + cell_size,          //y offset = const top-offset of the grid + cell size (that is to say, one grid row lower)
        i + 1);                     //value    = index + 1;
      grid_Ak[i] = this.CellValue(
        x_off + (i * cell_size),    //x offset = same as above
        y_off,                      //y offset = const top-offset of the grid.
        A[i]);                      //value    = current value in A.
    }

    canvas.width = grid_border * 2 + A.length * cell_size + header_diff;
    canvas.height = cell_size * 3 + diagram_height + cell_size; //cell_size as padding between grid and diagram, thus trice + cell_size padding bottom

    //a bit ironic but use scanline-algorithm to get the max-sum so we can calculate the ratio
    //for the diagram.
    var max = 0, t = 0;
    for (k = 0; k <= A.length; k++) {
      t += A[k];
      if (t <= 0)
        t = 0;
      else if (t > max)
        max = t;
    }

    //because max=0 causes serious issues.
    if (max == 0)
      max++;

    expected_sum = max;
    diagram_ratio = diagram_height / max;
  }

  this.drawCellsAll = function () {
    this.drawCellsAk();
    this.drawCellsK();
  }
  this.drawCellsAk = function() {
    this.drawCells(grid_Ak, "A[k]=");
  }
  this.drawCellsK = function () {
    this.drawCells(grid_k, "  k =");
  }

  // draws an array of cells with a name in the header column.
  this.drawCells = function (cells, name) {

    //delete grid-row across entire width of canvas for the cells.
    context.clearRect(0, cells[0].y, canvas.width, cell_size);

    context.font = "bold " + font_size + "px Consolas"
    context.globalCompositeOperation = "source-over";

    for (i = 0; i < A.length; i++) {
      var cell = cells[i];
      var width = context.measureText(cell.v).width / 2;

      //background color:
      context.beginPath();
      context.rect(cell.x, cell.y, cell_size, cell_size);
      context.fillStyle = cell.c;
      context.fill();

      //border:
      context.beginPath();
      context.strokeStyle = grid_color;
      context.lineWidth = 3;
      context.rect(cell.x, cell.y, cell_size, cell_size);
      context.stroke();

      //text:
      context.fillStyle = grid_color;
      context.fillText(cell.v, cell.x + (cell_size / 2) - width, cell.y + (cell_size / 2) + font_size / 4.0);
    }
    
    //write name before the grid row.
    var strlen = context.measureText(name).width + grid_border;
    context.fillText(name, cells[0].x - strlen, cells[0].y + (cell_size / 2) + font_size / 4.0)
  }

  this.drawDiagram = function () {

    context.clearRect(0, cell_size * 2.5, canvas.width, diagram_height + cell_size);
    context.font = font_size + "px Consolas"
    context.globalCompositeOperation = "source-over";

    //draw 'brakets' that show the region being covered by the current sum:
    if(V <= K)
    {
      var x_k = grid_k[K - 1].x + (cell_size / 2) + (cell_size / 4);
      var x_v = grid_k[V - 1].x + (cell_size / 2) - (cell_size / 4);

      var multi = 2.75;

      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 0.5;
      context.moveTo(x_v, cell_size * 2.5);
      context.lineTo(x_v, cell_size * multi);
      context.lineTo(x_k, cell_size * multi);
      context.lineTo(x_k, cell_size * 2.5);
      context.stroke();
    }



    var y_top = cell_size * 3;
    var step = Math.ceil(expected_sum / 10);    // units per step

    var x_from = grid_k[0].x;
    var x_to = grid_k[grid_k.length - 1].x + cell_size;


    var x_dotted = grid_k[K - 1].x + (cell_size / 2);
    context.beginPath();
    context.strokeStyle = "darkgreen";
    context.lineWidth = 2;
    context.setLineDash([10, 10]);
    context.moveTo(x_dotted, y_top);
    context.lineTo(x_dotted, y_top + diagram_height);
    context.stroke();
    context.setLineDash([]);

    for (var s = 0; s <= expected_sum; s += step) {

      var y = y_top + (diagram_height - (diagram_ratio * s));

      context.beginPath();
      context.strokeStyle = "black";
      context.lineWidth = 0.5;
      context.moveTo(x_from, y);
      context.lineTo(x_to, y);
      context.stroke();

      //write name before the grid row.
      var strlen = context.measureText(s).width + grid_border;
      context.fillText(s, x_from - strlen, y + font_size / 4.0)
    }
    
    
    var yFunc = function(index) {
       var _t = T;
       if(index != K)
          _t = SUM_QUEUE[index].t;
       return y_top + (diagram_height - (diagram_ratio * _t));
    }
    

    //draw points and connection lines.
    var x_prev = -1, y_prev = -1;
    for (var i = 1; i <= K; i++) {

      var y = yFunc(i);
      var x = grid_k[i - 1].x + (cell_size / 2);

      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fillStyle = "#D700FF";
      context.fill();

      if (x_prev != -1) {
        context.beginPath();
        context.strokeStyle = "#D700FF";
        context.lineWidth = 2;
        context.moveTo(x_prev, y_prev);
        context.lineTo(x, y);
        context.stroke();
      }
      x_prev = x;
      y_prev = y;
    }
    

    //fill sum region under curve.
    if (VON <= BIS && K > 1) {
      context.beginPath();
      context.fillStyle = "rgba(0,128,0,0.5)";
      
      if(VON == 1)
         context.moveTo(grid_k[VON - 1].x + (cell_size / 2), y_top + diagram_height);
      else {
         //if we aren't at the very first point, the filled out area is to go half to the left.
         //  so we interpolate the coordinates for that half bit.         
         context.moveTo(grid_k[VON - 1].x, y_top + diagram_height);
         
         var dx = cell_size;
         var dy = yFunc(VON) - yFunc(VON - 1);
         var k = dy / dx;
         var d = yFunc(VON) - (k * (grid_k[VON - 1].x + (cell_size / 2)));
         context.lineTo(grid_k[VON - 1].x, k * grid_k[VON - 1].x + d);         
      }
      
      
      
      for (var i = VON; i <= BIS; i++) {
        var y = yFunc(i);
        var x = grid_k[i - 1].x + (cell_size / 2);
        context.lineTo(x, y);
      }
      
      
      if(BIS >= K)      
         context.lineTo(grid_k[BIS - 1].x + (cell_size / 2), y_top + diagram_height);
      else {
         //if we aren't at the very last (ongoing) point, the filled out area is to go half to the right.
         //  so we interpolate the coordinates for that half bit.
         
         var dx = cell_size;
         var dy = yFunc(BIS + 1) - yFunc(BIS);
         var k = dy / dx;
         var d = yFunc(BIS + 1) - (k * (grid_k[BIS].x + (cell_size / 2)));
         context.lineTo(grid_k[BIS].x, k * grid_k[BIS].x + d);            
         
         context.lineTo(grid_k[BIS].x, y_top + diagram_height);
      }     
      
      context.closePath();
      context.fill();
    }

  }

  // returns a cell object with 4 variables:
  //  x: x-offset
  //  y: y-offset
  //  c: cell-color
  //  v: value
  this.CellValue = function(x_coord, y_coord, value) {
    var newCellValue = {
      x: x_coord,       //
      y: y_coord,       //
      c: "transparent", //c - color
      v: value,         //v - cell value   
    };
    return newCellValue;
  }
  
  //method for periodic execution
  // if ISPAUSED is not set it will call stepForward()
  this.runInterval = function () {
    if (scanline.active) {
      if (!ISPAUSED) {
        scanline.stepForward();
      }
    }
  }
  //js function for periodic execution of given function...
  this.interval = setInterval(this.runInterval, exec_interval * speed);
  
  this.runAlgorithm = function () {
    if (!FINISHED)
      ISPAUSED = false;
  }

  this.pauseAlgorithm = function () {
    ISPAUSED = true;
  }
  
  this.stepForward = function () {

    if (FINISHED)
      return;
    
    SUM_QUEUE[K - 1] = {
      t: T,
    };

    T += A[K - 1];
    if (T <= 0) {
      V = K + 1;
      T = 0;
    }
    else if (T > MAX) {
      MAX = T;
      VON = V;
      BIS = K;
    }

    this.updateCells();
    this.updateWrittenSum();

    K++;
    FINISHED = K > A.length;
  }

  var previous_K = 0;
  this.stepBackward = function () {

    if (K == 1)
      return;

    previous_K = K - 1;
    this.clear();
    while (K != previous_K)
      this.stepForward();
  }

  this.stepFill = function () {
    while (!FINISHED)
      this.stepForward();
  }

  this.stepBackFill = function () {
    this.clear();
    this.stepForward();
  }


  this.updateSpeed = function (new_speed) {
    speed = 11 - new_speed;
    clearInterval(scanline.interval);
    runspeed = exec_interval * speed;
    scanline.interval = setInterval(scanline.runInterval, runspeed);
  }


  this.updateWrittenSum = function () {

    if (SUM_QUEUE.length == 0) {
      document.getElementById("current_sum_header").innerHTML = "None yet"
    }
    else if (V > K) {
      document.getElementById("current_sum_header").innerHTML = "Reached 0<br>Started New Sum"
    }
    else {
      document.getElementById("current_sum_header").innerHTML =
        "Sum  = " + T + "<br>" +
        "From = " + V + "<br>" +
        "To   = " + K;
    }

    if (MAX == 0) {
      document.getElementById("largest_sum_header").innerHTML = "Empty Sum";
    }
    else {
      document.getElementById("largest_sum_header").innerHTML =
        "Sum  = " + MAX + "<br>" +
        "From = " + VON + "<br>" +
        "To   = " + BIS;
    }
  }

  this.updateCells = function () {

    for (i = 0; i < grid_k.length; i++)
      grid_k[i].c = "transparent";

    grid_k[K - 1].c = "lime";
    if(V <= grid_k.length)
      grid_k[V - 1].c = "lightcoral";
    this.drawCellsK();
    this.drawDiagram();
  }
};

scanline = new Scanline();