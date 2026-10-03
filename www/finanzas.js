(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const ui = {
    app: $("#finanzas-app"),
    login: $("#finanzas-login"),
    loginButton: $("#finanzas-login-btn"),
    error: $("#finanzas-error"),
    panel: $("#finanzas-panel"),
    period: $("#finanzas-periodo"),
    currency: $("#finanzas-moneda"),
    reload: $("#finanzas-recargar"),
    reminderForm: $("#finanzas-reminder-form"),
    reminderPersonal: $("#finanzas-reminder-personal"),
    reminderGroup: $("#finanzas-reminder-group"),
    reminderTime: $("#finanzas-reminder-time"),
    reminderTimezone: $("#finanzas-reminder-timezone"),
    reminderSave: $("#finanzas-reminder-save"),
    reminderStatus: $("#finanzas-reminder-status"),
    quoteValues: $("#finanzas-quote-values"),
    quoteChart: $("#finanzas-quote-chart"),
    quoteUpdated: $("#finanzas-quote-updated"),
    quoteStatus: $("#finanzas-quote-status"),
    priceAlertToggle: $("#finanzas-price-alert-toggle"),
    priceAlertStatus: $("#finanzas-price-alert-status")
  };
  if (!ui.app || !ui.panel) return;

  const state = {
    userId: null,
    groupId: null,
    members: [],
    tab: "personal",
    reportScope: "pareja",
    period: (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    })(),
    currency: "EUR",
    reminders: null,
    quote: null,
    quoteHistory: [],
    quoteCurrency: null,
    quoteRequest: 0,
    quoteTimer: null,
    priceAlertPreferenceLoaded: false,
    data: { personal: null, pareja: null },
    editingId: null,
    loading: false
  };
  const DEFAULT_CURRENCY = (() => {
    const region = (Intl.DateTimeFormat().resolvedOptions().locale.split("-")[1] || "").toUpperCase();
    return ({ US:"USD", MX:"MXN", AR:"ARS", CO:"COP", CL:"CLP", PE:"PEN", VE:"VES" })[region] || "EUR";
  })();
  const DEFAULT_CATEGORIES = [
    { nombre:"Vivienda", tipo:"gasto" },
    { nombre:"Comida", tipo:"gasto" },
    { nombre:"Transporte", tipo:"gasto" },
    { nombre:"Salud", tipo:"gasto" },
    { nombre:"Ocio", tipo:"gasto" },
    { nombre:"Otros gastos", tipo:"gasto" },
    { nombre:"Ingresos", tipo:"ingreso" }
  ];
  const QUOTE_COPY = {
    es:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"fecha de valor {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"compra",
      sell:"venta",
      checked:"Consultado {time}",
      vesStatus:"USD: tasa oficial BCV ({date}). USDT: ofertas P2P de Binance; el precio puede variar por método de pago y anunciante.",
      referenceStatus:"Tipo de cambio de referencia · última actualización del proveedor: {date}.",
      incomplete:"El proveedor devolvió una cotización incompleta.",
      unavailable:"No se pudo consultar el precio. Se volverá a intentar en un minuto."
    },
    en:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"value date {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"buy",
      sell:"sell",
      checked:"Updated {time}",
      vesStatus:"USD: official BCV rate ({date}). USDT: Binance P2P offers; prices may vary by payment method and advertiser.",
      referenceStatus:"Reference exchange rate · provider last updated: {date}.",
      incomplete:"The provider returned an incomplete quote.",
      unavailable:"The rate could not be loaded. Retrying in one minute."
    },
    pt:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"data-valor {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"compra",
      sell:"venda",
      checked:"Consultado {time}",
      vesStatus:"USD: taxa oficial do BCV ({date}). USDT: ofertas P2P da Binance; o preço pode variar conforme o método de pagamento e o anunciante.",
      referenceStatus:"Taxa de câmbio de referência · última atualização do provedor: {date}.",
      incomplete:"O provedor retornou uma cotação incompleta.",
      unavailable:"Não foi possível consultar a cotação. Tentaremos novamente em um minuto."
    },
    zh:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"价值日期 {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"买入",
      sell:"卖出",
      checked:"更新时间 {time}",
      vesStatus:"USD：BCV 官方汇率（{date}）。USDT：Binance P2P 报价；价格可能因支付方式和广告商而异。",
      referenceStatus:"参考汇率 · 提供方最后更新时间：{date}。",
      incomplete:"汇率提供方返回的数据不完整。",
      unavailable:"暂时无法获取汇率，将在一分钟后重试。"
    },
    ja:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"基準日 {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"購入",
      sell:"売却",
      checked:"更新 {time}",
      vesStatus:"USD：BCV公式レート（{date}）。USDT：Binance P2Pの提示価格です。支払方法や広告主によって変動します。",
      referenceStatus:"参考為替レート · 提供元の最終更新：{date}。",
      incomplete:"為替レート提供元から不完全なデータが返されました。",
      unavailable:"為替レートを取得できませんでした。1分後に再試行します。"
    },
    ko:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"기준일 {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"구매",
      sell:"판매",
      checked:"조회 {time}",
      vesStatus:"USD: BCV 공식 환율({date}). USDT: Binance P2P 호가이며 결제 방법과 판매자에 따라 달라질 수 있습니다.",
      referenceStatus:"참고 환율 · 제공업체 마지막 업데이트: {date}.",
      incomplete:"환율 제공업체가 불완전한 데이터를 반환했습니다.",
      unavailable:"환율을 불러오지 못했습니다. 1분 후 다시 시도합니다."
    },
    it:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"data di valuta {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"acquisto",
      sell:"vendita",
      checked:"Aggiornato {time}",
      vesStatus:"USD: tasso ufficiale BCV ({date}). USDT: offerte P2P Binance; il prezzo può variare in base al metodo di pagamento e all’inserzionista.",
      referenceStatus:"Tasso di cambio di riferimento · ultimo aggiornamento del provider: {date}.",
      incomplete:"Il provider ha restituito una quotazione incompleta.",
      unavailable:"Impossibile consultare il tasso. Nuovo tentativo tra un minuto."
    },
    fr:{
      usdPerLocal:"1 {currency} = {rate} USD",
      usdLabel:"USD / VES · BCV",
      usdtLabel:"VES / USDT · P2P",
      vesPerUsd:"1 USD = {rate} VES",
      bcvDate:"date de valeur {date}",
      usdtPerLocal:"1 VES = {rate} USDT",
      vesPerUsdt:"1 USDT ≈ {rate} VES",
      buy:"achat",
      sell:"vente",
      checked:"Consulté à {time}",
      vesStatus:"USD : taux officiel du BCV ({date}). USDT : offres P2P Binance ; le prix peut varier selon le moyen de paiement et l’annonceur.",
      referenceStatus:"Taux de change indicatif · dernière mise à jour du fournisseur : {date}.",
      incomplete:"Le fournisseur a renvoyé une cotation incomplète.",
      unavailable:"Impossible de consulter le taux. Nouvel essai dans une minute."
    }
  };
  let authGeneration = 0;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[char]);
  }

  function showError(message) {
    ui.error.textContent = message;
    ui.error.hidden = !message;
  }

  function dateRange(period = state.period) {
    const [year, month] = period.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const from = new Date(year, month - 6, 1);
    return {
      start: `${year}-${String(month).padStart(2, "0")}-01`,
      end: `${year}-${String(month).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
      chartStart: `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`
    };
  }

  function money(value) {
    const locales = { es:"es", en:"en", pt:"pt", zh:"zh-CN", ja:"ja", ko:"ko", it:"it", fr:"fr" };
    const locale = locales[window.SunPreferences?.getLanguage?.() || "es"] || "es";
    return new Intl.NumberFormat(locale, { style:"currency", currency:state.currency, maximumFractionDigits:2 }).format(Number(value) || 0);
  }

  function quoteNumber(value, maximumFractionDigits = 6) {
    const locale = { es:"es", en:"en", pt:"pt", zh:"zh-CN", ja:"ja", ko:"ko", it:"it", fr:"fr" }[window.SunPreferences?.getLanguage?.() || "es"] || "es";
    return new Intl.NumberFormat(locale, { minimumFractionDigits:Math.min(maximumFractionDigits, 2), maximumFractionDigits }).format(value);
  }

  function quoteCopy() {
    return QUOTE_COPY[window.SunPreferences?.getLanguage?.() || "es"] || QUOTE_COPY.es;
  }

  function quoteText(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
  }

  function quoteHistoryKey(currency) {
    return `sunadventures_fx_history_${currency}`;
  }

  function loadQuoteHistory(currency) {
    try {
      const rows = JSON.parse(localStorage.getItem(quoteHistoryKey(currency)) || "[]");
      return Array.isArray(rows) ? rows.filter(row => Number.isFinite(row.t) && Number.isFinite(row.usd)) : [];
    } catch (error) {
      console.warn("No se pudo leer el historial de cotizaciones:", error);
      return [];
    }
  }

  function saveQuoteSample(quotes) {
    const now = Date.now();
    const history = loadQuoteHistory(quotes.currency).filter(row => row.t > now - 24 * 60 * 60 * 1000);
    const sample = { t:now, usd:quotes.usd.value, usdt:quotes.usdt?.value ?? null };
    if (history.length && now - history[history.length - 1].t < 60_000) history[history.length - 1] = sample;
    else history.push(sample);
    try {
      localStorage.setItem(quoteHistoryKey(quotes.currency), JSON.stringify(history));
    } catch (error) {
      console.warn("No se pudo guardar el historial de cotizaciones:", error);
    }
    return { history, previous:history.length > 1 ? history[history.length - 2] : null };
  }

  function sparkline(history, currency) {
    const series = [{ key:"usd", color:"#f3c96e" }];
    if (currency === "VES") series.push({ key:"usdt", color:"#65d3b2" });
    const values = history.flatMap(row => series.map(line => Number(row[line.key])).filter(Number.isFinite));
    if (!history.length || !values.length) return "";
    const width = 720, height = 100, pad = 10;
    let min = Math.min(...values), max = Math.max(...values);
    if (min === max) { min *= .999; max *= 1.001; }
    const points = line => history.filter(row => Number.isFinite(Number(row[line.key]))).map((row, index, rows) => {
      const x = pad + (rows.length < 2 ? (width - 2 * pad) / 2 : index / (rows.length - 1) * (width - 2 * pad));
      const y = height - pad - (Number(row[line.key]) - min) / (max - min) * (height - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${height - pad}H${width - pad}" stroke="rgba(255,255,255,.12)" fill="none"/>${series.map(line => `<polyline points="${points(line)}" fill="none" stroke="${line.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`;
  }

  function trend(value, previous) {
    if (!Number.isFinite(previous) || previous <= 0) return "";
    const percent = (value - previous) / previous * 100;
    if (Math.abs(percent) < .02) return `→ ${quoteNumber(0, 2)} %`;
    return `${percent > 0 ? "↑" : "↓"} ${percent > 0 ? "+" : ""}${quoteNumber(percent, 2)} %`;
  }

  function renderQuote(quotes, history, previous) {
    const copy = quoteCopy();
    const code = quotes.currency;
    const usdValue = code === "VES" ? quotes.usd.localPerUsd : quotes.usd.value;
    const previousUsdValue = code === "VES" && previous?.usd ? 1 / previous.usd : previous?.usd;
    const usdTrend = trend(usdValue, previousUsdValue);
    const usdTitle = code === "VES"
      ? quoteText(copy.vesPerUsd, { rate:quoteNumber(usdValue, 4) })
      : quoteText(copy.usdPerLocal, { currency:code, rate:quoteNumber(usdValue) });
    const usdDetail = code === "VES"
      ? `${escapeHtml(quotes.usd.source)} · ${quoteText(copy.bcvDate, { date:quotes.usd.asOf })}`
      : `${escapeHtml(quotes.usd.source)} · ${escapeHtml(quotes.usd.asOf)}`;
    const rows = [`<article class="finanzas-quote-value"><span>${code === "VES" ? copy.usdLabel : `${code} / USD`}</span><strong>${usdTitle}</strong><small>${usdDetail}${usdTrend ? ` · ${usdTrend}` : ""}</small></article>`];
    if (quotes.usdt) {
      const usdtTrend = trend(quotes.usdt.value, previous?.usdt);
      rows.push(`<article class="finanzas-quote-value"><span>${copy.usdtLabel}</span><strong>${quoteText(copy.usdtPerLocal, { rate:quoteNumber(quotes.usdt.value) })}</strong><small>${quoteText(copy.vesPerUsdt, { rate:quoteNumber(quotes.usdt.localPerUsdt, 4) })} · ${escapeHtml(quotes.usdt.source)} · ${copy.buy} ${quoteNumber(quotes.usdt.buyLocalPerUsdt, 2)} / ${copy.sell} ${quoteNumber(quotes.usdt.sellLocalPerUsdt, 2)}${usdtTrend ? ` · ${usdtTrend}` : ""}</small></article>`);
    }
    ui.quoteValues.innerHTML = rows.join("");
    ui.quoteChart.innerHTML = sparkline(history, code) || `<span class="finanzas-quote-chart-empty">El gráfico se formará con las próximas cotizaciones.</span>`;
    const time = new Intl.DateTimeFormat(undefined, { hour:"2-digit", minute:"2-digit" }).format(new Date(quotes.fetchedAt));
    ui.quoteUpdated.textContent = quoteText(copy.checked, { time });
    ui.quoteStatus.textContent = code === "VES"
      ? quoteText(copy.vesStatus, { date:quotes.usd.asOf })
      : quoteText(copy.referenceStatus, { date:quotes.usd.asOf });
  }

  async function refreshCurrencyQuote() {
    if (!state.userId || !state.currency || !window._supabase) return;
    const request = ++state.quoteRequest;
    const currency = state.currency;
    if (!state.quote || state.quote.currency !== currency) ui.quoteUpdated.textContent = "Consultando cotización…";
    try {
      const { data, error } = await window._supabase.functions.invoke("currency-quotes", { body:{ currency } });
      if (error) throw error;
      if (request !== state.quoteRequest || currency !== state.currency) return;
      if (!data?.usd || !Number.isFinite(Number(data.usd.value))) throw new Error(quoteCopy().incomplete);
      const sample = saveQuoteSample(data);
      state.quote = data;
      state.quoteHistory = sample.history;
      renderQuote(data, sample.history, sample.previous);
    } catch (error) {
      if (request !== state.quoteRequest) return;
      console.error("Cotización de Finanzas:", error);
      ui.quoteUpdated.textContent = "Cotización no disponible";
      ui.quoteStatus.textContent = quoteCopy().unavailable;
    }
  }

  async function loadPriceAlertPreference() {
    const rows = await checked(window._supabase.from("finanzas_alertas_precio")
      .select("moneda,enabled").eq("user_id", state.userId).limit(1));
    state.priceAlertPreferenceLoaded = true;
    ui.priceAlertToggle.checked = rows[0]?.enabled || false;
    ui.priceAlertToggle.disabled = false;
    if (rows[0]?.moneda && rows[0].moneda !== state.currency) {
      await savePriceAlertPreference(rows[0].enabled, false, true);
    }
    ui.priceAlertStatus.textContent = "";
  }

  async function savePriceAlertPreference(enabled, requestPermission = true, resetBaseline = requestPermission) {
    ui.priceAlertStatus.textContent = "";
    try {
      if (enabled && requestPermission) {
        const activatePush = window._activarNotificacionesPush;
        if (typeof activatePush !== "function") throw new Error("No se pudo preparar el permiso de notificaciones.");
        await activatePush();
      }
      const preference = {
        user_id:state.userId,
        moneda:state.currency,
        enabled
      };
      if (enabled && resetBaseline) Object.assign(preference, {
        last_usd_value:null,
        last_usdt_value:null,
        last_alert_usd_value:null,
        last_alert_usdt_value:null,
        last_checked_at:null,
        last_notified_at:null,
        history:[]
      });
      const result = await window._supabase.from("finanzas_alertas_precio").upsert(preference, { onConflict:"user_id" });
      if (result.error) throw result.error;
      state.priceAlertPreferenceLoaded = true;
      ui.priceAlertStatus.textContent = enabled
        ? "Avisos activados. Serán silenciosos y se limitarán a uno cada 15 minutos."
        : "Avisos de precio desactivados.";
    } catch (error) {
      console.error("Avisos de cotización:", error);
      if (requestPermission) ui.priceAlertToggle.checked = false;
      ui.priceAlertStatus.textContent = `No se pudo guardar el aviso: ${error?.message || "error desconocido"}`;
    }
  }

  function getName(userId) {
    return state.members.find(member => member.id === userId)?.name || "Miembro";
  }

  function reportPeriod(value) {
    const [year, month] = value.split("-").map(Number);
    return `${year}-${String(month).padStart(2, "0")}`;
  }

  function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function onlyPeriod(rows) {
    return rows.filter(row => reportPeriod(row.fecha) === state.period);
  }

  function rowScope(scope) {
    return scope === "pareja" ? { user_id:state.userId, grupo_id:state.groupId } : { user_id:state.userId, grupo_id:null };
  }

  async function checked(query) {
    const result = await query;
    if (result.error) throw result.error;
    return result.data;
  }

  function defaultReminderPreferences() {
    return {
      personal_enabled:true,
      group_enabled:true,
      reminder_time:"20:00",
      timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    };
  }

  async function loadReminderPreferences() {
    const rows = await checked(window._supabase.from("finanzas_recordatorios")
      .select("personal_enabled,group_enabled,reminder_time,timezone,locale")
      .eq("user_id", state.userId).limit(1));
    state.reminders = rows[0] || defaultReminderPreferences();
    ui.reminderPersonal.checked = state.reminders.personal_enabled;
    ui.reminderGroup.checked = state.reminders.group_enabled;
    ui.reminderTime.value = String(state.reminders.reminder_time || "20:00").slice(0, 5);
    ui.reminderTimezone.textContent = `Zona horaria: ${state.reminders.timezone || defaultReminderPreferences().timezone}`;
    ui.reminderStatus.textContent = "";
  }

  async function saveReminderPreferences(event) {
    event.preventDefault();
    ui.reminderSave.disabled = true;
    ui.reminderStatus.textContent = "";
    try {
      if (ui.reminderPersonal.checked || ui.reminderGroup.checked) {
        const activatePush = window._activarNotificacionesPush;
        if (typeof activatePush !== "function") throw new Error("No se pudo preparar el permiso de notificaciones. Recarga la aplicación.");
        await activatePush();
      }
      const preferences = {
        user_id:state.userId,
        grupo_id:state.groupId,
        personal_enabled:ui.reminderPersonal.checked,
        group_enabled:ui.reminderGroup.checked,
        reminder_time:ui.reminderTime.value,
        timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        locale:window.SunPreferences?.getLanguage?.() || "es"
      };
      const result = await window._supabase.from("finanzas_recordatorios")
        .upsert(preferences, { onConflict:"user_id" });
      if (result.error) throw result.error;
      state.reminders = preferences;
      ui.reminderTimezone.textContent = `Zona horaria: ${preferences.timezone}`;
      ui.reminderStatus.textContent = preferences.personal_enabled || preferences.group_enabled
        ? "Recordatorios guardados. Te avisaremos solo si aún faltan gastos por registrar."
        : "Recordatorios desactivados.";
    } catch (error) {
      console.error("Recordatorios de Finanzas:", error);
      ui.reminderStatus.textContent = `No se pudieron guardar los recordatorios: ${error?.message || "error desconocido"}`;
    } finally {
      ui.reminderSave.disabled = false;
    }
  }

  async function fetchSettings(scope) {
    const db = window._supabase;
    let query = db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").limit(1);
    query = scope === "pareja"
      ? query.eq("grupo_id", state.groupId)
      : query.eq("user_id", state.userId).is("grupo_id", null);
    let rows = await checked(query);
    if (rows.length) return rows[0];
    const inserted = await db.from("finanzas_ajustes").insert({
      user_id:state.userId,
      grupo_id:scope === "pareja" ? state.groupId : null,
      moneda:DEFAULT_CURRENCY
    }).select("id,user_id,grupo_id,moneda").single();
    if (inserted.error && inserted.error.code !== "23505") throw inserted.error;
    if (!inserted.error) return inserted.data;
    const retry = scope === "pareja"
      ? db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").eq("grupo_id", state.groupId).single()
      : db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").eq("user_id", state.userId).is("grupo_id", null).single();
    return checked(retry);
  }

  async function loadScope(scope) {
    const db = window._supabase;
    const args = rowScope(scope);
    const scopeQuery = table => {
      let query = db.from(table).select("*");
      query = args.grupo_id ? query.eq("grupo_id", args.grupo_id) : query.eq("user_id", args.user_id).is("grupo_id", null);
      return query;
    };
    const range = dateRange();
    const movementQuery = scopeQuery("finanzas_movimientos")
      .gte("fecha", range.chartStart).lte("fecha", range.end).order("fecha", { ascending:false });
    const [categories, movements, budgets, goals, contributions, settings] = await Promise.all([
      checked(scopeQuery("finanzas_categorias").order("nombre")),
      checked(movementQuery),
      checked(scopeQuery("finanzas_presupuestos").order("periodo", { ascending:false })),
      checked(scopeQuery("finanzas_metas").order("created_at", { ascending:false })),
      checked(scopeQuery("finanzas_aportes").order("fecha", { ascending:false })),
      fetchSettings(scope)
    ]);
    const data = { categories, movements, budgets, goals, contributions, settings };
    if (!categories.length) await seedCategories(scope, data);
    state.data[scope] = data;
  }

  async function seedCategories(scope, data) {
    const db = window._supabase;
    const args = rowScope(scope);
    const result = await db.from("finanzas_categorias").insert(DEFAULT_CATEGORIES.map(category => ({
      user_id:state.userId,
      grupo_id:scope === "pareja" ? state.groupId : null,
      nombre:category.nombre,
      tipo:category.tipo
    })));
    if (result.error && result.error.code !== "23505") throw result.error;
    if (result.error) {
      let query = db.from("finanzas_categorias").select("*").order("nombre");
      query = args.grupo_id ? query.eq("grupo_id", args.grupo_id) : query.eq("user_id", args.user_id).is("grupo_id", null);
      data.categories = await checked(query);
      return;
    }
    data.categories = result.data || [];
    if (!data.categories.length) {
      let query = db.from("finanzas_categorias").select("*").order("nombre");
      query = args.grupo_id ? query.eq("grupo_id", args.grupo_id) : query.eq("user_id", args.user_id).is("grupo_id", null);
      data.categories = await checked(query);
    }
  }

  async function loadMembers(groupId) {
    const db = window._supabase;
    const members = await checked(db.from("grupo_miembros").select("user_id,rol").eq("grupo_id", groupId));
    if (!members?.length) throw new Error("No se encontraron integrantes en el grupo activo.");
    const profiles = await checked(db.from("perfiles").select("id,username").in("id", members.map(member => member.user_id)));
    state.members = members.map(member => ({
      id:member.user_id,
      role:member.rol,
      name:profiles.find(profile => profile.id === member.user_id)?.username || "Miembro"
    }));
  }

  async function initialize() {
    if (state.loading) return;
    state.loading = true;
    const generation = authGeneration;
    showError("");
    try {
      const db = window._supabase;
      if (!db) throw new Error("No se pudo conectar con el servicio de datos.");
      const { data:{ session }, error } = await db.auth.getSession();
      if (error) throw error;
      if (!session) {
        ui.login.hidden = false;
        ui.app.hidden = true;
        return;
      }
      state.userId = session.user.id;
      const group = window._getGrupoActivo?.();
      if (!group?.id) throw new Error("No se pudo preparar el grupo activo. Revisa tu conexión e inténtalo de nuevo.");
      state.groupId = group.id;
      await loadMembers(group.id);
      await Promise.all([loadScope("personal"), loadScope("pareja")]);
      if (generation !== authGeneration || state.userId !== session.user.id) return;
      try {
        await loadReminderPreferences();
      } catch (error) {
        console.error("Recordatorios de Finanzas:", error);
        ui.reminderStatus.textContent = "Ejecuta supabase-finanzas-recordatorios.sql y configura el cron para activar esta función.";
      }
      state.currency = state.data.personal.settings.moneda;
      ui.currency.value = state.currency;
      ui.period.value = state.period;
      try {
        await loadPriceAlertPreference();
      } catch (error) {
        console.error("Avisos de cotización:", error);
        ui.priceAlertToggle.disabled = true;
        ui.priceAlertStatus.textContent = "Ejecuta supabase-finanzas-cotizaciones.sql para activar los avisos.";
      }
      ui.login.hidden = true;
      ui.app.hidden = false;
      render();
      if (state.quoteTimer) clearInterval(state.quoteTimer);
      state.quoteTimer = setInterval(refreshCurrencyQuote, 60_000);
    } catch (error) {
      if (generation !== authGeneration) return;
      console.error("Finanzas:", error);
      const message = error?.code === "42P01" || error?.code === "PGRST205"
        ? "Falta activar las tablas de Finanzas. Ejecuta supabase-finanzas.sql en el SQL Editor de Supabase y vuelve a cargar."
        : `No se pudieron cargar tus finanzas: ${error?.message || "error desconocido"}`;
      showError(message);
      ui.login.hidden = true;
      ui.app.hidden = true;
    } finally {
      if (generation === authGeneration) state.loading = false;
    }
  }

  function activeScope() {
    return state.tab === "reportes" ? state.reportScope : state.tab;
  }

  function selectedData() {
    return state.data[activeScope()] || state.data.personal;
  }

  function render() {
    document.querySelectorAll("[data-finanzas-tab]").forEach(button => {
      const active = button.dataset.finanzasTab === state.tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const settings = state.data[activeScope()]?.settings;
    if (settings) {
      state.currency = settings.moneda;
      ui.currency.value = state.currency;
    }
    if (state.quoteCurrency !== state.currency) {
      state.quoteCurrency = state.currency;
      refreshCurrencyQuote();
      if (state.priceAlertPreferenceLoaded && ui.priceAlertToggle.checked) {
        savePriceAlertPreference(true, false, true);
      }
    }
    if (state.tab === "reportes") renderReports();
    else renderDashboard();
  }

  function metricCard(label, value, tone, detail = "") {
    return `<article class="finanzas-metric ${tone}"><span>${escapeHtml(label)}</span><strong>${money(value)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</article>`;
  }

  function categoryOptions(scope, type, selectedId = "") {
    const categories = state.data[scope]?.categories || [];
    return `<option value="">Sin categoría</option>${categories.filter(category => category.tipo === type).map(category =>
      `<option value="${escapeHtml(category.id)}" ${category.id === selectedId ? "selected" : ""}>${escapeHtml(category.nombre)}</option>`
    ).join("")}`;
  }

  function memberOptions(selectedId) {
    return state.members.map(member => `<option value="${escapeHtml(member.id)}" ${member.id === selectedId ? "selected" : ""}>${escapeHtml(member.name)}${member.id === state.userId ? " (tú)" : ""}</option>`).join("");
  }

  function movementForm(scope, editing) {
    const record = editing || {};
    const type = record.tipo || "gasto";
    return `<section class="finanzas-card">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">${editing ? "EDITAR MOVIMIENTO" : "NUEVO MOVIMIENTO"}</span><h2>${editing ? "Actualiza el registro" : "Anota un ingreso o gasto"}</h2></div></div>
      <form class="finanzas-form" id="finanzas-movimiento-form" data-scope="${scope}">
        <label><span>Tipo</span><select name="tipo"><option value="gasto" ${type === "gasto" ? "selected" : ""}>Gasto</option><option value="ingreso" ${type === "ingreso" ? "selected" : ""}>Ingreso</option></select></label>
        <label><span>Importe</span><input name="monto" type="number" min="0.01" step="0.01" required value="${editing ? escapeHtml(record.monto) : ""}" placeholder="0,00"></label>
        <label><span>Categoría</span><select name="categoria_id">${categoryOptions(scope, type, record.categoria_id || "")}</select></label>
        <label><span>Fecha</span><input name="fecha" type="date" required value="${escapeHtml(record.fecha || today())}"></label>
        ${scope === "pareja" ? `<label><span>${type === "ingreso" ? "Ingreso de" : "Pagado por"}</span><select name="miembro_id" required>${memberOptions(record.miembro_id || state.userId)}</select></label>` : ""}
        <label class="finanzas-form-wide"><span>Descripción</span><input name="descripcion" maxlength="120" value="${escapeHtml(record.descripcion || "")}" placeholder="Ej. Compra semanal"></label>
        <div class="finanzas-form-actions"><button class="btn-primary" type="submit">${editing ? "Guardar cambios" : "Añadir movimiento"}</button>${editing ? `<button class="btn-secondary" type="button" data-finanzas-cancel-edit>Cancelar</button>` : ""}</div>
      </form>
    </section>`;
  }

  function categoriesPanel(scope) {
    const categories = state.data[scope].categories;
    return `<details class="finanzas-card finanzas-details">
      <summary><span><span class="finanzas-eyebrow">ORGANIZACIÓN</span><strong>Categorías</strong></span><span class="finanzas-detail-count">${categories.length}</span></summary>
      <form class="finanzas-inline-form" data-category-form data-scope="${scope}">
        <label><span>Nombre de categoría</span><input name="nombre" maxlength="40" required placeholder="Ej. Mascotas"></label>
        <label><span>Tipo</span><select name="tipo"><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option></select></label>
        <button class="btn-secondary" type="submit">Añadir</button>
      </form>
      <div class="finanzas-category-list">${categories.map(category => `<div class="finanzas-category-row"><span class="finanzas-category-dot ${category.tipo}"></span><span>${escapeHtml(category.nombre)}</span><small>${category.tipo === "gasto" ? "Gasto" : "Ingreso"}</small>${category.user_id === state.userId ? `<button type="button" class="finanzas-icon-button" data-delete-category="${escapeHtml(category.id)}" data-scope="${scope}" aria-label="Eliminar ${escapeHtml(category.nombre)}">×</button>` : `<span></span>`}</div>`).join("")}</div>
    </details>`;
  }

  function budgetPanel(scope) {
    const data = state.data[scope];
    const period = `${state.period}-01`;
    const budgets = data.budgets.filter(budget => budget.periodo === period);
    const expenses = onlyPeriod(data.movements).filter(row => row.tipo === "gasto");
    return `<details class="finanzas-card finanzas-details" open>
      <summary><span><span class="finanzas-eyebrow">PLAN DEL MES</span><strong>Presupuestos</strong></span><span class="finanzas-detail-count">${budgets.length}</span></summary>
      <form class="finanzas-inline-form" data-budget-form data-scope="${scope}">
        <label><span>Categoría</span><select name="categoria_id" required>${(data.categories.filter(category => category.tipo === "gasto")).map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.nombre)}</option>`).join("")}</select></label>
        <label><span>Límite para ${escapeHtml(state.period)}</span><input name="limite" type="number" min="0.01" step="0.01" required placeholder="0,00"></label>
        <button class="btn-secondary" type="submit">Guardar límite</button>
      </form>
      <div class="finanzas-budget-list">${budgets.length ? budgets.map(budget => {
        const category = data.categories.find(item => item.id === budget.categoria_id);
        const spent = expenses.filter(row => row.categoria_id === budget.categoria_id).reduce((sum, row) => sum + Number(row.monto), 0);
        const percent = Math.min(100, budget.limite ? spent / Number(budget.limite) * 100 : 0);
        return `<div class="finanzas-budget-item"><div class="finanzas-budget-meta"><strong>${escapeHtml(category?.nombre || "Todas las categorías")}</strong><span>${money(spent)} / ${money(budget.limite)}</span></div><div class="finanzas-progress"><span style="width:${percent}%" class="${percent >= 100 ? "over" : ""}"></span></div>${budget.user_id === state.userId ? `<button type="button" class="finanzas-text-button" data-delete-budget="${escapeHtml(budget.id)}" data-scope="${scope}">Eliminar límite</button>` : ""}</div>`;
      }).join("") : `<p class="finanzas-empty">Aún no hay presupuestos para este mes.</p>`}</div>
    </details>`;
  }

  function goalsPanel(scope) {
    const data = state.data[scope];
    return `<section class="finanzas-card">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">${scope === "pareja" ? "PLANES EN COMÚN" : "TUS PLANES"}</span><h2>Metas de ahorro</h2></div></div>
      <form class="finanzas-inline-form finanzas-goal-form" data-goal-form data-scope="${scope}">
        <label><span>Nombre de la meta</span><input name="nombre" maxlength="60" required placeholder="Ej. Viaje de verano"></label>
        <label><span>Objetivo</span><input name="objetivo" type="number" min="0.01" step="0.01" required placeholder="0,00"></label>
        <label><span>Fecha objetivo</span><input name="fecha_objetivo" type="date"></label>
        <button class="btn-secondary" type="submit">Crear meta</button>
      </form>
      <div class="finanzas-goals">${data.goals.length ? data.goals.map(goal => {
        const saved = data.contributions.filter(item => item.meta_id === goal.id).reduce((sum, item) => sum + Number(item.monto), 0);
        const percent = Math.min(100, saved / Number(goal.objetivo) * 100);
        return `<article class="finanzas-goal"><div class="finanzas-goal-top"><div><strong>${escapeHtml(goal.nombre)}</strong><small>${goal.fecha_objetivo ? `Meta para ${escapeHtml(goal.fecha_objetivo)}` : "Sin fecha límite"}</small></div>${goal.user_id === state.userId ? `<button type="button" class="finanzas-icon-button" data-delete-goal="${escapeHtml(goal.id)}" data-scope="${scope}" aria-label="Eliminar meta ${escapeHtml(goal.nombre)}">×</button>` : ""}</div><div class="finanzas-goal-total"><strong>${money(saved)}</strong><span>de ${money(goal.objetivo)}</span></div><div class="finanzas-progress"><span style="width:${percent}%"></span></div><form class="finanzas-contribution-form" data-goal-id="${escapeHtml(goal.id)}" data-scope="${scope}"><input name="monto" type="number" min="0.01" step="0.01" aria-label="Aportación a ${escapeHtml(goal.nombre)}" placeholder="Aportar" required><button type="submit">Sumar ahorro</button></form></article>`;
      }).join("") : `<p class="finanzas-empty">Crea una meta y convierte el ahorro en un plan concreto.</p>`}</div>
    </section>`;
  }

  function splitTransactions(rows) {
    const incomes = rows.filter(row => row.tipo === "ingreso");
    const expenses = rows.filter(row => row.tipo === "gasto");
    return {
      income:incomes.reduce((sum, row) => sum + Number(row.monto), 0),
      expense:expenses.reduce((sum, row) => sum + Number(row.monto), 0),
      incomes,
      expenses
    };
  }

  function movementsList(scope, rows) {
    const data = state.data[scope];
    if (!rows.length) return `<div class="finanzas-empty finanzas-empty-large"><strong>Este mes empieza limpio</strong><span>Añade tu primer movimiento para ver cómo evoluciona.</span></div>`;
    return `<div class="finanzas-movements">${rows.map(row => {
      const category = data.categories.find(item => item.id === row.categoria_id);
      const actions = row.user_id === state.userId ? `<div class="finanzas-movement-actions"><button type="button" class="finanzas-text-button" data-edit-movement="${escapeHtml(row.id)}" data-scope="${scope}">Editar</button><button type="button" class="finanzas-text-button danger" data-delete-movement="${escapeHtml(row.id)}" data-scope="${scope}">Eliminar</button></div>` : "";
      return `<article class="finanzas-movement"><div class="finanzas-movement-symbol ${row.tipo}">${row.tipo === "ingreso" ? "+" : "−"}</div><div class="finanzas-movement-main"><strong>${escapeHtml(row.descripcion || category?.nombre || (row.tipo === "ingreso" ? "Ingreso" : "Gasto"))}</strong><small>${escapeHtml(category?.nombre || "Sin categoría")} · ${escapeHtml(row.fecha)}${scope === "pareja" ? ` · ${escapeHtml(getName(row.miembro_id))}` : ""}</small></div><strong class="finanzas-movement-amount ${row.tipo}">${row.tipo === "ingreso" ? "+" : "−"}${money(row.monto)}</strong>${actions}</article>`;
    }).join("")}</div>`;
  }

  function settlementCards(rows) {
    const { incomes, expenses } = splitTransactions(rows);
    const incomeByMember = new Map(state.members.map(member => [member.id, 0]));
    const paidByMember = new Map(state.members.map(member => [member.id, 0]));
    incomes.forEach(row => incomeByMember.set(row.miembro_id, (incomeByMember.get(row.miembro_id) || 0) + Number(row.monto)));
    expenses.forEach(row => paidByMember.set(row.miembro_id, (paidByMember.get(row.miembro_id) || 0) + Number(row.monto)));
    const incomeTotal = [...incomeByMember.values()].reduce((sum, value) => sum + value, 0);
    const expenseTotal = expenses.reduce((sum, row) => sum + Number(row.monto), 0);
    const share = new Map();
    state.members.forEach(member => {
      const weight = incomeTotal > 0 ? incomeByMember.get(member.id) / incomeTotal : 1 / state.members.length;
      share.set(member.id, (paidByMember.get(member.id) || 0) - expenseTotal * weight);
    });
    const creditors = [...share.entries()].filter(([, amount]) => amount > 0.01).map(([id, amount]) => ({ id, amount }));
    const debtors = [...share.entries()].filter(([, amount]) => amount < -0.01).map(([id, amount]) => ({ id, amount:-amount }));
    const settlements = [];
    debtors.forEach(debtor => creditors.forEach(creditor => {
      const amount = Math.min(debtor.amount, creditor.amount);
      if (amount > 0.01) {
        settlements.push(`${escapeHtml(getName(debtor.id))} aporta ${money(amount)} a ${escapeHtml(getName(creditor.id))}`);
        debtor.amount -= amount;
        creditor.amount -= amount;
      }
    }));
    return `<section class="finanzas-card finanzas-settlement">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">REPARTO PROPORCIONAL</span><h2>Balance entre miembros</h2></div></div>
      <p>La parte de cada persona se calcula según sus ingresos registrados este mes${incomeTotal ? "." : "; como todavía no hay ingresos, se divide a partes iguales."}</p>
      <div class="finanzas-member-balances">${state.members.map(member => {
        const balance = share.get(member.id) || 0;
        return `<div class="finanzas-member-balance"><span class="finanzas-avatar">${escapeHtml(member.name.slice(0, 1).toUpperCase())}</span><span><strong>${escapeHtml(member.name)}${member.id === state.userId ? " (tú)" : ""}</strong><small>Ingresos ${money(incomeByMember.get(member.id) || 0)} · Pagó ${money(paidByMember.get(member.id) || 0)}</small></span><b class="${balance >= 0 ? "positive" : "negative"}">${balance >= 0 ? "+" : "−"}${money(Math.abs(balance))}</b></div>`;
      }).join("")}</div>
      <div class="finanzas-settlement-note"><strong>${settlements.length ? "Para equilibrar este mes" : "Todo equilibrado"}</strong>${settlements.length ? `<ul>${settlements.map(item => `<li>${item}</li>`).join("")}</ul>` : "<span>No hay pagos pendientes entre miembros.</span>"}</div>
    </section>`;
  }

  function renderDashboard() {
    const scope = activeScope();
    const data = state.data[scope];
    if (!data) return;
    const rows = onlyPeriod(data.movements);
    const totals = splitTransactions(rows);
    const balance = totals.income - totals.expense;
    const isCouple = scope === "pareja";
    const editing = state.editingId ? data.movements.find(row => row.id === state.editingId) : null;
    const reportToggle = state.tab === "reportes" ? `<div class="finanzas-report-toggle"><button type="button" data-report-scope="personal" class="${scope === "personal" ? "active" : ""}">Personal</button><button type="button" data-report-scope="pareja" class="${scope === "pareja" ? "active" : ""}">Pareja</button></div>` : "";
    if (isCouple && state.members.length < 2) {
      ui.panel.innerHTML = `${reportToggle}      <div class="finanzas-empty finanzas-empty-large"><strong>Aún no hay más integrantes</strong><span>Invita a la otra persona a tu grupo desde el menú de perfil → Amigos y grupo para activar los gastos compartidos.</span></div>`;
      return;
    }
    ui.panel.innerHTML = `${reportToggle}
      <div class="finanzas-metrics">${metricCard("Ingresos", totals.income, "income")}${metricCard("Gastos", totals.expense, "expense")}${metricCard("Disponible", balance, balance >= 0 ? "balance-positive" : "balance-negative", "Ingresos menos gastos")}</div>
      ${movementForm(scope, editing)}
      ${isCouple ? settlementCards(rows) : ""}
      <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">ACTIVIDAD DEL PERÍODO</span><h2>Movimientos</h2></div><span class="finanzas-detail-count">${rows.length}</span></div>${movementsList(scope, rows)}</section>
      ${budgetPanel(scope)}
      ${goalsPanel(scope)}
      ${categoriesPanel(scope)}`;
    bindDashboardEvents(scope);
  }

  async function refreshData() {
    showError("");
    await Promise.all([loadScope("personal"), loadScope("pareja")]);
    render();
  }

  async function saveMovement(form, scope) {
    const values = new FormData(form);
    const amount = Number(values.get("monto"));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Escribe un importe mayor que cero.");
    const type = String(values.get("tipo"));
    const row = {
      user_id:state.userId,
      grupo_id:scope === "pareja" ? state.groupId : null,
      miembro_id:scope === "pareja" ? String(values.get("miembro_id") || state.userId) : state.userId,
      categoria_id:String(values.get("categoria_id") || "") || null,
      tipo:type,
      monto:amount,
      fecha:String(values.get("fecha")),
      descripcion:String(values.get("descripcion") || "").trim()
    };
    let request = state.editingId
      ? window._supabase.from("finanzas_movimientos").update(row).eq("id", state.editingId).eq("user_id", state.userId)
      : window._supabase.from("finanzas_movimientos").insert(row);
    const result = await request;
    if (result.error) throw result.error;
    state.editingId = null;
    await refreshData();
  }

  async function handleForm(form, callback) {
    try {
      await callback();
    } catch (error) {
      console.error("Finanzas:", error);
      showError(`No se pudo guardar: ${error?.message || "error desconocido"}`);
    }
  }

  function bindDashboardEvents(scope) {
    const transactionForm = $("#finanzas-movimiento-form", ui.panel);
    transactionForm?.addEventListener("change", event => {
      if (event.target.name === "tipo") {
        const categorySelect = $('select[name="categoria_id"]', transactionForm);
        categorySelect.innerHTML = categoryOptions(scope, event.target.value);
      }
    });
    transactionForm?.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(transactionForm, () => saveMovement(transactionForm, scope));
    });
    $("[data-finanzas-cancel-edit]", ui.panel)?.addEventListener("click", () => {
      state.editingId = null;
      render();
    });

    $$("[data-edit-movement]", ui.panel).forEach(button => button.addEventListener("click", () => {
      state.tab = button.dataset.scope;
      state.editingId = button.dataset.editMovement;
      render();
      $("#finanzas-movimiento-form", ui.panel)?.scrollIntoView({ behavior:"smooth", block:"center" });
    }));
    $$("[data-delete-movement]", ui.panel).forEach(button => button.addEventListener("click", () => {
      handleForm(null, async () => {
        const result = await window._supabase.from("finanzas_movimientos").delete().eq("id", button.dataset.deleteMovement).eq("user_id", state.userId);
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-category-form]", ui.panel).forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(form, async () => {
        const values = new FormData(form);
        const result = await window._supabase.from("finanzas_categorias").insert({
          user_id:state.userId, grupo_id:scope === "pareja" ? state.groupId : null,
          nombre:String(values.get("nombre")).trim(), tipo:String(values.get("tipo"))
        });
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-delete-category]", ui.panel).forEach(button => button.addEventListener("click", () => {
      handleForm(null, async () => {
        const result = await window._supabase.from("finanzas_categorias").delete().eq("id", button.dataset.deleteCategory).eq("user_id", state.userId);
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-budget-form]", ui.panel).forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(form, async () => {
        const values = new FormData(form);
        const amount = Number(values.get("limite"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("El límite debe ser mayor que cero.");
        const args = rowScope(scope);
        let existing = window._supabase.from("finanzas_presupuestos").select("id").eq("periodo", `${state.period}-01`).eq("categoria_id", String(values.get("categoria_id")));
        existing = args.grupo_id ? existing.eq("grupo_id", args.grupo_id) : existing.eq("user_id", state.userId).is("grupo_id", null);
        const found = await checked(existing.limit(1));
        const payload = { user_id:state.userId, grupo_id:scope === "pareja" ? state.groupId : null, categoria_id:String(values.get("categoria_id")), periodo:`${state.period}-01`, limite:amount };
        const result = found.length
          ? await window._supabase.from("finanzas_presupuestos").update({ limite:amount }).eq("id", found[0].id).eq("user_id", state.userId)
          : await window._supabase.from("finanzas_presupuestos").insert(payload);
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-delete-budget]", ui.panel).forEach(button => button.addEventListener("click", () => {
      handleForm(null, async () => {
        const result = await window._supabase.from("finanzas_presupuestos").delete().eq("id", button.dataset.deleteBudget).eq("user_id", state.userId);
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-goal-form]", ui.panel).forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(form, async () => {
        const values = new FormData(form);
        const amount = Number(values.get("objetivo"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("El objetivo debe ser mayor que cero.");
        const result = await window._supabase.from("finanzas_metas").insert({
          user_id:state.userId, grupo_id:scope === "pareja" ? state.groupId : null,
          nombre:String(values.get("nombre")).trim(), objetivo:amount,
          fecha_objetivo:String(values.get("fecha_objetivo") || "") || null
        });
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-goal-id]", ui.panel).forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      handleForm(form, async () => {
        const amount = Number(new FormData(form).get("monto"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("La aportación debe ser mayor que cero.");
        const result = await window._supabase.from("finanzas_aportes").insert({
          meta_id:form.dataset.goalId, user_id:state.userId, grupo_id:scope === "pareja" ? state.groupId : null, monto:amount
        });
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-delete-goal]", ui.panel).forEach(button => button.addEventListener("click", () => {
      handleForm(null, async () => {
        const result = await window._supabase.from("finanzas_metas").delete().eq("id", button.dataset.deleteGoal).eq("user_id", state.userId);
        if (result.error) throw result.error;
        await refreshData();
      });
    }));
    $$("[data-report-scope]", ui.panel).forEach(button => button.addEventListener("click", () => {
      state.reportScope = button.dataset.reportScope;
      render();
    }));
  }

  function $$(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function renderReports() {
    const scope = state.reportScope;
    const data = state.data[scope];
    const rows = onlyPeriod(data.movements);
    const totals = splitTransactions(rows);
    const monthly = [];
    const [year, month] = state.period.split("-").map(Number);
    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date(year, month - 1 - offset, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const matching = data.movements.filter(row => reportPeriod(row.fecha) === key);
      const sums = splitTransactions(matching);
      const locale = window.SunPreferences?.getLanguage?.() || "es";
      monthly.push({ key, label:new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, { month:"short" }).format(date), income:sums.income, expense:sums.expense });
    }
    const chartMax = Math.max(1, ...monthly.flatMap(item => [item.income, item.expense]));
    const bars = monthly.map(item => `<div class="finanzas-chart-month"><div class="finanzas-bars"><span class="income" style="height:${Math.max(3, item.income / chartMax * 100)}%" title="Ingresos ${money(item.income)}"></span><span class="expense" style="height:${Math.max(3, item.expense / chartMax * 100)}%" title="Gastos ${money(item.expense)}"></span></div><small>${escapeHtml(item.label)}</small></div>`).join("");
    const byCategory = data.categories.filter(category => category.tipo === "gasto").map(category => ({
      name:category.nombre,
      amount:rows.filter(row => row.tipo === "gasto" && row.categoria_id === category.id).reduce((sum, row) => sum + Number(row.monto), 0)
    })).filter(item => item.amount > 0).sort((a,b) => b.amount - a.amount);
    const categoryTotal = byCategory.reduce((sum, item) => sum + item.amount, 0);
    const colors = ["#ed9b48", "#5f9d75", "#8c78c6", "#d66f6f", "#5f9cb6", "#c7a34d"];
    let accumulated = 0;
    const gradient = byCategory.length
      ? `conic-gradient(${byCategory.map((item, index) => {
        const start = accumulated;
        accumulated += item.amount / categoryTotal * 100;
        return `${colors[index % colors.length]} ${start}% ${accumulated}%`;
      }).join(",")})`
      : "conic-gradient(#e8e6df 0 100%)";
    ui.panel.innerHTML = `<div class="finanzas-report-top"><div><span class="finanzas-eyebrow">VISTA GENERAL</span><h2>Reportes</h2></div><div class="finanzas-report-toggle"><button type="button" data-report-scope="personal" class="${scope === "personal" ? "active" : ""}">Personal</button><button type="button" data-report-scope="pareja" class="${scope === "pareja" ? "active" : ""}">Pareja</button></div></div>
      <div class="finanzas-metrics">${metricCard("Ingresos", totals.income, "income")}${metricCard("Gastos", totals.expense, "expense")}${metricCard("Balance", totals.income - totals.expense, totals.income >= totals.expense ? "balance-positive" : "balance-negative")}</div>
      <div class="finanzas-report-grid"><section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">ÚLTIMOS SEIS MESES</span><h2>Ingresos y gastos</h2></div></div><div class="finanzas-chart-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Gastos</span></div><div class="finanzas-chart">${bars}</div></section>
      <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">PERÍODO ACTUAL</span><h2>Gastos por categoría</h2></div></div><div class="finanzas-donut-wrap"><div class="finanzas-donut" style="background:${gradient}"><span>${money(categoryTotal)}</span></div><div class="finanzas-legend">${byCategory.length ? byCategory.map((item, index) => `<div><i style="background:${colors[index % colors.length]}"></i><span>${escapeHtml(item.name)}</span><strong>${money(item.amount)}</strong></div>`).join("") : `<p class="finanzas-empty">Aún no hay gastos categorizados.</p>`}</div></div></section></div>
      ${scope === "pareja" && state.members.length > 1 ? settlementCards(rows) : ""}
      <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">DETALLE</span><h2>Movimientos del período</h2></div></div>${movementsList(scope, rows)}</section>`;
    bindDashboardEvents(scope);
  }

  function bindEvents() {
    $$("[data-finanzas-tab]").forEach(button => button.addEventListener("click", () => {
      state.tab = button.dataset.finanzasTab;
      state.editingId = null;
      render();
    }));
    ui.period.addEventListener("change", () => {
      if (!/^\d{4}-\d{2}$/.test(ui.period.value)) return;
      state.period = ui.period.value;
      handleForm(null, refreshData);
    });
    ui.currency.addEventListener("change", () => handleForm(null, async () => {
      const value = ui.currency.value;
      if (!/^(EUR|USD|MXN|ARS|COP|CLP|PEN|VES)$/.test(value)) throw new Error("Selecciona una moneda válida.");
      const scope = activeScope();
      const settings = state.data[scope].settings;
      const result = await window._supabase.from("finanzas_ajustes").update({ moneda:value }).eq("id", settings.id);
      if (result.error) throw result.error;
      settings.moneda = value;
      state.currency = value;
      render();
    }));
    ui.reload.addEventListener("click", () => handleForm(null, refreshData));
    ui.reminderForm.addEventListener("submit", saveReminderPreferences);
    ui.priceAlertToggle.addEventListener("change", () => savePriceAlertPreference(ui.priceAlertToggle.checked));
    ui.loginButton.addEventListener("click", () => {
      $("#btn-open-login")?.click();
    });
    window._supabase?.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (!state.userId || state.userId === session.user.id) return;
        authGeneration++;
      } else {
        authGeneration++;
      }
      state.loading = false;
      state.userId = null;
      state.groupId = null;
      state.members = [];
      state.data = { personal:null, pareja:null };
      state.reminders = null;
      state.priceAlertPreferenceLoaded = false;
      state.quoteRequest++;
      state.quote = null;
      state.quoteHistory = [];
      state.quoteCurrency = null;
      if (state.quoteTimer) clearInterval(state.quoteTimer);
      state.quoteTimer = null;
      state.editingId = null;
      ui.panel.replaceChildren();
      ui.app.hidden = true;
      ui.login.hidden = false;
      showError("");
    });
    window.addEventListener("sunadventures:language-change", () => {
      if (state.data.personal) {
        render();
        if (state.quote) renderQuote(state.quote, state.quoteHistory, null);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    window.addEventListener("sunadventures:group-ready", () => initialize());
    window.addEventListener("sunadventures:group-error", event => {
      ui.login.hidden = true;
      ui.app.hidden = false;
      showError(`No se pudo preparar el grupo para Finanzas: ${event.detail?.message || "error desconocido"}`);
    });
    window._supabase?.auth.getSession().then(({ data:{ session }, error }) => {
      if (error) throw error;
      if (!session) {
        ui.login.hidden = false;
        ui.app.hidden = true;
      } else if (window._getGrupoActivo?.()?.id) {
        initialize();
      } else {
        ui.login.hidden = true;
        showError("Preparando tu espacio de Finanzas…");
      }
    }).catch(error => {
      console.error("Finanzas:", error);
      showError(`No se pudo comprobar la sesión: ${error?.message || "error desconocido"}`);
    });
  }, { once:true });
})();
