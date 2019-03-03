export type High = 1;
export type Low = 0;
export type Direction = "in" | "out" | "high" | "low";
export type Edge = "none" | "rising" | "falling" | "both";

export type Options = {
    debounceTimeout?: number,
    activeLow?: boolean,
    reconfigureDirection?: boolean,
}

export type BinaryValue = High | Low;
export type ValueCallback = (err: Error | null | undefined, value: BinaryValue) => void;

export class Gpio {
    static HIGH: High;
    static LOW: Low;
    static accessible: boolean;

    constructor(gpio: number, direction: Direction, edge?: Edge, options?: Options);

    read(callback: ValueCallback): void;
    read(): Promise<BinaryValue>;

    readSync(): BinaryValue;

    write(value: BinaryValue, callback: (err: Error | null | undefined) => void): void;
    write(value: BinaryValue): Promise<void>;

    writeSync(value: BinaryValue): void;

    watch(callback: ValueCallback): void;
    unwatch(callback?: ValueCallback): void;
    unwatchAll(): void;

    direction(): Direction;
    setDirection(direction: Direction): void;

    edge(): Edge;
    setEdge(edge: Edge): void;

    activeLow(): boolean;
    setActiveLow(invert: boolean): void;

    unexport(): void
}
