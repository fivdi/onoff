'use strict';

const assert = require('assert');
const MockLinux = require('./mocks/linux');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('writeSync', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });


  it('writes high', () => {
    const expected = 1;
    gpio.writeSync(expected);
    const actual = MockLinux.read(pin);
    assert.deepEqual(actual, expected);
  });

  it('writes low', () => {
    const expected = 0;
    gpio.writeSync(expected);
    const actual = MockLinux.read(pin);
    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

