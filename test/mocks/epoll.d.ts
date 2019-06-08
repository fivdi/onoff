export class Epoll {
    static EPOLLPRI: number;
  
    constructor(callback: (error: Error | null | undefined, fd: any, events: any) => void);
  
    add(fd: any, events: any): void;
  
    remove(fd: any): void;
  }