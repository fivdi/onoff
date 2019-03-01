import { watch, unwatchFile } from "fs";


declare type Directions = "in" | "out";
declare type Edges = "none" | "rising" | "falling" | "both";
declare type GpioOptions = {
    debounceTimeout: number,
    activeLow: boolean,
    reconfigureDirection: boolean,
}
declare type BinaryValue = 0 | 1;
declare type ValueCallback = (err: Error | undefined, value: BinaryValue) => void;

declare class Gpio {
    static HIGH: number;
    static LOW: number;
    static accessible: boolean;
    constructor(gpio: number, direction: Directions | "high" | "low", edge: Edges);

    read(callback: ValueCallback): void;
    read(): Promise<BinaryValue>;

    readSync(): BinaryValue;

    write(value: BinaryValue, callback: (err?: Error) => void): void;
    write(value: BinaryValue): Promise<void>;

    writeSync(value: BinaryValue): void;

    watch(callback: ValueCallback): void;
    unwatch(callback: ValueCallback): void;
    unwatchAll(): void;

    direction(): Directions;
    setDirection(direction: Directions): void;

    edge(): Edges;
    setEdge(edge: Edges): void;

    activeLow(): boolean;
    setActiveLow(invert?: boolean): void;

    unexport(): void
}