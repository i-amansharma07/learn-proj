"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitConfig = void 0;
class RateLimitConfig {
    constructor(maxRequests, windowInSeconds) {
        this.maxRequests = maxRequests;
        this.windowInSeconds = windowInSeconds;
    }
    getUserId() {
        return this.maxRequests;
    }
    getUserTier() {
        return this.windowInSeconds;
    }
}
exports.RateLimitConfig = RateLimitConfig;
