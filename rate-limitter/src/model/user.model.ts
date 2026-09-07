import { UserTierType } from "../enum/UserTierType.enum";

export class User {
  userId: string;
  tier: UserTierType;

  constructor(userId: string, tier: UserTierType) {
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
