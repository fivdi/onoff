3.2.1 - Jul 28 2018
===================

  * code style
  * update dependencies (epoll v2.0.3)

3.2.0 - Jul 24 2018
===================

  * add test to ensure HIGH and LOW have the expected values
  * add unittests (thank you [@pizzaisdavid](https://github.com/pizzaisdavid))
  * set active_low before setting direction in constructor
  * add constructor reconfigureDirection option

3.1.0 - May 13 2018
===================

  * replace new Buffer with Buffer.from or Buffer.alloc
  * add accessebile property to Gpio class (thank you [@johntalton](https://github.com/johntalton))
  * add HIGH and LOW properties to Gpio class (thank you [@johntalton](https://github.com/johntalton))

3.0.2 - Apr 07 2018
===================

  * update dependencies (epoll v2.0.1)
  * improve performance tests

3.0.1 - Apr 01 2018
===================

  * create poller for both inputs and outputs
  * add test to verify that gpio direction can be changed

3.0.0 - Mar 31 2018
===================

  * add effective debouncing support
  * codebase modernized
  * remove link to outdated tutorial
  * remove undocumented options method

2.0.0 - Feb 26 2018
===================

  * update dependencies (epoll v2.0.0)
  * drop support for node.js v0.10, v0.12, v5 and v7

1.2.0 - Feb 11 2018
===================

  * ignore edge argument when instantiating a Gpio for an output

1.1.9 - Dec 24 2017
===================

  * document node 9 support
  * update BeagleBone performance numbers
  * many documentation improvements
  * update BeagleBone Black performance numbers
  * update dependencies

1.1.8 - Oct 15 2017
===================

  * update dependencies (epoll v1.0.0)

1.1.7 - Aug 26 2017
===================

  * only check permissions for edge file if edge specified [#77](https://github.com/fivdi/onoff/issues/77)

1.1.5 - Jul 30 2017
===================

  * wait until unprivileged file access allowed

1.1.4 - Jul 15 2017
===================

  * improve examples

1.1.3 - Jun 18 2017
===================
  * upgrade to epoll v0.1.22
  * document related packages

1.1.2 - Feb 12 2017
===================
  * documentation improved
  * upgrade to epoll v0.1.21

1.1.1 - Jun 05 2016
===================
  * avoid exceptions when cape_universal is enabled on the bbb [#50](https://github.com/fivdi/onoff/issues/50)

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

