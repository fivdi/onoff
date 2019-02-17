'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('edge', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in');
  });


  it('is rising', () => {
    const expected = 'rising';
    MockLinux.writeEdge(pin, expected);
    const actual = gpio.edge();
    assert.deepEqual(actual, expected);
  });

  it('is falling', () => {
    const expected = 'falling';
    MockLinux.writeEdge(pin, expected);
    const actual = gpio.edge();
    assert.deepEqual(actual, expected);
  });

  it('is both', () => {
    const expected = 'both';
    MockLinux.writeEdge(pin, expected);
    const actual = gpio.edge();
    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

