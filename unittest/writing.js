'use strict';

const assert = require('assert');
const fs = require('fs');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('writing', () => {
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
    gpio = new Gpio(4, 'in');
  });

  describe('write', () => {

    it('success', (done) => {
      const actual = 1;
      gpio.write(actual, (error) => {
        const computed = fs.readFileSync('/sys/class/gpio/gpio4/value', { encoding: 'UTF-8' });
        assert.deepEqual(actual, computed);
        done();
      });
    });

  });

  describe('writeSync', () => {

    it('success', () => {
      const actual = 1;
      gpio.writeSync(actual);
      const computed = fs.readFileSync('/sys/class/gpio/gpio4/value', { encoding: 'UTF-8' });
      assert.deepEqual(actual, computed);
    });

  });

  afterEach(() => {
    gpio.unexport();
    mockFs.restore();
  });
});
