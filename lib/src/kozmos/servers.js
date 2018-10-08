"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pull_1 = require("./pull");
const push_1 = require("./push");
const _api_1 = require(".api");
class Servers extends _api_1.default {
    constructor(options) {
        super(options);
        this.pull = new pull_1.default(this, options);
        this.push = new push_1.default(this, options);
        this.onPostUpdates = options.onPostUpdates;
        this.onReceiveUpdates = options.onReceiveUpdates;
        this.onErrorParam = options.onError;
    }
    onError(error, action) {
        if (this.onErrorParam) {
            this.onErrorParam(error, action);
        }
    }
}
exports.default = Servers;
module.exports = Servers;
