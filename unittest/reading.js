'use strict';

const assert = require('assert');
const fs = require('fs');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('reading', () => {
  let gpio;

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
    gpio = new Gpio(4, 'out');
  });

  describe('read', () => {

    it('success', (done) => {
      fs.writeFileSync('/sys/class/gpio/gpio4/value', '1');
      gpio.read((error, value) => {
        assert.deepEqual(value, 1);
        done();
      });
    });

    it('error', (done) => {
      gpio.read((error, value) => {
        
        console.log(error);
        done();
      })
    });

  });

  describe('readSync', () => {

    it('success', () => {
      fs.writeFileSync('/sys/class/gpio/gpio4/value', '1');
      assert.deepEqual(gpio.readSync(), '1');
    });

  });

  afterEach(() => {
    gpio.unexport();
    mockFs.restore();
  });
});
