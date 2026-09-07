"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserTierType_enum_1 = require("./enum/UserTierType.enum");
const user_model_1 = require("./model/user.model");
const RateLimiter_service_1 = require("./service/RateLimiter.service");
const service = new RateLimiter_service_1.RateLimiterService();
const freeUser = new user_model_1.User("123", UserTierType_enum_1.UserTierType.FREE_TIER);
const premiumUser = new user_model_1.User("456", UserTierType_enum_1.UserTierType.PREMIUM_TIER);
let count = 1;
let totalReq = 120;
while (count <= totalReq) {
    const user = freeUser;
    if (service.allowrequest(user)) {
        console.log(`Request ${count} for ${user.getUserTier()} ALLOWED`);
    }
    else {
        console.log(`Request ${count} for ${user.getUserTier()} BLOCKED`);
    }
    const start = Date.now();
    while (Date.now() - start < 100) { }
    count++;
}
