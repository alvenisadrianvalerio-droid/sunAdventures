import { fetchCurrencyQuotes } from "../_shared/currency-quotes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
};

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers:corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status:405, headers:corsHeaders });

  try {
    const { currency } = await request.json();
    const quotes = await fetchCurrencyQuotes(String(currency || ""));
    return Response.json(quotes, { headers:corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron consultar las cotizaciones.";
    console.error("currency-quotes:", error);
    return Response.json({ error:message }, { status:502, headers:corsHeaders });
  }
});
