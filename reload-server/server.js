var static = require('node-static');
var util = require('util'),
  request = require('request'),
  _ = require('underscore'),
  url = require('url');

var PORT = 8080;

//
// Create a node-static server instance to serve the './public' folder
//
var default_config = {};

if (!module.parent) {
  var argv = require('optimist').argv;
  var config = {
    path: argv.dir,
    listener: function(e) {
      console.log('changed: %s', e);
      console.log(argv.url);
      var parsed = url.parse(argv.url);
      parsed.search = util.format('u=%s:%d/', 'http://localhost', PORT);
      target = url.format(parsed);
      if (target) {
        console.log('GET %s', target);
        request(target, function (e, r, b) {
          console.log('in callback: %s', r.statusCode);
          if (!e && r.statusCode == 200) {
            console.log(r.body);
          }
        });
      }
    }
  };

  var file = new static.Server(argv.dir);

  require('http').createServer(function (request, response) {
      request.addListener('end', function () {
        var now = new Date();
        console.log('%s %s: %s', now.toString(), request.method, request.url);
        file.serve(request, response);
      }).resume();
  }).listen(PORT);

  // console.log(argv, config);

  require('watchr').watch(config);
}
