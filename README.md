# Reload My Tab

This project is two things:
1. a node webserver that uses node-static and watchr to a) server static files in a directory and b) watch files for changes in the same directory and ping Firefox when this happens using an http request like 'http://localhost:9009/reload?u=<some-url>'
2. and add-on for Firefox that listens as an http server on a port and listens for requests from the node script like this

#### Requirements:

* node.js
* a recent version of Firefox ( tested on Nightly )

To use:
1. clone the repo and run npm install in the directory
1. install the xpi. In the reload-my-tab add-ons preferences, note the listen server.
1. in a terminal cd to your web root and run server.js:

    Usage: node ./server.js --dir=<site root> --url=<firefox url>
    Options:
      --dir  [required]
      --url  [required]



