sandwich = require('sandwich')

run_links = require('./links/remove')

var loops = [true, false]
  , directed = [true, false]
  , multiedge = [true, false]
  , options = sandwich(loops, directed, multiedge)


args = options.next()
run_links()
