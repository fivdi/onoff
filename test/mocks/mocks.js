"use strict";

var mockfs = require('mock-fs');

var fs = new mockfs.fs({
  '/sys/class/gpio': {
    'export':'',
  }
});

var GpioMock = function () {};
GpioMock.prototype = fs
var gpiofs = new GpioMock();

var fd_map = {};

gpiofs.writeFileSync = function (path,contents) {
  if(path == '/sys/class/gpio/export') {
    fs.mkdirSync('/sys/class/gpio/gpio' + contents);
    fs.writeFileSync('/sys/class/gpio/gpio' + contents + '/direction','out');
    fs.writeFileSync('/sys/class/gpio/gpio' + contents + '/edge','rise');
    fs.writeFileSync('/sys/class/gpio/gpio' + contents + '/value','0');
  }
  return fs.writeFileSync(path,contents);
}

gpiofs.openSync = function(path,mode) {
  var fd = fs.openSync(path,mode);
  fd_map[path] = fd;
  return fd;
};

var callback_map = {}

var epoll_callback;

var EpollMock = function (callback) {
  this.callback = callback;
};

EpollMock.prototype.add = function(fd) {
  callback_map[fd] = this.callback;
};
EpollMock.prototype.remove = function(fd) {};
EpollMock.prototype.modify = function() {};

EpollMock._change = function(path,contents) {
    fs.writeFileSync(path,contents);
    var fd = fd_map[path];
    callback_map[fd](undefined,fd,undefined);
};

module.exports.gpiofs = gpiofs
module.exports.EpollMock = EpollMock
