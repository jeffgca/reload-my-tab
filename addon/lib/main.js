const sp = require('simple-prefs');
const url = require('url');
const tabs = require('tabs');
const windows = require('windows').browserWindows;

var listen_port = sp.prefs.listen_port,
	DEBUG = sp.prefs.DEBUG;

var L = console.log,
	D = function(s) {
		if (DEBUG)
			console.log(s);
	}

var { setTimeout } = require('timers');
var tab_is_opening = false;

var target_uri,
	_current_tab,
	_current_win;

// L(prefs.debug, prefs.listen_port);

tabs.on('ready', function(tab) {
	var _url = tab.url.split('?').shift();
	if (_url.indexOf(target_uri) !== -1) {
		_current_tab = tab;
		_current_win = windows.activeWindow;
	}
	return;
});

tabs.on('close', function(tab) {
	var _url = tab.url.split('?').shift();
	if (_url.indexOf(target_uri) !== -1) {
		_current_tab = false;
		_current_win = false;
	}
});

function activateOrOpen(uri) {
	D('opening '+uri);
	if (_current_tab) {
		_current_win.activate();
		_current_tab.activate();
		_current_tab.reload();
		
	}
	else {
		target_uri = uri;
		tabs.open(uri);
	}
}

// run a local web server that accepts requests to refresh a 
// specific tab

let content = "This is the HTTPD test file.\n";

sp.on('listen_port', function() {
	L('setting listen_port to '+sp.prefs.listen_port);
	listen_port = sp.prefs.listen_port;
	srv.stop(function() {
		L('Restarting server...')
		srv = startServerAsync(listen_port);
	});
});

sp.on('DEBUG', function() {
	L('setting DEBUG to '+sp.prefs.DEBUG);
	DEBUG = sp.prefs.DEBUG;
});

// D(listen_port);

var { startServerAsync } = require("sdk/test/httpd"),
	srv = startServerAsync(listen_port);

D('Server listening on port '+listen_port);

require("unload").when(function cleanup() {
	srv.stop(function() { 
	  return;
	})
});

srv.registerPathHandler("/reload", function handle(request, response) {

	// L('Got here: '+request.queryString);

	if (request.queryString) {
		response.setHeader("Content-Type", "application/json", false);

		// 1. parse query string
		var path = request.queryString.split('=').pop();

		// 2. activate or open
		D('should activate or open this file: '+path);

		// tabs.open(path);
		activateOrOpen(path);
		response.write(JSON.stringify({response: 'OK'}));
	}
	else {
		response.write('Error, no query string.');
	}
});
