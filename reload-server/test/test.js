var fs = require('fs'),
  path = require('path'),
  optimist = require('optimist');

var DELAY = 5000; // 5 second pulses
var files = [];
var dirs = [];

function getName(n, dir) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for( var i=0; i < n; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  if (dir === void 0) {
    text += '.txt';
  }
  return text;
}

function getRand(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function addFile(root) {
  var _name = getName(10);
  var _path = path.resolve(root, getRand(dirs, _name));
  fs.writeFile(path, '**', function(e, r) {
    if (e) throw e;
    files.push(path);
    console.log('created file at %s', path);
  });
}

function addDir(root) {
  var _name = path.resolve(root, getName(5, true));
  fs.mkdir(_name, function(e, r) {
    if(e) throw e;
    dirs.push(_name);
    console.log('created directory %s', _name);
  });
}

function touchFile() {
  if (files.length === 0) {
    console.log('no files yet - bailing');
    return;
  }
  var _name = getRand(files);
  fs.fileExists(_name, function(e, r) {
    // if (e) throw e; 
    console.log('skipping, no file');
    fs.appendFile(_name, '', function(e, r) {
      if (e) throw e;
      console.log('touched %s', _name);
    });
  });
}

function run(root) {
  getRand([touchFile, addDir, addFile]).call(root);
}

if (!module.parent) {
  var root = optimist.argv.dir;
  // console.log(root);
  run(root);
  setInterval(run, 5000);
}
