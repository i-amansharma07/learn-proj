import { RateLimitConfig } from "../model/RateLimit.config";
import { RateLimitType } from "../enum/RateLimitType.enum";
import { RateLimiter } from "./RateLimiter";

export class FixedWindow extends RateLimiter {
  //user's count in current userWindow
  private readonly requestCount = new Map<string, number>();
  //user's Window
  private readonly userWindow = new Map<string, number>();

  constructor(config: RateLimitConfig) {
    super(config, RateLimitType.FIXED_WINDOW);
  }

  public allowRequest(userId: string): boolean {
    // ex : 20000/1000/10 = 2nd userWindow
    let currentWindow = Math.floor(
      Date.now() / 1000 / this.config.windowInSeconds,
    );

    let lastWindow = this.userWindow.get(userId);

    let count = this.requestCount.get(userId) ?? 0;

    if (lastWindow === undefined || currentWindow !== lastWindow) {
      //make new userWindow, reset counter
      this.userWindow.set(userId, currentWindow);
      this.requestCount.set(userId, 1);
      return true;
    } else if (count < this.config.maxRequests) {
      //increase count in same userWindow
      this.requestCount.set(userId, count + 1);
      return true;
    }

    return false;
  }
}

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
