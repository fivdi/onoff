'use strict';

export class Epoll {
  static get EPOLLPRI() { return 2; }

  _callback: any;
  _timeout: any;

  constructor(callback: any) {
    this._callback = callback;
    this._timeout = null;
  }

  add(fd: any, events: any) {
    this._timeout = setTimeout(() => {
      this._callback(null, fd, events);
    }, 10);
  }

  remove(fd: any) {
    if (this._timeout !== null) {
      clearTimeout(this._timeout);
    }
  }
}
