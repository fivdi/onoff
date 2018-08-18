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

function write(pin, value) {
  fs.writeFileSync(`/sys/class/gpio/gpio${pin}/value`, value);
}

function restore() {
  mockFs.restore();
}

exports.gpio = gpio;
exports.write = write;
exports.restore = restore;
