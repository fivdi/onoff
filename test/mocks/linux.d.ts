
export function gpio(pin: any): void;

export function gpioWithoutPinFiles(): void;

export function makeGpioAccessible(): void;

export function makeGpioInaccessible(): void;

export function read(pin: any): any;

export function write(pin: any, value: any): void;

export function readDirection(pin: any): any;

export function writeDirection(pin: any, direction: any): void;

export function readEdge(pin: void): any;

export function writeEdge(pin: any, edge: any): void;

export function readActiveLow(pin: any): any;

export function writeActiveLow(pin: any, value: any): void;

export function restore(): void;
