var test = require("tape")
//loading app and setting up some dummy data

var LinkRegister = require("./index")
  , assert = require("assert")
  , nodes = []

nodes.length = 20
for (var i = 0, len = nodes.length; i < len; i = i +  2){
  nodes[i] = {'type': Math.random(), 'value': Math.random()}
  nodes[i+1] = {'type': Math.random(), 'value': Math.random(), 'idx':i}
  //some dummy nodes
}

//initializing register object 
var register = new LinkRegister([], nodes)

test("has nodes", function(t){
  t.plan(1)
  t.notDeepEqual(register.nodes, undefined)
})
test("has links", function(t){
  t.plan(1)
  t.notDeepEqual(register.links, undefined)
})
test("has names", function(t){
  t.plan(1)
  t.notDeepEqual(register.name, undefined)
})
test("has has", function(t){
  t.plan(1)
  t.notDeepEqual(register.has, undefined)

})
test("has add", function(t){
  t.plan(1)
  t.notDeepEqual(register.add, undefined)

})
test("has ready", function(t){
  t.plan(1)
  t.notDeepEqual(register.ready, undefined)
})

test("nodes all have idx", function(t){
  t.plan(register.nodes.length)
  register.nodes.forEach(
    function(d, i){ 
      t.notDeepEqual(d.idx, undefined, "node " + i + " has no idx attribute" )
    }
  )
})

test("no repeated indices", function(t){
  t.plan(1)
  expected = register.nodes.length
  result = register.nodes.reduce(function(a, b){
    if (a.indexOf(b.idx) === -1){
        a.push(b)
    }
    return a
  }, [])

  t.deepEqual(result.length, expected, "result had the wrong lenght")
})

test('register.index', function(t){
  t.plan(1)
  var register = new LinkRegister([], nodes)
  var L = {'source': register.nodes[0], 'target': register.nodes[1]}
  register.add(L)

  var expected = 0
    , result = register.index(L)
  t.deepEqual(expected, result, "didn't get the right index")
})

test("can add links", function(t){
  t.plan(1)
  t.ok(make_links(register, 20, "make links threw an exception"))
})

test("does not duplicate existing links", function(t){
  t.plan(1)

  var register = new LinkRegister([], nodes)
    , i = ~~ (Math.random() * nodes.length)
    , j = ~~ (Math.random() * nodes.length)
    , new_link = {source: register.nodes[i], target: register.nodes[j]}

  register.add(new_link)
  register.add(new_link)
  register.add(new_link)

  t.deepEqual(register.links.length, 1, "there were duplicates")

})

test("remove a link", function(t){
  t.plan(4)
  //remove a few links:
  var register = new LinkRegister([], nodes)
  var n = 2
  make_links(register, 30)
  for (var i = 0; i < n; ++i){
    link_index = ~~ (Math.random() * register.links.length)
    var L = register.links[i]
    register.remove(L)
    //now make sure the link is not in the register
    t.deepEqual(register.register[register.name(L)], null)
    t.deepEqual(register.links.indexOf(L), -1)
  }
})

function make_links(register, n){
  while (register.links.length < 30){
    //picking a random element of nodes
    var i = ~~ (Math.random() * nodes.length)
      , j = ~~ (Math.random() * nodes.length)
      , new_link

    new_link = {source: register.nodes[i], target: register.nodes[j]}
    register.add(new_link)
  }
  return register.links
}
