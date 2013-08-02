module.exports = Link

function Link(loops, directed, simple) {
  this._directed = directed
  this._allow_loops = loops
  this._simple = simple
}


var cons = Link
  , proto = cons.prototype

proto.constructor = cons

proto.init = function(force, index_attr) {
  this.force = force 
  this.index_attr = index_attr 
  this.register = {}

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

proto.register_link = function(link) {
  this.register[this.name(name)] = link
}


proto.has = function(link) {
  var name = typeof link === 'string' ? link : this.name(link)
    , out

  if (this.register[name] !== undefined) {
    return true
  }

  if (!this._directed ) {
    return this.register[name.split(",").reverse().join()] !== undefined
  }

  return false
}

proto.is = function(A, B) {
  var directed_match = (A.source === B.source) && (A.target === B.target)
  if (directed) {
    return directed_match 
  }
  var cross_match = (A.target === B.source) && (A.source = B.target)
  return cross_match || directed_match
}

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

// make sure we don't already have the link, if we don't add it.
proto.add_link = function(link) {
  var name = this.name(link)
    , idx

  if(!this._simple && this.has(name)) {
    return false
  }

  this.register_link(link)
  this.links.push(link)

  return true
}

// removes the link, once.
proto.remove_link = function(link) {
  var reverse 

  if (this._directed) {
    return remove_link.call(this, link)
  }

  reverse = {target: link.source, source: link.target}
  return remove_link.call(this, link) || remove_link.call(this, reverse)
}

function remove_link(link) {
  var index 
  if(!this.has(link)) {
    // screw it!
    return false
  }

  index = this.index(this.register[this.name(link)])

  delete this.register[this.name(link)]
  // find the element in the links array and remove it
  this.links.splice(index, 1)

  return true
}
