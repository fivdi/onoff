'use strict';

const assert = require('assert');
const mockRequire = require('mock-require');
const MockEpoll = require('./mocks/epoll');
const MockLinux = require('./mocks/linux');

mockRequire('epoll', MockEpoll);
const Gpio = require('../onoff').Gpio;


describe('watching', () => {
  let gpio;
  let pin;

  const listener1 = (err, value) => {
    if (err) {
      throw err;
    }
    console.log(`listener1: value is ${value}`);
  }

  const listener2 = (err, value) => {
    if (err) {
      throw err;
    }
    console.log(`listener2: value is ${value}`);
  }

  beforeEach(() => {
    pin = 4;
    MockLinux.gpio(pin);
    gpio = new Gpio(pin, 'in', 'both');
  });

  describe('watch', () => {

    it('no listeners', () => {
      assert.deepEqual(gpio._listeners.length, 0);
    });

    it('one listener', () => {
      gpio.watch(listener1);
      assert.deepEqual(gpio._listeners.length, 1);
    });

    it('one listener multiple times', () => {
      gpio.watch(listener1);
      gpio.watch(listener1);
      assert.deepEqual(gpio._listeners.length, 2);
    });

    it('multiple listeners', () => {
      gpio.watch(listener1);
      gpio.watch(listener2);
      assert.deepEqual(gpio._listeners.length, 2);
    });
  });

  describe('unwatch', () => {

    it('no listeners', () => {
      gpio.unwatch(listener1);
      assert.deepEqual(gpio._listeners.length, 0);
    });

    it('one listener', () => {
      gpio.watch(listener1);
      gpio.unwatch(listener1);
      assert.deepEqual(gpio._listeners.length, 0);
    });

    it('one listener, all referneces', () => {
      gpio.watch(listener1);
      gpio.watch(listener1);
      gpio.unwatch(listener1);
      assert.deepEqual(gpio._listeners.length, 0);
    });

    it('mutliple listeners, only remove one', () => {
      gpio.watch(listener1);
      gpio.watch(listener2);
      gpio.unwatch(listener1);
      assert.deepEqual(gpio._listeners.length, 1);
    });
  });

  describe('unwatchAll', () => {

    it('no listeners', () => {
      gpio.unwatchAll();
      assert.deepEqual(gpio._listeners.length, 0);
    });


    it('one listener multiple times', () => {
      gpio.watch(listener1);
      gpio.watch(listener1);
      gpio.unwatchAll(listener1);
      assert.deepEqual(gpio._listeners.length, 0);
    });

    it('multiple listeners', () => {
      gpio.watch(listener1);
      gpio.watch(listener2);
      gpio.unwatchAll();
      assert.deepEqual(gpio._listeners.length, 0);
    });
  });

  afterEach(() => {
    gpio.unexport();
    MockLinux.restore();
  });
});
