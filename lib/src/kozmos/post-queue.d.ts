declare const Scheduler: any;
declare const syncdb: any;
declare class PostQueue {
    constructor(servers: any, options: any);
    add(updates: any, callback: any): void;
    all(callback: any): void;
    post(): void;
    onError(err: any): void;
    onHTTPError(err: any): void;
}
