"use strict";

const Gpio = require('../onoff').Gpio;

const assert = require('assert');
const mockfs = require('mock-fs');

mockfs({
  '/sys/class/gpio': {
    'export': '',
    'unexport': '',
    'gpio4': {
      'direction': '',
      'active_low': '',
      'value': '',
    }
  }
});

describe('watching', () => {
  let pin;

  beforeEach(() => {
    pin = new Gpio(4, 'in', 'both');
  });

  describe('watch', () => {

    it('no listeners', () => {
      assert.deepEqual(pin._listeners.length, 0);
    });

    it('one listener', () => {
      pin.watch(listener1);
      assert.deepEqual(pin._listeners.length, 1);
    });

    it('one listener multiple times', () => {
      pin.watch(listener1);
      pin.watch(listener1);
      assert.deepEqual(pin._listeners.length, 2);
    });

    it('multiple listeners', () => {
      pin.watch(listener1);
      pin.watch(listener2);
      assert.deepEqual(pin._listeners.length, 2);
    });
  });

  describe('unwatch', () => {

    it('no listeners', () => {
      pin.unwatch(listener1);
      assert.deepEqual(pin._listeners.length, 0);
    });

    it('one listener', () => {
      pin.watch(listener1);
      pin.unwatch(listener1);
      assert.deepEqual(pin._listeners.length, 0);
    });

    it('one listener, all referneces', () => {
      pin.watch(listener1);
      pin.watch(listener1);
      pin.unwatch(listener1);
      assert.deepEqual(pin._listeners.length, 0);
    });

    it('mutliple listeners, only remove one', () => {
      pin.watch(listener1);
      pin.watch(listener2);
      pin.unwatch(listener1);
      assert.deepEqual(pin._listeners.length, 1);
    });
  });

  describe('unwatchAll', () => {

    it('no listeners', () => {
      pin.unwatchAll();
      assert.deepEqual(pin._listeners.length, 0);
    });


    it('one listener multiple times', () => {
      pin.watch(listener1);
      pin.watch(listener1);
      pin.unwatchAll(listener1);
      assert.deepEqual(pin._listeners.length, 0);
    });

    it('multiple listeners', () => {
      pin.watch(listener1);
      pin.watch(listener2);
      pin.unwatchAll();
      assert.deepEqual(pin._listeners.length, 0);
    });
  });

  afterEach(() => {
    pin.unexport();
    mockfs.restore();
  });

  function listener1(err, value) {
    if (err) {
      throw err;
    }
    console.log(`listener1: value is ${value}`);
  }

  function listener2(err, value) {
    if (err) {
      throw err;
    }
    console.log(`listener2: value is ${value}`);
  }

});