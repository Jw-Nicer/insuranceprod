// A generic claim type
export type Claim = {
  [key: string]: string | number;
};

export interface PremiumHistory {
  year: number;
  premium: number;
}

export interface UploadedData {
  history: PremiumHistory[];
  totalLossPaid: number;
  totalExpensePaid: number;
  totalPremium: number;
  totalClaims: number;
}
