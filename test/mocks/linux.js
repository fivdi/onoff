'use strict';

const mockFs = require('mock-fs');
const fs = require('fs');

function gpio(pin) {
  const name = `gpio${pin}`;
  mockFs({
    '/sys/class/gpio': {
      'export': '',
      'unexport': '',
      [name]: {
        'direction': '',
        'edge': '',
        'active_low': '',
        'value': '',
      }
    }
  });
}

function makeGpioAccessible() {
  mockFs({
    '/sys/class/gpio': {
      'export': ''
    }
  });
}

function makeGpioInaccessible() {
  mockFs({
    '/sys/class/gpio': {
    }
  });
}

function read(pin) {
  return fs.readFileSync('/sys/class/gpio/gpio4/value', { encoding: 'UTF-8' });
}

function write(pin, value) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/value`, value);
}

function readDirection(pin) {
  return fs.readFileSync(`/sys/class/gpio/gpio${pin}/direction`, { encoding: 'UTF-8' });
}

function writeDirection(pin, direction) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/direction`, direction);
}

function readEdge(pin) {
  return fs.readFileSync(`/sys/class/gpio/gpio${pin}/edge`, { encoding: 'UTF-8' });
}

function writeEdge(pin, edge) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/edge`, edge);
}

function readActiveLow(pin) {
  return fs.readFileSync(`/sys/class/gpio/gpio${pin}/active_low`, { encoding: 'UTF-8' });
}

function writeActiveLow(pin, value) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/active_low`, value);
}

function restore() {
  mockFs.restore();
}

exports.gpio = gpio;
exports.makeGpioAccessible = makeGpioAccessible;
exports.makeGpioInaccessible = makeGpioInaccessible;
exports.read = read;
exports.write = write;
exports.readDirection = readDirection;
exports.writeDirection = writeDirection;
exports.readEdge = readEdge;
exports.writeEdge = writeEdge;
exports.readActiveLow = readActiveLow;
exports.writeActiveLow = writeActiveLow;
exports.restore = restore;

