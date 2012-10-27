## onoff

GPIO based I/O and interrupt detection with Node.js on Linux boards such as the
BeagleBone or Raspberry Pi

## Installation

    $ npm install onoff

## Blink the LED on GPIO #17 forever

```js
var onoff = require('onoff'),
    ledGpio = 17,
    nextLedState = 1;

onoff.configure(ledGpio, 'out', function (err) {
    if (err) throw err;

    setInterval(function() {
        onoff.value(ledGpio, nextLedState);
        nextLedState = nextLedState === 1 ? 0 : 1;
    }, 200);
});
```

## Wait for the button on GPIO #18 to interrupt

```js
var onoff = require('onoff'),
    buttonGpio = 18;

onoff.configure(buttonGpio, 'in', 'both', function (err) {
    if (err) throw err;
    console.log('Please press the button on GPIO 18...');
    onoff.watch(buttonGpio, function (err, value) {
        if (err) throw err;
        console.log('Button pressed!, its value was ' + value);
        onoff.unexp(buttonGpio);
    });
});
```

## Info

onoff has been tested on the BeagleBone (Ångström) and Raspberry Pi (Raspbian).
The suitability of onoff for a particular Linux board is highly dependent on
how GPIO interfaces are made available on that board. The document describing
[GPIO interfaces](http://www.kernel.org/doc/Documentation/gpio.txt) speaks of
GPIO access conventions on Linux. The word conventions is important here. For
example, onoff relies on sysfs files located at /sys/classes/gpio being
available. However, these sysfs files for userspace GPIO are optional and may
not be available on a particular platform.

As its name hopefully indicates, onoff can be used for turing things on and off
at a "reasonable" frequency. It's not suitable for
[bit banging](http://en.wikipedia.org/wiki/Bit_banging).

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to onoff functions.

