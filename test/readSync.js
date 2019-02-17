'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('readSync', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'out');
  });


  it('reads high', () => {
    const expected = 1;
    MockLinux.write(pin, expected);
    const actual = gpio.readSync();
    assert.deepEqual(actual, expected);
  });

  it('reads low', () => {
    const expected = 0;
    MockLinux.write(pin, expected);
    const actual = gpio.readSync();
    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

