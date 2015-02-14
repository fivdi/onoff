"use strict";

/*
 * In this test, GPIO #7 is wired to one end of a 1kΩ current limiting
 * resistor and GPIO #8 is wired to the other end of the resistor. GPIO #7 is
 * an interrupt generating input and GPIO #8 is an output.
 * By toggling the state of the output an interrupt is generated.
 * The output is toggled as often as possible to determine the maximum
 * rate at which interrupts can be handled.
 */
var Gpio = require('../onoff').Gpio,
  input = new Gpio(7, 'in', 'both'),
  output = new Gpio(8, 'out'),
  irqCount = 0,
  iv;

// Exit handler
function exit() {
  input.unexport();
  output.unexport();

  clearInterval(iv);
}
process.on('SIGINT', exit);

// Interrupt handler
input.watch(function (err, value) {
  if (err) {
    exit();
  }

  irqCount += 1;

  // Trigger next interrupt by toggling output.
  output.writeSync(value === 0 ? 1 : 0);
});

// Print number of interrupts once a second.
iv = setInterval(function () {
  console.log(irqCount);
  irqCount = 0;
}, 1000);

// Trigger first interrupt by toggling output.
output.writeSync(output.readSync() === 0 ? 1 : 0);

