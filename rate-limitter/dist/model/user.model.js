"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(userId, tier) {
        this.userId = userId;
        this.tier = tier;
    }
    getUserId() {
        return this.userId;
    }
    getUserTier() {
        return this.tier;
    }
}
exports.User = User;
