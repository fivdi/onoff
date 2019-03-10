'use strict';

const assert = require('assert');
const Gpio = require('../onoff').Gpio;

let output = new Gpio(8, 'out');
let input = new Gpio(7, 'in', 'both');

const watchWithSecondConfiguration = () => {
  input.watch((err, value) => {
    assert(!err, 'error during interrupt detection');
    assert(value === 1, 'expected interrupt on rising edge');

    setTimeout(() => {
      input.unexport();
      output.unexport();

      console.log('ok - ' + __filename);
    }, 10);
  });

  output.writeSync(1);
};

const changeConfiguration = () => {
  input.unwatchAll();

  let temp = output;
  temp.setDirection('in');
  output = input;
  input = temp;

  output.setEdge('none');
  output.setDirection('out');
  output.writeSync(0);
  assert(output.direction() === 'out', 'expected direction to be out');
  assert(output.edge() === 'none', 'expected edge to be none');
  assert(output.readSync() === 0, 'expected value to be 0');

  input.setEdge('rising');
  assert(input.direction() === 'in', 'expected direction to be in');
  assert(input.edge() === 'rising', 'expected edge to be rising');
  assert(input.readSync() === 0, 'expected value to be 0');

  watchWithSecondConfiguration();
};

const watchWithFirstConfiguration = () => {
  input.watch((err, value) => {
    assert(!err, 'error during interrupt detection');
    assert(value === 1, 'expected interrupt on rising edge');

    setTimeout(changeConfiguration, 10);
  });

  output.writeSync(1);
};

watchWithFirstConfiguration();
