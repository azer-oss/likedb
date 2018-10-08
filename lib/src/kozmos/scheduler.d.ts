declare class Scheduler {
    constructor(options: any);
    schedule(customInterval: any): void;
    abort(): void;
    reschedule(customInterval: any): void;
    call(): void;
}
