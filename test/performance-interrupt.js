"use strict";

/*
 * In this test, GPIO7 is connected to one end of a 1kΩ current limiting
 * resistor and GPIO8 is connected to the other end of the resistor. GPIO7 is
 * an interrupt generating input and GPIO8 is an output. By toggling the state
 * of the output an interrupt is generated. The output is toggled as often as
 * possible to determine the maximum rate at which interrupts can be handled.
 */
const Gpio = require('../onoff').Gpio;
const input = new Gpio(7, 'in', 'both');
const output = new Gpio(8, 'out');

let irqCount = 0;
let iv;

// Exit handler
function exit() {
  input.unexport();
  output.unexport();

  clearInterval(iv);
}
process.on('SIGINT', exit);

// Interrupt handler
input.watch((err, value) => {
  if (err) {
    exit();
  }

  irqCount += 1;

  // Trigger next interrupt by toggling output.
  output.writeSync(value === 0 ? 1 : 0);
});

// Print number of interrupts once a second.
iv = setInterval(() => {
  console.log(irqCount);
  irqCount = 0;
}, 1000);

// Trigger first interrupt by toggling output.
output.writeSync(output.readSync() === 0 ? 1 : 0);

