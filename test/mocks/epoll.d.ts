export class Epoll {
    static EPOLLPRI: number;
  
    constructor(callback: (args: any) => void);
  
    add(fd: any, events: any): void;
  
    remove(fd: any): void;
  }