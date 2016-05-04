1.1.0 - May 04 2016
===================
  * activeLow option
  * documentation improved

1.0.4 - Jan 29 2016
===================
  * documentation improved
  * epoll v0.1.17

1.0.3 - Oct 10 2015
===================
  * documentation improved
  * epoll v0.1.16

1.0.2 - Feb 18 2015
===================
  * documentation improved

1.0.1 - Feb 15 2015
===================
  * refactored tests to avoid relying in interrupt generating outputs as linux 3.13 and above no longer supports them
  * new wiring for tests and examples
  * pullup and pulldown resistor configuration documented

1.0.0 - Jan 10 2015
===================
  * use strict mode
  * jslint improvements
  * updated dependencies: epoll 0.1.4 -> 0.1.10
  * new wiring for tests on pi
  * GPIO access without superuser privileges on Raspbian

0.3.2 - Apr 18 2014
===================
  * Documented BeagleBone Ångström prerequisites
  * Updated dependencies: epoll 0.1.2 -> 0.1.4

0.3.1 - Mar 22 2014
===================
  * Added setDirection functionality [#19](https://github.com/fivdi/onoff/pull/19)
  * Added setEdge functionality
  * Updated dependencies: epoll 0.1.0 -> 0.1.2

0.3.0 - Nov 18 2013
===================
  * Updated dependencies: epoll 0.0.8 -> 0.1.0
  * Removed persistentWatch option

0.2.3 - Oct 14 2013
===================

  * Use epoll 0.0.8
  * onoff now plays well with the quick2wire gpio-admin and the WiringPi gpio utilities on the Pi [#14](https://github.com/fivdi/onoff/issues/14)
  * Documentation improved
  * New test to monitor interrupt performance
  * New light switch example

0.2.2 - Oct 05 2013
===================

  * Use epoll 0.0.7
  * Removed timeout hack in many-interrupts test

0.2.1 - Sep 25 2013
===================

  * Use epoll 0.0.3
  * Improved five-inputs test 

0.2.0 - Sep 22 2013
===================

  * Use epoll module for interrupt detection [#15](https://github.com/fivdi/onoff/issues/15)
  * 0.11.4+ compatability [#11](https://github.com/fivdi/onoff/issues/10)
  * One thread for watching all GPIOs rather than one thread per GPIO [#5](https://github.com/fivdi/onoff/issues/5)
  * Unwatch API added [#4](https://github.com/fivdi/onoff/issues/4)

0.1.7 - Sep 17 2013
===================

  * Remove OS limitations for installing [#12](https://github.com/fivdi/onoff/issues/12)

0.1.6 - July 15 2013
===================

  * Fixed typos
  * Documented how to watch five or more inputs

0.1.5 - May 26 2013
===================

  * Added test with five inputs

0.1.0 - Nov 11 2012
===================

  * Added Gpio objects
  * Removed functions, use Gpio objects instead
  * Performance improvements
  * Synchronous or asynchronous access to a GPIOs value
  * Allow applications to handle superuser issues

0.0.1 - Oct 28 2012
===================

  * Initial release

