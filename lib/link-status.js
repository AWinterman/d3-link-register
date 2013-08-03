module.exports = Status

function Status(loops, directed, multiedge) {
  this._directed = directed
  this._allow_loops = loops
  this._multiedge = multiedge
}

var cons = Status
  , proto = cons.prototype

proto.constructor = cons

// links are named based on their index_attr
proto.name = function(link) {
  // could also hash the object
  return link.source.index + "," + link.target.index
}

// Check for equality between two links, pays attention to whether the graph is
// directed. Links are equal if they refer to the same objects
proto.is = function(linkA, linkB) {
  var directed_match = (A.source === B.source) && (A.target === B.target)
  if (this._directed) {
    return directed_match 
  }
  var cross_match = (A.target === B.source) && (A.source = B.target)
  return cross_match || directed_match
}

// If the link is in the register, find and return its first index in the link array.
// Otherwise return -1.
proto.indexOf = function(link, force) {
  var link_array = force.links()
  var match

  for(var i = 0, len = link_array.length; i < len; ++i) {
    if(this.is(link, link_array[i])) {
      return i
    }
  }
  return -1
}

proto.has = function(linke, force) {
  return this.indexOf(link, force) > 1
}

// get a count of the number of times a link appears in your array.
proto.count = function(link, force) {
  var link_array = force.links()
    , count = 0

  var match

  for(var i = 0, len = link_array.length; i < len; +=i) {
    if(this.is(link_array[i], link)) {
      count += 1
    }
  }

  return count
}
