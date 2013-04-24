// Class to handle link manipulations for D3 linked graphs.

module.exports = LinkRegister

function LinkRegister(links, nodes, index_attr){
  this.links = links
  this.nodes = nodes
  this.index_attr = index_attr || 'idx'
  this.register = {}

  this.ensure_shape()
}

var cons = LinkRegister
  , proto = cons.prototype

// if nodes don't have an index, assign them one. If you did not set the third
// argument when you initialized the register, it defaults to "idx"
// Careful here, this will modify your node objects! 

// links are nmaed based on their index_attr
proto.name = function(link){
  return link.source[this.index_attr] + "," + link.target[this.index_attr]
}

proto.index = function(link){
  // find the element of the link array whose source[this.index_attr] and target[this.index_attr] attributes
  // match those of the argument
  for (var i = 0, len = this.links.length; i < len; ++i){
     source_match = link.source[this.index_attr] === this.links[i].source[this.index_attr]
     target_match = link.target[this.index_attr] === this.links[i].target[this.index_attr]
     if (source_match && target_match){
       return i
     }
  }
  return -1
}

proto.has = function(link){
  return !!this.register[this.name(link)]
}
  
// make sure we don't already have the link, if we don't add it.
proto.add = function(link){
  if(!this.has(link)){
    this.register[this.name(link)] = true
    this.links.push(link)
    link.target.linked = true
    link.source.linked = true
    return true
  }
  return false
}

  // remove the attribute from the register
proto.remove = function(link){
  if(this.has(link)){

    //note that links that were once in the register but are no longer now
    //reference the null object
    this.register[this.name(link)] = null

    // find the element in the links array and remove it
    this.links.splice(this.index(link), 1)
    return true
  }
  // otherwise we don't need to do anything
  return false
}

proto.ready = function(d3_graph_force){
  // A convenience function for d3
  // for easy interop with d3
  d3_graph_layout.nodes(this.nodes)
                 .links(this.links)
  return d3_graph_layout
}  


proto.ensure_shape = function(){
  // unindexed and range both hold indices
  var unindexed = []
    , range = []

  for(var i = 0, len = this.nodes.length; i < len; ++i){
    range.push(i)
    // check if the i-th node has an index attribute
    if(this.nodes[i][this.index_attr] === undefined){
      unindexed.push(i)
    } else {
      // then make sure the `i` is not in the range array.
      if (range.indexOf(i) > -1){
        //then we need to remove i from range
        range.splice(i, 1)
      }
    } 
  }

  // for each unindex element, pop an element from range, call it `new_id`, and
  // assign it to the unindexed element
  for(var i = 0, len = unindexed.length; i < len; ++i){
    var new_id = range.pop()
    this.nodes[unindexed[i]][this.index_attr] = new_id
  }

  return this.nodes
}
