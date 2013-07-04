d3-link-register
================

[![Build Status](https://secure.travis-ci.org/AWinterman/d3-link-register.png)](http://travis-ci.org/AWinterman/d3-link-register) 

A class to make working with the data structure expected by D3js graph layouts easier.


The link register provides methods to add and remove links and nodes,
efficiently check if the link is already in the layout and to remove all
links from a node.

The only assumption it currently makes about your graph layout is that if you a
link between a pair of nodes, you want exactly one link. This should probably
be set-able by the user, at some point.

## Installation ##

`npm install d3-link-register`

## Usage ##

Instantiation:

```js
var LinkRegister = require("d3-link-register")

var register  = new LinkRegister(force, links, nodes, index_attr)
```

### Arguments:
- `force`: the object responsible for actually rendering the nodes and links.
  `force` is assumed to have methods `.nodes` and `.links` which are used to set the data
  attributes corresponding to the nodes and links.
- `links`:  An array of objects with attributes `source` and `target`,
  which hold a reference to the nodes the link comes from and the link is
  directed to.
- `nodes`: An array of objects corresponding to the nodes of the graph
- `index_attr`: The attribute the register will use to keep track of which node
  is which. It includes a method (called internally) which will ensure that new
  nodes will be assigned the attribute. It is assumed to have a numerical
  value.

### Attributes:

It maps its arguments to the attributes of the same name. It also instantiates
a `register` attribute, which is an object literals used as a hash from from
the link name (of form "<target>,<source>") to the link itself.

### Methods:

- `register.name(link)`: Compute the name for a link based on the `index_attr` of it's target and source.

- `register.allow_loops(bool)`: Sets a flag to the boolean value of its
  argument.  Setting this to true allows the graph to have loop edges. That is
  it allows the same node to be the target and source of a link. 
  
  False by default.

  **returns** the current value of the flag if no argument is provided,
  otherwise returns the link register itself.

- `register.directed(bool)`: Sets a flag to the boolean value of its argument.
  If true, the graph is held to be directed, that is `link_register` will hold
  the direction of the link to be significant. In a directed graph `{target: A, source: B}` and
  `{target: B, source: A}` are considered to be different links. 
  
  Defaults to false.

  **returns** the current value of the flag if no argument is provided,
  otherwise returns the link register itself.

- `register.index(link)`: Finds the index of the it's argument in the link array by
  looking for a match between the `index_attrs` of `link.target` and
  `link.source`, and an element of the corresponding attributes of an element
  of the existing link array. Does the right thing vis-a-vis the value of
  `register.directed()`
    
  **returns** The index of the link if it is in `register.links`, `-1`
  otherwise.

- `register.has(link)`: A fast check to see if the link currently exists. It
  uses the `register.register` object literal.

- `register.add_link(link)`: If the link is not already in the register, add
  it. It will also updated the `register.force` object with the new link.

  **returns**: `true` if the link was added. `false` otherwise.

- `register.add_node`: Adds a node to the register, and updates the
  `register.force` object. Also makes sure that new nodes have a unique index
   object.

- `register.remove_link(link)`: Removes the supplied link from the register,
  and updates the `register.force` object accordingly. 

- `register.orphan_node(node)`: Removes all links from a given node.  It calls
  `register.remove_link` repeatedly

- `register.remove_node(node)`: Orphans the node and then removes it from the
  nodes array. You can now pass in an array of nodes to be removed.

- `register.init()`: Calls the .nodes and .links methods of the
  `register.force` object with the appropriate arguments. 
  
  **returns** `register.force`

- `register.ensure_shape()`: This method iterates through each node and makes
  sure it has an index. It will not assign a node an index which is already
  used by another node. It now  checks to makes sure the existing
  assignments are 1:1.

  **returns** `register.nodes`

----------

## Compatibility ##

[![browser support](https://ci.testling.com/AWinterman/d3-link-register.png)](https://ci.testling.com/AWinterman/d3-link-register)

### A measure of technical debt ###
See [codebux](https://github.com/substack/codebux) for more info.

    +   100.00  # initial stipend
    -    10.75  # index.js
    -    14.48  # tests.js
    —————————————————————————————————————————————————
    +    74.76



**License: MIT**
