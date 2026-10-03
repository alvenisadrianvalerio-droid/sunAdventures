export const SUPPORTED_QUOTE_CURRENCIES = ["EUR", "USD", "MXN", "ARS", "COP", "CLP", "PEN", "VES"] as const;
export type QuoteCurrency = typeof SUPPORTED_QUOTE_CURRENCIES[number];

export type CurrencyQuotes = {
  currency: QuoteCurrency;
  fetchedAt: string;
  usd: {
    value: number;
    localPerUsd: number;
    source: string;
    asOf: string;
  };
  usdt?: {
    value: number;
    localPerUsdt: number;
    buyLocalPerUsdt: number;
    sellLocalPerUsdt: number;
    source: string;
    asOf: string;
  };
};

const responseCache = new Map<QuoteCurrency, { expiresAt: number; value: CurrencyQuotes }>();
const CACHE_DURATION_MS = 45_000;

function parseLocalizedNumber(value: string) {
  const parsed = Number(value.replace(/\./g, "").replace(",", ".").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error("El proveedor devolvió un precio no válido.");
  return parsed;
}

async function fetchBcvUsdRate() {
  try {
    const response = await fetch("https://www.bcv.org.ve/", { signal:AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`BCV respondió HTTP ${response.status}.`);
    const html = await response.text();
    const usdPosition = html.search(/<span>\s*USD\s*<\/span>/i);
    if (usdPosition < 0) throw new Error("No se encontró la tasa USD publicada por el BCV.");
    const fragment = html.slice(usdPosition, usdPosition + 700);
    const rawValue = fragment.match(/<strong[^>]*>\s*([\d.,]+)\s*<\/strong>/i)?.[1];
    if (!rawValue) throw new Error("No se pudo leer la tasa USD publicada por el BCV.");
    const date = html.match(/Fecha\s+Valor:\s*([^<]+)/i)?.[1]?.replace(/&nbsp;/gi, " ").trim() || "Fecha BCV no disponible";
    return { localPerUsd:parseLocalizedNumber(rawValue), asOf:date };
  } catch (directError) {
    console.warn("BCV direct access failed; trying its public page through a text reader.", directError);
    const response = await fetch("https://r.jina.ai/http://www.bcv.org.ve/", { signal:AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`El lector de la página del BCV respondió HTTP ${response.status}.`);
    const text = await response.text();
    const usdPosition = text.search(/^(?:>\s*)?!\[[^\]]*\]\([^)]+\)\s*USD\s*$/im);
    if (usdPosition < 0) throw new Error("No se encontró la tasa USD del BCV en la página pública.");
    const fragment = text.slice(usdPosition, usdPosition + 500);
    const rawValue = fragment.match(/\*\*([\d.,]+)\*\*/)?.[1];
    if (!rawValue) throw new Error("No se pudo leer la tasa USD del BCV desde la página pública.");
    const date = fragment.match(/Fecha\s+Valor:\s*([^\r\n]+)/i)?.[1]?.replace(/^>\s*/, "").trim() || "Fecha BCV no disponible";
    return { localPerUsd:parseLocalizedNumber(rawValue), asOf:date };
  }
}

async function fetchBinanceSide(tradeType: "BUY" | "SELL") {
  const response = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
    method:"POST",
    headers:{ "Content-Type":"application/json", "clienttype":"web" },
    body:JSON.stringify({
      fiat:"VES",
      page:1,
      rows:10,
      tradeType,
      asset:"USDT",
      countries:[],
      proMerchantAds:false,
      shieldMerchantAds:false,
      filterType:"all",
      periods:[],
      payTypes:[],
      publisherType:null,
      transAmount:null
    }),
    signal:AbortSignal.timeout(12_000)
  });
  if (!response.ok) throw new Error(`Binance P2P respondió HTTP ${response.status}.`);
  const result = await response.json();
  const prices = (Array.isArray(result?.data) ? result.data : [])
    .map((item: { adv?: { price?: string } }) => Number(item.adv?.price))
    .filter((price: number) => Number.isFinite(price) && price > 0)
    .sort((left: number, right: number) => tradeType === "BUY" ? left - right : right - left)
    .slice(0, 5);
  if (!prices.length) throw new Error("Binance P2P no devolvió ofertas VES/USDT.");
  return prices[Math.floor(prices.length / 2)];
}

export async function fetchCurrencyQuotes(currency: string): Promise<CurrencyQuotes> {
  if (!SUPPORTED_QUOTE_CURRENCIES.includes(currency as QuoteCurrency)) {
    throw new Error("La moneda solicitada no está disponible.");
  }
  const code = currency as QuoteCurrency;
  const cached = responseCache.get(code);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const fetchedAt = new Date().toISOString();
  let quotes: CurrencyQuotes;
  if (code === "VES") {
    const [official, buyLocalPerUsdt, sellLocalPerUsdt] = await Promise.all([
      fetchBcvUsdRate(),
      fetchBinanceSide("BUY"),
      fetchBinanceSide("SELL")
    ]);
    const localPerUsdt = (buyLocalPerUsdt + sellLocalPerUsdt) / 2;
    quotes = {
      currency:code,
      fetchedAt,
      usd:{
        value:1 / official.localPerUsd,
        localPerUsd:official.localPerUsd,
        source:"BCV oficial",
        asOf:official.asOf
      },
      usdt:{
        value:1 / localPerUsdt,
        localPerUsdt,
        buyLocalPerUsdt,
        sellLocalPerUsdt,
        source:"Binance P2P",
        asOf:fetchedAt
      }
    };
  } else {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { signal:AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`El proveedor de tipos de cambio respondió HTTP ${response.status}.`);
    const result = await response.json();
    const localPerUsd = Number(result?.rates?.[code]);
    if (result?.result !== "success" || !Number.isFinite(localPerUsd) || localPerUsd <= 0) {
      throw new Error(`No hay una tasa disponible para ${code}.`);
    }
    quotes = {
      currency:code,
      fetchedAt,
      usd:{
        value:1 / localPerUsd,
        localPerUsd,
        source:"ExchangeRate-API (referencia)",
        asOf:result.time_last_update_utc || "Actualización no disponible"
      }
    };
  }

  responseCache.set(code, { expiresAt:Date.now() + CACHE_DURATION_MS, value:quotes });
  return quotes;
}
