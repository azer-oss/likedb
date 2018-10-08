export default class Scheduler {
    constructor(options: any);
    schedule(customIntervalSecs?: number): void;
    abort(): void;
    reschedule(customInterval: any): void;
    call(): void;
}
