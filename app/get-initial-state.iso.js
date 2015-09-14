/**
 * Isomorphic App
 * builds and output app's initial state
 */

var request = require('request');
var extend = require('extend');

var appConf = require('../lib/app-conf');

function getInitialState() {
    return new Promise(function(resolve, reject) {
        resolve({settings: appConf});
    });
}
