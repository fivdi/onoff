'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');
const MockLinux = require('./mocks/linux');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;

describe('watch callbacks', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
  });

  describe('watch', () => {

    it('fires rising', (done) => {
      gpio = new Gpio(pin, 'in', 'both');

      const expected = 1;
      MockLinux.write(pin, expected);
      gpio.watch((err, actual) => {
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('fires falling', (done) => {
      gpio = new Gpio(pin, 'in', 'both');

      const expected = 0;
      MockLinux.write(pin, expected);
      gpio.watch((err, actual) => {
        assert.deepEqual(actual, expected);
        done();
      });
    });

  });

  describe('watch with debounce', () => {

    it('fires rising', (done) => {
      gpio = new Gpio(pin, 'in', 'both', {debounceTimeout: 10});

      const expected = 1;
      MockLinux.write(pin, expected);
      gpio.watch((err, actual) => {
        assert.deepEqual(actual, expected);
        done();
      });
    });

    it('fires falling', (done) => {
      gpio = new Gpio(pin, 'in', 'both', {debounceTimeout: 10});

      const expected = 0;
      MockLinux.write(pin, expected);
      gpio.watch((err, actual) => {
        assert.deepEqual(actual, expected);
        done();
      });
    });

  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

