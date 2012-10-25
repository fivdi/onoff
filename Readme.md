## onoff

Functions for turning Linux board GPIO outputs on and off and detecting
interrupts on GPIO inputs.

## Blink the LED on GPIO #17 forever

```js
var onoff = require('../onoff'),
    ledGpio = 17,
    nextLedState = 1;

onoff.exp(ledGpio, function (err) {
    onoff.direction(ledGpio, 'out', function (err) {
        setInterval(function() {
            onoff.value(ledGpio, nextLedState);
            nextLedState = nextLedState === 1 ? 0 : 1;
        }, 200);
    });
});
```

## Wait for the button on GPIO #18 to be pressed and interrupt

```js
var onoff = require('../onoff'),
    buttonGpio = 18;

function watchButton() {
    console.log('Please press the button...');
    onoff.watch(buttonGpio, function (err, value) {
        console.log('Button pressed!');
        onoff.unexp(buttonGpio);
    });
};

onoff.exp(buttonGpio, function (err) {
    onoff.direction(buttonGpio, 'in', function (err) {
        onoff.edge(buttonGpio, 'both', function (err) {
            watchButton();
        });
    });
});
```

## Info

The functions are known to work on the BeagleBone (Ångström) and Raspberry Pi
(Raspbian).

GPIOs on Linux are identified by unsigned integers. These are the numbers that

