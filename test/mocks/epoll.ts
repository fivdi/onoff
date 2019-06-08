'use strict';

export class Epoll {
  static get EPOLLPRI(): number { return 2; }

  private callback: any;
  private timeout: any;

  constructor(callback: (error: Error | null | undefined, fd: any, events: any) => void) {
    this.callback = callback;
    this.timeout = null;
  }

  add(fd: any, events: any) {
    this.timeout = setTimeout(() => {
      this.callback(null, fd, events);
    }, 10);
  }

  remove(fd: any) {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
    }
  }
}
