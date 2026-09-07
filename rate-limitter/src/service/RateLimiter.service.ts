import { RateLimitType } from "../enum/RateLimitType.enum";
import { UserTierType } from "../enum/UserTierType.enum";
import { RateLimiter } from "../limiter/RateLimiter";
import { RateLimitFactory } from "../factory/RateLimitFactory";
import { RateLimitConfig } from "../model/RateLimit.config";
import { User } from "../model/user.model";

export class RateLimiterService {
  private rateLimiters = new Map<UserTierType, RateLimiter>();

  constructor() {
    this.rateLimiters.set(
      UserTierType.FREE_TIER,
      RateLimitFactory.createRateLimiter(
        RateLimitType.FIXED_WINDOW,
        new RateLimitConfig(15, 60),
      ),
    );

    this.rateLimiters.set(
      UserTierType.PREMIUM_TIER,
      RateLimitFactory.createRateLimiter(
        RateLimitType.FIXED_WINDOW,
        new RateLimitConfig(100, 60),
      ),
    );
  }

  public allowrequest(user: User): boolean {
    const limiter: RateLimiter | undefined = this.rateLimiters.get(
      user.getUserTier(),
    );

    if (limiter === undefined) {
      throw new Error("limiter not present");
    }

    return limiter.allowRequest(user.getUserId());
  }
}
