// Class to handle link manipulations for D3 linked graphs.
module.exports = LinkRegister

function LinkRegister(force, links, nodes, index_attr){
  this.force = force
  this.links = links || []
  this.nodes = nodes || []
  this.index_attr = index_attr || 'index'
  this.register = {}

  this._circular_links = false
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

proto.circular_links = function(bool){
  this._circular_links = bool || this._circular_links
  var out = arguments.length ? this : this._circular_links 
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
  if (!this.circular_links()) {
    if (link.target[this.index_attr] === link.source[this.index_attr]) {
      return true
    }
  }
  if (!this.directed()) {
    return !!this.register[name] || !!this.register[name.split().reverse().join()]
  } else {
    return !!this.register[name] 
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

//TODO: add functionallity so you can decide whether you care if a link to and
// from the same node already exists. There should also be something that tells
// you how many redundant links there are.

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
    //note that links that were once in the register but are no longer now
    //reference the null object
    this.register[this.name(link)] = null

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
    if (link === null){
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
proto.remove_node = function(node) {
  var idx
  this.orphan_node(node)
  this.nodes.forEach(function(d, i){
    idx = d[this.index_attr]
    if(idx === node[this.index_attr]) {
      this.nodes.splice(i, 1)
    }
  }, this)
  this.force.nodes(this.nodes)
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

