const sp = require('sdk/simple-prefs');
const url = require('sdk/url');
const tabs = require('sdk/tabs');
const windows = require('sdk/windows').browserWindows;
const { startServerAsync } = require("sdk/test/httpd");

var listen_port = sp.prefs.listen_port,
	DEBUG = sp.prefs.DEBUG;

var L = console.log,
	D = function(s) {
		if (DEBUG)
			console.log(s);
	},
	pp = function(o) { return JSON.stringify(o,null,'  '); };

var { setTimeout } = require('sdk/timers');
var tab_is_opening = false;

var target_uri,
	_current_tab = tabs.activeTab,
	_current_win = windows.activeWindow;

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

function activateOrOpen(uri, callback) {
	var message = '';
	try {
		console.log(_current_tab.url, uri, (_current_tab.url === uri));
		if (_current_tab && _current_tab.url === uri) {
			message = 're-opening tab '+_current_tab.id
			_current_win.activate();
			_current_tab.activate();
			_current_tab.reload();
		}
		else {
			message = 'opening new tab';
			_current_tab = null;
			_current_win = null;
			target_uri = uri;
			tabs.open(uri);
		}
	} catch (e) {
		callback(e);
	}
	console.log(message);
	callback(null, message);
}

// run a local web server that accepts requests to refresh a 
// specific tab

var content = "This is the HTTPD test file.\n";

sp.on('listen_port', function() {
	L('setting listen_port to '+sp.prefs.listen_port);
	listen_port = sp.prefs.listen_port;
	srv.stop(function() {
		L('Restarting server...');
		srv = startServerAsync(listen_port);
	});
});

sp.on('DEBUG', function() {
	L('setting DEBUG to '+sp.prefs.DEBUG);
	DEBUG = sp.prefs.DEBUG;
});

// D(listen_port);


var	srv = startServerAsync(listen_port);

D('Server listening on port '+listen_port);

require("sdk/system/unload").when(function cleanup() {
	srv.stop(function() {
		console.log('Stopping HTTP server for reload-my-tab');
		return;
	});
});

srv.registerPathHandler("/reload", function handle(request, response) {

	if (request.queryString) {
		response.setHeader("Content-Type", "application/json", false);

		// 1. parse query string
		var path = request.queryString.split('=').pop();

		// console.dir(request);

		activateOrOpen(path, function(err, resp) {
			if (err) {
				response.write(JSON.stringify({response: err}));
				return;
			}
			response.write(JSON.stringify({response: resp}));
		});
	}
	else {
		response.write('Error, no query string.');
	}
});
