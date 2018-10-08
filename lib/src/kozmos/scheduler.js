"use strict";
class Scheduler {
    constructor(options) {
        this.interval = options.interval || 5; // seconds
        this.scheduledAt = 0;
        this.lastCalledAt = 0;
        this.timer = undefined;
        this.callFn = options.fn;
        window.addEventListener('online', () => this.schedule());
        window.addEventListener('offline', () => this.abort());
    }
    schedule(customInterval) {
        if (this.scheduledAt > 0 || !navigator.onLine) {
            // Already scheduled or offline
            return;
        }
        this.scheduledAt = Date.now();
        let interval = this.interval * 1000;
        // If last call was more than [interval] seconds ago
        // Make the call immediately
        if (this.lastCalledAt < Date.now() - interval) {
            interval = 0;
        }
        if (typeof customInterval === 'number') {
            interval = customInterval * 1000;
        }
        this.timer = setTimeout(() => this.call(), interval);
    }
    abort() {
        try {
            clearTimeout(this.timer);
            this.timer = undefined;
            this.scheduledAt = 0;
        }
        catch (err) {
        }
    }
    reschedule(customInterval) {
        this.abort();
        this.schedule(customInterval);
    }
    call() {
        this.lastCalledAt = Date.now();
        this.scheduledAt = 0;
        this.timer = undefined;
        this.callFn();
    }
}
module.exports = Scheduler;
