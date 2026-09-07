import { UserTierType } from "./enum/UserTierType.enum";
import { User } from "./model/user.model";
import { RateLimiterService } from "./service/RateLimiter.service";

const service = new RateLimiterService();
const freeUser = new User("123", UserTierType.FREE_TIER);
const premiumUser = new User("456", UserTierType.PREMIUM_TIER);

let count = 1;
let totalReq = 120;

while (count <= totalReq) {
  const user = freeUser;
  if (service.allowrequest(user)) {
    console.log(`Request ${count} for ${user.getUserTier()} ALLOWED`);
  } else {
    console.log(`Request ${count} for ${user.getUserTier()} BLOCKED`);
  }
  const start = Date.now();

  while (Date.now() - start < 100) {}
  count++;
}
