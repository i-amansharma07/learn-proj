"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitFactory = void 0;
const RateLimitType_enum_1 = require("../enum/RateLimitType.enum");
const FixedWindow_1 = require("../limiter/FixedWindow");
class RateLimitFactory {
    static createRateLimiter(algo, config) {
        switch (algo) {
            case RateLimitType_enum_1.RateLimitType.FIXED_WINDOW:
                return new FixedWindow_1.FixedWindow(config);
            default:
                throw new Error(`Unsupported rate limit algorithm: ${algo}`);
        }
    }
}
exports.RateLimitFactory = RateLimitFactory;
