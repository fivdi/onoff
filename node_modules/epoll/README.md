## epoll

Exposes the Linux epoll API for monitoring multiple file descriptors to see if
I/O is possible on any of them.

This module was initially written to detect EPOLLPRI events indicating that
urgent data is available for reading. EPOLLPRI events are triggered by
interrupt generating [GPIO](https://www.kernel.org/doc/Documentation/gpio.txt)
pins. The epoll module will be used by [onoff](https://github.com/fivdi/onoff)
to detect interrupts.

## Installation

    $ [sudo] npm install epoll

## API

TODO - Write API documentation!

