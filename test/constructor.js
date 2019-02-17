'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockLinux = require('./mocks/linux');
const MockEpoll = require('./mocks/epoll');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('constructor', () => {
  let gpio;
  let pin;

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
  });


  it('creates input', () => {
    gpio = new Gpio(pin, 'in');

    const expected = 'in';
    const actual = gpio.direction();
    assert.deepEqual(actual, expected);
  });

  it('creates output', () => {
    gpio = new Gpio(pin, 'out');

    const expected = 'out';
    const actual = gpio.direction();
    assert.deepEqual(actual, expected);
  });

  it('creates active low input', () => {
    gpio = new Gpio(pin, 'in', {activeLow: true});

    const expected = true;
    const actual = gpio.activeLow();
    assert.deepEqual(actual, expected);
  });

  it('creates active high input', () => {
    gpio = new Gpio(pin, 'in', {activeLow: false});

    const expected = false;
    const actual = gpio.activeLow();
    assert.deepEqual(actual, expected);
  });

  it('creates input with debounce timeout', () => {
    gpio = new Gpio(pin, 'in', {debounceTimeout: 10});

    const expected = 10;
    const actual = gpio._debounceTimeout;
    assert.deepEqual(actual, expected);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

