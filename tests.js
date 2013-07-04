// TODO: rather than choosing a random sample, iterate through every available
// example and test that one.
var test = require("tape")
//loading app and setting up some dummy data

var LinkRegister = require("./index")
  , assert = require("assert")

// run the tests for each possible choice of graph types. Currently this boils
// down to whether or not loops (links which connect a  node to itself) are
// allowed, and whether the graph is directed or not

run(false, false)
run(true, false)
run(false, true)
run(true, true)

function run(loops, directed) { 
  var loops = loops || false
    , directed = directed || false
    , new_register = register_generator(loops, directed)
    , nodes = []
    , force = {links: identity, nodes: identity}

  function register_generator(loops, directed) {
    return function(force, links, nodes) {
      var register = new LinkRegister(force, links, nodes, "idx")
      register.allow_loops(loops)
      register.directed(directed)
      return register
    }
  }

  nodes.length = 20
  for (var i = 0, len = nodes.length; i < len; i = i +  2){
    nodes[i] = {'type': Math.random(), 'value': Math.random()}
    nodes[i+1] = {'type': Math.random(), 'value': Math.random(), 'idx':i}
    //some dummy nodes
  }


  //initializing register object 
  var register = new_register(force, null, nodes)

  test("has the right attributes", function(t){
    t.plan(13)
    t.notDeepEqual(register.nodes, undefined)
    t.notDeepEqual(register.links, undefined)
    t.notDeepEqual(register.name, undefined)
    t.notDeepEqual(register.has, undefined)
    t.notDeepEqual(register.add_link, undefined)
    t.notDeepEqual(register.add_node, undefined)
    t.notDeepEqual(register.remove_link, undefined)
    t.notDeepEqual(register.remove_node, undefined )
    t.notDeepEqual(register.orphan_node, undefined )
    t.notDeepEqual(register.init, undefined)
    t.notDeepEqual(register.ensure_shape, undefined)
    t.notDeepEqual(register.directed, undefined)
    t.notDeepEqual(register.allow_loops, undefined)
  })

  test("setters actually set", function(t){ 
    t.plan(2)

    var register = new_register(force, null, nodes)
    t.equal(register.directed(), directed)
    t.equal(register.allow_loops(), loops)
  })

  test("nodes all have idx", function(t){
    t.plan(register.nodes.length)
    register.nodes.forEach(
      function(d, i){ 
        t.notDeepEqual(d.idx, undefined, "node " + i + " has an idx attribute" )
      }
    )
  })

  test("no repeated index attributes on the nodes", function(t){
    t.plan(1)
    expected = register.nodes.length
    result = register.nodes.reduce(function(a, b){
      if (a.indexOf(b.idx) === -1){
          a.push(b)
      }
      return a
    }, [])

    t.deepEqual(result.length, expected, "result had right length")
  })

  test('register.index', function(t){
    t.plan(2)

    var register = new_register(force, null, nodes)
    var L = {'source': register.nodes[0], 'target': register.nodes[1]}
    register.add_link(L)

    var expected = 0
      , result = register.index(L)

    t.deepEqual(expected, result, "finds the link")

    if (directed) {
      // looking for the reverrse of L should not add another link.
      expected = -1
      result = register.index(reverse(L))
      t.deepEqual(expected, result, "reverse does not match the link")
    } else {
      // looking for reverse should find the link
      expected = 0
      result = register.index(reverse(L))
      t.deepEqual(expected, result, "reverse matches the link")
    }

  })

  test("can add links", function(t){
    t.plan(1)
    t.ok(make_links(register, 20, "make links threw an exception"))
  })

  test("does not duplicate existing links", function(t){
    t.plan(1)

    var register = new_register(force, null, nodes)
      , new_nodes = chose_two(register.nodes)
      , new_link = {source: new_nodes[0], target: new_nodes[1]}

    register.add_link(new_link)
    register.add_link(new_link)
    register.add_link(new_link)

    t.deepEqual(register.links.length, 1)
  })

  test("membership checks respect the `directed` setting", function(t) {
    t.plan(1)
    var register = new_register(force, null, nodes)
      , two = choose_two(nodes)
      , new_link = {source: two[0], target: two[1]}
      , reversed = reverse(new_link)
      , expected
      , has

    register.add_link(new_link)

    has = register.has(reversed)
    expected = !register.directed()

    t.equal(expected, has)
  })

  test("adding reverse links respects the `directed` setting", function(t) {
    t.plan(1)
    var register = new_register(force, null, nodes)
     , nodes
     , new_link
     , expected

    make_unidirectional_links(register)

    expected = 0
    for (var i = 0, len = register.links.length; i < len; ++i) {
      new_link = register.links[i]
      if (register.directed()) {
        register.add_link(new_link)
        register.add_link(reverse(new_link))
        expected += 2
      } else {
        register.add_link(new_link)
        register.add_link(reverse(new_link))
        expected += 1
      }
    }

    t.deepEqual(register.links.length, expected)
  })

  test("adding loops respects `allow_loops` setting", function(t) {
    t.plan(1)
    var register = new_register(force, null, nodes)
      , i = ~~ (Math.random() * nodes.length)
      , j = i
      , new_link = {source: register.nodes[i], target: register.nodes[j]}

    register.add_link(new_link)
    if (register.allow_loops()){
      expected = 1
    } else {
      expected = 0
    }
    t.deepEqual(register.links.length, expected)
  })


  test("remove a link", function(t){
    t.plan(4)
    //remove a few links:
    var register = new_register(force, null, nodes)
 
    var n = 2
    make_links(register, 30)
    for (var i = 0; i < n; ++i){
      var L = register.links[i]
      register.remove_link(L)
      //now make sure the link is not in the register
      t.deepEqual(register.register[register.name(L)], undefined)
      t.deepEqual(register.links.indexOf(L), -1)
    }
  })

  test("remove reverse of a link respects directed setting", function(t) {
    var register = new_register(force, null, nodes)
      , new_link
      , expected
      , result
      , L

    make_unidirectional_links(register)

    t.plan(register.links.length)
    counter = 0
    while (register.directed() ? counter < register.links.length : register.links.length ) {
      L = reverse(register.links[0])
      result = register.remove_link(L)
      expected = !register.directed()
      t.equal(result, expected)
      counter += 1
    }

  })

  function choose_two(arr) {
    var i = ~~ (Math.random() * arr.length)
      , j = i == arr.length - 1 ? i - 1 : i + 1

    return [arr[i], arr[j]]
  }

  function reverse(link) {
    return {source: link.target, target: link.source}
  }

  function identity(a){ return a }

  function make_links(register, n){
    var n = n || 30
    while (register.links.length < n){
      //picking a random nodes for the source and the target
      var i = ~~ (Math.random() * nodes.length)
        , j = ~~ (Math.random() * nodes.length)
        , new_link

      new_link = {source: register.nodes[i], target: register.nodes[j]}
      register.add_link(new_link)
    }
    return register.links
  }
}


function make_unidirectional_links(register) {
    for (var i = 0, len = register.nodes.length - 1; i < len; i += 2) {
      new_link = {source: register.nodes[i], target: register.nodes[i+1]}
      register.add_link(new_link)
    }
}

function chose_two(arr) {
    var i = ~~ (Math.random() * arr.length)
      , j = i === arr.length - 1 ? i - 1 : i + 1
    return [arr[i], arr[j]]
}
