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

  it('ignores exceptions thrown by setActiveLow', () => {
    const setActiveLow = Gpio.prototype.setActiveLow;
    Gpio.prototype.setActiveLow = () => {
      throw new Error();
    };

    const expected = '';
    let actual;

    try {
      gpio = new Gpio(pin, 'out', {activeLow: true});
      actual = '';
    } catch (err) {
      actual = 'error thrown by setActiveLow was not ignored';
    }

    Gpio.prototype.setActiveLow = setActiveLow;

    assert.deepEqual(actual, expected);
  });

  it('ignores exceptions thrown by setDirection', () => {
    const setDirection = Gpio.prototype.setDirection;
    Gpio.prototype.setDirection = () => {
      throw new Error();
    };

    const expected = '';
    let actual;

    try {
      gpio = new Gpio(pin, 'out');
      actual = '';
    } catch (err) {
      actual = 'error thrown by setDirection was not ignored';
    }

    Gpio.prototype.setDirection = setDirection;

    assert.deepEqual(actual, expected);
  });

  it('ignores exceptions thrown by setEdge', () => {
    const setEdge = Gpio.prototype.setEdge;
    Gpio.prototype.setEdge = () => {
      throw new Error();
    };

    const expected = '';
    let actual;

    try {
      gpio = new Gpio(pin, 'in', 'both');
      actual = '';
    } catch (err) {
      actual = 'error thrown by setEdge was not ignored';
    }

    Gpio.prototype.setEdge = setEdge;

    assert.deepEqual(actual, expected);
  });

  it('does not unnecessarily reconfigure direction', () => {
    let setDirectionCalled = false;

    const setDirection = Gpio.prototype.setDirection;
    Gpio.prototype.setDirection = () => {
      setDirectionCalled = true;
    };

    gpio = new Gpio(pin, 'in', {reconfigureDirection: false});

    Gpio.prototype.setDirection = setDirection;

    assert(!setDirectionCalled);
  });

  it('reconfigures direction if necessary', () => {
    let setDirectionCalled = false;

    const setDirection = Gpio.prototype.setDirection;
    Gpio.prototype.setDirection = () => {
      setDirectionCalled = true;
    };

    gpio = new Gpio(pin, 'high', {reconfigureDirection: false});

    Gpio.prototype.setDirection = setDirection;

    assert(setDirectionCalled);
  });


  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});

