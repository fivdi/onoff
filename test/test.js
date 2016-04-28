"use strict";

var mocks = require('./mocks/mocks')

var fs = mocks.fs;
var Epoll = mocks.Epoll;

var rewire = require('rewire');
var onoff = rewire('../onoff');
var Gpio = onoff.Gpio;

var path = require('path');

var GPIO_ROOT_PATH = path.join(__dirname,'fs/');

onoff.__set__('GPIO_ROOT_PATH',GPIO_ROOT_PATH);
onoff.__set__('fs',fs);
onoff.__set__('Epoll',Epoll);

var assert = require('assert');

describe('Gpio',function () {

  it('turn on and off sync', function () {
    var led = new Gpio(1, 'out'),
      value;

    assert(led.direction() === 'out');

    led.writeSync(0);
    value = fs.readFileSync(path.join(GPIO_ROOT_PATH,'gpio1','value')).toString().trim();
    assert(value == '0');

    led.writeSync(1)
    value = fs.readFileSync(path.join(GPIO_ROOT_PATH,'gpio1','value')).toString().trim();
    assert(value == '1');

  })
  it('turn on and off async', function (done) {
    var led = new Gpio(1, 'out');

    assert(led.direction() === 'out');


    led.write(0,function(err) {
      assert(err == undefined);
      fs.readFile(path.join(GPIO_ROOT_PATH,'gpio1','value'),function (err,data) {
        assert(err == undefined);
        assert(data.toString().trim() == '0')

        led.write(1,function(err) {
          assert(err == undefined);
          fs.readFile(path.join(GPIO_ROOT_PATH,'gpio1','value'),function (err,data) {

            assert(err == undefined);
            assert(data.toString().trim() == '1')
            done()
          })
        })
      })
    })
  })
  it('should wait for interrupt', function (done) {
    var button = new Gpio(1, 'in', 'both');

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
      Epoll._change(path.join(GPIO_ROOT_PATH,'gpio1','value'),'1');
    })
  })
  it('should interrupt many times', function (done) {
    var button = new Gpio(1, 'in', 'rising', {
      debounceTimeout : 50
    }),
    count = 0;

    assert(button.direction() === 'in');
    assert(button.edge() === 'rising');
    assert(button.options().debounceTimeout === 50);

    var iv = setInterval(function (){
      Epoll._change(path.join(GPIO_ROOT_PATH,'gpio1','value'),'1');
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
      var led = new Gpio(1, 'out');
      led.writeSync(led.readSync() ^ 1);
      led.unexport();
    }
  })

})
