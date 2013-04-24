
//loading app and setting up some dummy data

suite('LinkRegister:', function(){
  var LinkRegister = require("./LinkRegister")
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

  test("has nodes", function(){
    assert.notDeepEqual(register.nodes, undefined)
  })
  test("has links", function(){
    assert.notDeepEqual(register.links, undefined)
  })
  test("has names", function(){
    assert.notDeepEqual(register.name, undefined)
  })
  test("has has", function(){
    assert.notDeepEqual(register.has, undefined)

  })
  test("has add", function(){
    assert.notDeepEqual(register.add, undefined)

  })
  test("has ready", function(){
    assert.notDeepEqual(register.ready, undefined)
  })

  test("nodes all have idx", function(){
    register.nodes.forEach(
      function(d, i){ 
        assert.notDeepEqual(d.idx, undefined, "node " + i + " has no idx attribute" )
      }
    )
  })

  test("no repeated indices", function(){
    expected = register.nodes.length
    result = register.nodes.reduce(function(a, b){
      if (a.indexOf(b.idx) === -1){
          a.push(b)
      }
      return a
    }, [])
    assert.deepEqual(result.length, expected, register.nodes)
  })

  test('register.index', function(){
    var L = {'source': register.nodes[0], 'target': register.nodes[1]}
    register.add(L)

    var expected = 0
      , result = register.index(L)
    assert.deepEqual(expected, result, "didn't get the right index")
  })

  test("add links", function(){
    while (register.links.length < 30){
      //picking a random element of nodes
      var i = ~~ (Math.random() * nodes.length)
        , j = ~~ (Math.random() * nodes.length)
        , new_link

      new_link = {source: register.nodes[i], target: register.nodes[j]}
      register.add(new_link)

      assert(register.register[register.name(new_link)], "link was not added to links")
      
      //this needs to check for indices instead
      assert(register.has(new_link), new_link + "was not addd to register.links")
      assert.notDeepEqual(register.index(new_link), -1, new_link + "was not addd to register.links")
    }
  })

  test("remove a link", function(){
    //remove a few links:
    var n = 2
 
    for (var i = 0; i < n; ++i){
      link_index = ~~ (Math.random() * register.links.length)
      var L = register.links[i]
      register.remove(L)
      //now make sure the link is not in the register
      assert.deepEqual(register.register[register.name(L)], null)
      assert.deepEqual(register.links.indexOf(L), -1)
    }
  })

