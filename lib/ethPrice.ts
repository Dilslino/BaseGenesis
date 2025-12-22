/**
 * ETH Price Service
 *
 * Fetches real-time ETH price from CoinGecko API.
 * Includes caching to avoid excessive API calls.
 */

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_DURATION_MS = 60 * 1000; // 1 minute cache

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

// Fallback price if API fails
const FALLBACK_ETH_PRICE = 3500;

/**
 * Fetch current ETH price in USD
 *
 * @returns ETH price in USD
 */
export async function getEthPrice(): Promise<number> {
  // Return cached price if still valid
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION_MS) {
    return priceCache.price;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=ethereum&vs_currencies=usd`,
      {
        headers: { 'Accept': 'application/json' },
        // Cache for 1 minute on the server
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data?.ethereum?.usd;

    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Invalid price data from CoinGecko');
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now()
    };

    return price;
  } catch (error) {
    console.error('Failed to fetch ETH price:', error);

    // Return cached price if available, otherwise fallback
    if (priceCache) {
      console.warn('Using stale cached ETH price');
      return priceCache.price;
    }

    console.warn(`Using fallback ETH price: $${FALLBACK_ETH_PRICE}`);
    return FALLBACK_ETH_PRICE;
  }
}

/**
 * Convert USD amount to ETH
 *
 * @param usdAmount - Amount in USD
 * @returns Amount in ETH
 */
export async function usdToEth(usdAmount: number): Promise<number> {
  const ethPrice = await getEthPrice();
  return usdAmount / ethPrice;
}

/**
 * Convert ETH amount to USD
 *
 * @param ethAmount - Amount in ETH
 * @returns Amount in USD
 */
export async function ethToUsd(ethAmount: number): Promise<number> {
  const ethPrice = await getEthPrice();
  return ethAmount * ethPrice;
}
