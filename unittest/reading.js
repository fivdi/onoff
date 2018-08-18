'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('reading', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'out');
  });

  describe('read', () => {

    it('success', (done) => {
      MockLinux.write(pin, '1');
      gpio.read((error, value) => {
        assert.deepEqual(value, 1);
        done();
      });
    });

  });

  describe('readSync', () => {

    it('success', () => {
      MockLinux.write(pin, '1');
      assert.deepEqual(gpio.readSync(), '1');
    });

  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});
