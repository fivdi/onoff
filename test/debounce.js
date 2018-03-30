"use strict";

const assert = require('assert');
const Gpio = require('../onoff').Gpio;
const output = new Gpio(8, 'out');
const button = new Gpio(7, 'in', 'both', {debounceTimeout: 10});

let buttonPressedCount = 0;
let buttonReleasedCount = 0;

function simulateToggleButtonStateWithBounce(cb) {
  let toggleCount = 0;

  const iv = setInterval(() => {
    if (toggleCount === 19) {
      clearInterval(iv);
      return cb();
    }

    output.writeSync(output.readSync() ^ 1);
    toggleCount += 1;
  }, 2);
}

function simulatePressAndReleaseButtonWithBounce() {
  simulateToggleButtonStateWithBounce(() => {
    setTimeout(() => {
      simulateToggleButtonStateWithBounce(() => {
        setTimeout(() => {
          assert(buttonPressedCount === 1);
          assert(buttonReleasedCount === 1);

          button.unexport();
          output.unexport();

          console.log('ok - ' + __filename);
        }, 20);
      });
    }, 50);
  });
}

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  if (value === 1) {
    buttonPressedCount += 1;
  } else if (value === 0) {
    buttonReleasedCount += 1;
  }
});

simulatePressAndReleaseButtonWithBounce();

