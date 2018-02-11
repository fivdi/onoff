# onoff

GPIO access and interrupt detection with **Node.js** on Linux boards like the
Raspberry Pi, C.H.I.P. or BeagleBone.

onoff supports Node.js versions 0.10, 0.12, 4, 5, 6, 7, 8 and 9.

[![Mentioned in Awesome Node.js](https://awesome.re/mentioned-badge.svg)](https://github.com/sindresorhus/awesome-nodejs)

## Contents

 * [Installation](#installation)
 * [Usage](#usage)
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

## Usage

Assume that there's an LED connected to GPIO17 and a momentary push button
connected to GPIO4.

<img src="https://raw.githubusercontent.com/fivdi/onoff/master/examples/light-switch.png">

When the button is pressed the LED should turn on, when it's released the LED
should turn off. This can be achieved with the following code:

```js
var Gpio = require('onoff').Gpio,
  led = new Gpio(17, 'out'),
  button = new Gpio(4, 'in', 'both');

button.watch(function(err, value) {
  led.writeSync(value);
});
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
button Gpio objects are released by calling their unexport method.

```js
var Gpio = require('onoff').Gpio,
  led = new Gpio(17, 'out'),
  button = new Gpio(4, 'in', 'both');

button.watch(function (err, value) {
  if (err) {
    throw err;
  }

  led.writeSync(value);
});

process.on('SIGINT', function () {
  led.unexport();
  button.unexport();
});
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
- activeLow - A boolean value specifying whether the values read from or
written to the GPIO should be inverted. The interrupt generating edge for the
GPIO also follow this this setting. The valid values for activeLow are true
and false. Setting activeLow to true inverts. Optional, the default value is
false.

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the onoff Gpio constructor function when exporting GPIOs
to userspace. For example, pin 11 on the Raspberry Pi expansion header
corresponds to GPIO17 in Raspbian Linux. 17 is therefore the number to pass
to the onoff Gpio constructor when using pin 11 on the expansion header.

##### read([callback])
- [callback] - An optional completion callback that gets two arguments (err,
value), where err is reserved for an error object and value is the number 0
or 1 and represents the state of the GPIO.

Read GPIO value asynchronously.

Note that most systems support readback of GPIOs configured as outputs. The
read method can therefore be called for any GPIO, irrespective of whether it
was configured as an input or an output. The Raspberry Pi and BeagleBone are
examples of such systems.

##### readSync()
Read GPIO value synchronously. Returns the number 0 or 1 to represent the
state of the GPIO.

Note that most systems support readback of GPIOs configured as outputs. The
readSync method can therefore be called for any GPIO, irrespective of whether
it was configured as an input or an output. The Raspberry Pi and BeagleBone
are examples of such systems.

##### write(value[, callback])
- value - The number 0 or 1.
- [callback] - An optional completion callback that gets one argument (err),
where err is reserved for an error object.

Write GPIO value asynchronously.

##### writeSync(value)
- value - The number 0 or 1.

Write GPIO value synchronously.

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
input or output. The valid values are 'in' and 'out'.

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
Setting activeLow to true inverts. Optional, the default value is false.

Set GPIO activeLow setting.

##### unexport()
Reverse the effect of exporting the GPIO to userspace. A Gpio object should not
be used after calling its unexport method.

### Synchronous API

Blink the LED connected to GPIO17 for 5 seconds:

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
  led = new Gpio(17, 'out'),      // Export GPIO17 as an output.
  iv;

// Toggle the state of the LED connected to GPIO17 every 200ms.
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

### Asynchronous API

Blink the LED connected to GPIO17 for 5 seconds:

```js
var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
  led = new Gpio(17, 'out');      // Export GPIO17 as an output.

// Toggle the state of the LED connected to GPIO17 every 200ms 'count' times.
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
}(25));
```

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

On the Raspberry Pi, most GPIOs have either their pull-up or pull-down resistor
activated by default. The defaults can be seen in Table 6-31 on pages 102 and
103 of the
[BCM2835 ARM Peripherals](http://www.farnell.com/datasheets/1521578.pdf)
documentation.

Pullup and pulldown resistors for GPIOs can be configured with device tree
overlays. The Wiki page
[Enabling Pullup and Pulldown Resistors on The Raspberry Pi](https://github.com/fivdi/onoff/wiki/Enabling-Pullup-and-Pulldown-Resistors-on-The-Raspberry-Pi)
describes how this can be achieved on the Raspberry Pi.

## Benchmarks

Three of the onoff tests are used to monitor performance:

  * performance-async.js - determine max. no. of write ops per seconds
  * performance-sync.js - determine max. no. of writeSync ops per second
  * performance-interrupt.js - determine max. no. of interrupts per second

The average of ten runs of these tests using various versions of Node.js
and onoff are shown in the following tables.

**Raspberry Pi 3, 1.2Ghz, Raspbian:**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v8.2.1 | v1.1.4 | 4.9.35-v7+ | 27345 | 318771 | 20094
v6.11.1 | v1.1.4 | 4.9.35-v7+ | 26010 | 280180 | 19050
v4.8.4 | v1.1.4 | 4.9.35-v7+ | 27674 | 328949 | 18326
v0.10.29 | v1.1.4 | 4.9.35-v7+ | 23021 | 188573 | 19352

**Raspberry Pi 2, 900Mhz, Raspbian:**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v8.2.1 | v1.1.4 | 4.9.35-v7+ | 12792 | 181829 | 9691
v6.11.1 | v1.1.4 | 4.9.35-v7+ | 12348 | 167106 | 9215
v4.8.4 | v1.1.4 | 4.9.35-v7+ | 13643 | 167248 | 8667
v0.10.29 | v1.1.4 | 4.9.35-v7+ | 11368 | 98464 | 9451

**Raspberry Pi 1, 700Mhz, Raspbian:**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v8.2.1 | v1.1.4 | 4.9.35+ | 2738 | 53589 | 2353
v6.11.1 | v1.1.4 | 4.9.35+ | 2565 | 23111 | 1709
v4.8.4 | v1.1.4 | 4.9.35+ | 2806 | 33847 | 1590
v0.10.29 | v1.1.4 | 4.9.35+ | 2468 | 24837 | 1955

**BeagleBone Black, 1GHz, Debian 9.2:**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v9.2.0 | v1.1.8 | 4.4.91-ti-r133 | 7584 | 105198 | 6820
v8.2.1 | v1.1.8 | 4.4.91-ti-r133 | 7908 | 113476 | 6544
v6.11.4 | v1.1.8 | 4.4.91-ti-r133 | 7784 | 100586 | 6079
v4.8.4 | v1.1.8 | 4.4.91-ti-r133 | 8236 | 113988 | 5216

**BeagleBone, 720MHz, Debian 9.2:**

node | onoff | kernel | write / sec | writeSync / sec | interrupts / sec
:---: | :---: | :---: | ---: | ---: | ---:
v9.2.0 | v1.1.8 | 4.4.91-ti-r133 | 5348 | 74305 | 4870
v8.2.1 | v1.1.8 | 4.4.91-ti-r133 | 5703 | 82007 | 4871
v6.11.4 | v1.1.8 | 4.4.91-ti-r133 | 5534 | 72223 | 4247
v4.8.4 | v1.1.8 | 4.4.91-ti-r133 | 6020 | 81516 | 3786

## Related Packages

Here are a few links to other hardware specific Node.js packages that may be
of interest.

  * [pigpio](https://github.com/fivdi/pigpio) - Fast GPIO, PWM, servo control, state change notification and interrupt handling on the Raspberry Pi
  * [i2c-bus](https://github.com/fivdi/i2c-bus) - I2C serial bus access
  * [spi-device](https://github.com/fivdi/spi-device) - SPI serial bus access
  * [mcp-spi-adc](https://github.com/fivdi/mcp-spi-adc) - Analog to digital conversion with the MCP3002/4/8, MCP3202/4/8 and MCP3304

## Additional Information

onoff was tested on the following platforms:

- Raspberry Pi 1, 2 and 3
  - Raspbian
- C.H.I.P.
  - Debian
- BeagleBone, BeagleBone Black and PocketBeagle
  - Debian

The suitability of onoff for a particular Linux board is highly dependent on
how GPIO interfaces are made available on that board. The
[GPIO interfaces](https://www.kernel.org/doc/Documentation/gpio/)
documentation describes GPIO access conventions rather than standards that must
be followed so GPIO can vary from platform to platform. For example, onoff
relies on sysfs files located at /sys/classes/gpio being available. However,
these sysfs files for userspace GPIO are optional and may not be available on a
particular platform.

For an introduction to onoff checkout
[Node.js Embedded Development on the Raspberry Pi](https://learn.adafruit.com/node-embedded-development?view=all)
at the Adafruit Learning System.

