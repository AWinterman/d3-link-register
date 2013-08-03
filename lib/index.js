module.exports = ForceManager 

var Node = require('./lib/node')
// Class to handle link manipulations for D3 linked graphs.

function ForceManager(loops, directed, multiedge) {
  var link = Node.call(this, loops, directed, multiedge)
}

var cons = ForceManager 
  , proto = cons.prototype = new Node

proto.constructor = cons

