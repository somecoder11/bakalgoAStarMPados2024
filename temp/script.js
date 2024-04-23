function MinimalunionFind() {
  class Node {
    constructor(name, coords, radius, id) {
      this.children = []
      this.name = name
      this.x_center = coords[0]
      this.y_center = coords[1]
      this.x_bottom = this.x_center
      this.y_bottom = this.y_center + radius
      this.x_top = this.x_center
      this.y_top = this.y_center - radius
      this.x_left = this.x_center - radius
      this.y_left = this.y_center
      this.x_right = this.x_center + radius
      this.y_right = this.y_center
      this.radius = radius
      this.id = id
      this.number_of_members = 1
    }

    checkIfClickWasInside(coords) 
    {
      let mouseX = coords[0]
      let mouseY = coords[1]
      return mouseX >= this.x_left && mouseX <= this.x_left + 2 * this.radius && mouseY >= (this.y_left - this.radius) && mouseY <= (this.y_left - this.radius) + 2 * this.radius
    }

    // Used in the findButtonFunction
    // Highlights the set to which it belongs
    // using a red circle
    drawCircleAroundParentSet(ctx)
    {
      ctx.beginPath()
      ctx.arc(this.x_center, this.y_center, this.radius * 2, 0, 2*Math.PI)
      ctx.strokeStyle = "red"
      ctx.fillStyle = 'rgba(255, 0, 0, 0)'
      ctx.stroke()
      ctx.fill()
    }

    getTotalNumberOfChildren() 
    {
      let totalChildren = this.children.length
      for(let i = 0; i < this.children.length; i++)
      {
        totalChildren += this.children[i].getTotalNumberOfChildren()
      }
      return totalChildren
    }

    getTreeHeight() {
      if(this.children.length === 0) {
        return 1
      }
      else {
        let maxHeight = 0; 
        for(let i = 0; i < this.children.length; i++){
          const childHeight = this.children[i].getTreeHeight()
          if(childHeight > maxHeight) {
            maxHeight = childHeight
          }
        }
        return maxHeight + 1
      }
    }

    addChild(child)
    {
      child.parent = this
      this.children.push(child)
    }


    removeChild(child)
    {
      const index = this.children.indexOf(child)
      if(index >= 0) 
      {
        this.children.splice(index, 1)
      }
    }

    getCoordsCenter() 
    {
      return [this.x_center, this.y_center]
    }
    getCoordsLeft() {
      return [this.x_left, this.y_left]
    }
    getCoordsTop() {
      return [this.x_top, this.y_top]
    }
    getCoordsBottom() {
      return [this.x_bottom, this.y_bottom]
    }
    getCoordsRight() {
      return [this.x_right, this.y_right]
    }

    setCoords(coords){
      this.x_center = coords[0]
      this.y_center = coords[1]
      this.x_bottom = this.x_center
      this.y_bottom = this.y_center + this.radius
      this.x_top = this.x_center
      this.y_top = this.y_center - this.radius
      this.x_left = this.x_center - this.radius
      this.y_left = this.y_center
      this.x_right = this.x_center + this.radius
      this.y_right = this.y_center
    }

    // Only for fast find
    drawBetweenChildren(ctx, exception) 
    {
      for(let i = 0; i < this.children.length - 1; i++)
      {
        ctx.beginPath()
        if(exception !== null && exception.indexOf(this.children[i + 1]) !== -1)
          ctx.strokeStyle = "green"
        else
          ctx.strokeStyle = "black"
        let delta_x = Math.abs(this.children[i].getCoordsRight()[0] - this.children[i + 1].getCoordsLeft()[0])
        let delta_y = 20
        if(this.children[i].y_left == this.children[i + 1].getCoordsCenter()[1])
        {
          delta_y = 0
        }
        ctx.moveTo(this.children[i].getCoordsRight()[0], this.children[i].getCoordsRight()[1])
        const cp1x = this.children[i].getCoordsRight()[0] + delta_x
        const cp1y = this.children[i].getCoordsCenter()[1] + delta_y
        const cp2x = this.children[i + 1].getCoordsLeft()[0] - delta_x
        const cp2y = this.children[i + 1].getCoordsCenter()[1] - delta_y
        const epx = this.children[i + 1].x_left
        const epy = this.children[i + 1].y_left
        const dx = 3 * (epx - cp2x)
        const dy = 3 * (epy - cp2y)
        const angle = Math.atan2(dy, dx)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, epx, epy)
        ctx.stroke();

        ctx.moveTo(this.children[i + 1].getCoordsLeft()[0], this.children[i + 1].getCoordsLeft()[1])
        ctx.lineTo(
          this.children[i + 1].getCoordsLeft()[0] - min_object_distance * Math.cos(angle - Math.PI / 6),
          this.children[i + 1].getCoordsLeft()[1] - min_object_distance * Math.sin(angle - Math.PI / 6)
        )
        ctx.stroke()
        ctx.moveTo(this.children[i + 1].getCoordsLeft()[0], this.children[i + 1].getCoordsLeft()[1])
        ctx.lineTo(
          this.children[i + 1].getCoordsLeft()[0] - min_object_distance * Math.cos(angle + Math.PI / 6),
          this.children[i + 1].getCoordsLeft()[1] - min_object_distance * Math.sin(angle + Math.PI / 6)
          )
        ctx.stroke();
      }
    }

    drawBetweenChildrenNewNode(ctx, side_from_which_to_connect) {
      if(side_from_which_to_connect == "right")
      {
        ctx.strokeStyle = "green"
        ctx.beginPath()
        ctx.moveTo(this.children[this.children.length - 2].getCoordsRight()[0], this.children[this.children.length - 2].getCoordsRight()[1])
        ctx.lineTo(this.children[this.children.length - 1].getCoordsLeft()[0], this.children[this.children.length - 1].getCoordsLeft()[1])
        ctx.stroke();

        ctx.moveTo(this.children[this.children.length - 1].getCoordsLeft()[0], this.children[this.children.length - 1].getCoordsLeft()[1])
        ctx.lineTo(
          this.children[this.children.length - 1].getCoordsLeft()[0] - min_object_distance * Math.cos(Math.PI / 6),
          this.children[this.children.length - 1].getCoordsLeft()[1] + min_object_distance * Math.sin(-Math.PI / 6)
      )
        ctx.moveTo(this.children[this.children.length - 1].getCoordsLeft()[0], this.children[this.children.length - 1].getCoordsLeft()[1])
        ctx.lineTo(
        this.children[this.children.length - 1].getCoordsLeft()[0] - min_object_distance * Math.cos(Math.PI / 6),
        this.children[this.children.length - 1].getCoordsLeft()[1] - min_object_distance * Math.sin(-Math.PI / 6)
    )
        ctx.stroke();
      }
      else
      {
        ctx.strokeStyle = "green"
        ctx.beginPath()
        ctx.moveTo(this.children[0].getCoordsRight()[0], this.children[0].getCoordsRight()[1])
        ctx.lineTo(this.children[1].getCoordsLeft()[0], this.children[1].getCoordsLeft()[1])
        ctx.stroke();

        ctx.moveTo(this.children[1].getCoordsLeft()[0], this.children[1].getCoordsLeft()[1])
        ctx.lineTo(
          this.children[1].getCoordsLeft()[0] - min_object_distance * Math.cos(Math.PI / 6),
          this.children[1].getCoordsLeft()[1] + min_object_distance * Math.sin(-Math.PI / 6)
      )
        ctx.moveTo(this.children[1].getCoordsLeft()[0], this.children[1].getCoordsLeft()[1])
        ctx.lineTo(
        this.children[1].getCoordsLeft()[0] - min_object_distance * Math.cos(Math.PI / 6),
        this.children[1].getCoordsLeft()[1] - min_object_distance * Math.sin(-Math.PI / 6)
    )
        ctx.stroke();
      }
        ctx.strokeStyle = "black"
    }

    changeChildrenToParent(parent) {
      while(this.children.length)
      {
        this.children[0].setParent(parent)
        parent.addChild(this.children[0])
        this.removeChild(this.children[0])
      }
      parent_nodes_fast_find.splice(parent_nodes_fast_find.indexOf(this), 1)
    }

    drawCurvedArrowTo(ctx, parent, strokeStyle, side_from_which_to_connect)
    {
      ctx.strokeStyle = strokeStyle
      const parentX = parent.getCoordsBottom()[0]
      const parentY = parent.getCoordsBottom()[1]
      let dx = 0
      let dy = 1
      
      let delta_y = Math.abs(parentY - this.y_top) / 3
      if(delta_y <= 10)
      {
        delta_y = 30
      }

      ctx.beginPath()
      ctx.moveTo(parent.getCoordsBottom()[0], parent.getCoordsBottom()[1])
      const cp1x = parent.getCoordsCenter()[0] + (this.getCoordsCenter()[0] - parent.getCoordsCenter()[0]) * 2 / 3
      const cp1y = this.getCoordsTop()[1] - delta_y
      const cp2x = parent.getCoordsCenter()[0] + (this.getCoordsCenter()[0] - parent.getCoordsCenter()[0]) * 1 / 3
      const cp2y = parent.getCoordsBottom()[1] + delta_y
      const epx = this.x_top
      const epy = this.y_top
      dx = 3 * (epx - cp2x)
      dy = 3 * (epy - cp2y)
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, epx, epy)

      ctx.stroke()
      const angle = Math.atan2(dy, dx)
      ctx.moveTo(parentX, parentY)
      ctx.lineTo(
        parentX + min_object_distance * Math.cos(angle - Math.PI / 6),
        parentY + min_object_distance * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(parentX, parentY)
      ctx.lineTo(
        parentX + min_object_distance * Math.cos(angle + Math.PI / 6),
        parentY + min_object_distance * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()
    }

    drawCurvedArrowFromTo(ctx, parent, strokeStyle)
  {
    ctx.strokeStyle = strokeStyle
    const parentX = parent.getCoordsBottom()[0]
    const parentY = parent.getCoordsBottom()[1]
    let dx = 0
    let dy = 1
    let delta_y = Math.abs(parentY - this.y_top) / 3
    if(delta_y <= 0.01)
      delta_y = 30

    ctx.beginPath()
    ctx.moveTo(parent.getCoordsBottom()[0], parent.getCoordsBottom()[1])
    const cp1x = parent.getCoordsCenter()[0] + (this.getCoordsCenter()[0] - parent.getCoordsCenter()[0]) * 2 / 3
    const cp1y = this.getCoordsTop()[1] - delta_y
    const cp2x = parent.getCoordsCenter()[0] + (this.getCoordsCenter()[0] - parent.getCoordsCenter()[0]) * 1 / 3
    const cp2y = parent.getCoordsBottom()[1] + delta_y
    const epx = this.x_top
    const epy = this.y_top
    dx = 3 * (epx - cp1x)
    dy = 3 * (epy - cp1y)
    ctx.bezierCurveTo(cp2x, cp2y, cp1x, cp1y, epx, epy)

    ctx.stroke()
    const angle = Math.atan2(dy, dx)
    ctx.moveTo(parentX, parentY)
    ctx.lineTo(
      parentX + min_object_distance * Math.cos(angle - Math.PI / 6),
      parentY + min_object_distance * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(parentX, parentY)
    ctx.lineTo(
      parentX + min_object_distance * Math.cos(angle + Math.PI / 6),
      parentY + min_object_distance * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()

    dx = 3 * (cp2x - parentX)
    dy = 3 * (cp2y - parentY)
    const angle2 = Math.atan2(dy, dx)
    ctx.moveTo(this.x_top, this.y_top)
    ctx.lineTo(
      this.x_top - min_object_distance * Math.cos(angle2 - Math.PI / 6),
      this.y_top - min_object_distance * Math.sin(angle2 - Math.PI / 6)
    )
    ctx.moveTo(this.x_top, this.y_top)
    ctx.lineTo(
      this.x_top - min_object_distance * Math.cos(angle2 + Math.PI / 6),
      this.y_top - min_object_distance * Math.sin(angle2 + Math.PI / 6)
    )
    ctx.stroke()
  }
  drawArrowTo(ctx, strokestyle = "black") {
      const parentX = this.parent.getCoordsBottom()[0]
      const parentY = this.parent.getCoordsBottom()[1]
      const dx = parentX - this.x_top
      const dy = parentY - this.y_top
      const angle = Math.atan2(dy, dx)
      ctx.strokeStyle = strokestyle
      ctx.beginPath()
      ctx.moveTo(this.x_top, this.y_top)
      ctx.lineTo(parentX, parentY)
      ctx.lineTo(
        parentX - min_object_distance * Math.cos(angle - Math.PI / 6),
        parentY - min_object_distance * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(parentX, parentY)
      ctx.lineTo(
        parentX - min_object_distance * Math.cos(angle + Math.PI / 6),
        parentY - min_object_distance * Math.sin(angle + Math.PI / 6)
      )
      
      ctx.stroke()
    }

    drawArrowFromTo(ctx, storkeStyle) {
      const parentX = this.parent.getCoordsBottom()[0]
      const parentY = this.parent.getCoordsBottom()[1]
      const dx = parentX - this.x_top
      const dy = parentY - this.y_top
      const angle = Math.atan2(dy, dx)
      ctx.beginPath()
      ctx.moveTo(this.x_top, this.y_top)
      ctx.lineTo(
        this.x_top + min_object_distance * Math.cos(angle - Math.PI / 6),
        this.y_top + min_object_distance * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(this.x_top, this.y_top)
      ctx.lineTo(
        this.x_top + min_object_distance * Math.cos(angle + Math.PI / 6),
        this.y_top + min_object_distance * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(this.x_top, this.y_top)
      ctx.lineTo(parentX, parentY)
      ctx.lineTo(
        parentX - min_object_distance * Math.cos(angle - Math.PI / 6),
        parentY - min_object_distance * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(parentX, parentY)
      ctx.lineTo(
        parentX - min_object_distance * Math.cos(angle + Math.PI / 6),
        parentY - min_object_distance * Math.sin(angle + Math.PI / 6)
      )
      ctx.strokeStyle = storkeStyle
      ctx.stroke()
    }
  }
  class CircleNode extends Node {
    constructor(name, coords, radius, id) {
      super(name, coords, radius, id)
    }

    copy()
    {
      let t =  new CircleNode(this.name, [this.x_center, this.y_center], this.radius, this.id)
      this.children.forEach((child) => {
        t.children.push(new SquareNode(child.name, t, [child.x_center, child.y_center], child.radius, child.id))
      })
      t.number_of_members = t.getTotalNumberOfChildren()
      return t
    }

    draw(ctx, strokeColor, fillColor) {
      ctx.beginPath()
      ctx.arc(this.x_center, this.y_center, this.radius, 0, 2*Math.PI)
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = fillColor
      ctx.stroke()
      ctx.fill()
    }
    drawName(ctx) {
      const textColor = "black"
      const fontSize = "16px"
      const fontFamily = "Arial"
      const text = "S"
      ctx.fillStyle = textColor
      ctx.font = fontSize + " " + fontFamily
      const textHeight = parseInt(fontSize)
      ctx.fillText(text, this.x_center - 3, this.y_center + textHeight / 2 - 4)
      ctx.font = "14px" + " " + fontFamily
      const factor = this.name === "10" ? 9 : 7
      ctx.fillText(this.name, this.x_center + factor, this.y_center + textHeight - 6)
    }
  }


  class SquareNode extends Node{
    constructor(name, parent, coords, radius, id = null, children = []){
      super(name, coords, radius, id)
      this.parent = parent
      this.children = children
    }

    copy(parent=null)
  {
    let us = null
    if(parent !== null)
    {
      us = new SquareNode(this.name, parent, [this.x_center, this.y_center], this.radius, this.id)
    }
    else
    {
      us = new SquareNode(this.name, null, [this.x_center, this.y_center], this.radius, this.id)
    }
    let to_ret  = [us]
    for(let i = 0; i < this.children.length; i++)
    {
      let n_c = this.children[i].copy(us)
      to_ret.push(n_c)
      if(Array.isArray(n_c))
      us.children.push(n_c[0])
      else
      us.children.push(n_c)
      n_c.parent = us
    }
    if(this.children.length === 0)
    {
      return us
    }
      
    return to_ret
  }


    setParent(parent){
      this.parent = parent
    }

    draw(ctx, strokeColor, fillColor) {
      ctx.beginPath()
      ctx.fillStyle = fillColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = "1"
      ctx.strokeRect(this.x_left, this.y_left - this.radius, 2 * this.radius, 2 * this.radius)
      ctx.fillRect(this.x_left, this.y_left - this.radius, 2 * this.radius, 2 * this.radius)
    }

    

    drawName(ctx) {
      ctx.beginPath()
      const textColor = "black"
      const fontSize = "14px"
      const fontFamily = "Arial"
      const text = this.name
      ctx.fillStyle = "black"
      ctx.font = fontSize + " " + fontFamily
      const textHeight = parseInt(fontSize)
      ctx.fillText(text, this.x_center, this.y_center + textHeight / 2)
      if(this.parent === null)           
      {
        ctx.font = "16px" + " " + fontFamily
      ctx.fillText("S", this.x_center - 6, this.y_center - 2 * this.radius)
      const factor = (text.charCodeAt(0) - 64).toString() === "10" ? 24 : 18
      const factor2 = (text.charCodeAt(0) - 64).toString() === "10" ? 7 : 5
      ctx.fillText("," + (this.getTotalNumberOfChildren() + 1).toString(), this.x_center + factor, this.y_center - 2 * this.radius)
      ctx.font = "14px" + " " + fontFamily
      ctx.fillText((text.charCodeAt(0) - 64).toString(), this.x_center + factor2, this.y_center - 2 * this.radius + 6)
      }
    }
    
    
  }

  this.active = false;
  var width = 1000;
  var height = 640;
  var grid_border = 10;
  let new_state = true

  let active_button = null
  let active_button_number = 1

  

  var content_div;
  var info_div;
  var algo_div;

  var canvas;
  var context;

  var font_size = 24;

  var speed = 0.6;

  var default_dot_color = "#222222";
  var dot_circle_color = "#BBBBBB";
  var dotted_rectangle_color = "#000000";

  var kruskal_offset = (width/2);

  var union_animation_duration = 1
  var find_animation_duration = 100

  var FAST_FIND_OFFSET = (height*2/3)

  var commands_from = 1;
  var commands_to = 1

  var stepCount = 0;
  var boxesStepCount = 0;
  var pointLimit = 25;
  var pointCount = 0;

  var max_number_of_nodes = 10;

  const strokeColor_circle = "black"
  const fillColor_circle = "white"
  const strokeColor_square = "black"
  const fillColor_square = "white"

  const radius = 20;

  let animation_in_progress = false

  let states_fast_find = new Array();
  let states_fast_union = new Array();
  let states_almost_linear = new Array();
  let states_boxes = new Array()
  let commands = new Array();
  


  var primPoints = new Array();
  var primTree = new Array();
  var primQueue = new Array();
  var primEdges = new Array();
  var primLastEdgeAdded = null;

  var kruskalPoints = new Array();
  var kruskalTrees = new Array();
  var kruskalEdges = new Array();
  var kruskalSortedEdges = new Array();
  var kruskalLastEdgeAdded = null;

  var primEdgeColor = "#000088";
  var primShortestEdgeColor = "#B22222";
  var primNotShortestEdgeColor = "#FF8A00";
  var primLastAddedEdgeColor = "#09B516";

  var kruskalEdgeColor = "#000088";
  var kruskalShortestEdgeColor = "#B22222";
  var kruskalNotShortestEdgeColor = "#FF8A00";
  var kruskalLastAddedEdgeColor = "#09B516";

  var parent_nodes_fast_find = new Array();
  // var child_nodes_fast_find = new Array();

  var parent_nodes_fast_union = new Array();
  var child_nodes_fast_union = new Array();

  var parent_nodes_almost_linear = new Array();
  var child_nodes_almost_linear = new Array();


  let selected_circles_fast_find = [null, null];
  let selected_circles_fast_union = [null, null];
  let selected_circles_almost_linear = [null, null];

  let selectors_left = Array();
  let selectors_right = Array()

  let selected_sets = [null, null];

  var dotted_thickness = "2";
  var dot_circle_thickness = "2";
  var dot_radius = 5
  var dot_circle = 10
  var min_object_distance = 20;


  const fast_find_top_left_corner_x = dotted_thickness/2 + min_object_distance
  const fast_find_top_left_corner_y = FAST_FIND_OFFSET


  const fast_find_top_right_corner_x = fast_find_top_left_corner_x + width - 2*min_object_distance - 160;
  const fast_find_top_right_corner_y = FAST_FIND_OFFSET;

  const fast_find_bottom_left_corner_x = fast_find_top_left_corner_x;
  const fast_find_bottom_left_corner_y = FAST_FIND_OFFSET + height * 1/3 - 2 * min_object_distance;

  const fast_find_bottom_right_corner_x = fast_find_top_right_corner_x;
  const fast_find_bottom_right_corner_y = fast_find_bottom_left_corner_x + width - 2*min_object_distance;

  const fast_find_height = fast_find_bottom_left_corner_y - fast_find_top_left_corner_y
  const fast_find_width = fast_find_bottom_right_corner_x - fast_find_top_left_corner_x



// (canvas.width/2)-dotted_thickness-2*min_object_distance, (canvas.height-dotted_thickness-2*min_object_distance) * 2/3)
  const fast_union_top_left_corner_x = dotted_thickness/2 + min_object_distance
  const fast_union_top_left_corner_y = dotted_thickness/2 + min_object_distance

  const fast_union_top_right_corner_x = (fast_union_top_left_corner_x + (width/2)-dotted_thickness-2*min_object_distance) * 6 /7
  const fast_union_top_right_corner_y = fast_union_top_left_corner_y;
  
  const fast_union_bottom_left_corner_x = fast_union_top_left_corner_x;
  const fast_union_bottom_left_corner_y = fast_union_top_left_corner_y + (height-dotted_thickness-2*min_object_distance) * 2/3;

  const fast_union_bottom_right_corner_x = fast_union_top_right_corner_x;
  const fast_union_bottom_right_corner_y = fast_union_top_left_corner_y + (height-dotted_thickness-2*min_object_distance) * 2/3;

  const fast_union_width = fast_find_top_right_corner_x - fast_find_top_left_corner_x
  const fast_union_height = fast_union_bottom_left_corner_y - fast_union_top_left_corner_y

  const almost_linear_top_right_corner_x = fast_find_top_left_corner_x + width - 2*min_object_distance - 160
  const almost_linear_top_right_corner_y = fast_union_top_right_corner_y

  const almost_linear_top_left_corner_x = almost_linear_top_right_corner_x - ((width/2)-dotted_thickness-2*min_object_distance) * 6 / 7
  const almost_linear_top_left_corner_y = fast_union_top_right_corner_y
  
  
  const almost_linear_bottom_left_corner_x = almost_linear_top_left_corner_x;
  const almost_linear_bottom_left_corner_y = almost_linear_top_left_corner_y + (height-dotted_thickness-2*min_object_distance) * 2/3;

  const almost_linear_bottom_right_corner_x = almost_linear_top_right_corner_x;
  const almost_linear_bottom_right_corner_y = almost_linear_top_left_corner_y + (height-dotted_thickness-2*min_object_distance) * 2/3;
  

  var primMovingPoint = undefined;
  var kruskalMovingPoint = undefined;

  var current_boxes = []

  //global algorithm variables
  var FINISHED = false;
  var ISPAUSED = true;
  var DRAW = true;

  var starting_number_of_nodes_was_even = false


  
  // Draws a little black triange to indicate
  // there there are more operations which have been performed later
  this.drawOperationsContinueUp = function(ctx)
  {
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.moveTo(fast_find_top_right_corner_x + min_object_distance + 70 - 15, fast_union_top_left_corner_y - 6)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70, fast_union_top_left_corner_y - 20)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70 + 15, fast_union_top_left_corner_y - 6)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70 + 15, fast_union_top_left_corner_y - 6)
    ctx.closePath()
    ctx.fill()
  }

  // Draws a little black triange to indicate
  // there there are more operations which have been performed earlier
  this.drawOperationsContinueDown = function(ctx)
  {
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.moveTo(fast_find_top_right_corner_x + min_object_distance + 70 - 15, fast_union_top_left_corner_y - 6)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70, fast_union_top_left_corner_y - 20)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70 + 15, fast_union_top_left_corner_y - 6)
    ctx.lineTo(fast_find_top_right_corner_x + min_object_distance + 70 + 15, fast_union_top_left_corner_y - 6)
    ctx.closePath()
    ctx.fill()
  }

  this.drawOperationBoxes = function(ctx, bottom_left_x, bottom_left_y)
  {
    const delta_y = fast_find_bottom_left_corner_y - fast_union_top_left_corner_y
    const factor = 15
    let counter = 1;
    for(let i = commands_from; i < commands_to; i++)
    {
      const rect_top_left_corner_x = bottom_left_x
      const rect_top_left_corner_y = bottom_left_y - counter * delta_y / factor
      const rect_width = 140
      const rect_height = (fast_find_bottom_left_corner_y - fast_union_top_left_corner_y) / factor
      ctx.fillStyle = "white"
      ctx.strokeRect(rect_top_left_corner_x, rect_top_left_corner_y, rect_width, rect_height)
      ctx.fillRect(rect_top_left_corner_x, rect_top_left_corner_y, rect_width, rect_height)
      ctx.strokeStyle = "black"
      ctx.stroke()
      ctx.fillStyle = "black"
      ctx.font = "24px Arial"
      if(commands[i][1] === "union")
      {
        ctx.fillText(commands[i][1].toUpperCase() + " " + commands[i][0][0].toString() + ", " + commands[i][0][1].toString(), bottom_left_x + 70, rect_top_left_corner_y + rect_height / 2 + 6)
      }
      else
      {
        ctx.fillText(commands[i][1].toUpperCase() + " " + commands[i][0][0].toString(), bottom_left_x + 70, rect_top_left_corner_y + rect_height / 2 + 6)
      }
      counter++
    }
  }

  this.drawOperations = function(ctx) 
  {
    if(commands.length === 1) return
    const commands_bottom_left_corner_x = fast_find_top_right_corner_x + min_object_distance;
    const commands_bottom_left_corner_y = fast_find_bottom_left_corner_y
    const delta_y = fast_find_bottom_left_corner_y - fast_union_top_left_corner_y
    const factor = 15

    ctx.beginPath()
    
    if(commands.length <= 16 || stepCount <= 1)
    {
      commands_from = 1
      commands_to = commands.length >= 16 ? commands_from + 15 : commands.length
    }
    else if(commands.length > 16 && stepCount == commands_to)
    {
      commands_from++
      commands_to++
    }
    else if(commands.length > 16 && stepCount <= commands_from - 1)
    {
      commands_from--
      commands_to--
    }
    ctx.strokeStyle = "black"
    this.drawOperationBoxes(ctx, commands_bottom_left_corner_x, commands_bottom_left_corner_y)
    ctx.strokeStyle = "red"
    if(stepCount !== 0 && commands.length <= 16)
    {
      ctx.strokeRect(commands_bottom_left_corner_x, commands_bottom_left_corner_y - stepCount * delta_y / 15, 140, (fast_find_bottom_left_corner_y - fast_union_top_left_corner_y) / 15) 
    }
    else if(stepCount !== 0)
    {
      ctx.strokeRect(commands_bottom_left_corner_x, commands_bottom_left_corner_y - (16 - Math.abs(commands_to - stepCount)) * delta_y / 15, 140, (fast_find_bottom_left_corner_y - fast_union_top_left_corner_y) / 15) 
    }
    if(commands_from > 1)
    {
      this.drawOperationsContinueDown(ctx)
    }
    if(commands_to < commands.length)
    {
      this.drawOperationsContinueUp(ctx)
    }
  }

  this.updateSelectedSets = function(){
  if(active_button_number === 1)
  {
    for(let j = 0; j < parent_nodes_fast_find.length; j++)
    {
      if(selected_sets[0] != null && selected_sets[0].id == parent_nodes_fast_find[j].id)
      {
        selected_sets[0] = parent_nodes_fast_find[j]
        selected_circles_fast_find[0] = parent_nodes_fast_find[j]
        
      }
      else if(selected_sets[1] != null && selected_sets[1].id === parent_nodes_fast_find[j].id)
      {
        selected_sets[1] = parent_nodes_fast_find[j]
        selected_circles_fast_find[1] = parent_nodes_fast_find[j]
      }
    }
  }
  else if(active_button_number === 2)
  {
    for(let j = 0; j < parent_nodes_fast_union.length; j++)
    {
      if(selected_sets[0] != null && selected_sets[0].id == parent_nodes_fast_union[j].id)
      {
        selected_sets[0] = parent_nodes_fast_union[j]
        selected_circles_fast_union[0] = parent_nodes_fast_union[j]
        
      }
      else if(selected_sets[1] != null && selected_sets[1].id === parent_nodes_fast_union[j].id)
      {
        selected_sets[1] = parent_nodes_fast_union[j]
        selected_circles_fast_union[1] = parent_nodes_fast_union[j]
      }
    }
  }
  else if(active_button_number === 3)
  {
    for(let j = 0; j < parent_nodes_almost_linear.length; j++)
    {
      if(selected_sets[0] != null && selected_sets[0].id == parent_nodes_almost_linear[j].id)
      {
        selected_sets[0] = parent_nodes_almost_linear[j]
        selected_circles_almost_linear[0] = parent_nodes_almost_linear[j]
        
      }
      else if(selected_sets[1] != null && selected_sets[1].id === parent_nodes_almost_linear[j].id)
      {
        selected_sets[1] = parent_nodes_almost_linear[j]
        selected_circles_almost_linear[1] = parent_nodes_almost_linear[j]
      }
    }
  }
}


  this.highlightButton = function(buttonNumber){
      if(animation_in_progress) return
      if(active_button) 
      {
          active_button.classList.remove("active")
      }
      const button = document.querySelector(`.custom-button:nth-child(${buttonNumber})`)
      button.classList.add("active")
      active_button = button
      active_button_number = buttonNumber
      unionFind.updateSelectedSets()
      new_state=false
      unionFind.redrawCanvas();
      new_state=true 
      window.opener.postMessage("*")
  }

  this.returnChildFind = function(node_to_find, parents, children)
  {
    for(const parent of parents)
    {
      if(parent.name === node_to_find)
      {
        return parent
      }
    }
    for(const child of children)
    {
      if(child.name === node_to_find)
      {
        return child
      }
    }
    return null
  }
  
  this.animateFindFastFind = async function(nodeToFind) {
    
    let found_child = null
    let from_to = false
    let context = canvas.getContext("2d");
    for(const parent of parent_nodes_fast_find)
    {
      if(found_child !== null)
      {
        break
      }
      for(const child of parent.children)
      {
        if(child.name === nodeToFind)
        {
          found_child = child
          let indexof = parent.children.indexOf(child)
          if(indexof === 0 || indexof === parent.children.length -1)
            from_to = true
          break
        }
      }
    }
    if(found_child === null) return null
    if(active_button_number === 1 && from_to)
    {
      found_child.drawArrowFromTo(context, "red")
      found_child.drawArrowFromTo(context, "red")
      found_child.drawArrowFromTo(context, "red")
    }
    else
    {
      found_child.drawArrowTo(context, "red")
      found_child.drawArrowTo(context, "red")
      found_child.drawArrowTo(context, "red")
    }
    found_child.parent.drawCircleAroundParentSet(context)
    return found_child
  }

  this.drawArrowFindFastUnion = async function(ctx, node, draw)
  {
    let to_ret = []
    while(node.parent !== null)
    {
      to_ret.push(node)
      if(draw)
      {
        node.drawArrowTo(ctx, "red")
        node.drawArrowTo(ctx, "red")
        node.drawArrowTo(ctx, "red")
      }
      
      node = node.parent
      if(draw)
      await new Promise(r => setTimeout(r, -1600 * find_animation_duration + 2160))
    }
    if(draw)
    node.drawCircleAroundParentSet(ctx)
    to_ret.push(node)
    if(draw)
    await new Promise(r => setTimeout(r, -1600 * find_animation_duration + 2160))
    return to_ret
  }

  this.animateFindFastUnion = async function(node_to_find)
  {
    let context = canvas.getContext("2d");
    let found_child = await this.returnChildFind(node_to_find, parent_nodes_fast_union, child_nodes_fast_union)
    if(found_child === null) return null
    await this.drawArrowFindFastUnion(context, found_child, true)
    await new Promise(r => setTimeout(r, -1500 * find_animation_duration + 1650))
    return found_child
  }

this.animateChangeOfParent = async function(l, ctx, draw)
{
  if(l.length === 2 && draw)
  {
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBoxes();
    this.drawCurrentSelectorsAlmostLinear(ctx, l[0], "right", "red")
    l[l.length - 1].drawCircleAroundParentSet(ctx)
    return
  }
  for(let i = 0; i < l.length - 2; i++)
  {
    l[i].setParent(l[l.length - 1])
    if(l.length - 1 !== i + 1)
    {
      l[i + 1].removeChild(l[i])
      l[l.length - 1].addChild(l[i])
    }
    if(draw)
    {
      ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
      
      this.drawCanvasBoundingBoxes();
      this.drawCurrentSelectorsAlmostLinear(ctx, l[i], "right", "red")
      for(let j = 0; j < l.length - 1; j++)
      {
        l[j].drawArrowTo(ctx, "red")
        l[j].drawArrowTo(ctx, "red")
        l[j].drawArrowTo(ctx, "red")
      }
      
      await new Promise(r => setTimeout(r, -1600 * find_animation_duration + 2160))
    } 
  }
  const startTime = performance.now()


  var start_parents = this.getStartCoordsCurrentSelectorsAlmostLinear()
  var goal_parents = this.getGoalCoordsCurrentSelectorsAlmostLinearParents()

  // Sorrrted
  var start_children = []
  var goal_children = []
  var i = 0
  for(const parent of this.sortedParents(parent_nodes_almost_linear))
  {
    if(parent.children.length === 0) continue
    var delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (parent.getTreeHeight() + 1)
    start_children.push(this.getStartCoordsCurrentSelectorsFastUnionChildren(parent))
    goal_children.push(this.getGoalCoordsCurrentSelectorsFastUnionChildren(parent, goal_parents[i], current_boxes[i].topLeftX, current_boxes[i].topRightX, delta_y, 1))
    i++
  }
  function updateAllChildCoords(root, goal, progress)
  {
    if(root.children.length === 0) return
    for(let i = 0; i < root.children.length; i++)
    {
      for(let j = 0; j < goal_children.length; j++)
      {
        for(let k = 0; k < goal_children[j].length; k++)
        {
          if(root.children[i].id == goal_children[j][k][0])
          {
            root.children[i].setCoords([lerp(start_children[j][k][1][0], goal_children[j][k][1][0], progress), lerp(start_children[j][k][1][1], goal_children[j][k][1][1], progress)])
          }
        }
      }
      updateAllChildCoords(root.children[i], goal, progress)
    }
  }
  function updateAllParentCoords(progress)
  {
    let i = 0
    for(const parent of self.sortedParents(parent_nodes_almost_linear))
    {
      parent.setCoords([lerp(start_parents[i][0], goal_parents[i][0], progress), lerp(start_parents[i][1], goal_parents[i][1], progress)])
      i++
    }
  }
  
  const self = this
  function updateSquares(currentTime) {
    const elapsed = (currentTime - startTime)
    const progress = Math.min(elapsed / (1000 * union_animation_duration), 1)
    updateAllParentCoords(progress)
    for(const parent of parent_nodes_almost_linear)
    {
      updateAllChildCoords(parent, 1, progress)
    }
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    self.drawCanvasBoundingBoxes();
    self.drawCurrentSelectorsAlmostLinear(ctx)
    // for(let i = 0; i < l.length - 2; i++)
    // {
    //   if(draw)
    //   {
    //     for(let j = 0; j < l.length - 1; j++)
    //     {
    //       l[j].drawArrowTo(ctx, "red")
    //       l[j].drawArrowTo(ctx, "red")
    //       l[j].drawArrowTo(ctx, "red")
    //     }
    //   } 
    // }
    if(progress < 1)
      window.requestAnimationFrame(updateSquares)
    else 
      animation_in_progress = false
  }
  if(active_button_number === 3)
  {
    window.requestAnimationFrame(updateSquares)
  }
}

this.animateFindAlmostLinear = async function(node_to_find, draw)
{
  let context = canvas.getContext("2d");
  let found_child = await this.returnChildFind(node_to_find, parent_nodes_almost_linear, child_nodes_almost_linear)
  if(found_child === null) return null
  let new_parent = await this.drawArrowFindFastUnion(context, found_child, draw)
  
  await new Promise(r => setTimeout(r, -1875 * find_animation_duration + 1937.5))
  await this.animateChangeOfParent(new_parent, context, draw)
  return found_child
}

this.findButtonFunction = async function(to_find) {
  union_animation_duration = -speed + 1.6
  find_animation_duration = speed
  if(animation_in_progress) return
  new_state = true
  animation_in_progress = true
  selected_sets = [null, null]
  let added = false
  
  if(active_button_number === 1)
  {
    let found = await unionFind.animateFindFastFind(to_find)
    if(found === null) 
    {
      window.alert("Please enter an element that exists")
      animation_in_progress = false
      return
    }
    else 
    {
      added = true
    }
  }
  else if(active_button_number === 2)
  {
      let found = await unionFind.animateFindFastUnion(to_find)
      if(found === null) 
      {
          window.alert("Please enter an element that exists")
          animation_in_progress = false
          return
      }
  else 
  {
      added = true
  }
  }
  let found = await unionFind.animateFindAlmostLinear(to_find, active_button_number === 3)
  if(active_button_number === 3 && found === null) 
  {
    window.alert("Please enter an element that exists")
    animation_in_progress = false
    return
  }
  else 
  {
    if(active_button_number === 3)
    added = true
  }
  stepCount++
  unionFind.removeAllFutureStates()
  context.clearRect(fast_find_top_right_corner_x + min_object_distance, fast_union_top_left_corner_y, 140, canvas.height);
  context.rect(fast_find_top_right_corner_x + min_object_distance, fast_union_top_left_corner_y, 140, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y)
  if(added)
  {
    commands.push([[to_find], "find"])
  }
  await unionFind.drawOperations(canvas.getContext("2d"))
  states_boxes.push(JSON.parse(JSON.stringify(current_boxes)))
  animation_in_progress = false
  unionFind.updateCoordsCurrentSelectorsFastFind(canvas.getContext("2d"))
  unionFind.updateCoordsCurrentSelectorsTree(this.sortedParents(parent_nodes_fast_union), states_fast_union)
  unionFind.updateCoordsCurrentSelectorsTree(this.sortedParents(parent_nodes_almost_linear), states_almost_linear)
  // new_state = false
  // await unionFind.redrawCanvas();
  // new_state = true
}

  // this.copyAllStates = function(to_copy_fast_find, to_copy_fast_union, to_copy_almost_linear)

  this.handleRecievedMessage = function(event) {
    // if(animation_in_progress) return
    if(event.data.length === 9 && event.data[8] == "openwindow")
    {
      let temp_states_fast_find = event.data[0]
      let temp_states_fast_union = event.data[1]
      let temp_states_almost_linear = event.data[2]
      commands = event.data[6]
      for(let i = 0; i < temp_states_fast_find.length; i++)
      {
        states_fast_find.push([])
        for(let j = 0; j < temp_states_fast_find[i].length; j++)
        {
          let to_copy = temp_states_fast_find[i][j]
          states_fast_find[i].push(new CircleNode(to_copy.name, [to_copy.x_center, to_copy.y_center], to_copy.radius, to_copy.id))
          for(let k = 0; k < to_copy.children.length; k++)
          {
            states_fast_find[i][j].children.push(new SquareNode(to_copy.children[k].name, states_fast_find[i][j], [to_copy.children[k].x_center, to_copy.children[k].y_center], to_copy.children[k].radius, to_copy.children[k].id))
          }
        }
      }
      for(let i = 0; i < temp_states_fast_union.length; i++)
      {
        states_fast_union.push([])
        for(let j = 0; j < temp_states_fast_union[i].length; j++)
        {
          let to_copy = temp_states_fast_union[i][j]
          if(to_copy.parent === null)
          {
            states_fast_union[i].push(new SquareNode(to_copy.name, null, [to_copy.x_center, to_copy.y_center], to_copy.radius, to_copy.id))
          }
          else
          {
            for(const par of states_fast_union[i])
            {
              if(par.name === to_copy.parent.name)
              {
                let child = new SquareNode(to_copy.name, par, [to_copy.x_center, to_copy.y_center], to_copy.radius, to_copy.id)
                states_fast_union[i].push(child)
                par.children.push(child)
                break
              }
            }
          }
        }
      }
      for(let i = 0; i < temp_states_almost_linear.length; i++)
      {
        states_almost_linear.push([])
        for(let j = 0; j < temp_states_almost_linear[i].length; j++)
        {
          let to_copy = temp_states_almost_linear[i][j]
          if(to_copy.parent === null)
          {
            states_almost_linear[i].push(new SquareNode(to_copy.name, null, [to_copy.x_center, to_copy.y_center], to_copy.radius, to_copy.id))
          }
          else
          {
            for(const par of states_almost_linear[i])
            {
              if(par.name === to_copy.parent.name)
              {
                let child = new SquareNode(to_copy.name, par, [to_copy.x_center, to_copy.y_center], to_copy.radius, to_copy.id)
                states_almost_linear[i].push(child)
                par.children.push(child)
                break
              }
            }
          }
        }
      }
      
      stepCount = event.data[5]
      states_boxes = JSON.parse(JSON.stringify(event.data[3]))
      selected_sets = event.data[4]
      if(states_fast_union.length !== 0)
      {
        let temp = []
        states_fast_union[stepCount].forEach(s => {
          if(s.parent === null)
          temp.push(s.copy())
        })
        for(const a of temp.flat(Infinity))
        {
          if(a.parent === null)
          parent_nodes_fast_union.push(a)
          else
          child_nodes_fast_union.push(a)
        }
        temp = []
        parent_nodes_almost_linear = []
        child_nodes_almost_linear = []
        states_almost_linear[stepCount].forEach(s => {
          if(s.parent === null)
          temp.push(s.copy())
        })
        for(const a of temp.flat(Infinity))
        {
          if(a.parent === null)
          parent_nodes_almost_linear.push(a)
          else
          child_nodes_almost_linear.push(a)
        }
        
        parent_nodes_fast_find = []
        states_fast_find[stepCount].forEach(s => {
          parent_nodes_fast_find.push(s.copy())
        })
        boxesStepCount = event.data[7]
        if(states_boxes.length)
        current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount]))
      }
      
      unionFind.updateSelectedSets()
      new_state = false
      unionFind.redrawCanvas();
      
    }
    else if(event.data.length === 5 && event.data[4] === "nodesButton")
    {
      stepCount = 0
      boxesStepCount = 0
      parent_nodes_almost_linear = []
      parent_nodes_fast_find = []
      parent_nodes_fast_union = []
      selected_sets = []
      parent_nodes_fast_find = event.data[0].map(objdata => new CircleNode(objdata.name, [objdata.x_center, objdata.y_center], objdata.radius, objdata.id))
      parent_nodes_fast_union = event.data[1].map(objdata => new SquareNode(objdata.name, objdata.parent, [objdata.x_center, objdata.y_center], objdata.radius, objdata.id))
      parent_nodes_almost_linear = event.data[2].map(objdata => new SquareNode(objdata.name, objdata.parent, [objdata.x_center, objdata.y_center], objdata.radius, objdata.id))
      current_boxes = JSON.parse(JSON.stringify(event.data[3]))
      states_almost_linear = []
      states_fast_find = []
      states_fast_union = []
      states_boxes = []
      commands = [[]]
      let i = 0
      const square_radius = 5/6 * radius
      for(const par of parent_nodes_fast_find)
      {
        var child = new SquareNode(String.fromCharCode(65 + i), par, [0, 0], square_radius, i + 1)
        par.addChild(child)
        i++
      }
      states_boxes.push(JSON.parse(JSON.stringify(current_boxes)))
      new_state = true
      unionFind.redrawCanvas();
    }
    else if(event.data.length === 4 && event.data[3] === "selectedSet")
    {
      // highlight selected Set
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      console.log(states_fast_find.length)
      selected_sets = event.data[0]
      stepCount = event.data[1]
      boxesStepCount = event.data[2]
      unionFind.updateSelectedSets()
      new_state = false
      unionFind.redrawCanvas();
    }
    else if(event.data.length === 3 && event.data[2] === "union")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      
      stepCount = event.data[0]
      boxesStepCount = event.data[1] - 1
      unionFind.unionButtonFunction()
    }
    else if(event.data.length === 4 && event.data[3] === "find")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      stepCount = event.data[1]
      boxesStepCount = event.data[2]
      unionFind.findButtonFunction(event.data[0])
    }
    else if(event.data.length === 3 && event.data[2] === "stepforward")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      stepCount = event.data[0]
      boxesStepCount = event.data[1]
      unionFind.stepForward()
    } 
    else if(event.data.length === 3 && event.data[2] === "stepbackward")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      stepCount = event.data[0]
      boxesStepCount = event.data[1]
      unionFind.stepBackward()
    }
    else if(event.data.length === 4 && event.data[0] === "new_speed")
    {
      stepCount = event.data[2]
      boxesStepCount = event.data[3]
      unionFind.updateSpeed(event.data[1])
    }
    else if(event.data.length === 1 && event.data[0] === "fastBackward")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      unionFind.fastBackward()
    }
    else if(event.data.length === 1 && event.data[0] === "fastForward")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      unionFind.fastForward()
    }
    else if(event.data.length === 1 && event.data[0] === "clearTree")
    {
      if(animation_in_progress)
      {
        union_animation_duration = 0.001
        find_animation_duration = 1000
      }
      unionFind.clearTree()
    }
  }



  this.initialize = function() {
      const buttonUnion = document.getElementById("unionButton")
      window.addEventListener('message', this.handleRecievedMessage)


      const button = document.querySelector(`.custom-button:nth-child(${1})`)
      button.classList.add("active")
      active_button = button

  
    
    content_div = document.getElementById("content")

    canvas = document.createElement("canvas")
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("class", "unselectable");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    content_div.appendChild(canvas);

    content_div.setAttribute("style","width:" + width + "px");
    content_div.style.width=width + 'px';


  

  buttonUnion.addEventListener('click', this.unionButtonFunction)
  }

  // here ends initialize

  this.unionButtonFunction = async function() {
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
    if(animation_in_progress) return
    if(selected_sets[0] == null || selected_sets[1] == null)
    {
      alert("Please select exactly 2 Sets to union")
      return
    }
    new_state = true
    commands.push([[selected_sets[0].id, selected_sets[1].id], "union"])
    // put the parents into the selected Arrays
    await unionFind.addSelectedSetsToArrays()
    await unionFind.connectBoxes()
    await unionFind.removeAllFutureStates()
    context.clearRect(0, 0, canvas.width, canvas.height);
    await unionFind.drawCanvasBoundingBoxes();
    await unionFind.drawOperations(context)

    let index_of_parent_with_less_children_selected_sets = await unionFind.determineSetWithLessChildren()
    var index_of_parent_with_more_children_selected_sets = index_of_parent_with_less_children_selected_sets ? 0 : 1

    var side_from_which_to_connect = "right"
    animation_in_progress = true
    await unionFind.animateFastFind(context, selected_circles_fast_find[index_of_parent_with_less_children_selected_sets], selected_circles_fast_find[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 1)
    await unionFind.animateFastUnion(context, selected_circles_fast_union[index_of_parent_with_less_children_selected_sets], selected_circles_fast_union[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 2)
    await unionFind.animateAlmostLinear(context, selected_circles_almost_linear[index_of_parent_with_less_children_selected_sets], selected_circles_almost_linear[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 3)
      
    selected_circles_fast_find[index_of_parent_with_more_children_selected_sets].number_of_members += selected_circles_fast_find[index_of_parent_with_less_children_selected_sets].number_of_members
  

    selected_circles_fast_find = [null, null]
    selected_sets = [null, null]
    selected_circles_almost_linear = []
    selected_circles_fast_union = []
    await unionFind.redrawCanvas() 
}


  this.determineSetWithLessChildren = function()
{
  let parent_with_less_children;
  if(selected_circles_fast_find[0].children.length > selected_circles_fast_find[1].children.length)
  {
    parent_with_less_children = selected_circles_fast_find[1]
  }
  else if(selected_circles_fast_find[0].children.length < selected_circles_fast_find[1].children.length)
  {
    parent_with_less_children = selected_circles_fast_find[0]
  }
  else
  {
    if(selected_circles_fast_find[0].id < selected_circles_fast_find[1].id)
    {
      parent_with_less_children = selected_circles_fast_find[1]
    }
    else
    {
      parent_with_less_children = selected_circles_fast_find[0]
    }
  }
  
  var index_of_parent_with_less_children_selected_sets = selected_circles_fast_find.indexOf(parent_with_less_children)
  if(index_of_parent_with_less_children_selected_sets === -1)
  {
    throw new Error("Something went terribly wrong!")
  }
  return index_of_parent_with_less_children_selected_sets
}

  this.removeAllFutureStates = function()
  {

    if(stepCount === states_fast_find.length) return
    const to_remove = states_fast_find.length - stepCount
    states_fast_find.splice(stepCount, to_remove)
    states_fast_union.splice(stepCount, to_remove)
    states_almost_linear.splice(stepCount, to_remove)
    states_boxes.splice(stepCount, to_remove)
    commands.splice(stepCount, to_remove)
  }

  this.addSelectedSetsToArraysHelper = function(parents, selected_circles)
  {
    for(let i = 0; i < parents.length; i++)
    {
      if(parents[i].id === selected_sets[0].id)
      {
        selected_circles[0] = parents[i]
      }
      else if(parents[i].id === selected_sets[1].id)
      {
        selected_circles[1] = parents[i]
      }
    }
  }

  this.addSelectedSetsToArrays = function() 
  {
    this.addSelectedSetsToArraysHelper(parent_nodes_fast_find, selected_circles_fast_find)
    this.addSelectedSetsToArraysHelper(parent_nodes_fast_union, selected_circles_fast_union)
    this.addSelectedSetsToArraysHelper(parent_nodes_almost_linear, selected_circles_almost_linear)
  }


  this.animateFastFind = async function(ctx, par_with_less, par_with_more, side_from_which_to_connect, draw)
{
  //STEP0
  //DRAWCURRENTSTATE
 
  if(draw == 1)
  {
    this.drawCanvasBoundingBoxes();
    this.drawOperations(ctx)
    this.drawNodesFastFind(ctx)
  }

  //STEP1
  //SET NEW PARENT
  let children_with_green_arrow = []
  while(par_with_less.children.length)
  {
    par_with_less.children[0].setParent(par_with_more)
    par_with_more.addChild(par_with_less.children[0], side_from_which_to_connect)
    par_with_less.removeChild(par_with_less.children[0])
    children_with_green_arrow.push(par_with_more.children[par_with_more.children.length - 1])
    if(draw == 1)
    {
      ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
      this.drawNodesFastFind(ctx, children_with_green_arrow)
      await new Promise(r => setTimeout(r, -1000 * speed + 1600 ))
    }
    
    
  }
  parent_nodes_fast_find.splice(parent_nodes_fast_find.indexOf(par_with_less), 1)
  par_with_more.number_of_members += par_with_less.number_of_members
  
  //STEP2
  //DRAW ARROW TO NEW PARENT
  if(draw)
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    this.drawOperations(ctx)
    this.drawCanvasBoundingBoxes();
    this.drawNodesFastFind(ctx, children_with_green_arrow)
  }
  
  const startTime = performance.now()

  

  var start_parents = []
  this.sortedParents(parent_nodes_fast_find).forEach((parent) => {
    start_parents.push(parent.getCoordsCenter())
  })

  var goal_parents = this.getGoalCoordsCurrentSelectorsFastFindParents();

  var start_children = []
  for(let i = 0; i < parent_nodes_fast_find.length; i++)
    {
        start_children.push([])
        for(let j = 0; j < this.sortedParents(parent_nodes_fast_find)[i].children.length; j++)
        {
            start_children[i].push(this.sortedParents(parent_nodes_fast_find)[i].children[j].getCoordsCenter())
        }
    }

  var goal_children = this.getGoalCoordsCurrentSelectorsFastFindChildren(goal_parents)
  const self = this
  function updateSquares(currentTime) {
    const elapsed = (currentTime - startTime)
    const progress = Math.min(elapsed / (1000 * union_animation_duration), 1)
    const parents = self.sortedParents(parent_nodes_fast_find)
    for(let i = 0; i < parent_nodes_fast_find.length; i++)
    {
        let index = parent_nodes_fast_find.indexOf(parents[i])
        parent_nodes_fast_find[index].setCoords([lerp(start_parents[i][0], goal_parents[i][0], progress), lerp(start_parents[i][1], goal_parents[i][1], progress)])
        for(let j = 0; j < parent_nodes_fast_find[index].children.length; j++)
        {
            parent_nodes_fast_find[index].children[j].setCoords([lerp(start_children[i][j][0], goal_children[i][j][0], progress), lerp(start_children[i][j][1], goal_children[i][j][1], progress)])
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    self.drawCanvasBoundingBoxes();
    self.drawOperations(ctx)
    self.drawNodesFastFind(ctx, children_with_green_arrow)
    if(progress < 1)
      window.requestAnimationFrame(updateSquares)
    else
    {
      animation_in_progress = false
      self.redrawCanvas()
    } 
  }
  if(draw)
    window.requestAnimationFrame(updateSquares)
}


this.animateFastUnion = async function(ctx, par_with_less, par_with_more, side_from_which_to_connect, draw) 
{
  
  //STEP0
  //DRAWCURRENTSTATE
  if(draw)
  {
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    this.drawCanvasBoundingBoxes();
    this.drawOperations(ctx)
    this.drawCurrentSelectorsFastUnion(ctx)
  }

  //STEP1
  //SET NEW PARENT
  par_with_more.addChild(par_with_less, side_from_which_to_connect)
  // par_with_less.setParent(par_with_more)
  
  
  if(draw)
  {
    par_with_less.drawCurvedArrowTo(ctx, par_with_more, "green", side_from_which_to_connect)
    await new Promise(r => setTimeout(r, -1000 * speed + 1600 ))
  }
  par_with_more.number_of_members += par_with_less.number_of_members
  child_nodes_fast_union.push(par_with_less)
  
  parent_nodes_fast_union.splice(parent_nodes_fast_union.indexOf(par_with_less), 1)

  
  //STEP2
  //DRAW ARROW TO NEW PARENT
  if(draw)
  {
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    this.drawCanvasBoundingBoxes();
    this.drawOperations(ctx)
    this.drawCurrentSelectorsFastUnion(ctx)
  }
  
  const startTime = performance.now()


  var start_parents = this.getStartCoordsCurrentSelectorsFastUnionParents()
  var goal_parents = this.getGoalCoordsCurrentSelectorsFastUnionParents()

  // Sorrrted
  var start_children = []
  var goal_children = []
  var i = 0
  for(const parent of this.sortedParents(parent_nodes_fast_union))
  {
    if(parent.children.length === 0) continue
    var delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (parent.getTreeHeight() + 1)
    start_children.push(this.getStartCoordsCurrentSelectorsFastUnionChildren(parent))
    goal_children.push(this.getGoalCoordsCurrentSelectorsFastUnionChildren(parent, goal_parents[i], current_boxes[i].topLeftX, current_boxes[i].topRightX, delta_y, 1))
    i++
  }
  function updateAllChildCoords(root, goal, progress)
  {
    if(root.children.length === 0) return
    for(let i = 0; i < root.children.length; i++)
    {
      for(let j = 0; j < goal_children.length; j++)
      {
        for(let k = 0; k < goal_children[j].length; k++)
        {
          if(root.children[i].id == goal_children[j][k][0])
          {
            root.children[i].setCoords([lerp(start_children[j][k][1][0], goal_children[j][k][1][0], progress), lerp(start_children[j][k][1][1], goal_children[j][k][1][1], progress)])
          }
        }
      }
      updateAllChildCoords(root.children[i], goal, progress)
    }
  }
  function updateAllParentCoords(progress)
  {
    let i = 0
    for(const parent of self.sortedParents(parent_nodes_fast_union))
    {
      parent.setCoords([lerp(start_parents[i][0], goal_parents[i][0], progress), lerp(start_parents[i][1], goal_parents[i][1], progress)])
      i++
    }
  }
  
  const self = this
  function updateSquares(currentTime) {
    const elapsed = (currentTime - startTime)
    const progress = Math.min(elapsed / (1000 * union_animation_duration), 1)
    updateAllParentCoords(progress)
    for(const parent of parent_nodes_fast_union)
    {
      updateAllChildCoords(parent, 1, progress)
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    self.drawCanvasBoundingBoxes();
    self.drawOperations(ctx);
    self.drawCurrentSelectorsFastUnion(ctx, par_with_less, side_from_which_to_connect)
    if(progress < 1)
      window.requestAnimationFrame(updateSquares)
    else
    {
      animation_in_progress = false
      self.redrawCanvas()
    } 
  }
  if(draw)
    window.requestAnimationFrame(updateSquares)
}

this.animateAlmostLinear = async function(ctx, par_with_less, par_with_more, side_from_which_to_connect, draw) {
    
  //STEP0
  //DRAWCURRENTSTATE
  if(draw)
  {
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    this.drawCanvasBoundingBoxes();
    this.drawOperations(ctx);
    this.drawCurrentSelectorsAlmostLinear(ctx)
  }
  


  //STEP1
  //SET NEW PARENT

  par_with_more.addChild(par_with_less, side_from_which_to_connect)
  if(draw)
  {
    par_with_less.drawCurvedArrowTo(ctx, par_with_more, "green", side_from_which_to_connect)
    await new Promise(r => setTimeout(r, -1000 * speed + 1600 ))
  }
  
  par_with_more.number_of_members += par_with_less.number_of_members
  child_nodes_almost_linear.push(par_with_less)
  
  parent_nodes_almost_linear.splice(parent_nodes_almost_linear.indexOf(par_with_less), 1)

  
  //STEP2
  //DRAW ARROW TO NEW PARENT
  if(draw)
  {
    ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    this.drawCanvasBoundingBoxes();
    this.drawOperations(ctx)
    this.drawCurrentSelectorsAlmostLinear(ctx)
  }
  
  const startTime = performance.now()


  var start_parents = this.getStartCoordsCurrentSelectorsAlmostLinear()
  var goal_parents = this.getGoalCoordsCurrentSelectorsAlmostLinearParents()

  // Sorrrted
  var start_children = []
  var goal_children = []
  var i = 0
  for(const parent of this.sortedParents(parent_nodes_almost_linear))
  {
    if(parent.children.length === 0) continue
    var delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (parent.getTreeHeight() + 1)
    start_children.push(this.getStartCoordsCurrentSelectorsFastUnionChildren(parent))
    goal_children.push(this.getGoalCoordsCurrentSelectorsFastUnionChildren(parent, goal_parents[i], current_boxes[i].topLeftX, current_boxes[i].topRightX, delta_y, 1))
    i++
  }
  function updateAllChildCoords(root, goal, progress)
  {
    if(root.children.length === 0) return
    for(let i = 0; i < root.children.length; i++)
    {
      for(let j = 0; j < goal_children.length; j++)
      {
        for(let k = 0; k < goal_children[j].length; k++)
        {
          if(root.children[i].id == goal_children[j][k][0])
          {
            root.children[i].setCoords([lerp(start_children[j][k][1][0], goal_children[j][k][1][0], progress), lerp(start_children[j][k][1][1], goal_children[j][k][1][1], progress)])
          }
        }
      }
      updateAllChildCoords(root.children[i], goal, progress)
    }
  }
  function updateAllParentCoords(progress)
  {
    let i = 0
    for(const parent of self.sortedParents(parent_nodes_almost_linear))
    {
      parent.setCoords([lerp(start_parents[i][0], goal_parents[i][0], progress), lerp(start_parents[i][1], goal_parents[i][1], progress)])
      i++
    }
  }
  
  const self = this
  function updateSquares(currentTime) {
    const elapsed = (currentTime - startTime)
    const progress = Math.min(elapsed / (1000 * union_animation_duration), 1)
    updateAllParentCoords(progress)
    for(const parent of parent_nodes_almost_linear)
    {
      updateAllChildCoords(parent, 1, progress)
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.clearRect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y);
    self.drawCanvasBoundingBoxes();
    self.drawCurrentSelectorsAlmostLinear(ctx, par_with_less, side_from_which_to_connect)
    self.drawOperations(ctx)
    if(progress < 1)
      window.requestAnimationFrame(updateSquares)
    else
    {
      animation_in_progress = false
      self.redrawCanvas()
    } 
  }
  if(draw)
  {
    window.requestAnimationFrame(updateSquares)
  }
    
}

  function lerp(start, end, t)
  {
    return start + (end - start) * t
  }

  this.drawTree = function(ctx, root)
  {
    const num_of_children = root.children.length
    root.draw(ctx, "black", "white")
    root.drawName(ctx, "black", "white")
    if(num_of_children == 0) return
    for(let i = 0; i < num_of_children; i++)
    {
      this.drawTree(ctx, root.children[i])
    }
  }

  this.connectTreeArrows = function(ctx, root, algorithm, exception = null, side_from_which_to_connect = null, color="green") 
{
  if(algorithm == "find")
  {
   root.drawBetweenChildren(ctx, exception)
   
   for(let i = 0; i < root.children.length; i++)
   {
    if(i == 0 || i == root.children.length - 1)
    {
      if(exception !== null && exception.indexOf(root.children[i]) !== -1)
      {
        root.children[i].drawCurvedArrowFromTo(ctx, root, "green")
      }
      else
      {
        root.children[i].drawCurvedArrowFromTo(ctx, root, "black")
      }
        
    }
    else
    {
      if(exception !== null && exception.indexOf(root.children[i]) !== -1)
        root.children[i].drawArrowTo(ctx, "green")
      else
        root.children[i].drawArrowTo(ctx, "black")
    }
   }
  }

  else if(algorithm == "union")
  {
    const num_of_children = root.children.length
    if(num_of_children == 0)
    {
      if(root.parent == null) return
      else 
      {
        if(root === exception)
        {
          root.drawCurvedArrowTo(ctx, root.parent, "green", side_from_which_to_connect)
        }
        else
        {
          root.drawArrowTo(ctx)
        }
        
      }
    }
    for(let i = 0; i < num_of_children; i++)
    {
      if(root.children[i] === exception)
      {
        root.children[i].drawCurvedArrowTo(ctx, root, "green", side_from_which_to_connect)
      }
      else
      {
        root.children[i].drawArrowTo(ctx)
      }
      
      this.connectTreeArrows(ctx, root.children[i], "union", exception, side_from_which_to_connect)
    }
  }
  else 
  {
    const num_of_children = root.children.length
    if(num_of_children == 0)
    {
      if(root.parent == null) return
      else 
      {
        if(root === exception)
        {
          root.drawCurvedArrowTo(ctx, root.parent, color, side_from_which_to_connect)
        }
        else
        {
          root.drawArrowTo(ctx)
        }
        
      }
    }
    for(let i = 0; i < num_of_children; i++)
    {
      if(root.children[i] === exception)
      {
        root.children[i].drawCurvedArrowTo(ctx, root, color, side_from_which_to_connect)
      }
      else
      {
        root.children[i].drawArrowTo(ctx)
      }
      
      this.connectTreeArrows(ctx, root.children[i], "almost_linear", exception, side_from_which_to_connect)
    }
  }
}

  this.drawCanvasBoundingBoxes = function() {
    context.setLineDash([5, 5]);
    
    context.beginPath();
    context.lineWidth = dotted_thickness;
    context.strokeStyle = dotted_rectangle_color;

    // TOP left
    context.rect(fast_union_top_left_corner_x, fast_union_top_left_corner_y, 
      almost_linear_top_right_corner_x - fast_union_top_left_corner_x, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y); 
    
    
    context.rect(fast_find_top_right_corner_x + min_object_distance, fast_union_top_left_corner_y, 140, fast_find_bottom_left_corner_y - fast_union_top_left_corner_y)

    // TOP right


    context.stroke();

    context.font="24px Consolas";
    context.textAlign="center";

    context.setLineDash([])
  }

  this.drawCurrentSelectors = function(ctx) 
  {
      if(active_button_number == 1)
      {
          for(let i = 0; i < parent_nodes_fast_find.length; i++)
          {
              if(selected_sets.indexOf(parent_nodes_fast_find[i]) != -1)
              {
                  parent_nodes_fast_find[i].draw(ctx, "black", "green")
              }
              else
              {
                  parent_nodes_fast_find[i].draw(ctx, "black", "white")
              }
              parent_nodes_fast_find[i].drawName(ctx)
          }
      }
      else if(active_button_number == 2)
      {
          for(let i = 0; i < parent_nodes_fast_union.length; i++)
          {
              if(selected_sets.indexOf(parent_nodes_fast_union[i]) != -1)
              {
                  parent_nodes_fast_union[i].draw(ctx, "black", "green")
              }
              else
              {
                  parent_nodes_fast_union[i].draw(ctx, "black", "white")
              }
              parent_nodes_fast_union[i].drawName(ctx)
          }
      }
      else if(active_button_number == 3)
      {
        for(let i = 0; i < parent_nodes_almost_linear.length; i++)
          {
              if(selected_sets.indexOf(parent_nodes_almost_linear[i]) != -1)
              {
                parent_nodes_almost_linear[i].draw(ctx, "black", "green")
              }
              else
              {
                parent_nodes_almost_linear[i].draw(ctx, "black", "white")
              }
              parent_nodes_almost_linear[i].drawName(ctx)
          }
      }
      
  }

  // Assumes that the sets in fast find have the correct coordinates
  this.drawNodesFastFind = function(ctx, exceptions=null) {
    for(const parent_fast_find of parent_nodes_fast_find)
    {
      this.drawNodeFastFind(ctx, parent_fast_find, exceptions)
    }
  }

  this.drawNodeFastFind = function(ctx, node, exceptions=null)
  {
    this.drawTree(ctx, node)
    this.connectTreeArrows(ctx, node, "find", exceptions)
  }

  this.updateCoordsCurrentSelectorsFastFind = function() {
    let i = 0;
    let temp = []
  
    for(const parent_fast_find of this.sortedParents(parent_nodes_fast_find))
    {
      const delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / 3
      parent_fast_find.setCoords([current_boxes[i].topLeftX + (current_boxes[i].topRightX - current_boxes[i].topLeftX) / 2, current_boxes[i].topLeftY + delta_y])
      this.updateCoordsCurrentSelectorsFastFindChildren(parent_fast_find, current_boxes[i].topLeftX, current_boxes[i].topRightX, delta_y)
      temp.push(parent_fast_find.copy())
      i++
    }
    if(!new_state) return
    states_fast_find.push(temp)
  }

  this.drawState = function()
  {
    let ctx = canvas.getContext("2d")
    if(active_button_number === 1)
    {
      for(let i = 0; i < states_fast_find[stepCount].length; i++)
      {
        this.drawNodeFastFind(ctx, states_fast_find[stepCount][i])
      }
    }
    else if(active_button_number === 2)
    {
      this.drawCurrentSelectorsFastUnion(ctx)
    }
    else if(active_button_number === 3)
    {
      this.drawCurrentSelectorsAlmostLinear(ctx)
    }
  }

  this.updateCoordsCurrentSelectorsFastFindChildren = function(root, from, to, delta_y)
  {
    const num_of_children = root.children.length
    if(num_of_children == 0) return
    for(let i = 0; i < num_of_children; i++)
    {
      root.children[i].setCoords([from + (2 * i + 1) * (to - from) / (2 * num_of_children), root.getCoordsCenter()[1] + delta_y])
    }
  }

  this.getGoalCoordsCurrentSelectorsFastFindParents = function() {
    var to_ret = []
    for(let i = 0; i < parent_nodes_fast_find.length; i++)
    {
      const delta_y = current_boxes[i].topLeftY + (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / 3
      to_ret.push([current_boxes[i].topLeftX + (current_boxes[i].topRightX - current_boxes[i].topLeftX) / 2, delta_y])
    }
    return to_ret
}

  this.getGoalCoordsCurrentSelectorsFastFindChildren = function(goal_parents) {
    var to_ret = []
    const parents = this.sortedParents(parent_nodes_fast_find)
    for(let i = 0; i < parent_nodes_fast_find.length; i++)
    {
      const num_of_children = parents[i].children.length
      const from = current_boxes[i].topLeftX
      const to = current_boxes[i].topRightX
      const delta_y = current_boxes[i].topLeftY + (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / 3 * 2
      to_ret.push([])
      for(let j = 0; j < num_of_children; j++)
      {
          to_ret[i].push([from + (2 * j + 1) * (to - from) / (2 * num_of_children), delta_y])
      }
    }
    return to_ret
  }

  this.updateCoordsCurrentSelectorsFastUnionChildren = function(root, from, to, delta_y)
  {
    const num_of_children = root.children.length
    if(num_of_children == 0) return
    for(let i = 0; i < num_of_children; i++)
    {
      root.children[i].setCoords([from + (2 * i + 1) * (to - from) / (2 * num_of_children), root.getCoordsCenter()[1] + delta_y ])
      this.updateCoordsCurrentSelectorsFastUnionChildren(root.children[i], from + (2 * i) * (to - from) / (2 * num_of_children), from + (2 * (i + 1)) * (to - from) / (num_of_children * 2), delta_y)
    }
  }


  this.getGoalCoordsCurrentSelectorsFastUnionChildren = function(root, goal_parents, from, to, delta_y, level = 1) {
    var to_ret = []
      const num_of_children = root.children.length
      if(num_of_children == 0) return
      for(let i = 0; i < num_of_children; i++)
      {
        var key = root.children[i].id
        to_ret.push([key, [from + (2 * i + 1) * (to - from) / (2 * num_of_children), goal_parents[1] + delta_y]])
        const returned = this.getGoalCoordsCurrentSelectorsFastUnionChildren(root.children[i], to_ret[to_ret.length - 1][1], from + (2 * i) * (to - from) / (2 * num_of_children), from + (2 * (i + 1)) * (to - from) / (num_of_children * 2), delta_y, level + 1)
        if(returned == undefined) continue
        for(let j = 0; j < returned.length; j++)
        {
          to_ret.push(returned[j])
        }
      }
      return to_ret
  }

  this.sortedParents = function(parents)
  {
    const copy = [...parents]
    copy.sort((a, b) => {
      const countA = a.getTotalNumberOfChildren()
      const countB = b.getTotalNumberOfChildren()
      return countB - countA
    })
    return copy
  }

  this.getGoalCoordsCurrentSelectorsFastUnionParents = function()
  {
    var sorted_union_parents = this.sortedParents(parent_nodes_fast_union)
    let i = 0;
    let to_ret = []
    for(const sorted_parent of sorted_union_parents)
    {
      const num_of_children = sorted_parent.getTotalNumberOfChildren()
      const delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (sorted_parent.getTreeHeight() + 1)
      const delta_x = current_boxes[i].bottomRightX - current_boxes[i].bottomLeftX
      to_ret.push([current_boxes[i].bottomLeftX + delta_x / 2, current_boxes[i].topLeftY + delta_y])
      i++
    }
    return to_ret
  }

  this.getGoalCoordsCurrentSelectorsAlmostLinearParents = function()
  {
    var sorted_linear_parents = this.sortedParents(parent_nodes_almost_linear)
    let i = 0;
    let to_ret = []
    for(const sorted_parent of sorted_linear_parents)
    {
      const num_of_children = sorted_parent.getTotalNumberOfChildren()
      const delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (sorted_parent.getTreeHeight() + 1)
      const delta_x = current_boxes[i].bottomRightX - current_boxes[i].bottomLeftX
      to_ret.push([current_boxes[i].bottomLeftX + delta_x / 2, current_boxes[i].topLeftY + delta_y])
      i++
    }
    return to_ret
  }

  this.getStartCoordsCurrentSelectorsFastUnionParents = function()
  {
    var sorted_union_parents = this.sortedParents(parent_nodes_fast_union)
    let to_ret = []
    for(const sorted_parent of sorted_union_parents)
    {
      to_ret.push(sorted_parent.getCoordsCenter())
    }
    return to_ret
  }

  this.getStartCoordsCurrentSelectorsAlmostLinear = function(){
    var sorted_linear_parents = this.sortedParents(parent_nodes_almost_linear)
    let to_ret = []
    for(const sorted_parent of sorted_linear_parents)
    {
      to_ret.push(sorted_parent.getCoordsCenter())
    }
    return to_ret
  }

  this.getStartCoordsCurrentSelectorsFastUnionChildren = function(parent) {
    var to_ret = []
    const num_of_children = parent.children.length
    if(num_of_children == 0) return
    for(let i = 0; i < num_of_children; i++)
    {
      var key = parent.children[i].id
      to_ret.push([key, parent.children[i].getCoordsCenter()])
      const returned = this.getStartCoordsCurrentSelectorsFastUnionChildren(parent.children[i])
      if(returned == undefined) continue
      for(let j = 0; j < returned.length; j++)
      {
        to_ret.push(returned[j])
      }
    }
    return to_ret
  }
  

  this.drawCurrentSelectorsFastUnion = function(ctx, exception = null, side_from_which_to_connect = null) {
    for(const parent_fast_union of parent_nodes_fast_union)
    {
        this.drawTree(ctx, parent_fast_union)
        this.connectTreeArrows(ctx, parent_fast_union, "union", exception, side_from_which_to_connect)
    }

  }

  this.drawChildrenLeftFastFind = function(ctx, parent, children) {
    const num_of_children = parent.children.length
    for(let i = 0; i < children.length; i++)
    {
      const distanceBetweenChildren = (fast_find_bottom_right_corner_x - fast_find_bottom_left_corner_x) / (num_of_children + 1)

      const startX = parent.getCoordsCenter()[0] - (distanceBetweenChildren * (num_of_children - 1)) / 2
      children[i].setCoords([startX + i * distanceBetweenChildren,  FAST_FIND_OFFSET + 9 * min_object_distance + radius])
      children[i].draw(ctx, "black", "white")
    }
  }

  this.drawCurrentSelectorsAlmostLinear = function(ctx, exception = null, side_from_which_to_connect = null, color="green")
{
  for(const parent_almost_linear of parent_nodes_almost_linear)
  {

      this.drawTree(ctx, parent_almost_linear)
      this.connectTreeArrows(ctx, parent_almost_linear, "almost_linear", exception, side_from_which_to_connect, color)
  }
}


  this.drawCurrentNodesSelected = function(ctx, strokeColor, fillColor) {
    this.updateCoordsCurrentSelectorsFastFind(ctx)
    this.updateCoordsCurrentSelectorsTree(this.sortedParents(parent_nodes_fast_union), states_fast_union)
    this.updateCoordsCurrentSelectorsTree(this.sortedParents(parent_nodes_almost_linear), states_almost_linear)
    new_state = false

    if(active_button_number == 1)
    {
        this.drawNodesFastFind(ctx)
    }
    else if(active_button_number == 2)
    {
        this.drawCurrentSelectorsFastUnion(ctx)
    }
    else if(active_button_number == 3)
    {
      this.drawCurrentSelectorsAlmostLinear(ctx)
    }
    this.drawCurrentSelectors(ctx)
        
}
  // This is the initial function
  this.putCanvasIntoLittleSquares = function(number_of_squares) {
      // TOP LEFT
      // TOP RIGHT
      // BOTTOM LEFT
      // BOTTOM RIGHT
      const topLeftX = fast_union_top_left_corner_x
      const topLeftY = fast_union_top_left_corner_y
      const bottomRightX = fast_find_bottom_right_corner_x
      const bottomRightY = fast_find_bottom_left_corner_y

      const width = bottomRightX - topLeftX
      const height = bottomRightY - topLeftY

      let squareWidth = 0
      if(number_of_squares <= 5)
      {
          squareWidth = width / number_of_squares
      }
      else if(number_of_squares > 5 && number_of_squares % 2 === 0)
      {
          squareWidth = width / (number_of_squares / 2)
      }
      else 
      {
          squareWidth = width / ((number_of_squares + 1) / 2)
      }
      const squareHeight = number_of_squares > 5 ? height / 2 : height

      let currentX = topLeftX
      let currentY = topLeftY
      for(let  i= 0; i < number_of_squares; i++)
      {
          const squareObj = {}
          squareObj.topLeftX = currentX
          squareObj.topLeftY = currentY
          squareObj.topRightX = currentX + squareWidth
          squareObj.topRightY = currentY
          squareObj.bottomLeftX = currentX
          squareObj.bottomLeftY = currentY + squareHeight
          squareObj.bottomRightX = currentX + squareWidth
          squareObj.bottomRightY = currentY + squareHeight
          current_boxes.push(squareObj)

          

          if(number_of_squares > 5 && i % 2 === 0)
          {
              currentY += squareHeight
          }
          else if(number_of_squares > 5 && i % 2 !== 0)
          {
              currentY -= squareHeight
              currentX += squareWidth
          }
          else if(number_of_squares <= 5)
          {
              currentX += squareWidth
          }
      }
      if(number_of_squares % 2 !== 0 && number_of_squares > 5)
      {
          const lastSquare = current_boxes[number_of_squares - 1]
          lastSquare.bottomLeftY += squareHeight
          lastSquare.bottomRightY += squareHeight
      }
      states_boxes.push(JSON.parse(JSON.stringify(current_boxes)))
  }

  // Only for debug purposes
  this.drawBoxes = function() {
      current_boxes.forEach( square => {
          const topLeftX = square.topLeftX
          const topLeftY = square.topLeftY
          const width = square.topRightX - square.topLeftX
          const height  = square.bottomLeftY - square.topLeftY

          let cont = canvas.getContext("2d")
          cont.strokeRect(topLeftX, topLeftY, width, height)
      })
  }

  this.connectBoxes = function() {
      if(!current_boxes.length) return
      boxesStepCount++
      stepCount++
      if(current_boxes.length >= 3 && boxesStepCount % 2 == 0)
      {
          current_boxes[1].topRightX = current_boxes[2].topRightX
          current_boxes[1].bottomRightX = current_boxes[2].bottomRightX
          current_boxes[1].bottomRightY = current_boxes[2].bottomRightY
          current_boxes[1].bottomLeftY = current_boxes[2].bottomLeftY
          current_boxes.splice(2, 1)
      }
      else if(current_boxes.length < 3 && boxesStepCount % 2 !== 0)
      {
        current_boxes[0].topRightX = current_boxes[1].topRightX
          current_boxes[0].bottomRightX = current_boxes[1].bottomRightX
          current_boxes[0].bottomRightY = current_boxes[1].bottomRightY
          current_boxes[0].bottomLeftY = current_boxes[1].bottomLeftY
          current_boxes.splice(1, 1)
      }
      else if(current_boxes.length < 3 && boxesStepCount % 2 == 0)
      {
        current_boxes[0].topRightX = current_boxes[1].topRightX
        current_boxes[0].bottomRightX = current_boxes[1].bottomRightX
        current_boxes[0].bottomRightY = current_boxes[1].bottomRightY
        current_boxes[0].bottomLeftY = current_boxes[1].bottomLeftY
        current_boxes.splice(1, 1)
      }
      else if(boxesStepCount % 2 !== 0)
      {
          current_boxes[0].topRightX = current_boxes[1].topRightX
          current_boxes[0].bottomRightX = current_boxes[1].bottomRightX
          current_boxes[0].bottomRightY = current_boxes[1].bottomRightY
          current_boxes[0].bottomLeftY = current_boxes[1].bottomLeftY
          current_boxes.splice(1, 1)
      }
      if(current_boxes.length > 1 && current_boxes[0].topRightX - current_boxes[0].topLeftX != current_boxes[1].topRightX - current_boxes[1].topLeftX)
      {
      const topLeftX = fast_union_top_left_corner_x
      const topLeftY = fast_union_top_left_corner_y
      const bottomRightX = fast_find_bottom_right_corner_x
      const bottomRightY = fast_find_bottom_left_corner_y

      const width = bottomRightX - topLeftX
      const height = Math.floor(bottomRightY - topLeftY)
      let number_of_whole_boxes = 0
      let number_of_half_boxes = 0
      for(const box of current_boxes)
      {
        if(box.bottomLeftY - box.topLeftY >= height)
          number_of_whole_boxes++
        else
          number_of_half_boxes++
      }
      let delta_x = width / (number_of_whole_boxes + Math.floor(number_of_half_boxes / 2))
      for(let i = 0; i < current_boxes.length; i++)
      {
        
        if(i !== 0 && current_boxes[i - 1].bottomLeftY - current_boxes[i - 1].topLeftY >= height)
        {
          current_boxes[i].topLeftX = current_boxes[i - 1].topRightX
          current_boxes[i].bottomLeftX = current_boxes[i].topLeftX
        }
        if(i !== 0 && current_boxes[i - 1].bottomLeftY - current_boxes[i - 1].topLeftY < height && current_boxes[i].topLeftY === current_boxes[i - 1].bottomLeftY)
        {
          current_boxes[i].topLeftX = current_boxes[i - 1].topLeftX
          current_boxes[i].bottomLeftX = current_boxes[i].topLeftX
        }
        else if(i !== 0 && current_boxes[i - 1].bottomLeftY - current_boxes[i - 1].topLeftY < height && current_boxes[i].topLeftY !== current_boxes[i - 1].bottomLeftY)
        {
          current_boxes[i].topLeftX = current_boxes[i - 1].topRightX
          current_boxes[i].bottomLeftX = current_boxes[i].topLeftX
        }
        current_boxes[i].topRightX = current_boxes[i].topLeftX + delta_x
        current_boxes[i].bottomRightX = current_boxes[i].topRightX
      }
      }
      if(new_state)
      states_boxes.push(JSON.parse(JSON.stringify(current_boxes)))
  }

  this.updateCoordsCurrentSelectorsTree = function(parents, states)
  {
    let i = 0    
    for(const parent of parents)
    {
        const delta_y = (current_boxes[i].bottomLeftY - current_boxes[i].topLeftY) / (parent.getTreeHeight() + 1)
        const delta_x = current_boxes[i].bottomRightX - current_boxes[i].bottomLeftX
        parent.setCoords([current_boxes[i].bottomLeftX + delta_x / 2, current_boxes[i].topLeftY + delta_y])
        this.updateCoordsCurrentSelectorsFastUnionChildren(parent, current_boxes[i].bottomLeftX, current_boxes[i].bottomRightX, delta_y)
        i++
    }
    if(!new_state) return
    let temp = []
    for(const parent of parents)
    {
      temp.push(parent.copy())
    }
    states.push(temp.flat(Infinity))
  }

  this.animateStepForward = async function()
  {
      animation_in_progress = true
      parent_nodes_fast_union = []
      child_nodes_fast_union = []
      temp = []
      current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount]))
      states_fast_union[stepCount - 1].forEach(s => {
        if(s.parent === null)
        temp.push(s.copy())
      })
      for(const a of temp.flat(Infinity))
      {
        if(a.parent === null)
        parent_nodes_fast_union.push(a)
        else
        child_nodes_fast_union.push(a)
      }
      temp = []
      parent_nodes_almost_linear = []
      child_nodes_almost_linear = []
      states_almost_linear[stepCount - 1].forEach(s => {
        if(s.parent === null)
        temp.push(s.copy())
      })
      for(const a of temp.flat(Infinity))
      {
        if(a.parent === null)
        parent_nodes_almost_linear.push(a)
        else
        child_nodes_almost_linear.push(a)
      }
      parent_nodes_fast_find = []
      states_fast_find[stepCount - 1].forEach(s => {
        parent_nodes_fast_find.push(s.copy())
      })
        let index = 0;
        for(let i = 0; i < parent_nodes_fast_find.length; i++)
        {
          if(commands[stepCount][0].indexOf(parent_nodes_fast_find[i].id) !== -1)
          {
            selected_sets[index] = parent_nodes_fast_find[i]
            index++
            if(index > 1) break;
          }
        }
        current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount - 1]))
      if(commands[stepCount][1] === "union")
      {
        this.addSelectedSetsToArrays()
        this.connectBoxes()
        stepCount--
  
        // put the parents into the selected Arrays
            
    
        let index_of_parent_with_less_children_selected_sets = this.determineSetWithLessChildren()
        var index_of_parent_with_more_children_selected_sets = index_of_parent_with_less_children_selected_sets ? 0 : 1
    
        var side_from_which_to_connect = "right"
        
        await unionFind.animateFastFind(context, selected_circles_fast_find[index_of_parent_with_less_children_selected_sets], selected_circles_fast_find[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 1)
        await unionFind.animateFastUnion(context, selected_circles_fast_union[index_of_parent_with_less_children_selected_sets], selected_circles_fast_union[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 2)
        await unionFind.animateAlmostLinear(context, selected_circles_almost_linear[index_of_parent_with_less_children_selected_sets], selected_circles_almost_linear[index_of_parent_with_more_children_selected_sets], side_from_which_to_connect, active_button_number === 3)
        selected_circles_fast_find[index_of_parent_with_more_children_selected_sets].number_of_members += selected_circles_fast_find[index_of_parent_with_less_children_selected_sets].number_of_members
      
        selected_circles_fast_find = [null, null]
        selected_sets = [null, null]
        selected_circles_almost_linear = []
        selected_circles_fast_union = []
        
      }
      else
      {
        this.redrawCanvas()
        to_search = commands[stepCount][0][0]
        
        if(active_button_number === 1)
        {
          let found = await unionFind.animateFindFastFind(to_search)
          if(found === null) 
          {
            window.alert("Please enter an element that exists")
            animation_in_progress = false
            return
          }
          else 
          {
            added = true
            selected_sets = [null, null]
          }
        }
        else if(active_button_number === 2)
        {
          let found = await unionFind.animateFindFastUnion(to_search)
          if(found === null) 
          {
            window.alert("Please enter an element that exists")
            animation_in_progress = false
            return
          }
          else 
          {
            added = true
            selected_sets = [null, null]
          }
        }
        let found = await unionFind.animateFindAlmostLinear(to_search, active_button_number === 3)
        if(active_button_number === 3 && found === null) 
        {
          window.alert("Please enter an element that exists")
          animation_in_progress = false
          return
        }
        else 
        {
          if(active_button_number === 3)
          {
            added = true
            selected_sets = [null, null]
          }
        }
        await unionFind.drawOperations(canvas.getContext("2d"))
        animation_in_progress = false
      }
    }


  
  this.stepForward = function() 
  {
    animation_in_progress = true
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
    new_state = false
    stepCount++;
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawOperations(context)
    selected_sets = [null, null]
    this.drawCanvasBoundingBoxes()
    this.animateStepForward()
  } 


  this.stepBackward = function() {
    if(stepCount <= 0 || animation_in_progress) return;
    new_state = false
    if(commands[stepCount][1] === "union")
      boxesStepCount--
    stepCount--;
    
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBoxes()


    parent_nodes_fast_union = []
    child_nodes_fast_union = []
    temp = []
    states_fast_union[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_fast_union.push(a)
      else
      child_nodes_fast_union.push(a)
    }

    temp = []
    parent_nodes_almost_linear = []
    child_nodes_almost_linear = []
    states_almost_linear[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_almost_linear.push(a)
      else
      child_nodes_almost_linear.push(a)
    }
    parent_nodes_fast_find = []
    states_fast_find[stepCount].forEach(s => {
      parent_nodes_fast_find.push(s.copy())
    })
    current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount]))
    this.drawState()
  

    selected_sets = [null, null]
    this.redrawCanvas()
  }


  this.redrawCanvas = function() 
  {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBoxes();
    this.drawCurrentNodesSelected(context, "black", "white");
    this.drawOperations(context)
  }


  this.updateSpeed = function(new_speed) {
    if(!animation_in_progress) this.redrawCanvas()
    speed = (1 + parseInt(new_speed)) / 10;
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
  }

  this.clearTree = function() {
    if(animation_in_progress) return
    stepCount = 0;
    boxesStepCount = 0

    parent_nodes_fast_find = []
    parent_nodes_fast_union = []
    parent_nodes_almost_linear = []
    selected_circles_fast_find = []
    child_nodes_almost_linear = []
    child_nodes_fast_union = []
    states_fast_find = []
    states_almost_linear = []
    states_fast_union = []
    current_boxes = []
    states_boxes = []
    starting_number_of_nodes_was_even = false
    stepCount = 0
    boxesStepCount = 0
    commands = [[]]
    new_state = false
    animation_in_progress = false
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
    this.redrawCanvas();  
  }

  this.fastBackward = function()
  {
    if(animation_in_progress) return
    while(stepCount > 0)
    {
      if(commands[stepCount][1] === "union")
      {
        boxesStepCount--
      }
      stepCount--
    }
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBoxes()

    parent_nodes_fast_union = []
    child_nodes_fast_union = []
    temp = []
    states_fast_union[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_fast_union.push(a)
      else
      child_nodes_fast_union.push(a)
    }

    temp = []
    parent_nodes_almost_linear = []
    child_nodes_almost_linear = []
    states_almost_linear[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_almost_linear.push(a)
      else
      child_nodes_almost_linear.push(a)
    }
    parent_nodes_fast_find = []
    states_fast_find[stepCount].forEach(s => {
      parent_nodes_fast_find.push(s.copy())
    })
    current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount]))
    this.drawState()
    selected_sets = [null, null]
    new_state = false
    this.redrawCanvas()
    new_state = true
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
  }

  this.fastForward = function() 
  {
    if(animation_in_progress) return
    while(stepCount < states_fast_find.length - 1)
    {
      stepCount++
      if(stepCount !== 0 && commands[stepCount][1] === "union")
      {
        boxesStepCount++
      }
    }
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawCanvasBoundingBoxes()
    

    parent_nodes_fast_union = []
    child_nodes_fast_union = []
    temp = []
    states_fast_union[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_fast_union.push(a)
      else
      child_nodes_fast_union.push(a)
    }
    temp = []
    parent_nodes_almost_linear = []
    child_nodes_almost_linear = []
    states_almost_linear[stepCount].forEach(s => {
      if(s.parent === null)
      temp.push(s.copy())
    })
    for(const a of temp.flat(Infinity))
    {
      if(a.parent === null)
      parent_nodes_almost_linear.push(a)
      else
      child_nodes_almost_linear.push(a)
    }
    parent_nodes_fast_find = []
    states_fast_find[stepCount].forEach(s => {
      parent_nodes_fast_find.push(s.copy())
    })
    current_boxes = JSON.parse(JSON.stringify(states_boxes[stepCount]))
    this.drawState()
    // REMAIN HERE
    selected_sets = [null, null]
    new_state = false
    this.redrawCanvas()
    new_state = true
    union_animation_duration = -speed + 1.6
    find_animation_duration = speed
  }
};

unionFind = new MinimalunionFind();
