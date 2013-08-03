module.exports = Link

function Link(loops, directed, multiedge) {
  this._directed = directed
  this._allow_loops = loops
  this._multiedge = multiedge

  this.links = []
  this.nodes = []
  this.register = {}
}


var cons = Link
  , proto = cons.prototype

proto.constructor = cons

// initalize a new register with a force, and the attribute you wnt to use to
// name nodes immutably (links are named by the index attributes of their
// source and their target.).

proto.init = function(force, index_attr) {
  this.force = force 
  this.index_attr = index_attr 

  // links is a reference to the shallow copy of the links array.
  this.links = this.force.links()

  for(var i = 0, len = this.links.length; i < len; ++i) {
    this.register_link(this.links[i])
  }
  return this
}


// links are named based on their index_attr
proto.name = function(link) {
  // could also hash the object
  return link.source[this.index_attr] + "," + link.target[this.index_attr]
}

// add the link to the register
proto.register_link = function(link) {
  var name = this.name(link)
  var reverse 

  if(this.has(link) && this._multiedge) {
    this.register[name].count += 1
    return true
  } else if(this.has(link)) {
    return false
  }

  if(this._multiedge) {
    link.count = 1
  }

  this.register[name] = link
  if(!this._directed) {
    this.register[name.split(',').reverse().join(',')] = link
  }
  return true
}

// Check if the link is in the array. Respects whether the graph is directed.
// If the graph allows multiple edges, returns the multiplicity of the edge.
proto.has = function(link) {
  var name = typeof link === 'string' ? link : this.name(link)
    , reverse_name
    , out

  if(this.register[name] !== undefined) {
    return !this._multiedge || this.register[name].count
  }

  reverse_name = name.split(',').reverse().join()
  if(!this._directed && (this.register[reverse_name] !== undefined)) {
      return !this.multiedge || this.register[name].count
  }

  return false
}

// Check for equality between two links, pays attention to whether the graph is
// directed.
proto.is = function(A, B) {
  var idxattr = this.index_attr
  var directed_match = (A.source[idxattr] === B.source[idxattr]) 
    && (A.target[idxattr] === B.target[idxattr])
  if (this._directed) {
    return directed_match 
  }
  var cross_match = (A.target[idxattr] === B.source[idxattr]) && (A.source[idxattr] = B.target[idxattr])
  return cross_match || directed_match
}

// If the link is in the register, find and return its first index in the link array.
// Otherwise return -1.
proto.index = function(link) {
  var match

  if(!this.has(link)) {
    return -1
  } 

  for(var i = 0, len = this.links.length; i < len; ++i) {
    if(this.is(link, this.links[i])) {
      return i
    }
  }
}

// Add a new link. If the graph does not allow multiple edges, check first to
// make sure we don't already have it.
proto.add_link = function(link) {
  var name = this.name(link)
    , idx

  if(!this._simple && this.has(name)) {
    return false
  }

  link.source.neighbors.push(link.target)
  link.target.neighbors.push(link.source)
  this.register_link(link)
  this.links.push(link)

  return true
}

// removes the link, once. If the graph is not directed, will not know the
// difference between a link and its reverse. Can also take an array or a
// single link.
proto.remove_link = function(link) {
  var reverse 
  if(!link.length) {
    link = [link]
  }

  if (this._directed) {
    return remove_link.apply(this, link)
  }

  reverse = link.map(function(d) {
    return {target: d.source, source: d.target}
  })

  return remove_link.apply(this, link) || remove_link.apply(this, reverse)
}

function remove_link(link) {
  var index 
  if(!this.has(link)) {
    console.log("HELLO")
    // screw it!
    return false
  }

  index = this.index(this.register[this.name(link)])
  delete this.register[this.name(link)]
  // find the element in the links array and remove it
  this.links.splice(index, 1)

  return true
}
