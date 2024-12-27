export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  supply: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  volume?: number;
  high?: number;
  low?: number;
}

// Mock data generator
export const getMockPriceHistory = (days: number = 7): PriceHistory[] => {
  const now = Date.now();
  const oneDayMs = 86400000;
  const data: PriceHistory[] = [];
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * oneDayMs);
    const basePrice = 45000; // Base price for simulation
    const randomFactor = 0.1; // 10% maximum variation
    const price = basePrice * (1 + (Math.random() * 2 - 1) * randomFactor);
    
    data.push({
      timestamp,
      price,
      volume: Math.random() * 1000000,
      high: price * 1.02,
      low: price * 0.98,
    });
  }
  
  return data;
};