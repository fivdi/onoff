'use strict';

const assert = require('assert');
const fs = require('fs');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('reading', () => {
  let pin;

  beforeEach(() => {
    mockFs({
      '/sys/class/gpio': {
        'export': '',
        'unexport': '',
        'gpio4': {
          'direction': '',
          'active_low': '',
          'value': '',
        }
      }
    });
    pin = new Gpio(4, 'out');
  });

  describe('read', () => {

    it('success', (done) => {
      fs.writeFileSync('/sys/class/gpio/gpio4/value', '1');
      pin.read((error, value) => {
        assert.deepEqual(value, 1);
        done();
      });
    });
    
  });

  describe('readSync', () => {

    it('success', () => {
      fs.writeFileSync('/sys/class/gpio/gpio4/value', '1');
      assert.deepEqual(pin.readSync(), '1');
    });

  });

  afterEach(() => {
    pin.unexport();
    mockFs.restore();
  });
});
