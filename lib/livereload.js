var path = require('path');
var fs = require('fs-extra');
var livereload = require('better-livereload');

var serverPath = path.join(__dirname, '..', 'builds', 'develop');

var server = livereload.createServer();
fs.ensureDirSync(serverPath);
server.watch(serverPath);
