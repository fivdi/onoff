'use strict';

class Epoll {
  static get EPOLLPRI() { return 2; }

  constructor(callback) {
    this._callback = callback;
    this._timeout = null;
  }

  add(fd, events) {
    this._timeout = setTimeout(() => {
      this._callback(null, fd, events);
    }, 10);
  }

  remove(fd) {
    if (this._timeout !== null) {
      clearTimeout(this._timeout);
    }
  }
}

exports.Epoll = Epoll;

