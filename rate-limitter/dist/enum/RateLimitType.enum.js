"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitType = void 0;
var RateLimitType;
(function (RateLimitType) {
    RateLimitType["TOKEN_BUCKET"] = "TOKEN_BUCKET";
    RateLimitType["FIXED_WINDOW"] = "FIXED_WINDOW";
    RateLimitType["SLIDING_WINDOW"] = "SLIDING_WINDOW";
    RateLimitType["SLIDING_WINDOW_COUNTER"] = "SLIDING_WINDOW_COUNTER";
})(RateLimitType || (exports.RateLimitType = RateLimitType = {}));
