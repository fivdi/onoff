'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('setActiveLow', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });


  it('is active high', () => {
    gpio.setActiveLow(true);
    const actual = MockLinux.readActiveLow(pin);
    assert.deepEqual(actual, 1);
  });

  it('is active low', () => {
    gpio.setActiveLow(false);
    const actual = MockLinux.readActiveLow(pin);
    assert.deepEqual(actual, 0);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

