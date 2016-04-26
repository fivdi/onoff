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

var epoll_callback;

var EpollMock = function (callback) {
  epoll_callback = callback;
};

EpollMock.prototype.add = function() {};
EpollMock.prototype.remove = function() {};

var rewire = require('rewire');
var onoff = rewire('../onoff');

onoff.__set__('fs',gpiofs);
onoff.__set__('Epoll',EpollMock);

var assert = require('assert');

describe('Gpio',function () {
  it('should wait for interrupt', function (done) {

    var Gpio = onoff.Gpio;
    var button = new Gpio(4, 'in', 'both');

    assert(button.direction() === 'in');
    assert(button.edge() === 'both');

    button.watch(function (err, value) {
      if (err) {
        throw err;
      }

      assert(value === 1);

      button.unexport();

      done();
    });
    setTimeout(function() {
      fs.writeFileSync('/sys/class/gpio/gpio4/value','1');
      epoll_callback(undefined,fd_map['/sys/class/gpio/gpio4/value'],undefined);
    })
  })
})
