## onoff

Functions for turning Linux board GPIO outputs on and off and detecting
interrupts on GPIO inputs.

## Blink the LED on GPIO #17 forever

```js
var onoff = require('../onoff'),
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
var onoff = require('../onoff'),
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

The functions are known to work on the BeagleBone (Ångström) and Raspberry Pi
(Raspbian).

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to onoff functions.

