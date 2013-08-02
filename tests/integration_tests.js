 var LinkRegister = require('../index')
  , assert = require('assert')
  , test = require('tape')
  , d3 = require('d3')

var height = 1000
  , width = 1000

test('can initialize a largish graph', function(t) {
  var register = big()
  register.init()
  setTimeout(function(){t.end()}, 1000)
})

test('can initialize a largish graph and remove its nodes all at once', function(t) {
  var register = big()
  register.remove_links(register.links)
  t.end()
})


test('can initialize a largish graph and remove its nodes sequentially', function(t) {
  var register = big()
  for(var i=0, len = register.links.length; i < len; ++i) {
    register.remove_links(register.links)
  }
  t.end()
})

function big(time) {
  // let's do a thousand nodes.
  var nodes = new Array(1000)

  // let's link 500 of them together
  var links = new Array(500)

  for(var i = 0, len = nodes.length; i < len; ++i) {
    nodes[i] = {}
  }

  for(var i = 0, len = links.length; i < len; ++i) {
    links[i] = {}
    links[i].source = choose(nodes.length)
    links[i].target = choose(nodes.length)
  }



  var svg = d3.select("#graph")
      .append("svg")
      .attr("width", width)
      .attr("height", height)

  var node = svg.selectAll(".node")
    , link = svg.selectAll(".link")

  var register = new LinkRegister(d3.layout.force(), links, nodes)

  register.force.size([width, height])
    .on('tick', tick(link))

  return register
}

// a function to pick an element between 0 and length
function choose(length) {
  return ~~(Math.random() * length)
}


function tick(link) {
  return function() {
    link.attr("x1", function(d) { return d.source.x })
        .attr("y1", function(d) { return d.source.y })
        .attr("x2", function(d) { return d.target.x })
        .attr("y2", function(d) { return d.target.y })

    node.attr("transform", function(d){
      return "translate(" + d.x + "," + d.y + ")"
    })
  }
}


