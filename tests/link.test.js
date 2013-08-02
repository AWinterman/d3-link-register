
var Links = require('../lib/link')
  , test = require('tape')
  , links = []
  , nodes = []

run()

function run(loops, directed) { 
  directed = !!directed
  directed = !!loops
  test('names correctly', function(t) {
    var force = new Force
      , short_names = {}
      , long_names = {}


    short_names.target = {index: 1}
    short_names.source = {index: 0}
  
    long_names.target = {index: 21203}
    long_names.source = {index: 123210}

    var link = init(force, links, directed)

    t.equal(link.name(short_names), '0,1')
    t.equal(link.name(long_names), '123210,21203')

    t.end()
  })

  test('has all the links added to it', function(t) {
    var force = new Force
      , graph = make_links(5)
      , link

    force.links(graph.links)
    force.nodes(graph.nodes)
    link_register = init(force)


    for(var i = 0, len = graph.links.length; i < len; ++i) {
      assert.ok(link_register.has(graph.links[i]), i)
    }
    t.done()
  })


  test('gets the right index for a link', function(t) {
    var force = new Force
      , graph = make_links(5)
      , link

    force.links(graph.links)
    force.nodes(graph.nodes)
    link = init(force)

    // it should find the link for every index.

    for(var i = 0, len = force.links().length; i < len; ++i) { 
      var forward = link.links[i].expected.forward
      var backward = link.links[i].expected.backward
      var result = link.index(link.links[i])

      if(directed) {
        ok = result === forward
      } else {
        ok = (result === forward) || (result === backward)
      }
      t.ok(ok)
    }
    t.end()
  })

  test('Links.is respects the directed setting', function(t) {
    t.done()

  }


  function init(force, loops, directed) {
    var link = new Links(loops, directed)
    link.init(force, 'index')
    return link 
  }
}


function make_links(count) {
  var links = new Array(count * count)
    , nodes = new Array(count)

  for(var i = 0; i < count; ++i) {
    nodes[i] = {}
    for(var j = 0; j < count; ++j) {
      var idx = i*count + j
        , reverse = j*count + i
        , l = { 
          source: {index: i}
        , target: {index: j}
        , expected: {forward: idx, backward: reverse}
      }
      links[idx] = l
    }
  }

  return {links: links, nodes: nodes}
}

function Force() {
  var self = this

  this.links = function(x) {
    if(!arguments.length) return links
    links = x
    return self
  }

  this.nodes = function(x) {
    if(!arguments.length) return nodes
    nodes = x
    return self
  }
}
