[![Build Status](https://travis-ci.org/fivdi/onoff.svg?branch=master)](https://travis-ci.org/fivdi/onoff)
[![codecov](https://codecov.io/gh/fivdi/onoff/branch/master/graph/badge.svg)](https://codecov.io/gh/fivdi/onoff)
[![npm Version](http://img.shields.io/npm/v/onoff.svg)](https://www.npmjs.com/package/onoff)
[![Downloads Per Month](http://img.shields.io/npm/dm/onoff.svg)](https://www.npmjs.com/package/onoff)
[![Mentioned in Awesome Node.js](https://awesome.re/mentioned-badge.svg)](https://github.com/sindresorhus/awesome-nodejs#hardware)

# onoff

GPIO access and interrupt detection with **Node.js** on Linux boards like the
Raspberry Pi or BeagleBone.

onoff supports Node.js versions 10, 12 and 14.

## Contents

 * [Installation](#installation)
 * [Usage](#usage)
   * [LEDs and Buttons](#leds-and-buttons)
   * [Debouncing Buttons](#debouncing-buttons)
   * [Blink an LED Using the Synchronous API](#blink-an-led-using-the-synchronous-api)
   * [Blink an LED Using the Asynchronous API and Completion Callbacks](#blink-an-led-using-the-asynchronous-api-and-completion-callbacks)
   * [Blink an LED Using the Asynchronous API and Promises](#blink-an-led-using-the-asynchronous-api-and-promises)
 * [API](#api)
 * [How Does onoff Work?](#how-does-onoff-work)
 * [Configuring Pullup and Pulldown Resistors](#configuring-pullup-and-pulldown-resistors)
 * [Benchmarks](#benchmarks)
 * [Related Packages](#related-packages)
 * [Additional Information](#additional-information)

## Installation

```
npm install onoff
```

Note that although it's possible to install onoff on non-Linux systems the
functionality offered by onoff is only available on Linux systems.

## Usage

#### LEDs and Buttons
Assume that there's an LED connected to GPIO17 and a momentary push button
connected to GPIO4.

<img src="https://raw.githubusercontent.com/fivdi/onoff/master/examples/light-switch.png">

When the button is pressed the LED should turn on, when it's released the LED
should turn off. This can be achieved with the following code:

```js
const Gpio = require('onoff').Gpio;
const led = new Gpio(17, 'out');
const button = new Gpio(4, 'in', 'both');

button.watch((err, value) => led.writeSync(value));
```

Here two Gpio objects are being created. One called led for the LED connected
to GPIO17 which is an output, and one called button for the momentary push
button connected to GPIO4 which is an input. In addition to specifying that
the button is an input, the constructors optional third argument is used to
specify that 'both' rising and falling interrupt edges should be configured
for the button GPIO as both button presses and releases should be handled.

After everything has been setup correctly, the buttons watch method is used to
specify a callback function to execute every time the button is pressed or
released. The value argument passed to the callback function represents the
state of the button which will be 1 for pressed and 0 for released. This value
is used by the callback to turn the LED on or off using its writeSync method.

When the above program is running it can be terminated with ctrl-c. However,
it doesn't free its resources. It also ignores the err argument passed to
the callback. Here's a slightly modified variant of the program that handles
ctrl-c gracefully and bails out on error. The resources used by the led and
button Gpio objects are released by invoking their unexport method.

```js
const Gpio = require('onoff').Gpio;
const led = new Gpio(17, 'out');
const button = new Gpio(4, 'in', 'both');

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  led.writeSync(value);
});

process.on('SIGINT', _ => {
  led.unexport();
  button.unexport();
});
```

#### Debouncing Buttons
When working with buttons there will often be button bounce issues which
result in the hardware thinking that a button was pressed several times
although it was only pressed once. onoff provides a software debouncing
solution for resolving bounce issues.

Assume again that there's an LED connected to GPIO17 and a momentary push
button connected to GPIO4.

When the button is pressed the LED should toggle its state. This is a typical
example of a situation where there will be button bounce issues. The issue can
be resolved by using the debounceTimeout option when creating the Gpio object
for the button. In the below program the debounceTimeout is set to 10
milliseconds. This delays invoking the watch callback for the button while the
button is bouncing. The watch callback will not be invoked until the button
stops bouncing and has been in a stable state for 10 milliseconds.

```js
const Gpio = require('onoff').Gpio;
const led = new Gpio(17, 'out');
const button = new Gpio(4, 'in', 'rising', {debounceTimeout: 10});

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  led.writeSync(led.readSync() ^ 1);
});

process.on('SIGINT', _ => {
  led.unexport();
  button.unexport();
});
```

#### Blink an LED Using the Synchronous API

Blink an LED connected to GPIO17 for 5 seconds using the synchronous readSync
and writeSync methods.

```js
const Gpio = require('../onoff').Gpio; // Gpio class
const led = new Gpio(17, 'out');       // Export GPIO17 as an output

// Toggle the state of the LED connected to GPIO17 every 200ms
const iv = setInterval(_ => led.writeSync(led.readSync() ^ 1), 200);

// Stop blinking the LED after 5 seconds
setTimeout(_ => {
  clearInterval(iv); // Stop blinking
  led.unexport();    // Unexport GPIO and free resources
}, 5000);
```

#### Blink an LED Using the Asynchronous API and Completion Callbacks

Blink an LED connected to GPIO17 for 5 seconds using the asynchronous read and
write methods and completion callbacks.

```js
const Gpio = require('../onoff').Gpio; // Gpio class
const led = new Gpio(17, 'out');       // Export GPIO17 as an output
let stopBlinking = false;

// Toggle the state of the LED connected to GPIO17 every 200ms
const blinkLed = _ => {
  if (stopBlinking) {
    return led.unexport();
  }

  led.read((err, value) => { // Asynchronous read
    if (err) {
      throw err;
    }

    led.write(value ^ 1, err => { // Asynchronous write
      if (err) {
        throw err;
      }
    });
  });

  setTimeout(blinkLed, 200);
};

blinkLed();

// Stop blinking the LED after 5 seconds
setTimeout(_ => stopBlinking = true, 5000);
```

#### Blink an LED Using the Asynchronous API and Promises

Blink an LED connected to GPIO17 for 5 seconds using the asynchronous read and
write methods and Promises.

```js
const Gpio = require('../onoff').Gpio; // Gpio class
const led = new Gpio(17, 'out');       // Export GPIO17 as an output
let stopBlinking = false;

// Toggle the state of the LED connected to GPIO17 every 200ms
const blinkLed = _ => {
  if (stopBlinking) {
    return led.unexport();
  }

  led.read()
    .then(value => led.write(value ^ 1))
    .then(_ => setTimeout(blinkLed, 200))
    .catch(err => console.log(err));
};

blinkLed();

// Stop blinking the LED after 5 seconds
setTimeout(_ => stopBlinking = true, 5000);
```

#### Check accessibility

Sometimes it may be necessary to determine if the current system supports
GPIOs programmatically and mock functionality if it doesn't. `Gpio.accessible`
can be used to achieve this.

```js
const Gpio = require('onoff').Gpio;

const useLed = (led, value) => led.writeSync(value);

let led;

if (Gpio.accessible) {
  led = new Gpio(17, 'out');
  // more real code here
} else {
  led = {
    writeSync: value => {
      console.log('virtual led now uses value: ' + value);
    }
  };
}

useLed(led, 1);
```

## API

### Class Gpio

  * [Gpio(gpio, direction [, edge] [, options]) - Constructor](#gpiogpio-direction--edge--options)
  * [read([callback]) - Read GPIO value asynchronously](#readcallback)
  * [readSync() - Read GPIO value synchronously](#readsync)
  * [write(value[, callback]) - Write GPIO value asynchronously](#writevalue-callback)
  * [writeSync(value) - Write GPIO value synchronously](#writesyncvalue)
  * [watch(callback) - Watch for hardware interrupts on the GPIO](#watchcallback)
  * [unwatch([callback]) - Stop watching for hardware interrupts on the GPIO](#unwatchcallback)
  * [unwatchAll() - Remove all watchers for the GPIO](#unwatchall)
  * [direction() - Get GPIO direction](#direction)
  * [setDirection(direction) - Set GPIO direction](#setdirectiondirection)
  * [edge() - Get GPIO interrupt generating edge](#edge)
  * [setEdge(edge) - Set GPIO interrupt generating edge](#setedgeedge)
  * [activeLow() - Get GPIO activeLow setting](#activelow)
  * [setActiveLow(invert) - Set GPIO activeLow setting](#setactivelowinvert)
  * [unexport() - Reverse the effect of exporting the GPIO to userspace](#unexport)
  * [static accessible - Determine whether or not GPIO access is possible](#static-accessible)
  * [HIGH / LOW - Constants used when reading or writing a GPIO value](#static-high--low)

##### Gpio(gpio, direction [, edge] [, options])
- gpio - An unsigned integer specifying the GPIO number.
- direction - A string specifying whether the GPIO should be configured as an
input or output. The valid values are: 'in', 'out', 'high', and 'low'. If 'out'
is specified the GPIO will be configured as an output and the value of the GPIO
will be set to 0. 'high' and 'low' are variants of 'out' that configure the
GPIO as an output with an initial level of 1 or 0 respectively.
- [edge] - An optional string specifying the interrupt generating edge or
edges for an input GPIO. The valid values are: 'none', 'rising', 'falling' or
'both'. The default value is 'none' indicating that the GPIO will not generate
interrupts. Whether or not interrupts are supported by an input GPIO is GPIO
specific. If interrupts are not supported by a GPIO the edge argument should
not be specified. The edge argument is ignored for output GPIOs.
- [options] - An optional options object.

Configures the GPIO based on the passed arguments and returns a new Gpio
object that can be used to access the GPIO.

The following options are supported:
- debounceTimeout - An unsigned integer specifying a millisecond delay. Delays
invoking the watch callback for an interrupt generating input GPIO while the
input is bouncing. The watch callback will not be invoked until the input
stops bouncing and has been in a stable state for debounceTimeout
milliseconds. Optional, if unspecified the input GPIO will not be debounced.
- activeLow - A boolean value specifying whether the values read from or
written to the GPIO should be inverted. The interrupt generating edge for the
GPIO also follow this this setting. The valid values for activeLow are true
and false. Setting activeLow to true inverts. Optional, the default value is
false.
- reconfigureDirection - A boolean value specifying whether the direction for
the GPIO should be reconfigured even though the direction is already
configured correctly. When an application starts, the direction of a GPIO used
by that application may already be configured correctly, for example, from a
previous run of the application. Reconfiguring the direction of that GPIO can
result in unwanted side effects. For example, if a GPIO is already configured
as an output and it is reconfigured as an output by passing 'out' to the
constructor, the value of that output will be set to 0. In some applications
this is not desirable and the value of the output should not be modified. The
reconfigureDirection option can help here. If reconfigureDirection is set to
false the direction of a GPIO that is already correctly configured will not be
reconfigured. Optional, the default value is true.

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the onoff Gpio constructor when exporting GPIOs to
userspace. For example, pin 11 on the Raspberry Pi expansion header
corresponds to GPIO17 in Raspbian Linux. 17 is therefore the number to pass
to the onoff Gpio constructor when using pin 11 on the expansion header.

##### read([callback])
- [callback] - An optional completion callback that gets two arguments (err,
value), where err is reserved for an Error object and value is the number 0
or 1 and represents the state of the GPIO.

Read GPIO value asynchronously. If no completion callback is specified read
returns a Promise which resolves to the value of the GPIO on success or rejects
with an Error object on failure.

Note that most systems support readback of GPIOs configured as outputs. The
read method can therefore be invoked for any GPIO, irrespective of whether it
was configured as an input or an output. The Raspberry Pi and BeagleBone are
examples of such systems.

##### readSync()
Read GPIO value synchronously. Returns the number 0 or 1 to represent the
state of the GPIO.

Note that most systems support readback of GPIOs configured as outputs. The
readSync method can therefore be invoked for any GPIO, irrespective of whether
it was configured as an input or an output. The Raspberry Pi and BeagleBone
are examples of such systems.

##### write(value[, callback])
- value - The number 0 or 1.
- [callback] - An optional completion callback that gets one argument (err),
where err is reserved for an error object.

Write GPIO value asynchronously. If no completion callback is specified write
returns a Promise that resolves with no value on success or rejects with an
Error object on failure.

Note that on most systems invoking write for a GPIO configured as an input
will result in an EPERM error indicating that the operation is not permitted.
The Raspberry Pi and BeagleBone are examples of such systems.

##### writeSync(value)
- value - The number 0 or 1.

Write GPIO value synchronously.

Note that on most systems invoking writeSync for a GPIO configured as an input
will result in an EPERM error indicating that the operation is not permitted.
The Raspberry Pi and BeagleBone are examples of such systems.

##### watch(callback)
- callback - A callback that gets two arguments (err, value), where err is
reserved for an error object and value is the number 0 or 1 and represents the
state of the GPIO. The value can also be used to determine whether the
interrupt occurred on a rising or falling edge. A value of 0 implies a falling
edge interrupt and a value of 1 implies a rising edge interrupt.

Watch for hardware interrupts on the GPIO. The edge argument that was passed
to the constructor determines which hardware interrupts to watch for.

##### unwatch([callback])
- [callback] - The callback to remove.

Stop watching for hardware interrupts on the GPIO. If callback is specified,
only that particular callback is removed. Otherwise all callbacks are removed.

##### unwatchAll()
Remove all hardware interrupt watchers for the GPIO.

##### direction()
Returns the string 'in' or 'out' indicating whether the GPIO is an input or
output.

##### setDirection(direction)
- direction - A string specifying whether the GPIO should be configured as an
input or output. The valid values are 'in', 'out', 'high', and 'low'. If 'out'
is specified the GPIO will be configured as an output and the value of the GPIO
will be set to 0. 'high' and 'low' are variants of 'out' that configure the
GPIO as an output with an initial level of 1 or 0 respectively.

Set GPIO direction.

##### edge()
Returns the string 'none', 'falling', 'rising', or 'both' indicating the
interrupt generating edge or edges for the GPIO. Whether or not interrupts are
supported by an input GPIO is GPIO specific. If interrupts are not supported
the edge method should not be used. Interrupts are not supported by output
GPIOs.

##### setEdge(edge)
- edge - A string specifying the interrupt generating edge or edges for an
input GPIO. The valid values are: 'none', 'rising', 'falling' or 'both'.
Whether or not interrupts are supported by an input GPIO is GPIO specific. If
interrupts are not supported the setEdge method should not be used. Interrupts
are not supported by output GPIOs.

Set GPIO interrupt generating edge.

##### activeLow()
Returns true or false indicating whether or not the values read from or written
to the GPIO are inverted.

##### setActiveLow(invert)
- invert - A boolean value specifying whether the values read from or written
to the GPIO should be inverted. The interrupt generating edge for the GPIO also
follow this this setting. The valid values for invert are true and false.
Setting activeLow to true inverts.

Set GPIO activeLow setting.

##### unexport()
Reverse the effect of exporting the GPIO to userspace. A Gpio object should not
be used after invoking its unexport method.

##### static accessible
Determine whether or not GPIO access is possible. true if the current process
has the permissions required to export GPIOs to userspace. false otherwise.
Loosely speaking, if this property is true it should be possible for the
current process to create Gpio objects.

It is notable that while this property may be false indicating that the
current process does not have the permissions required to export GPIOs to
userspace, existing exported GPIOs may still be accessible.

This property is useful for mocking functionality on computers used for
development that do not provide access to GPIOs.

This is a static property and should be accessed as `Gpio.accessible`.

##### static HIGH / LOW
Constants used when reading or writing a GPIO value. Gpio.HIGH and Gpio.LOW
can be used in place of the numeric constants 1 and 0.


## How Does onoff Work?

Internally onoff uses sysfs files located at /sys/class/gpio to access GPIOs
and the [epoll package](https://github.com/fivdi/epoll) to detect hardware
interrupts. The Linux GPIO sysfs interface for userspace is documented
[here](https://www.kernel.org/doc/Documentation/gpio/sysfs.txt).
It's a relatively simple interface which can be used to ask the Linux kernel
to export control of a GPIO to userspace. After control of a GPIO has been
exported to userspace, the GPIO can be configured as an input or output.
Thereafter, the state of an input can be read, and the state of an output can
be written. Some systems will also allow the state of a output to be read.
The GPIO sysfs interface can also be used for interrupt detection. onoff can
detect several thousand interrupts per second on both the BeagleBone and the
Raspberry Pi.


## Configuring Pullup and Pulldown Resistors

As mentioned in section [How Does onoff Work](#how-does-onoff-work) the sysfs
interface is used to access GPIOs. The sysfs interface doesn't offer support
for configuring pullup and pulldown resistors on GPIOs.

There are however many platform specific mechanisms for configuring pullup and
pulldown resistors that are compatible with onoff. onoff itself doesn't use
these mechanisms as one of the goals of onoff is to be platform independent.

Here we'll take a look at two mechanisms available on the Raspberry Pi for
configuring pullup and pulldown resistors.

The first point to be aware of is that most GPIOs on a Raspberry Pi have
either their pullup or pulldown resistor activated by default. The defaults
can be seen in Table 6-31 on pages 102 and 103 of the
[BCM2835 ARM Peripherals](http://www.farnell.com/datasheets/1521578.pdf)
documentation.

#### Using the gpio Command in /boot/config.txt 

On Raspbian 2018-04-18 or later the `gpio` configuration command can be used
in `/boot/config.txt` to configure pullup and pulldown resistors. Further
information is available at
[New "gpio" config command](https://www.raspberrypi.org/forums/viewtopic.php?f=117&t=208748).

#### Using Device Tree Overlays

Device tree overlays can also be used to configure pullup and pulldown
resistors. The Wiki page
[Enabling Pullup and Pulldown Resistors on The Raspberry Pi](https://github.com/fivdi/onoff/wiki/Enabling-Pullup-and-Pulldown-Resistors-on-The-Raspberry-Pi)
describes this mechanism in more detail.

## Benchmarks

Three of the onoff tests are used to monitor performance.

  * performance-async.js - determine max. no. of write ops per seconds
  * performance-sync.js - determine max. no. of writeSync ops per second
  * performance-interrupt.js - determine max. no. of interrupts per second

The results of these tests are shown in the following tables.

**Raspberry Pi 4 B, 1.5GHz, Raspbian Buster 10.1**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.75-v7l+ | 25050 | 261875 | 23308
v12.14.0 | v5.0.0 | 4.19.75-v7l+ | 26249 | 354699 | 24802
v10.18.0 | v5.0.0 | 4.19.75-v7l+ | 28221 | 356435 | 24767
v8.17.0 | v5.0.0 | 4.19.75-v7l+ | 28080 | 526504 | 25086

**Raspberry Pi 3 B, 1.2GHz, Raspbian Buster 10.1**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.75-v7l+ | 20676 | 158916 | 17259
v12.14.0 | v5.0.0 | 4.19.75-v7l+ | 21670 | 207222 | 18328
v10.18.0 | v5.0.0 | 4.19.75-v7l+ | 23661 | 225758 | 20741
v8.17.0 | v5.0.0 | 4.19.75-v7l+ | 22381 | 331501 | 21266

**Raspberry Pi 2 B, 900MHz, Raspbian Buster 10.1**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.75-v7l+ | 10146 | 87727 | 8798
v12.14.0 | v5.0.0 | 4.19.75-v7l+ | 10769 | 113107 | 10373
v10.18.0 | v5.0.0 | 4.19.75-v7l+ | 11843 | 129086 | 10536
v8.17.0 | v5.0.0 | 4.19.75-v7l+ | 11992 | 177764 | 10466

**Raspberry Pi 1 B, 700MHz, Raspbian Buster 10.1**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.75+ | 2158 | 19673 | 1985
v12.14.0 | v5.0.0 | 4.19.75+ | 2316 | 26696 | 2112
v10.18.0 | v5.0.0 | 4.19.75+ | 2613 | 33129 | 2225
v8.17.0 | v5.0.0 | 4.19.75+ | 2651 | 57811 | 2347

**BeagleBone Black, 1GHz, Debian Buster 10.2**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.79-ti-r30 | 6509 | 53240 | 5402
v12.14.0 | v5.0.0 | 4.19.79-ti-r30 | 6855 | 70535 | 5911
v10.18.0 | v5.0.0 | 4.19.79-ti-r30 | 7564 | 79133 | 5920
v8.17.0 | v5.0.0 | 4.19.79-ti-r30 | 7116 | 103920 | 6144

**BeagleBone, 720MHz, Debian Buster 10.2**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v13.5.0 | v5.0.0 | 4.19.79-ti-r30 | 4441 | 38425 | 4031
v12.14.0 | v5.0.0 | 4.19.79-ti-r30 | 5013 | 49741 | 4297
v10.18.0 | v5.0.0 | 4.19.79-ti-r30 | 5400 | 57157 | 4371
v8.17.0 | v5.0.0 | 4.19.79-ti-r30 | 5307 | 75034 | 4406

## Related Packages

Here are a few links to other hardware specific Node.js packages that may be
of interest.

  * [pigpio](https://github.com/fivdi/pigpio) - Fast GPIO, PWM, servo control, state change notification and interrupt handling on the Raspberry Pi
  * [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access
  * [spi-device](https://github.com/fivdi/spi-device) - SPI serial bus access
  * [mcp-spi-adc](https://github.com/fivdi/mcp-spi-adc) - Analog to digital conversion with the MCP3002/4/8, MCP3202/4/8 and MCP3304

## Additional Information

onoff was tested on the following platforms:

- Raspberry Pi 1, 2, 3 and 4
  - Raspbian
- BeagleBone, BeagleBone Black and PocketBeagle
  - Debian

The suitability of onoff for a particular Linux board is highly dependent on
how GPIO interfaces are made available on that board. The
[GPIO interfaces](https://www.kernel.org/doc/Documentation/gpio/)
documentation describes GPIO access conventions rather than standards that must
be followed so GPIO can vary from platform to platform. For example, onoff
relies on sysfs files located at /sys/class/gpio being available. However,
these sysfs files for userspace GPIO are optional and may not be available on a
particular platform.

