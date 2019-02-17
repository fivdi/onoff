'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('setDirection', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
  });


  it('is input', () => {
    gpio = new Gpio(pin, 'out');

    const expected = 'in';
    gpio.setDirection(expected);
    const actual = MockLinux.readDirection(pin);
    assert.deepEqual(actual, expected);
  });

  it('is output', () => {
    gpio = new Gpio(pin, 'in');

    const expected = 'out';
    gpio.setDirection(expected);
    const actual = MockLinux.readDirection(pin);
    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

