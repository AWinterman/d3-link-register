// Class to handle link manipulations for D3 linked graphs.
module.exports = LinkRegister

function LinkRegister(force, links, nodes, index_attr){
  this.force = force
  this.links = links || []
  this.nodes = nodes || []
  this.index_attr = index_attr || 'index'
  this.register = {}

  this._allow_loops = false
  this._directed = false

  this.ensure_shape()
}

var cons = LinkRegister
  , proto = cons.prototype

// if nodes don't have an index, assign them one. If you did not set the third
// argument when you initialized the register, it defaults to "index"
// Careful here, this will modify your node objects! 

// links are nmaed based on their index_attr
proto.name = function(link){
  return link.source[this.index_attr] + "," + link.target[this.index_attr]
}

proto.allow_loops = function(bool){
  this._allow_loops = bool || this._allow_loops
  var out = arguments.length ? this : this._allow_loops 
  return out
}

proto.directed = function(bool){
  this._directed = bool || this._directed
  var out = arguments.length ? this : this._directed 
  return out
}

proto.index = function(link){
  var source_match 
    , target_match
    , source_to_target
    , target_to_source
  // find the element of the link array whose source[this.index_attr] and target[this.index_attr] attributes
  // match those of the argument
    for (var i = 0, len = this.links.length; i < len; ++i){
       source_match = link.source[this.index_attr] === this.links[i].source[this.index_attr]
       target_match = link.target[this.index_attr] === this.links[i].target[this.index_attr]
       if (!this.directed()) {
         source_to_target = link.source[this.index_attr] === this.links[i].target[this.index_attr]
         target_to_source = link.target[this.index_attr] === this.links[i].source[this.index_attr]
       }
       if ((source_match && target_match) || (source_to_target && target_to_source) ) {
         return i
       }
    }
    return -1
}

proto.has = function(link){
  var name = this.name(link)
    , out
  if (!this.allow_loops()) {
    if (link.target[this.index_attr] === link.source[this.index_attr]) {
      return true
    }
  }
  if (!this.directed()) {
    return (this.register[name] !== undefined) || (this.register[name.split(",").reverse().join()] !== undefined)
  } else {
    return this.register[name] !== undefined 
  }
}
  
// make sure we don't already have the link, if we don't add it.
proto.add_link = function(link) {
  if(!this.has(link)) {
    this.register[this.name(link)] = link
    // the following two lines seem redundant
    this.links.push(link)
    this.force.links(this.links)
    return true
  }
  return false
}

//TODO: add support for non-simple graphs.

proto.add_node = function(node) {
  this.nodes.push(node)
  // the following seem redundant
  this.force.nodes(this.nodes)
  this.ensure_shape()
  return node
}

proto.remove_link = function(link) {
  var reverse 
  if (this.directed()) {
    return remove_link.call(this, link)
  }
  reverse = {target: link.source, source: link.target}
  return remove_link.call(this, link) || remove_link.call(this, reverse)
}

// A function to carry out the removal of links.
function remove_link(link) {
  if(this.has(link)) {
    this.register[this.name(link)] = undefined

    // find the element in the links array and remove it
    this.links.splice(this.index(link), 1)
    this.force.links(this.links)
    return true
  }
  // otherwise we don't need to do anything
  return false
}

proto.orphan_node = function(node) {
  // for each link that ends or begins at the node, remove the link
  var remove
    , link
  for (var name in this.register) {
    // check to see if the i-th link has the node as a target or as a source
    link = this.register[name]
    if (!link){
      continue
    }
    remove = link.target[this.index_attr] === node[this.index_attr] ||
                 link.source[this.index_attr] === node[this.index_attr]
    if (remove) {
      this.remove_link(link)
    }
  }
}

// orphan the node, then remove it from the nodes object
// TODO: add support for operations on arrays to the rest, too
proto.remove_node = function(node) {
  if (node.length) {
    remove_nodes.call(this, node)
  } else {
    remove_nodes.call(this, [node])
  }
}

function remove_nodes(nodes) {
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

proto.init = function(){
  // A convenience function for d3
  // for easy interop with d3
  this.force
    .nodes(this.nodes)
    .links(this.links)
  return this.force 
}  

proto.ensure_shape = function(){
  // unindexed and range both hold indices
  var unindexed = []
    , range = []
    , used = []

  // figuring out the current state of the indices
  this.nodes.forEach(function(d, i){ 
    var idx = d[this.index_attr]
    if (idx !== undefined) {
      used.push(idx)
    } else {
      unindexed.push(i)
    }
    range.push(i)
  }, this)

  // now I want those elements in range that are not used
  range = range.filter(function(d){
    return used.indexOf(d) === -1
  })

  unindexed.forEach(function(d){
    this.nodes[d][this.index_attr] = range.pop()
  }, this)


  return this.nodes
}

