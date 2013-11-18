/*
 * Sets up eight GPIOs as interrupt generating outputs and allows them all to
 * interrupt as fast as they can.
 */
var Gpio = require('../onoff').Gpio,
    gpioNrs = [36, 37, 38, 39, 44, 45, 46, 47], // BB.
    // gpioNrs = [11, 14, 15, 17, 22, 23, 24, 25], // Pi.
    leds = [],
    grandIrqTotal = 0,
    iv;

function ledStateChanged(err, value) {
    if (err) exit();
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
    iv = setInterval(function() {
        var i, subIrqTotal, message = '';

        for (i = subIrqTotal= 0; i != leds.length; i += 1) {
            message += ', ' + leds[i].irqCount;
            subIrqTotal += leds[i].irqCount;
            leds[i].irqCount = 0;
        }

        grandIrqTotal += subIrqTotal;
        message = grandIrqTotal + ', '  + subIrqTotal + message;
        console.log(message);
    }, 1000);
}

function exit() {
    var i;

    for (i = 0; i != leds.length; i += 1) {
        leds[i].unexport();
    }

    clearInterval(iv);
}

setup();

// Call exit when ctrl-c hit.
process.on('SIGINT', exit);

