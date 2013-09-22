## onoff

GPIO based I/O and interrupt detection with Node.js on Linux boards such as the
BeagleBone or Raspberry Pi.

onoff provides a constructor function called Gpio which can be used to make
Gpio objects corresponding to Linux GPIOs. Examples of its usage can be seen in
the code below. The Gpio methods available are as follows:

  * read(callback) - Read GPIO value asynchronously
  * readSync() - Read GPIO value synchronously
  * write(value, callback) - Write GPIO value asynchronously
  * writeSync(value) - Write GPIO value synchronously
  * watch(callback) - Watch for changes on the GPIO
  * unwatch(callback) - Stop watching for changes on the GPIO
  * unwatchAll() - Remove all watchers for the GPIO
  * direction() - Read GPIO direction
  * edge() - Read GPIO interrupt generating edge
  * options() - Get GPIO options
  * unexport() - Reverse the effect of exporting the GPIO to userspace

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the onoff Gpio constructor function when exporting GPIOs
to userspace. For example, pin P1_11 on the Raspberry Pi P1 expansion header
corresponds to GPIO #17 in Raspbian Linux. 17 is therefore the number to pass
to the onoff Gpio constructor when using pin P1_11 on the P1 expansion header.

onoff requires Node.js v0.8.0 or higher.

## Installation

    $ npm install onoff

## Synchronous API - Blink the LED on GPIO #17 for 5 seconds

The examples here can be run by the superuser or by non-superusers when the
technique described in section "How to handle superuser issues" is used.

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
    led = new Gpio(17, 'out'),    // Export GPIO #17 as an output.
    iv;

// Toggle the state of the LED on GPIO #17 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
iv = setInterval(function() {
    led.writeSync(led.readSync() === 0 ? 1 : 0); // 1 = on, 0 = off :)
}, 200);

// Stop blinking the LED and turn it off after 5 seconds.
setTimeout(function() {
    clearInterval(iv); // Stop blinking
    led.writeSync(0);  // Turn LED off.
    led.unexport();    // Unexport GPIO and free resources
}, 5000);
```

## Asynchronous API - Blink the LED on GPIO #17 20 times

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
    led = new Gpio(17, 'out');    // Export GPIO #17 as an output.

// Toggle the state of the LED on GPIO #17 every 200ms 'count' times.
// Here asynchronous methods are used. Synchronous methods are also available.
(function blink(count) {
    if (count <= 0) return led.unexport();

    led.read(function(err, value) {  // Asynchronous read.
        if (err) throw err;

        led.write(value === 0 ? 1 : 0, function(err) { // Asynchronous write.
            if (err) throw err;
        });
    });

    setTimeout(function() {
        blink(count - 1);
    }, 200);
})(20);
```

## Wait for the button on GPIO #18 to interrupt

This example watches a momentary push button on GPIO #18 and prints a message
when when the button is pressed interrupting the CPU. The watch method doesn't
require CPU resources while waiting for an interrupt to occur freeing the CPU
to perfrom other tasks.

```js
var Gpio = require('onoff').Gpio,        // Constructor function for Gpio objects.
    button = new Gpio(18, 'in', 'both'); // Export GPIO #18 as an interrupt
                                         // generating input.

console.log('Please press the button on GPIO #18...');

// The callback passed to watch will be called when the button on GPIO #18 is
// pressed. 
button.watch(function (err, value) {
    if (err) throw err;

    console.log('Button pressed!, its value was ' + value);

    button.unexport(); // Unexport GPIO and free resources
});
```

## How to handle superuser issues

In gereral, superuser privileges are required for exporting and using GPIOs.
However, running all processes that access GPIOs as the superuser will be
unacceptable for most. To resolve this issue onoff can be used as follows:

Step 1 - Export GPIOs as superuser

Create a simple program for exporting GPIOs and execute this program with
superuser privileges. In addition to exporting the GPIOs, this program will
automatically change the access permissions for the GPIOs value file giving
all users read and write access.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out');
```

Step 2 - The application can be run by a non-superuser

After the program from step one has been executed by the superuser, the
application itself can be executed by a non-superuser. The Gpio constructor
will see that the GPIO has already been exported to userspace and will not
attempt to export it again. The value of the GPIO can be modified as all
users have read and write access to its value file.

Highspeed Blinking

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    time = process.hrtime(),
    hertz,
    i;

for (i = 0; i !== 50000; i += 1) {
    led.writeSync(1);
    led.writeSync(0);
}

time = process.hrtime(time);
hertz = Math.floor(i / (time[0] + time[1] / 1E9));

console.log('Frequency = ' + hertz / 1000 + 'KHz');
```

Depending on the system load, the frequency logged to the console should be up
to 35KHz on a 720MHz BeagleBone or up to 23KHz on a 700MHz Raspberry Pi.

Step 3 - Unexport GPIOs as superuser

After the application has terminated, a third program can be executed by the
superuser to unexport the appropriate GPIOs.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out');

led.unexport();
```

## Additional Information

onoff has been tested on the BeagleBone (Ångström) and Raspberry Pi (Raspbian).
The suitability of onoff for a particular Linux board is highly dependent on
how GPIO interfaces are made available on that board. The
[GPIO interfaces](http://www.kernel.org/doc/Documentation/gpio.txt)
documentation describes GPIO access conventions rather than standards that must
be followed so GPIO can vary from platform to platform. For example, onoff
relies on sysfs files located at /sys/classes/gpio being available. However,
these sysfs files for userspace GPIO are optional and may not be available on a
particular platform.


