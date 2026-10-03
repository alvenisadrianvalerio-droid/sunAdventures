import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";
import { fetchCurrencyQuotes, type QuoteCurrency } from "../_shared/currency-quotes.ts";

type ReminderPreference = {
  user_id: string;
  grupo_id: string | null;
  personal_enabled: boolean;
  group_enabled: boolean;
  reminder_time: string;
  timezone: string;
  locale: string;
  last_sent_date: string | null;
};

type PriceAlertPreference = {
  user_id: string;
  moneda: QuoteCurrency;
  last_usd_value: number | string | null;
  last_usdt_value: number | string | null;
  last_alert_usd_value: number | string | null;
  last_alert_usdt_value: number | string | null;
  last_checked_at: string | null;
  last_notified_at: string | null;
  history: unknown;
};

type QuotePoint = { t:number; usd:number; usdt:number | null };

const COPY: Record<string, { personal: [string, string]; group: [string, string] }> = {
  es: {
    personal: ["Finanzas personales", "Recuerda registrar los gastos personales de hoy."],
    group: ["Finanzas del grupo", "Recuerda registrar los gastos de hoy en el grupo."]
  },
  en: {
    personal: ["Personal finances", "Remember to log today's personal expenses."],
    group: ["Group finances", "Remember to log today's group expenses."]
  },
  pt: {
    personal: ["Finanças pessoais", "Lembre-se de registrar as despesas pessoais de hoje."],
    group: ["Finanças do grupo", "Lembre-se de registrar as despesas do grupo de hoje."]
  },
  zh: {
    personal: ["个人财务", "记得记录今天的个人支出。"],
    group: ["群组财务", "记得记录今天的群组支出。"]
  },
  ja: {
    personal: ["個人の家計", "今日の個人支出を記録しましょう。"],
    group: ["グループの家計", "今日のグループ支出を記録しましょう。"]
  },
  ko: {
    personal: ["개인 재정", "오늘의 개인 지출을 기록해 주세요."],
    group: ["그룹 재정", "오늘의 그룹 지출을 기록해 주세요."]
  },
  it: {
    personal: ["Finanze personali", "Ricorda di registrare le spese personali di oggi."],
    group: ["Finanze del gruppo", "Ricorda di registrare le spese del gruppo di oggi."]
  },
  fr: {
    personal: ["Finances personnelles", "Pensez à enregistrer les dépenses personnelles d’aujourd’hui."],
    group: ["Finances du groupe", "Pensez à enregistrer les dépenses du groupe d’aujourd’hui."]
  }
};

function localDateTime(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone:timezone,
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    hourCycle:"h23"
  }).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)?.value || "";
  return {
    date:`${value("year")}-${value("month")}-${value("day")}`,
    time:`${value("hour")}:${value("minute")}`
  };
}

function toNumber(value: number | string | null) {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function changedByThreshold(current: number, previous: number | null) {
  return previous !== null && previous !== 0 && Math.abs(current - previous) / Math.abs(previous) >= .001;
}

function direction(current: number, previous: number | null) {
  if (previous === null || current === previous) return "→";
  return current > previous ? "↑" : "↓";
}

function formatRate(value: number) {
  return value.toPrecision(5).replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
}

function validQuoteHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is QuotePoint =>
    typeof item === "object" && item !== null &&
    Number.isFinite(Number(item.t)) &&
    Number.isFinite(Number(item.usd)) &&
    (item.usdt === null || Number.isFinite(Number(item.usdt)))
  ).map(item => ({ t:Number(item.t), usd:Number(item.usd), usdt:item.usdt === null ? null : Number(item.usdt) })).slice(-29);
}

function quoteImage(history: QuotePoint[], currency: QuoteCurrency) {
  const lines: Array<{ key:"usd" | "usdt"; color:string }> = [{ key:"usd", color:"#f3c96e" }];
  if (currency === "VES") lines.push({ key:"usdt", color:"#65d3b2" });
  const values = history.flatMap(point => lines.map(line => point[line.key]).filter((value): value is number => value !== null));
  if (values.length < 2) return undefined;
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min *= .999; max *= 1.001; }
  const paths = lines.map(line => {
    const series = history.filter(point => point[line.key] !== null);
    const points = series.map((point, index) => {
      const x = 20 + index / Math.max(1, series.length - 1) * 520;
      const y = 125 - ((point[line.key] as number) - min) / (max - min) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<polyline points="${points}" fill="none" stroke="${line.color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="150" viewBox="0 0 560 150"><rect width="560" height="150" rx="16" fill="#18201e"/><path d="M20 128H540" stroke="#ffffff" stroke-opacity=".16"/>${paths}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

Deno.serve(async request => {
  if (request.method !== "POST") return new Response("Method not allowed", { status:405 });

  const secret = Deno.env.get("FINANCE_REMINDER_CRON_SECRET");
  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return new Response("Unauthorized", { status:401 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!supabaseUrl || !serviceRoleKey || !vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
      throw new Error("Falta configurar una variable requerida de Supabase o VAPID.");
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: preferences, error } = await admin
      .from("finanzas_recordatorios")
      .select("user_id,grupo_id,personal_enabled,group_enabled,reminder_time,timezone,locale,last_sent_date");
    if (error) throw error;

    let sent = 0;
    let failed = 0;
    for (const preference of (preferences || []) as ReminderPreference[]) {
      let local: ReturnType<typeof localDateTime>;
      try {
        local = localDateTime(new Date(), preference.timezone);
      } catch (error) {
        failed++;
        console.error(`Zona horaria no válida para ${preference.user_id}:`, error);
        continue;
      }
      if (local.time !== preference.reminder_time.slice(0, 5) || preference.last_sent_date === local.date) continue;

      const notifications: Array<{ scope: "personal" | "group"; recipients: string[] }> = [];
      if (preference.personal_enabled) {
        const { count, error: expenseError } = await admin.from("finanzas_movimientos")
          .select("id", { count:"exact", head:true })
          .eq("user_id", preference.user_id)
          .is("grupo_id", null)
          .eq("tipo", "gasto")
          .eq("fecha", local.date);
        if (expenseError) throw expenseError;
        if (!count) notifications.push({ scope:"personal", recipients:[preference.user_id] });
      }

      if (preference.group_enabled && preference.grupo_id) {
        const { count, error: expenseError } = await admin.from("finanzas_movimientos")
          .select("id", { count:"exact", head:true })
          .eq("grupo_id", preference.grupo_id)
          .eq("tipo", "gasto")
          .eq("fecha", local.date);
        if (expenseError) throw expenseError;
        if (!count) {
          const { data: members, error: membersError } = await admin.from("grupo_miembros")
            .select("user_id").eq("grupo_id", preference.grupo_id);
          if (membersError) throw membersError;
          notifications.push({ scope:"group", recipients:(members || []).map(member => member.user_id) });
        }
      }

      if (!notifications.length) continue;
      const { data: claimed, error: claimError } = await admin.from("finanzas_recordatorios")
        .update({ last_sent_date:local.date, updated_at:new Date().toISOString() })
        .eq("user_id", preference.user_id)
        .or(`last_sent_date.is.null,last_sent_date.neq.${local.date}`)
        .select("user_id");
      if (claimError) throw claimError;
      if (!claimed?.length) continue;

      const recipientIds = [...new Set(notifications.flatMap(notification => notification.recipients))];
      if (!recipientIds.length) continue;
      const { data: subscriptions, error: subscriptionsError } = await admin.from("push_subscriptions")
        .select("id,user_id,subscription").in("user_id", recipientIds);
      if (subscriptionsError) throw subscriptionsError;

      for (const notification of notifications) {
        const recipients = new Set(notification.recipients);
        const [title, body] = (COPY[preference.locale] || COPY.es)[notification.scope];
        const payload = JSON.stringify({
          title,
          body,
          url:"./#finanzas",
          tag:`finance-${notification.scope}-${local.date}`
        });
        const scopedSubscriptions = (subscriptions || []).filter(subscription => recipients.has(subscription.user_id));
        for (const subscription of scopedSubscriptions) {
          try {
            await webpush.sendNotification(subscription.subscription, payload);
            sent++;
          } catch (pushError) {
            const statusCode = typeof pushError === "object" && pushError !== null && "statusCode" in pushError
              ? pushError.statusCode
              : undefined;
            if (statusCode === 404 || statusCode === 410) {
              const { error: deleteError } = await admin.from("push_subscriptions").delete().eq("id", subscription.id);
              if (deleteError) console.error("No se pudo borrar una suscripción caducada:", deleteError);
            } else {
              failed++;
              console.error("No se pudo enviar un recordatorio financiero:", pushError);
            }
          }
        }
      }
    }

    const { data: priceAlerts, error: priceAlertsError } = await admin
      .from("finanzas_alertas_precio")
      .select("user_id,moneda,last_usd_value,last_usdt_value,last_alert_usd_value,last_alert_usdt_value,last_checked_at,last_notified_at,history")
      .eq("enabled", true);
    if (priceAlertsError) throw priceAlertsError;

    const quotes = new Map<QuoteCurrency, Awaited<ReturnType<typeof fetchCurrencyQuotes>>>();
    for (const alert of (priceAlerts || []) as PriceAlertPreference[]) {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 50_000).toISOString();
      const { data: claimed, error: claimError } = await admin.from("finanzas_alertas_precio")
        .update({ last_checked_at:now.toISOString(), updated_at:now.toISOString() })
        .eq("user_id", alert.user_id)
        .or(`last_checked_at.is.null,last_checked_at.lt.${cutoff}`)
        .select("user_id");
      if (claimError) throw claimError;
      if (!claimed?.length) continue;

      let quote = quotes.get(alert.moneda);
      try {
        if (!quote) {
          quote = await fetchCurrencyQuotes(alert.moneda);
          quotes.set(alert.moneda, quote);
        }
      } catch (quoteError) {
        failed++;
        console.error(`No se pudo consultar ${alert.moneda} para un aviso de precio:`, quoteError);
        continue;
      }

      const usdValue = quote.usd.value;
      const usdtValue = quote.usdt?.value ?? null;
      const oldUsdAlert = toNumber(alert.last_alert_usd_value);
      const oldUsdtAlert = toNumber(alert.last_alert_usdt_value);
      const usdChanged = changedByThreshold(usdValue, oldUsdAlert);
      const usdtChanged = usdtValue !== null && changedByThreshold(usdtValue, oldUsdtAlert);
      const baselineUsd = oldUsdAlert ?? toNumber(alert.last_usd_value) ?? usdValue;
      const baselineUsdt = oldUsdtAlert ?? toNumber(alert.last_usdt_value) ?? usdtValue;
      const lastNotified = alert.last_notified_at ? Date.parse(alert.last_notified_at) : 0;
      const notifyDue = Date.now() - lastNotified >= 15 * 60_000;
      const history = validQuoteHistory(alert.history);
      history.push({ t:Date.now(), usd:usdValue, usdt:usdtValue });
      const trimmedHistory = history.slice(-30);
      let sentForAlert = 0;

      if ((usdChanged || usdtChanged) && notifyDue) {
        const { data: subscriptions, error: subscriptionsError } = await admin.from("push_subscriptions")
          .select("id,subscription").eq("user_id", alert.user_id);
        if (subscriptionsError) throw subscriptionsError;

        const usdArrow = alert.moneda === "VES"
          ? direction(quote.usd.localPerUsd, oldUsdAlert ? 1 / oldUsdAlert : null)
          : direction(usdValue, oldUsdAlert);
        const usdtArrow = usdtValue === null ? "" : direction(usdtValue, oldUsdtAlert);
        const title = alert.moneda === "VES" ? "Cotización VES · BCV / Binance P2P" : `Cotización ${alert.moneda} / USD`;
        const body = alert.moneda === "VES"
          ? `1 USD = ${formatRate(quote.usd.localPerUsd)} VES ${usdArrow} · 1 VES = ${formatRate(usdtValue || 0)} USDT ${usdtArrow}`
          : `1 ${alert.moneda} = $${formatRate(usdValue)} USD ${usdArrow}`;
        const payload = JSON.stringify({
          title,
          body,
          url:"./#finanzas",
          tag:`finance-price-${alert.user_id}`,
          silent:true,
          image:quoteImage(trimmedHistory, alert.moneda)
        });

        for (const subscription of (subscriptions || [])) {
          try {
            await webpush.sendNotification(subscription.subscription, payload);
            sent++;
            sentForAlert++;
          } catch (pushError) {
            const statusCode = typeof pushError === "object" && pushError !== null && "statusCode" in pushError
              ? pushError.statusCode
              : undefined;
            if (statusCode === 404 || statusCode === 410) {
              const { error: deleteError } = await admin.from("push_subscriptions").delete().eq("id", subscription.id);
              if (deleteError) console.error("No se pudo borrar una suscripción caducada:", deleteError);
            } else {
              failed++;
              console.error("No se pudo enviar una alerta de precio:", pushError);
            }
          }
        }
      }

      const update = {
        last_usd_value:usdValue,
        last_usdt_value:usdtValue,
        last_alert_usd_value:sentForAlert ? usdValue : baselineUsd,
        last_alert_usdt_value:sentForAlert ? usdtValue : baselineUsdt,
        history:trimmedHistory,
        updated_at:now.toISOString(),
        ...(sentForAlert
          ? {
              last_notified_at:now.toISOString()
            }
          : {})
      };
      const { error: updateError } = await admin.from("finanzas_alertas_precio")
        .update(update).eq("user_id", alert.user_id);
      if (updateError) throw updateError;
    }

    return Response.json({ sent, failed });
  } catch (error) {
    console.error("finance-reminders:", error);
    return Response.json({ error:error instanceof Error ? error.message : "Error interno" }, { status:500 });
  }
});
