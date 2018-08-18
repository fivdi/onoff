'use strict';

const assert = require('assert');
const MockLinux = require('./mocks/linux');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('writing', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });

  describe('write', () => {

    it('success', (done) => {
      const actual = 1;
      gpio.write(actual, (error) => {
        const computed = MockLinux.read(pin);
        assert.deepEqual(actual, computed);
        done();
      });
    });

  });

  describe('writeSync', () => {

    it('success', () => {
      const actual = 1;
      gpio.writeSync(actual);
      const computed = MockLinux.read(pin);
      assert.deepEqual(actual, computed);
    });

  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});
