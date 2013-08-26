const sp = require('simple-prefs');
const url = require('url');
const tabs = require('tabs');
const windows = require('windows').browserWindows;
const { startServerAsync } = require("sdk/test/httpd");

var listen_port = sp.prefs.listen_port,
	DEBUG = sp.prefs.DEBUG;

var L = console.log,
	D = function(s) {
		if (DEBUG)
			console.log(s);
	},
	pp = function(o) { return JSON.stringify(o,null,'  ')};

var { setTimeout } = require('timers');
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
	L(pp([_current_tab.url, uri]));

	if (_current_tab && _current_tab.url === uri) {
		_current_win.activate();
		_current_tab.activate();
		_current_tab.reload();
	}
	else {
		_current_tab = null;
		_current_win = null;
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


var	srv = startServerAsync(listen_port);

D('Server listening on port '+listen_port);

require("unload").when(function cleanup() {
	srv.stop(function() { 
		console.log('Stopping HTTP server for reload-my-tab');
	  return;
	})
});

function toFileUri(localPath) {
    let file = Cc["@mozilla.org/file/local;1"].
           createInstance(Ci.nsILocalFile);

    file.initWithPath(localPath);
    let { Services } = Cu.import("resource://gre/modules/Services.jsm");
    let url = Services.io.newFileURI(file);
    return url.spec;
}

srv.registerPathHandler("/reload", function handle(request, response) {

	if (request.queryString) {
		response.setHeader("Content-Type", "application/json", false);

		// 1. parse query string
		var path = request.queryString.split('=').pop();

		console.log(toFileUri(path));


		activateOrOpen(path, function(err, resp) {
			if (err) { 
				response.write(JSON.stringify({response: err}));
			}	
			response.write(JSON.stringify({response: 'OK'}));
		});
	}
	else {
		response.write('Error, no query string.');
	}
});
