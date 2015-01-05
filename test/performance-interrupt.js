"use strict";

/*
 * Sets up eight GPIOs as interrupt generating outputs and allows them all to
 * interrupt as fast as they can.
 */
var Gpio = require('../onoff').Gpio,
    // gpioNrs = [36, 37, 38, 39, 44, 45, 46, 47], // BB.
    gpioNrs = [7, 8, 9, 10, 11, 14, 15, 25], // Pi.
    leds = [],
    grandIrqTotal = 0,
    iv;

function exit() {
    var i;

    for (i = 0; i !== leds.length; i += 1) {
        leds[i].unexport();
    }

    clearInterval(iv);
}

function ledStateChanged(err, value) {
    if (err) {
        exit();
    }

    this.irqCount += 1;
    // Trigger next interrupt by toggling led state.
    this.writeSync(value === 0 ? 1 : 0);
}

function setup() {
    var i;

    // Configure all led as interrupt generating outputs.
    for (i = 0; i !== gpioNrs.length; i += 1) {
        leds[i] = new Gpio(gpioNrs[i], 'out', 'both');

        // Add an irqCount property to the leds Gpio.
        leds[i].irqCount = 0;
        leds[i].watch(ledStateChanged.bind(leds[i]));

        // Trigger first interrupt by toggling led state.
        leds[i].writeSync(leds[i].readSync() === 0 ? 1 : 0);
    }

    // Print info about interrupts once a second.
    iv = setInterval(function () {
        var j, subIrqTotal, message = '';

        for (j = subIrqTotal= 0; j !== leds.length; j += 1) {
            message += ', ' + leds[j].irqCount;
            subIrqTotal += leds[j].irqCount;
            leds[j].irqCount = 0;
        }

        grandIrqTotal += subIrqTotal;
        message = grandIrqTotal + ', '  + subIrqTotal + message;
        console.log(message);
    }, 1000);
}

setup();

// Call exit when ctrl-c hit.
process.on('SIGINT', exit);

