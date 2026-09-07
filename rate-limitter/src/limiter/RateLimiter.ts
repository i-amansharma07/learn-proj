import { RateLimitType } from "../enum/RateLimitType.enum";
import { RateLimitConfig } from "../model/RateLimit.config";

export abstract class RateLimiter {
  protected readonly config: RateLimitConfig;
  protected readonly type: RateLimitType;

  constructor(config: RateLimitConfig, type: RateLimitType) {
    this.config = config;
    this.type = type;
  }

  public abstract allowRequest(userId: string): boolean;
}
