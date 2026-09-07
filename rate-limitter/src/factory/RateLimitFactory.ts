import { RateLimitType } from "../enum/RateLimitType.enum";
import { FixedWindow } from "../limiter/FixedWindow";
import { RateLimitConfig } from "../model/RateLimit.config";

export class RateLimitFactory {
  static createRateLimiter(algo: RateLimitType, config: RateLimitConfig) {
    switch (algo) {
      case RateLimitType.FIXED_WINDOW:
        return new FixedWindow(config);

      default:
        throw new Error(`Unsupported rate limit algorithm: ${algo}`);
    }
  }
}
