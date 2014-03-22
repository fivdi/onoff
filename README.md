## onoff

GPIO access and interrupt detection with Node.js on Linux boards such as the
BeagleBone or Raspberry Pi.

## Installation

    $ [sudo] npm install onoff

onoff requires Node.js v0.8.0 or higher.

## Usage

Assume that there's an LED on GPIO #17 and a momentary push button on GPIO #18.
When the button is pressed the LED should trun on, when it's released the LED
should turn off. This can be acheived with the following code:

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    led.writeSync(value);
});
```

Here two Gpio objects are being created. One called led for the LED on GPIO #17
which is an output, and one called button for the momentary push button on
GPIO #18 which is an input. In addition to specifying that the button is an
input, the constructors optional third argument is used to specify that 'both'
rising and falling interrupt edges should be configured for the button GPIO as
both button presses and releases should be handled.

After everything has been setup correctly, the buttons watch method is used to
specify a callback function to execute every time the button is pressed or
released. The value argument passed to the callback function represents the
state of the button which will be 1 for pressed and 0 for released. This value
is used by the callback to turn the LED on or off using its writeSync method.

When the above program is running it can be terminated with ctrl-c. However,
it doesn't free its resources. It also ignores the err argument passed to
the callback. Here's a slightly modified variant of the program that handles
ctrl-c gracefully and bails out on error. The resources used by the led and
button Gpio objects are released by calling their unexport method.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    led.unexport();
    button.unexport();
    process.exit();
}

process.on('SIGINT', exit);
```

## News & Updates

### onoff v0.3.0 breaking persistentWatch change

The persistentWatch option that was supported by onoff v0.1.2 through v0.2.3
was removed with onoff v0.3.0. As of v0.3.0 watchers are always persistent.
Note that this is a breaking change as the persistentWatch option defaulted
to false which resulted in one-shot watchers.

If you were explicitly setting persistentWatch to true, the migration step is
easy, simply remove the persistentWatch option.

If you were explicitly setting persistentWatch to false, or letting it default
to false, you'll need to re-work your code. If one-shot watchers are needed,
the effect can be acheived by calling unwatch or unwatchAll in the watcher
callback the first time it's called.

## How does it work?

Internally onoff uses sysfs files located at /sys/class/gpio to access GPIOs
and the [Node.js epoll module](https://github.com/fivdi/epoll) to detect
hardware interrupts. It can detect several thousand interrupts per second on
both the BeagleBone and the Raspberry Pi.

## API

onoff provides a constructor function called Gpio which can be used to make
Gpio objects corresponding to Linux GPIOs. The Gpio methods available are as
follows:

  * [Gpio](https://github.com/fivdi/onoff/blob/master/onoff.js#L9-L36) - Constructor
  * read(callback) - Read GPIO value asynchronously
  * readSync() - Read GPIO value synchronously
  * write(value, callback) - Write GPIO value asynchronously
  * writeSync(value) - Write GPIO value synchronously
  * watch(callback) - Watch for hardware interrupts on the GPIO. Inputs and
    outputs can be watched. The edge argument that was passed to the
    constructor determines which hardware interrupts are watcher for.
  * unwatch(callback) - Stop watching for hardware interrupts on the GPIO
  * unwatchAll() - Remove all watchers for the GPIO
  * direction() - Get GPIO direction
  * setDirection() - Set GPIO direction
  * edge() - Get GPIO interrupt generating edge
  * setEdge() - Set GPIO interrupt generating edge
  * options() - Get GPIO options
  * unexport() - Reverse the effect of exporting the GPIO to userspace

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the onoff Gpio constructor function when exporting GPIOs
to userspace. For example, pin P1_11 on the Raspberry Pi P1 expansion header
corresponds to GPIO #17 in Raspbian Linux. 17 is therefore the number to pass
to the onoff Gpio constructor when using pin P1_11 on the P1 expansion header.

## Synchronous API

Blink the LED on GPIO #17 for 5 seconds:

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

## Asynchronous API

Blink the LED on GPIO #17 for 5 seconds:

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

## Configuring pull-up and pull-down resistors

As onoff plays well with the quick2wire gpio-admin and the WiringPi gpio
utilities, either of these tools can be used to configure pull-up and pull-down
resistors on th Pi.

## Benchmarks

Three of the onoff tests are used to monitor performance:

  * performance-async.js - determine max. no. of write ops per seconds
  * performance-sync.js - determine max. no. of writeSync ops per second
  * performance-interrupt.js - determine max. no. of interrupts per second

The average of ten runs of these tests using various versions of Node.js and
onoff are shown in the following tables.

**BeagleBone, 720MHz, Ångström v2012.12, Kernel 3.8.13:**

Node.js | onoff | write ops / sec | writeSync ops / sec | interrupts / sec
:---: | :---: | ---: | ---: | ---:
v0.11.7 | v0.2.3 | 6399 | 84334 | 5519
v0.10.20 | v0.2.3 | 4925 | 45713 | 4561

**BeagleBone Black, 1GHz, Ångström v2012.12, Kernel 3.8.13:**

Node.js | onoff | write ops / sec | writeSync ops / sec | interrupts / sec
:---: | :---: | ---: | ---: | ---:
v0.11.9 | v0.3.0 | 8663 | 110219 | 7154
v0.11.8 | v0.2.3 | 8446 | 100698 | 7323

**Raspberry Pi, 700Mhz, Raspbian, Kernel 3.6.11+:**

Node.js | onoff | write ops / sec | writeSync ops / sec | interrupts / sec
:---: | :---: | ---: | ---: | ---:
v0.11.7 | v0.2.3 | 3355 | 49651 | 2550
v0.10.8 | v0.2.3 | 2772 | 31825 | 2297

## How to handle superuser issues

In gereral, superuser privileges are required for exporting and using GPIOs.
However, running all processes that access GPIOs as the superuser will be
unacceptable for most. There are several ways to resolve this issue.

**Resolving superuser issues with onoff**

onoff has built in functionality which can be leveraged to resolve superuser
issues. Let's assume that the application is the led/button example from
above.

Step 1 - Export GPIOs as superuser

Create a simple program for exporting GPIOs and execute this program with
superuser privileges. In addition to exporting the GPIOs, this program will
automatically change the access permissions for the GPIO value files giving
all users read and write access.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');
```

Step 2 - The application can be run by a non-superuser

After the program from step one has been executed by the superuser, the
application itself can be executed by a non-superuser. The Gpio constructor
will detect whether a GPIO has already been exported to userspace and will not
attempt to export it again. The value of the GPIO can be accessed as all
users have read and write access to the value file. Note that unlike the
initial led/button example, the applications exit function does not attempt
to unexport the GPIOs when it terminates.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    process.exit();
}

process.on('SIGINT', exit);
```

Step 3 - Unexport GPIOs as superuser

After the application has terminated, a third program can be executed by the
superuser to unexport the appropriate GPIOs.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

led.unexport();
button.unexport();
```

**Resolving superuser issues on the Pi with quick2wire-gpio-admin**

After [quick2wire-gpio-admin](https://github.com/quick2wire/quick2wire-gpio-admin)
has been successfully installed, the gpio-admin utility can be used to
export/unexport GPIOs and the application can be executed without superuser
privileges. Let's assume that the application is the led/button example from
above.

Step 1 - Export GPIOs with gpio-admin

Run the following commands to export GPIO #17 and #18:

```bash
gpio-admin export 17
gpio-admin export 18
```

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that
unlike the initial led/button example, the applications exit function does
not attempt to unexport the GPIOs when it terminates.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    process.exit();
}

process.on('SIGINT', exit);
```

Step 3 - Unxport GPIOs with gpio-admin

After the application has terminated, run the following commands to unexport
GPIO #17 and #18:

```bash
gpio-admin unexport 17
gpio-admin unexport 18
```

**Resolving superuser issues on the Pi with the WiringPi gpio utility**

After the [WiringPi gpio utility](http://wiringpi.com/the-gpio-utility/)
has been successfully installed, it can be used to export/unexport GPIOs and
the application can be executed without superuser privileges. Let's assume that
the application is the led/button example from above.

Step 1 - Export GPIOs with gpio

Run the following commands to export GPIO #17 and #18:

```bash
gpio export 17 out
gpio export 18 in
```

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that
unlike the initial led/button example, the applications exit function does
not attempt to unexport the GPIOs when it terminates.

```js
var Gpio = require('onoff').Gpio,
    led = new Gpio(17, 'out'),
    button = new Gpio(18, 'in', 'both');

button.watch(function(err, value) {
    if (err) exit();
    led.writeSync(value);
});

function exit() {
    process.exit();
}

process.on('SIGINT', exit);
```

Step 3 - Unxport GPIOs with gpio

After the application has terminated, run the following commands to unexport
GPIO #17 and #18:

```bash
gpio unexport 17
gpio unexport 18
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

