module.exports = ForceManager 

var Link = require('./lib/link')
// Class to handle link manipulations for D3 linked graphs.

function ForceManager(loops, directed, simple){
  this._allow_loops = false
  this._directed = false

  Link.call(this, loops, directed, simple)
}

var cons = LinkRegister
  , proto = cons.prototype = new Link

proto.constructor = cons

proto.init = function(force, index_attr) {
  // need to call the parents init method in her
  this.force = force || {links: identity, nodes: identity}
  this.index_attr = index_attr || 'register_index'

  Link.init.call(this, this.force, this.index_attr)

  this._max_idx = 0
  this.add_nodes(this.nodes)
  this.add_links(this.links)

  this.force
    .nodes(this.nodes)
    .links(this.links)

  return this.force 
}


proto.add_node = function(nodes) {
  if(nodes.length) {
    nodes.forEach(check_shape, this)
    this.nodes = this.nodes.concat(nodes)
  } else {
    check_shape.call(this, node)
    this.nodes.push(node)
  }
  return this
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

function identity(a){
  return a 
}


function check_shape(node) {
  if (node[this.index_attr] > this._max_idx) {
    this._max_idx = nodes[this.index_attr]
    return this
  }

  this._max_idx += 1
  node[this.index_attr] = this._max_idx
}

