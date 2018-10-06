export default class Scheduler {
    interval: number;
    scheduledAt: number;
    lastCalledAt: number;
    timer?: number;
    callFn: () => void;
    constructor(options: any);
    schedule(customIntervalSecs?: number): void;
    abort(): void;
    reschedule(customInterval: any): void;
    call(): void;
}
