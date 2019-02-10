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
        'active_low': '',
        'value': '',
      }
    }
  });
}

function read(pin) {
  return fs.readFileSync('/sys/class/gpio/gpio4/value', { encoding: 'UTF-8' });
}

function write(pin, value) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/value`, value);
}

function restore() {
  mockFs.restore();
}

exports.gpio = gpio;
exports.write = write;
exports.read = read;
exports.restore = restore;
