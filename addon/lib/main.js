const prefs = require('simple-prefs').prefs;
const url = require('url');
const DEBUG = prefs.debug;
const tabs = require('tabs');
const windows = require('windows').browserWindows;

var L = console.log;

var D = function(s) {
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
	if (tab.url.indexOf(target_uri) !== -1) {
		_current_tab = tab;
		_current_win = windows.activeWindow;
	}
	return;
});

tabs.on('close', function(tab) {
	if (tab.url.indexOf(target_uri) !== -1) {
		_current_tab = false;
		_current_win = false;
	}
});

function activateOrOpen(uri) {
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
let listen_port = prefs.listen_port || "9999";

D(listen_port);

let { startServerAsync } = require("sdk/test/httpd");
let srv = startServerAsync(listen_port);

require("unload").when(function cleanup() {
	srv.stop(function() { 
	  //you should continue execution from this point.
	  return;
	})
});

srv.registerPathHandler("/reload", function handle(request, response) {
	response.setHeader("Content-Type", "application/json", false);

	if (request.queryString) {
		content = request.queryString+"\n";

		// 1. parse query string
		var path = request.queryString.split('=').pop();

		// 2. activate or open
		L('should activate or open this file: '+path);

		// tabs.open(path);
		activateOrOpen(path);
	}
	response.write(content);
});
