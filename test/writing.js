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
      const expected = 1;
      gpio.write(expected, (error) => {
        const actual = MockLinux.read(pin);
        assert.deepEqual(actual, expected);
        done();
      });
    });

  });

  describe('writeSync', () => {

    it('success', () => {
      const expected = 1;
      gpio.writeSync(expected);
      const actual = MockLinux.read(pin);
      assert.deepEqual(actual, expected);
    });

  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});
