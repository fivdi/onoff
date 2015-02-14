## onoff

**onoff is io.js and Node.js compatable**

GPIO access and interrupt detection with Node.js on Linux boards such as the
BeagleBone, BeagleBone Black, Raspberry Pi, or Raspberry Pi 2.

## Adafruit Learning System

For an introduction to onoff checkout
[Node.js Embedded Development on the Raspberry Pi](https://learn.adafruit.com/node-embedded-development?view=all)
at the Adafruit Learning System.

## Installation

    $ [sudo] npm install onoff

**BeagleBone Prerequisites**

There are no prerequisites for using onoff on the BeagleBone or BeagleBone
Black, when Debian is being used.

Before installing onoff on stock Ångström on the BeagleBone or BeagleBone
Black, three Python modules need to be installed; python-compiler, python-misc,
and python-multiprocessing. They can be installed with the following commands:

```bash
$ opkg update
$ opkg install python-compiler
$ opkg install python-misc
$ opkg install python-multiprocessing
```

## News & Updates

### onoff v1.0.0 - No more superuser issues with user pi on Raspbian

User pi on recent versions of Raspbian can access GPIOs without superuser
privileges and the techniques for avoiding superuser issues described in
section
[How to handle superuser issues](https://github.com/fivdi/onoff#how-to-handle-superuser-issues)
no longer need to be applied.

One of the techniques for avoiding superuser issues on older versions of
Raspbian was titled "Resolving superuser issues with onoff". This technique
is no longer supported with onoff v1.0.0 or higher.

### onoff v0.3.0 - Breaking persistentWatch change

The persistentWatch option that was supported by onoff v0.1.2 through v0.2.3
was removed with onoff v0.3.0. As of v0.3.0 watchers are always persistent.
Note that this is a breaking change as the persistentWatch option defaulted
to false which resulted in one-shot watchers.

If you were explicitly setting persistentWatch to true, the migration step is
easy, simply remove the persistentWatch option.

If you were explicitly setting persistentWatch to false, or letting it default
to false, you'll need to re-work your code. If one-shot watchers are needed,
the effect can be achieved by calling unwatch or unwatchAll in the watcher
callback the first time it's called.

## Usage

Assume that there's an LED on GPIO #14 and a momentary push button on GPIO #4.
When the button is pressed the LED should turn on, when it's released the LED
should turn off. This can be achieved with the following code:

```js
var Gpio = require('onoff').Gpio,
  led = new Gpio(14, 'out'),
  button = new Gpio(4, 'in', 'both');

button.watch(function(err, value) {
  led.writeSync(value);
});
```

Here two Gpio objects are being created. One called led for the LED on GPIO #14
which is an output, and one called button for the momentary push button on
GPIO #4 which is an input. In addition to specifying that the button is an
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
  led = new Gpio(14, 'out'),
  button = new Gpio(4, 'in', 'both');

function exit() {
  led.unexport();
  button.unexport();
  process.exit();
}

button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  led.writeSync(value);
});

process.on('SIGINT', exit);
```

## How does it work?

Internally onoff uses sysfs files located at /sys/class/gpio to access GPIOs
and the [Node.js epoll module](https://github.com/fivdi/epoll) to detect
hardware interrupts. The Linux GPIO sysfs interface for userspace is
documented [here](https://www.kernel.org/doc/Documentation/gpio/sysfs.txt).
It's a relatively simple interface which can be used to ask the Linux kernel
to export control of a GPIO to userspace. After control of a GPIO has been
exported to userspace, the GPIO can be configured as an input or output.
Thereafter, the state of an input can be read, and the state of an output can
be written. Some systems will also allow the state of a output to be read.
The GPIO sysfs interface can also be used for interrupt detection. onoff can
detect several thousand interrupts per second on both the BeagleBone and the
Raspberry Pi.

## API

onoff provides a constructor function called Gpio which can be used to make
Gpio objects corresponding to Linux GPIOs. The Gpio methods available are as
follows:

  * [Gpio](https://github.com/fivdi/onoff/blob/master/onoff.js#L31-L54) - Constructor
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
to userspace. For example, pin 8 on the Raspberry Pi P1 expansion header
corresponds to GPIO #14 in Raspbian Linux. 14 is therefore the number to pass
to the onoff Gpio constructor when using pin 8 on the P1 expansion header.

## Synchronous API

Blink the LED on GPIO #14 for 5 seconds:

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
  led = new Gpio(14, 'out'),      // Export GPIO #14 as an output.
  iv;

// Toggle the state of the LED on GPIO #14 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
iv = setInterval(function () {
  led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off :)
}, 200);

// Stop blinking the LED and turn it off after 5 seconds.
setTimeout(function () {
  clearInterval(iv); // Stop blinking
  led.writeSync(0);  // Turn LED off.
  led.unexport();    // Unexport GPIO and free resources
}, 5000);
```

## Asynchronous API

Blink the LED on GPIO #14 for 5 seconds:

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
  led = new Gpio(14, 'out');      // Export GPIO #14 as an output.

// Toggle the state of the LED on GPIO #14 every 200ms 'count' times.
// Here asynchronous methods are used. Synchronous methods are also available.
(function blink(count) {
  if (count <= 0) {
    return led.unexport();
  }

  led.read(function (err, value) { // Asynchronous read.
    if (err) {
      throw err;
    }

    led.write(value ^ 1, function (err) { // Asynchronous write.
      if (err) {
        throw err;
      }
    });
  });

  setTimeout(function () {
    blink(count - 1);
  }, 200);
}(20));
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

**Raspberry Pi 2, 900Mhz, Raspbian, Kernel 3.18.5-v7+:**

io.js | onoff | write ops / sec | writeSync ops / sec | interrupts / sec
:---: | :---: | ---: | ---: | ---:
v1.2.0 | v1.0.0 | 13863 | 171501 | 9268

Node.js | onoff | write ops / sec | writeSync ops / sec | interrupts / sec
:---: | :---: | ---: | ---: | ---:
v0.10.36 | v1.0.0 | 12010 | 98493 | 9803

## How to handle superuser issues

User pi on recent versions of Raspbian can access GPIOs without superuser
privileges. On older versions of Raspbian the techniques described here can be
used to avoid superuser issues.

**Resolving superuser issues on the Pi with quick2wire-gpio-admin**

After [quick2wire-gpio-admin](https://github.com/quick2wire/quick2wire-gpio-admin)
has been successfully installed, the gpio-admin utility can be used to
export/unexport GPIOs and the application can be executed without superuser
privileges. Let's assume that the application is the led/button example from
above.

Step 1 - Export GPIOs with gpio-admin

Run the following commands to export GPIO #14 and #4:

```bash
gpio-admin export 14
gpio-admin export 4
```

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that
unlike the initial led/button example, the applications exit function does
not attempt to unexport the GPIOs when it terminates.

```js
var Gpio = require('../onoff').Gpio,
  led = new Gpio(14, 'out'),
  button = new Gpio(4, 'in', 'both');

function exit() {
  led.unexport();
  button.unexport();
  process.exit();
}

button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  led.writeSync(value);
});

process.on('SIGINT', exit);
```

Step 3 - Unxport GPIOs with gpio-admin

After the application has terminated, run the following commands to unexport
GPIO #14 and #4:

```bash
gpio-admin unexport 14
gpio-admin unexport 4
```

**Resolving superuser issues on the Pi with the WiringPi gpio utility**

After the [WiringPi gpio utility](http://wiringpi.com/the-gpio-utility/)
has been successfully installed, it can be used to export/unexport GPIOs and
the application can be executed without superuser privileges. Let's assume that
the application is the led/button example from above.

Step 1 - Export GPIOs with gpio

Run the following commands to export GPIO #14 and #4:

```bash
gpio export 14 out
gpio export 4 in
```

Step 2 - Run the application

Now the application can be executed without superuser privileges. Note that
unlike the initial led/button example, the applications exit function does
not attempt to unexport the GPIOs when it terminates.

```js
var Gpio = require('../onoff').Gpio,
  led = new Gpio(14, 'out'),
  button = new Gpio(4, 'in', 'both');

function exit() {
  led.unexport();
  button.unexport();
  process.exit();
}

button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  led.writeSync(value);
});

process.on('SIGINT', exit);
```

Step 3 - Unxport GPIOs with gpio

After the application has terminated, run the following commands to unexport
GPIO #14 and #4:

```bash
gpio unexport 14
gpio unexport 4
```

## Additional Information

Tested on the following platforms:

- Raspberry Pi 1
  - Raspbian
- Raspberry Pi 2
  - Raspbian
- BeagleBone
  - Ångström
  - Debian
- BeagleBone Black
  - Ångström
  - Debian
  - Ubuntu

The suitability of onoff for a particular Linux board is highly dependent on
how GPIO interfaces are made available on that board. The
[GPIO interfaces](https://www.kernel.org/doc/Documentation/gpio/)
documentation describes GPIO access conventions rather than standards that must
be followed so GPIO can vary from platform to platform. For example, onoff
relies on sysfs files located at /sys/classes/gpio being available. However,
these sysfs files for userspace GPIO are optional and may not be available on a
particular platform.

