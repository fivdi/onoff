"use strict";

var mocks = require('./mocks/mocks')

var rewire = require('rewire');
var onoff = rewire('../onoff');
var Gpio = onoff.Gpio;

onoff.__set__('fs',mocks.gpiofs);
onoff.__set__('Epoll',mocks.EpollMock);

var assert = require('assert');

describe('Gpio',function () {
  it('turn on and off sync', function () {

    var led = new Gpio(17, 'out'),
      value;

    assert(led.direction() === 'out');


    led.writeSync(0)
    value = mocks.gpiofs.readFileSync('/sys/class/gpio/gpio17/value');
    assert(value == '0');

    led.writeSync(1)
    value = mocks.gpiofs.readFileSync('/sys/class/gpio/gpio17/value');
    assert(value == '1');

  })
  it('turn on and off async', function (done) {

    var led = new Gpio(17, 'out'),
      value;

    assert(led.direction() === 'out');


    led.write(0,function(err) {
      assert(err == undefined);
      mocks.gpiofs.readFile('/sys/class/gpio/gpio17/value',function (err,data) {
        assert(err == undefined);
        assert(data = '0')

        led.write(1,function(err) {
          assert(err == undefined);
          mocks.gpiofs.readFile('/sys/class/gpio/gpio17/value',function (err,data) {
            assert(err == undefined);
            assert(data = '1')
            done()
          })
        })
      })
    })
  })
  it('should wait for interrupt', function (done) {

    var button = new Gpio(4, 'in', 'both');

    assert(button.direction() === 'in');
    assert(button.edge() === 'both');

    button.watch(function (err, value) {
      if (err) {
        throw err;
      }

      assert(value === 1);

      button.unexport();

      done();
    });
    setTimeout(function() {
      mocks.EpollMock._change('/sys/class/gpio/gpio4/value','1');
    })
  })
  it('should interrupt many times', function (done) {
    var button = new Gpio(4, 'in', 'rising', {
      debounceTimeout : 50
    }),
    count = 0;

    assert(button.direction() === 'in');
    assert(button.edge() === 'rising');
    assert(button.options().debounceTimeout === 50);

    var iv = setInterval(function (){
      mocks.EpollMock._change('/sys/class/gpio/gpio4/value','1');
    },100)

    button.watch(function (err, value) {
      if (err) {
        throw err;
      }

      count += 1;

      if (count === 5) {
        button.unexport();
        clearInterval(iv);
        done()
      }
    })
  })

  it('should export many times', function () {
    for (var i = 0; i <= 100; i += 1) {
      var led = new Gpio(17, 'out');
      led.writeSync(led.readSync() ^ 1);
      led.unexport();
    }
  })

})
