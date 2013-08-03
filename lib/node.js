module.exports = Node

var Change = require('./link-change')

var Node(loops, directed, multiedge) {
  Change.call(this, loops, directed, multiedge)
}

var cons = Node
  , proto = cons.prototype = Object.create(Change.prototype)

// simple convenience method to add a new node.
//
// Need to check if this actually updates the array.
proto.add_node = function(node, force) {
  var nodes_array = force.nodes()
  if(node.length) {
    nodes_array = nodes_array.concat(node)
  } else {
    nodes_array.push(node)
  }
  return this
}

// find all the indices for 
proto.find_link_for_node = function(nodes, force) {
  var links = force.links()
    , nodes_array = force.nodes()
    , indices = []
   
  for(var i = 0, len = links.length; i < len; ++i) {
    if(nodes === links[i].target || nodes === links[i].source) {
      indices.push(links[i])
    }
  }
  return indices
}

// orphan the node, then remove it from the nodes object
proto.remove_node = function(node, force) {
  if (node.length) {
    remove_nodes.call(this, node)
  } else {
    remove_nodes.call(this, [node])
  }
}

function remove_nodes(nodes, force) {
  var self = this
  nodes.forEach(function(node) {
    self.orphan_node(node)
    self.nodes.forEach(function(d, i){
      var idx = d[self.index_attr]
      if(idx === node[self.index_attr]) {
        self.nodes.splice(i, 1)
      }
    })
    self.force.nodes(self.nodes)
  })
}
  
proto.orphan_node = function(node, force) {
  var node_array = force.nodes()
    , link_array = force.links()

  // for each link that ends or begins at the node, remove the link
  var remove
    , link

  // iterate through its neighborhood, and remove any link referenced in its.
  node.neighborhood.forEach(function(L) {
    this.remove_link(L)
  })
}

