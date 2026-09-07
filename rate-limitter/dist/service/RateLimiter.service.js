"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiterService = void 0;
const RateLimitType_enum_1 = require("../enum/RateLimitType.enum");
const UserTierType_enum_1 = require("../enum/UserTierType.enum");
const RateLimitFactory_1 = require("../factory/RateLimitFactory");
const RateLimit_config_1 = require("../model/RateLimit.config");
class RateLimiterService {
    constructor() {
        this.rateLimiters = new Map();
        this.rateLimiters.set(UserTierType_enum_1.UserTierType.FREE_TIER, RateLimitFactory_1.RateLimitFactory.createRateLimiter(RateLimitType_enum_1.RateLimitType.FIXED_WINDOW, new RateLimit_config_1.RateLimitConfig(15, 60)));
        this.rateLimiters.set(UserTierType_enum_1.UserTierType.PREMIUM_TIER, RateLimitFactory_1.RateLimitFactory.createRateLimiter(RateLimitType_enum_1.RateLimitType.FIXED_WINDOW, new RateLimit_config_1.RateLimitConfig(100, 60)));
    }
    allowrequest(user) {
        const limiter = this.rateLimiters.get(user.getUserTier());
        if (limiter === undefined) {
            throw new Error("limiter not present");
        }
        return limiter.allowRequest(user.getUserId());
    }
}
exports.RateLimiterService = RateLimiterService;
