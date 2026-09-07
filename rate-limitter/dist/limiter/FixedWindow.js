"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedWindow = void 0;
const RateLimitType_enum_1 = require("../enum/RateLimitType.enum");
const RateLimiter_1 = require("./RateLimiter");
class FixedWindow extends RateLimiter_1.RateLimiter {
    constructor(config) {
        super(config, RateLimitType_enum_1.RateLimitType.FIXED_WINDOW);
        //user's count in current userWindow
        this.requestCount = new Map();
        //user's Window
        this.userWindow = new Map();
    }
    allowRequest(userId) {
        var _a;
        // ex : 20000/1000/10 = 2nd userWindow
        let currentWindow = Math.floor(Date.now() / 1000 / this.config.windowInSeconds);
        let lastWindow = this.userWindow.get(userId);
        let count = (_a = this.requestCount.get(userId)) !== null && _a !== void 0 ? _a : 0;
        if (lastWindow === undefined || currentWindow !== lastWindow) {
            //make new userWindow, reset counter
            this.userWindow.set(userId, currentWindow);
            this.requestCount.set(userId, 1);
            return true;
        }
        else if (count < this.config.maxRequests) {
            //increase count in same userWindow
            this.requestCount.set(userId, count + 1);
            return true;
        }
        return false;
    }
}
exports.FixedWindow = FixedWindow;
/*


currentWindow = calculate current userWindow

user's lastWindow = stored userWindow

IF user has entered a new userWindow:
    reset counter
    allow request

ELSE:
    IF count < maxRequests:
        increment count
        allow request

    ELSE:
        reject request
        
        
*/
