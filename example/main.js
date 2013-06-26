// This example can be run with `npm run example`.
// It depends on having d3, d3-link-register, and beefy installed.
// You simply run `npm run install-example` to install these dependencies.

var d3 = require("d3")
  , LinkRegister = require("../index.js")

// Establishing some constants
var width = 960
  , height = 500
  , CURSOR_WIDTH = 30
  , DELETE_WIDTH = 10
  , register = new LinkRegister(d3.layout.force(), null, [{}], 'idx')

var fill = d3.scale.category20().domain(d3.range(20))

// The force directed graph.
var force = register.force
    .size([width, height])
    .linkDistance(30)
    .charge(-60)
    .on("tick", tick)

register.init()

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)

svg.append("rect")
    .attr("width", width)
    .attr("height", height)

var node = svg.selectAll(".node")
  , link = svg.selectAll(".link")
    
var cursor = svg.append("circle")
    .attr("r", CURSOR_WIDTH)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor")

d3.select(window).on("keydown", function(){
  if (event.keyCode === 16) {
    cursor.attr("r", DELETE_WIDTH)
  }
})

d3.select(window).on("keyup", function(){
  if (event.keyCode === 16) {
    cursor.attr("r", CURSOR_WIDTH)
  }
})

restart()

function mousemove() {
  cursor.attr("transform", "translate(" + d3.mouse(this) + ")")
}

function mousedown() {
  if (!event.shiftKey) {
    regular_mousedown.call(this)
  }
  else {

    shift_mousedown.call(this)
  }
}

function shift_mousedown() {
  var point = d3.mouse(this)

  register.nodes.forEach(function(target) {
    var x = target.x - point[0]
      , y = target.y - point[1] 
    if (Math.sqrt(x*x + y*y) < DELETE_WIDTH) {
      register.remove_node(target)
    }
  })

  restart()
}

function regular_mousedown() {
  var point = d3.mouse(this)
    , node = {x: point[0], y: point[1]}

  // nodes.push(node)
  register.add_node(node)

  // add links to any nearby nodes
  register.nodes.forEach(function(target) {
    var x = target.x - node.x,
        y = target.y - node.y
    if (Math.sqrt(x * x + y * y) < CURSOR_WIDTH) {
      register.add_link({source: node, target: target})
    }
  })
  restart()
}

function tick() {
  link.attr("x1", function(d) { return d.source.x })
      .attr("y1", function(d) { return d.source.y })
      .attr("x2", function(d) { return d.target.x })
      .attr("y2", function(d) { return d.target.y })

  node.attr("transform", function(d){
    return "translate(" + d.x + "," + d.y + ")"
  })
  //  .attr("cx", function(d){ return d.x})
  //  .attr("cy", function(d){ return d.y})

}

function restart() {
  var cn
  link = link.data(register.links)

  link.enter().insert("line", ".node")
      .attr("class", "link")

  link.exit().remove()

  node = node.data(register.nodes, function(d){ return d.idx })

  node.exit().remove()

  cn = node.enter().insert("g", ".cursor")
      .attr("class", "node")

  cn.append("circle")
      .attr("r", 5)
      .style("fill", function(d) { return fill(d.idx % 20) })

  cn.append("text")
    .attr("transform", "translate(10, 5)")
    .text(function(d){ return d.idx })

  force.start()
}
