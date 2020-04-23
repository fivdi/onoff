'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('activeLow', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'out');
  });


  it('is active high', () => {
    MockLinux.writeActiveLow(pin, '1');
    const actual = gpio.activeLow();
    assert.deepEqual(actual, true);
  });

  it('is active low', () => {
    MockLinux.writeActiveLow(pin, '0');
    const actual = gpio.activeLow();
    assert.deepEqual(actual, false);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

