
export class Gpio {
    static HIGH: High;
    static LOW: Low;
    static accessible: boolean;

    constructor(gpio: number, direction: Directions, edge?: Edges, options?: Options);

    read(callback: ValueCallback): void;
    read(): Promise<BinaryValue>;

    readSync(): BinaryValue;

    write(value: BinaryValue, callback: (err: Error | undefined) => void): void;
    write(value: BinaryValue): Promise<void>;

    writeSync(value: BinaryValue): void;

    watch(callback: ValueCallback): void;
    unwatch(callback?: ValueCallback): void;
    unwatchAll(): void;

    direction(): Directions;
    setDirection(direction: Directions): void;

    edge(): Edges;
    setEdge(edge: Edges): void;

    activeLow(): boolean;
    setActiveLow(invert: boolean): void;

    unexport(): void
}

export type Directions = "in" | "out" | "high" | "low";
export type Edges = "none" | "rising" | "falling" | "both";
export type Options = {
    debounceTimeout?: number,
    activeLow?: boolean,
    reconfigureDirection?: boolean,
}
export type High = 1;
export type Low = 0;
export type BinaryValue = High | Low;
export type ValueCallback = (err: Error | undefined, value: BinaryValue) => void;

