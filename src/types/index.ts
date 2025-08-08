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

export interface Transaction {
  category: string;
  supplierName: string;
  spend: number;
  addressable: boolean;
  discoverable: boolean;
}

export interface Gpt {
  name: string;
  description: string;
  url: string;
}
