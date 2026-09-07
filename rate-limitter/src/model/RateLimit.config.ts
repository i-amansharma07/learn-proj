export class RateLimitConfig {
  maxRequests: number;
  windowInSeconds: number;

  constructor(maxRequests: number, windowInSeconds: number) {
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
