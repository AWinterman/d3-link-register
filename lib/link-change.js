module.exports = Change

var Status = require('./link-status')

function Change(loops, directed, multiedge) {
  Status.call(this, loops, directed, multiedge)
}

var cons = Change
  , proto = cons.prototype = Object.create(Status.prototype)

proto.constructor = cons

// Add a new link. If the graph does not allow multiple edges, check first to
// make sure we don't already have it.
proto.add_link = function(link, force) {
  var name = this.name(link)
    , idx

  if(!this._simple && this.has(link, force)) {
    return false
  }

  link.source._out_links.push(link)
  link.target._in_links.push(link)

  this.links.push(link)
  return true
}

// removes the link, once. If the graph is not directed, will not know the
// difference between a link and its reverse. Can also take an array or a
// single link.
proto.remove_link = function(link, force) {
  var reverse 

  if(!link.length) {
    link = [link]
  }

  if (this._directed) {
    return remove_link.apply(this, force, link)
  }

  reverse = link.map(function(d) {
    return {target: d.source, source: d.target}
  })

  return remove_link.apply(this, link, force) || remove_link.apply(this, reverse, force)
}

function remove_link(link, force) {
  var index = this.indexOf(link)
  // find the element in the links array and remove it
  if(index === -1) {
    return false
  }

  // 
  target_index = source._out_links.indexOf(link)
  source_index = source._in_links.indexOf(link)

  // remove the source from the targets neighborhood, and the target from the
  // source neighborhood
  this.links[index].source._out_links.splice(target_index, 1)
  this.links[index].target._in_links.splice(source_index, 1)

  this.links.splice(index, 1)
  return true
}

