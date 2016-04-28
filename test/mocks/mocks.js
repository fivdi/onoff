"use strict";

var fs = Object.assign({},require('fs'));

var fd_map = {};

var o_openSync = fs.openSync;

fs.openSync = function(path,mode) {
  var fd = o_openSync(path,mode);
  fd_map[path] = fd;
  return fd;
};

var callback_map = {}

var Epoll = function (callback) {
  this.callback = callback;
};

Epoll.prototype.add = function(fd) {
  callback_map[fd] = this.callback;
};
Epoll.prototype.remove = function() {};
Epoll.prototype.modify = function() {};

Epoll._change = function(path,contents) {
  var fd = fd_map[path];
  fs.writeFileSync(path,contents);
  callback_map[fd](undefined,fd,undefined);
};

module.exports.fs = fs
module.exports.Epoll = Epoll
