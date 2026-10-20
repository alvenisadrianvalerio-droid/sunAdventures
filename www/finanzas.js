(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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
    priceAlertStatus: $("#finanzas-price-alert-status"),
    quoteCard: $("#finanzas-quote-card"),
    reminderCard: $("#finanzas-reminder-card")
  };
  if (!ui.app || !ui.panel) return;

  const CURRENCIES = ["EUR","USD","MXN","ARS","COP","CLP","PEN","VES"];
  const DEFAULT_CURRENCY = (() => {
    const region = (Intl.DateTimeFormat().resolvedOptions().locale.split("-")[1] || "").toUpperCase();
    return ({ US:"USD", MX:"MXN", AR:"ARS", CO:"COP", CL:"CLP", PE:"PEN", VE:"VES" })[region] || "EUR";
  })();
  const DEFAULT_CATEGORIES = [
    { nombre:"Vivienda", tipo:"gasto" }, { nombre:"Comida", tipo:"gasto" },
    { nombre:"Transporte", tipo:"gasto" }, { nombre:"Salud", tipo:"gasto" },
    { nombre:"Ocio", tipo:"gasto" }, { nombre:"Otros gastos", tipo:"gasto" },
    { nombre:"Ingresos", tipo:"ingreso" }
  ];

  const QUOTE_COPY = {
    es:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"fecha de valor {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"compra", sell:"venta", checked:"Consultado {time}", vesStatus:"USD: tasa oficial BCV ({date}). USDT: ofertas P2P de Binance; el precio puede variar por método de pago y anunciante.", referenceStatus:"Tipo de cambio de referencia · última actualización del proveedor: {date}.", incomplete:"El proveedor devolvió una cotización incompleta.", unavailable:"No se pudo consultar el precio. Se volverá a intentar en un minuto." },
    en:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"value date {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"buy", sell:"sell", checked:"Updated {time}", vesStatus:"USD: official BCV rate ({date}). USDT: Binance P2P offers; prices may vary by payment method and advertiser.", referenceStatus:"Reference exchange rate · provider last updated: {date}.", incomplete:"The provider returned an incomplete quote.", unavailable:"The rate could not be loaded. Retrying in one minute." },
    pt:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"data-valor {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"compra", sell:"venda", checked:"Consultado {time}", vesStatus:"USD: taxa oficial do BCV ({date}). USDT: ofertas P2P da Binance; o preço pode variar conforme o método de pagamento e o anunciante.", referenceStatus:"Taxa de câmbio de referência · última atualização do provedor: {date}.", incomplete:"O provedor retornou uma cotação incompleta.", unavailable:"Não foi possível consultar a cotação. Tentaremos novamente em um minuto." },
    zh:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"价值日期 {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"买入", sell:"卖出", checked:"更新时间 {time}", vesStatus:"USD：BCV 官方汇率（{date}）。USDT：Binance P2P 报价；价格可能因支付方式和广告商而异。", referenceStatus:"参考汇率 · 提供方最后更新时间：{date}。", incomplete:"汇率提供方返回的数据不完整。", unavailable:"暂时无法获取汇率，将在一分钟后重试。" },
    ja:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"基準日 {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"購入", sell:"売却", checked:"更新 {time}", vesStatus:"USD：BCV公式レート（{date}）。USDT：Binance P2Pの提示価格です。支払方法や広告主によって変動します。", referenceStatus:"参考為替レート · 提供元の最終更新：{date}。", incomplete:"為替レート提供元から不完全なデータが返されました。", unavailable:"為替レートを取得できませんでした。1分後に再試行します。" },
    ko:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"기준일 {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"구매", sell:"판매", checked:"조회 {time}", vesStatus:"USD: BCV 공식 환율({date}). USDT: Binance P2P 호가이며 결제 방법과 판매자에 따라 달라질 수 있습니다.", referenceStatus:"참고 환율 · 제공업체 마지막 업데이트: {date}.", incomplete:"환율 제공업체가 불완전한 데이터를 반환했습니다.", unavailable:"환율을 불러오지 못했습니다. 1분 후 다시 시도합니다." },
    it:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"data di valuta {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"acquisto", sell:"vendita", checked:"Aggiornato {time}", vesStatus:"USD: tasso ufficiale BCV ({date}). USDT: offerte P2P Binance; il prezzo può variare in base al metodo di pagamento e all’inserzionista.", referenceStatus:"Tasso di cambio di riferimento · ultimo aggiornamento del provider: {date}.", incomplete:"Il provider ha restituito una quotazione incompleta.", unavailable:"Impossibile consultare il tasso. Nuovo tentativo tra un minuto." },
    fr:{ usdLabel:"USD / VES · BCV", usdtLabel:"VES / USDT · P2P", vesPerUsd:"1 USD = {rate} VES", bcvDate:"date de valeur {date}", usdtPerLocal:"1 USDT = {rate} VES", vesPerUsdt:"1 VES ≈ {rate} USDT", buy:"achat", sell:"vente", checked:"Consulté à {time}", vesStatus:"USD : taux officiel du BCV ({date}). USDT : offres P2P Binance ; le prix peut varier selon le moyen de paiement et l’annonceur.", referenceStatus:"Taux de change indicatif · dernière mise à jour du fournisseur : {date}.", incomplete:"Le fournisseur a renvoyé une cotation incomplète.", unavailable:"Impossible de consulter le taux. Nouvel essai dans une minute." }
  };

  const state = {
    userId: null, groupId: null, members: [],
    section: "resumen", scope: "personal",
    period: (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; })(),
    currency: "EUR",
    reminders: null, quote: null, quoteHistory: [], quoteCurrency: null,
    quoteRequest: 0, quoteTimer: null, priceAlertPreferenceLoaded: false,
    data: { personal: null, pareja: null },
    editingId: null, loading: false
  };
  let authGeneration = 0;

  /* ---------- Utilidades ---------- */
  const escapeHtml = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const showError = msg => { ui.error.textContent = msg; ui.error.hidden = !msg; };
  const today = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`; };
  const reportPeriod = v => v.slice(0, 7);
  const activeScope = () => state.scope;
  const rowScope = scope => scope === "pareja" ? { user_id: state.userId, grupo_id: state.groupId } : { user_id: state.userId, grupo_id: null };
  const onlyPeriod = rows => rows.filter(r => reportPeriod(r.fecha) === state.period);
  const getName = id => state.members.find(m => m.id === id)?.name || "Miembro";

  function dateRange(period = state.period) {
    const [y, m] = period.split("-").map(Number);
    const end = new Date(y, m, 0);
    const from = new Date(y, m - 6, 1);
    return {
      start: `${y}-${String(m).padStart(2,"0")}-01`,
      end: `${y}-${String(m).padStart(2,"0")}-${String(end.getDate()).padStart(2,"0")}`,
      chartStart: `${from.getFullYear()}-${String(from.getMonth()+1).padStart(2,"0")}-01`
    };
  }

  function money(value, curr) {
    const locales = { es:"es", en:"en", pt:"pt", zh:"zh-CN", ja:"ja", ko:"ko", it:"it", fr:"fr" };
    const locale = locales[window.SunPreferences?.getLanguage?.() || "es"] || "es";
    return new Intl.NumberFormat(locale, {
      style: "currency", currency: curr || state.currency, maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }
  function quoteNumber(v, max = 6) {
    const locale = { es:"es", en:"en", pt:"pt", zh:"zh-CN", ja:"ja", ko:"ko", it:"it", fr:"fr" }[window.SunPreferences?.getLanguage?.() || "es"] || "es";
    return new Intl.NumberFormat(locale, { minimumFractionDigits: Math.min(max, 2), maximumFractionDigits: max }).format(v);
  }
  const quoteCopy = () => QUOTE_COPY[window.SunPreferences?.getLanguage?.() || "es"] || QUOTE_COPY.es;
  const quoteText = (tpl, vals) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vals[k] ?? ""));

  async function checked(query) {
    const r = await query;
    if (r.error) throw r.error;
    return r.data;
  }

  /* ---------- Cotizaciones ---------- */
  const quoteHistoryKey = c => `sunad_fx_history_v2_${c}`;
  function loadQuoteHistory(c) {
    try {
      const rows = JSON.parse(localStorage.getItem(quoteHistoryKey(c)) || "[]");
      return Array.isArray(rows) ? rows.filter(r => Number.isFinite(r.t) && Number.isFinite(r.usd)) : [];
    } catch { return []; }
  }
  function saveQuoteSample(q) {
    const now = Date.now();
    const history = loadQuoteHistory(q.currency).filter(r => r.t > now - 86400000);
    const sample = { t: now, usd: q.usd.value, usdt: q.usdt?.localPerUsdt ?? null };
    if (history.length && now - history[history.length - 1].t < 60000) history[history.length - 1] = sample;
    else history.push(sample);
    try { localStorage.setItem(quoteHistoryKey(q.currency), JSON.stringify(history)); } catch {}
    return { history, previous: history.length > 1 ? history[history.length - 2] : null };
  }
  function sparkline(history, currency) {
    const series = [{ key:"usd", color:"#f3c96e" }];
    if (currency === "VES") series.push({ key:"usdt", color:"#65d3b2" });
    const values = history.flatMap(r => series.map(l => Number(r[l.key])).filter(Number.isFinite));
    if (!history.length || !values.length) return "";
    const W = 720, H = 100, pad = 10;
    let min = Math.min(...values), max = Math.max(...values);
    if (min === max) { min *= .999; max *= 1.001; }
    const pts = line => history.filter(r => Number.isFinite(Number(r[line.key]))).map((r, i, rows) => {
      const x = pad + (rows.length < 2 ? (W - 2 * pad) / 2 : i / (rows.length - 1) * (W - 2 * pad));
      const y = H - pad - (Number(r[line.key]) - min) / (max - min) * (H - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M${pad} ${H-pad}H${W-pad}" stroke="rgba(255,255,255,.12)" fill="none"/>${series.map(l => `<polyline points="${pts(l)}" fill="none" stroke="${l.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</svg>`;
  }
  function trend(value, prev) {
    if (!Number.isFinite(prev) || prev <= 0) return "";
    const pct = (value - prev) / prev * 100;
    if (Math.abs(pct) < .02) return `→ ${quoteNumber(0, 2)} %`;
    return `${pct > 0 ? "↑" : "↓"} ${pct > 0 ? "+" : ""}${quoteNumber(pct, 2)} %`;
  }
  function renderQuote(q, history, prev) {
    const copy = quoteCopy(), code = q.currency;
    const usdValue = code === "VES" ? q.usd.localPerUsd : q.usd.value;
    const prevUsd = code === "VES" && prev?.usd ? 1 / prev.usd : prev?.usd;
    const usdTrend = trend(usdValue, prevUsd);
    const usdTitle = code === "VES"
      ? quoteText(copy.vesPerUsd, { rate: quoteNumber(usdValue, 4) })
      : `1 ${code} = ${quoteNumber(usdValue)} USD`;
    const usdDetail = code === "VES"
      ? `${escapeHtml(q.usd.source)} · ${quoteText(copy.bcvDate, { date: q.usd.asOf })}`
      : `${escapeHtml(q.usd.source)} · ${escapeHtml(q.usd.asOf)}`;
    const rows = [`<article class="finanzas-quote-value"><span>${code === "VES" ? copy.usdLabel : `${code} / USD`}</span><strong>${usdTitle}</strong><small>${usdDetail}${usdTrend ? ` · ${usdTrend}` : ""}</small></article>`];
    if (q.usdt) {
      const usdtTrend = trend(q.usdt.localPerUsdt, prev?.usdt);
      rows.push(`<article class="finanzas-quote-value"><span>${copy.usdtLabel}</span><strong>${quoteText(copy.usdtPerLocal, { rate: quoteNumber(q.usdt.localPerUsdt, 2) })}</strong><small>${quoteText(copy.vesPerUsdt, { rate: quoteNumber(q.usdt.value, 6) })} · ${escapeHtml(q.usdt.source)} · ${copy.buy} ${quoteNumber(q.usdt.buyLocalPerUsdt, 2)} / ${copy.sell} ${quoteNumber(q.usdt.sellLocalPerUsdt, 2)}${usdtTrend ? ` · ${usdtTrend}` : ""}</small></article>`);
    }
    const chartSvg = sparkline(history, code);
    if (chartSvg) {
      ui.quoteChart.innerHTML = chartSvg;
      ui.quoteChart.hidden = false;
      ui.quoteChart.style.display = "";
    } else {
      ui.quoteChart.innerHTML = "";
      ui.quoteChart.hidden = true;
      ui.quoteChart.style.display = "none";
    }
    const time = new Intl.DateTimeFormat(undefined, { hour:"2-digit", minute:"2-digit" }).format(new Date(q.fetchedAt));
    ui.quoteUpdated.textContent = quoteText(copy.checked, { time });
    ui.quoteStatus.textContent = code === "VES"
      ? quoteText(copy.vesStatus, { date: q.usd.asOf })
      : quoteText(copy.referenceStatus, { date: q.usd.asOf });
  }
  async function fetchRealtimeVesFallback() {
    let bcvRate = null, bcvDate = null;
    let usdtRate = null, usdtBuy = null, usdtSell = null;

    // 1. Intentar obtener tasa oficial BCV y Paralelo de DolarApi
    try {
      const res = await fetch("https://ve.dolarapi.com/v1/dolares", { cache: "no-store" });
      if (res.ok) {
        const arr = await res.json();
        const oficial = arr.find(x => x.fuente === "oficial" || x.nombre?.toLowerCase().includes("oficial"));
        if (oficial && Number(oficial.promedio || oficial.venta) > 0) {
          bcvRate = Number(oficial.promedio || oficial.venta);
          bcvDate = oficial.fechaActualizacion ? String(oficial.fechaActualizacion).slice(0, 10) : today();
        }
      }
    } catch (e) {
      console.warn("Fallo DolarApi BCV:", e);
    }

    // 2. Fallback de respaldo para BCV si DolarApi falló: DolarVZLA CDN
    if (!bcvRate) {
      try {
        const res = await fetch("https://rates.dolarvzla.com/bcv/current.json", { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          if (Number(d.usd?.price || d.usd) > 0) {
            bcvRate = Number(d.usd?.price || d.usd);
            bcvDate = d.date || today();
          }
        }
      } catch (e) {
        console.warn("Fallo DolarVZLA:", e);
      }
    }

    // 3. Obtener USDT en tiempo real (Binance P2P) a través de CriptoYa
    try {
      const res = await fetch("https://criptoya.com/api/binancep2p/USDT/VES/100", { cache: "no-store" });
      if (res.ok) {
        const c = await res.json();
        const ask = Number(c.ask), bid = Number(c.bid);
        if (ask > 0 || bid > 0) {
          usdtBuy = ask || bid;
          usdtSell = bid || ask;
          usdtRate = (usdtBuy && usdtSell) ? (usdtBuy + usdtSell) / 2 : (usdtBuy || usdtSell);
        }
      }
    } catch (e) {
      console.warn("Fallo CriptoYa Binance P2P:", e);
    }

    // Si al menos obtuvimos el dólar oficial o USDT
    if (bcvRate || usdtRate) {
      const usdVal = bcvRate || (usdtRate ? usdtRate * 0.95 : 1);
      const usdtVal = usdtRate || (bcvRate ? bcvRate * 1.15 : 1);
      return {
        currency: "VES",
        fetchedAt: new Date().toISOString(),
        usd: {
          value: 1 / usdVal,
          localPerUsd: usdVal,
          source: "BCV (En tiempo real)",
          asOf: bcvDate || today()
        },
        usdt: {
          value: 1 / usdtVal,
          localPerUsdt: usdtVal,
          buyLocalPerUsdt: usdtBuy || usdtVal,
          sellLocalPerUsdt: usdtSell || usdtVal,
          source: "Binance P2P (En tiempo real)",
          asOf: new Date().toISOString()
        }
      };
    }
    return null;
  }

  async function refreshCurrencyQuote() {
    if (!state.currency) return;
    const req = ++state.quoteRequest, currency = state.currency;
    if (!state.quote || state.quote.currency !== currency) ui.quoteUpdated.textContent = "Actualizando tasas en tiempo real…";

    // Intentar primero a través de Supabase functions si hay sesión
    let data = null;
    if (state.userId && window._supabase) {
      try {
        const res = await window._supabase.functions.invoke("currency-quotes", { body: { currency } });
        if (!res.error && res.data?.usd && Number.isFinite(Number(res.data.usd.value))) {
          data = res.data;
        }
      } catch (err) {
        console.warn("currency-quotes edge function falló o no desplegada, recurriendo a APIs directas:", err);
      }
    }

    // Si es VES (Bolívares) o falló la edge function, consultar APIs públicas en tiempo real
    if (!data && currency === "VES") {
      try {
        data = await fetchRealtimeVesFallback();
      } catch (e) {
        console.warn("Error en fallback VES:", e);
      }
    }

    // Fallback general para monedas internacionales si edge function no responde
    if (!data) {
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD`, { cache: "no-store" });
        if (res.ok) {
          const fx = await res.json();
          const rate = fx.rates?.[currency];
          if (rate && Number(rate) > 0) {
            data = {
              currency,
              fetchedAt: new Date().toISOString(),
              usd: {
                value: 1 / rate,
                localPerUsd: rate,
                source: "ExchangeRate-API (En tiempo real)",
                asOf: fx.time_last_update_utc?.slice(0, 10) || today()
              }
            };
          }
        }
      } catch (e) {
        console.warn("Error en fallback internacional:", e);
      }
    }

    if (req !== state.quoteRequest || currency !== state.currency) return;

    if (data && data.usd && Number.isFinite(Number(data.usd.value))) {
      const sample = saveQuoteSample(data);
      state.quote = data; state.quoteHistory = sample.history;
      renderQuote(data, sample.history, sample.previous);
    } else {
      ui.quoteUpdated.textContent = "Cotización no disponible";
      ui.quoteStatus.textContent = quoteCopy().unavailable;
    }
  }

  /* ---------- Alertas de precio ---------- */
  async function loadPriceAlertPreference() {
    const rows = await checked(window._supabase.from("finanzas_alertas_precio").select("moneda,enabled").eq("user_id", state.userId).limit(1));
    state.priceAlertPreferenceLoaded = true;
    ui.priceAlertToggle.checked = rows[0]?.enabled || false;
    ui.priceAlertToggle.disabled = false;
    if (rows[0]?.moneda && rows[0].moneda !== state.currency) await savePriceAlertPreference(rows[0].enabled, false, true);
    ui.priceAlertStatus.textContent = "";
  }
  async function savePriceAlertPreference(enabled, requestPermission = true, resetBaseline = requestPermission) {
    ui.priceAlertStatus.textContent = "";
    try {
      if (enabled && requestPermission) {
        const fn = window._activarNotificacionesPush;
        if (typeof fn !== "function") throw new Error("No se pudo preparar el permiso de notificaciones.");
        await fn();
      }
      const pref = { user_id: state.userId, moneda: state.currency, enabled };
      if (enabled && resetBaseline) Object.assign(pref, {
        last_usd_value: null, last_usdt_value: null,
        last_alert_usd_value: null, last_alert_usdt_value: null,
        last_checked_at: null, last_notified_at: null, history: []
      });
      const r = await window._supabase.from("finanzas_alertas_precio").upsert(pref, { onConflict: "user_id" });
      if (r.error) throw r.error;
      state.priceAlertPreferenceLoaded = true;
      ui.priceAlertStatus.textContent = enabled
        ? "Avisos activados. Serán silenciosos y se limitarán a uno cada 15 minutos."
        : "Avisos de precio desactivados.";
    } catch (err) {
      console.error("Avisos:", err);
      if (requestPermission) ui.priceAlertToggle.checked = false;
      ui.priceAlertStatus.textContent = `No se pudo guardar el aviso: ${err?.message || "error desconocido"}`;
    }
  }

  /* ---------- Recordatorios ---------- */
  const defaultReminderPrefs = () => ({
    personal_enabled: true, group_enabled: true,
    reminder_time: "20:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  });
  async function loadReminderPreferences() {
    const rows = await checked(window._supabase.from("finanzas_recordatorios").select("personal_enabled,group_enabled,reminder_time,timezone,locale").eq("user_id", state.userId).limit(1));
    state.reminders = rows[0] || defaultReminderPrefs();
    ui.reminderPersonal.checked = state.reminders.personal_enabled;
    ui.reminderGroup.checked = state.reminders.group_enabled;
    ui.reminderTime.value = String(state.reminders.reminder_time || "20:00").slice(0, 5);
    ui.reminderTimezone.textContent = `Zona horaria: ${state.reminders.timezone || defaultReminderPrefs().timezone}`;
    ui.reminderStatus.textContent = "";
  }
  async function saveReminderPreferences(event) {
    event.preventDefault();
    ui.reminderSave.disabled = true;
    ui.reminderStatus.textContent = "";
    try {
      if (ui.reminderPersonal.checked || ui.reminderGroup.checked) {
        const fn = window._activarNotificacionesPush;
        if (typeof fn !== "function") throw new Error("No se pudo preparar el permiso de notificaciones.");
        await fn();
      }
      const prefs = {
        user_id: state.userId, grupo_id: state.groupId,
        personal_enabled: ui.reminderPersonal.checked,
        group_enabled: ui.reminderGroup.checked,
        reminder_time: ui.reminderTime.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        locale: window.SunPreferences?.getLanguage?.() || "es"
      };
      const r = await window._supabase.from("finanzas_recordatorios").upsert(prefs, { onConflict: "user_id" });
      if (r.error) throw r.error;
      state.reminders = prefs;
      ui.reminderTimezone.textContent = `Zona horaria: ${prefs.timezone}`;
      ui.reminderStatus.textContent = (prefs.personal_enabled || prefs.group_enabled)
        ? "Recordatorios guardados. Te avisaremos solo si aún faltan gastos por registrar."
        : "Recordatorios desactivados.";
    } catch (err) {
      console.error("Recordatorios:", err);
      ui.reminderStatus.textContent = `No se pudieron guardar los recordatorios: ${err?.message || "error desconocido"}`;
    } finally {
      ui.reminderSave.disabled = false;
    }
  }

  /* ---------- Carga de datos ---------- */
  async function fetchSettings(scope) {
    const db = window._supabase;
    let q = db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").limit(1);
    q = scope === "pareja"
      ? q.eq("grupo_id", state.groupId)
      : q.eq("user_id", state.userId).is("grupo_id", null);
    const rows = await checked(q);
    if (rows.length) return rows[0];
    const ins = await db.from("finanzas_ajustes").insert({
      user_id: state.userId,
      grupo_id: scope === "pareja" ? state.groupId : null,
      moneda: DEFAULT_CURRENCY
    }).select("id,user_id,grupo_id,moneda").single();
    if (ins.error && ins.error.code !== "23505") throw ins.error;
    if (!ins.error) return ins.data;
    return checked(scope === "pareja"
      ? db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").eq("grupo_id", state.groupId).single()
      : db.from("finanzas_ajustes").select("id,user_id,grupo_id,moneda").eq("user_id", state.userId).is("grupo_id", null).single());
  }

  async function loadScope(scope) {
    const db = window._supabase;
    const args = rowScope(scope);
    const scopeQuery = table => {
      let q = db.from(table).select("*");
      q = args.grupo_id ? q.eq("grupo_id", args.grupo_id) : q.eq("user_id", args.user_id).is("grupo_id", null);
      return q;
    };
    const range = dateRange();
    const movementQuery = scopeQuery("finanzas_movimientos")
      .gte("fecha", range.chartStart).lte("fecha", range.end).order("fecha", { ascending: false });

    const [categories, movements, budgets, goals, contributions, settings] = await Promise.all([
      checked(scopeQuery("finanzas_categorias").order("nombre")),
      checked(movementQuery),
      checked(scopeQuery("finanzas_presupuestos").order("periodo", { ascending: false })),
      checked(scopeQuery("finanzas_metas").order("created_at", { ascending: false })),
      checked(scopeQuery("finanzas_aportes").order("fecha", { ascending: false })),
      fetchSettings(scope)
    ]);

    // 🔧 FIX: `goals` es const → NO reasignar. Normalizamos a otra variable.
    const fallbackCurrency = settings?.moneda || DEFAULT_CURRENCY;
    const normalizedGoals = (goals || []).map(g => ({ ...g, moneda: g.moneda || fallbackCurrency }));

    const data = { categories, movements, budgets, goals: normalizedGoals, contributions, settings };
    if (!categories.length) await seedCategories(scope, data);
    state.data[scope] = data;
  }

  async function seedCategories(scope, data) {
    const db = window._supabase;
    const args = rowScope(scope);
    const r = await db.from("finanzas_categorias").insert(DEFAULT_CATEGORIES.map(c => ({
      user_id: state.userId,
      grupo_id: scope === "pareja" ? state.groupId : null,
      nombre: c.nombre, tipo: c.tipo
    })));
    if (r.error && r.error.code !== "23505") throw r.error;
    let q = db.from("finanzas_categorias").select("*").order("nombre");
    q = args.grupo_id ? q.eq("grupo_id", args.grupo_id) : q.eq("user_id", args.user_id).is("grupo_id", null);
    data.categories = await checked(q);
  }

  async function loadMembers(groupId) {
    const db = window._supabase;
    const members = await checked(db.from("grupo_miembros").select("user_id,rol").eq("grupo_id", groupId));
    if (!members?.length) throw new Error("No se encontraron integrantes en el grupo activo.");
    const profiles = await checked(db.from("perfiles").select("id,username").in("id", members.map(m => m.user_id)));
    state.members = members.map(m => ({
      id: m.user_id, role: m.rol,
      name: profiles.find(p => p.id === m.user_id)?.username || "Miembro"
    }));
  }

  /* ---------- Initialize ---------- */
  async function initialize() {
    if (state.loading) return;
    state.loading = true;
    const gen = authGeneration;
    showError("");
    try {
      const db = window._supabase;
      if (!db) throw new Error("No se pudo conectar con el servicio de datos.");
      const { data: { session }, error } = await db.auth.getSession();
      if (error) throw error;
      if (!session) { ui.login.hidden = false; ui.app.hidden = true; return; }

      state.userId = session.user.id;
      const group = window._getGrupoActivo?.();
      if (!group?.id) throw new Error("No se pudo preparar el grupo activo. Revisa tu conexión e inténtalo de nuevo.");
      state.groupId = group.id;

      await loadMembers(group.id);
      await Promise.all([loadScope("personal"), loadScope("pareja")]);
      if (gen !== authGeneration || state.userId !== session.user.id) return;

      try { await loadReminderPreferences(); }
      catch (err) {
        console.error("Recordatorios:", err);
        ui.reminderStatus.textContent = "Ejecuta supabase-finanzas-recordatorios.sql y configura el cron para activar esta función.";
      }

      state.currency = state.data.personal.settings.moneda;
      ui.currency.value = state.currency;
      ui.period.value = state.period;

      try { await loadPriceAlertPreference(); }
      catch (err) {
        console.error("Avisos:", err);
        ui.priceAlertToggle.disabled = true;
        ui.priceAlertStatus.textContent = "Ejecuta supabase-finanzas-cotizaciones.sql para activar los avisos.";
      }

      ui.login.hidden = true;
      ui.app.hidden = false;
      render();
      if (state.quoteTimer) clearInterval(state.quoteTimer);
      state.quoteTimer = setInterval(refreshCurrencyQuote, 30000);
    } catch (err) {
      if (gen !== authGeneration) return;
      console.error("Finanzas:", err);
      const msg = err?.code === "42P01" || err?.code === "PGRST205"
        ? "Falta activar las tablas de Finanzas. Ejecuta supabase-finanzas.sql en el SQL Editor de Supabase y vuelve a cargar."
        : `No se pudieron cargar tus finanzas: ${err?.message || "error desconocido"}`;
      showError(msg);
      ui.login.hidden = true;
      ui.app.hidden = true;
    } finally {
      if (gen === authGeneration) state.loading = false;
    }
  }

  /* ---------- Render ---------- */
  function selectedData() { return state.data[activeScope()] || state.data.personal; }

  function render() {
    $$("[data-finanzas-section]").forEach(b => {
      const on = b.dataset.finanzasSection === state.section;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on));
    });
    $$("[data-finanzas-scope]").forEach(b => {
      const on = b.dataset.finanzasScope === state.scope;
      b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on));
    });
    ui.quoteCard.hidden = state.section !== "cotizaciones";
    ui.reminderCard.hidden = state.section !== "recordatorios";
    ui.panel.hidden = state.section === "cotizaciones" || state.section === "recordatorios";
    ui.period.closest(".finanzas-toolbar").hidden = ui.panel.hidden;
    $(".finanzas-scopes").hidden = ui.panel.hidden;

    const settings = state.data?.[activeScope()]?.settings;
    if (settings) { state.currency = settings.moneda; ui.currency.value = state.currency; }

    if (state.quoteCurrency !== state.currency) {
      state.quoteCurrency = state.currency;
      refreshCurrencyQuote();
      if (state.priceAlertPreferenceLoaded && ui.priceAlertToggle.checked) {
        savePriceAlertPreference(true, false, true);
      }
    }
    if (ui.panel.hidden) { ui.panel.replaceChildren(); return; }
    if (state.section === "reportes") renderReports();
    else renderDashboard();
  }

  /* ---------- Dashboard ---------- */
  function metricCard(label, value, tone, detail = "") {
    return `<article class="finanzas-metric ${tone}"><span>${escapeHtml(label)}</span><strong>${money(value)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</article>`;
  }
  function categoryOptions(scope, type, selectedId = "") {
    const cats = state.data[scope]?.categories || [];
    return `<option value="">Sin categoría</option>${cats.filter(c => c.tipo === type).map(c =>
      `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? "selected" : ""}>${escapeHtml(c.nombre)}</option>`).join("")}`;
  }
  function memberOptions(selectedId) {
    return state.members.map(m =>
      `<option value="${escapeHtml(m.id)}" ${m.id === selectedId ? "selected" : ""}>${escapeHtml(m.name)}${m.id === state.userId ? " (tú)" : ""}</option>`).join("");
  }

  function movementForm(scope, editing) {
    const r = editing || {}, type = r.tipo || "gasto";
    return `<section class="finanzas-card" id="card-nuevo-movimiento">
      <div class="finanzas-card-heading">
        <div>
          <span class="finanzas-eyebrow">${editing ? "MODO EDICIÓN" : "REGISTRO RÁPIDO"}</span>
          <h2>${editing ? "Modificar movimiento" : "¿En qué se fue o de dónde vino?"}</h2>
        </div>
      </div>
      <form class="finanzas-form" id="finanzas-movimiento-form" data-scope="${scope}">
        <!-- Selector táctil intuitivo Gasto vs Ingreso -->
        <div class="finanzas-type-switch">
          <button type="button" class="finanzas-type-btn gasto ${type === "gasto" ? "active" : ""}" data-set-type="gasto">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Anotar Gasto
          </button>
          <button type="button" class="finanzas-type-btn ingreso ${type === "ingreso" ? "active" : ""}" data-set-type="ingreso">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> Anotar Ingreso
          </button>
        </div>
        <input type="hidden" name="tipo" value="${type}">

        <label>
          <span>¿Cuánto fue? (${escapeHtml(state.currency)})</span>
          <input name="monto" id="finanzas-input-monto" type="number" min="0.01" step="0.01" required value="${editing ? escapeHtml(r.monto) : ""}" placeholder="0,00" autofocus>
        </label>

        <!-- Chips de montos rápidos -->
        <div class="finanzas-quick-chips">
          <span>Montos rápidos:</span>
          <button type="button" class="finanzas-quick-chip" data-quick-amount="5">+5</button>
          <button type="button" class="finanzas-quick-chip" data-quick-amount="10">+10</button>
          <button type="button" class="finanzas-quick-chip" data-quick-amount="20">+20</button>
          <button type="button" class="finanzas-quick-chip" data-quick-amount="50">+50</button>
          <button type="button" class="finanzas-quick-chip" data-quick-amount="100">+100</button>
        </div>

        <label>
          <span>Categoría</span>
          <select name="categoria_id" id="finanzas-select-categoria">${categoryOptions(scope, type, r.categoria_id || "")}</select>
        </label>

        <!-- Chips de selección rápida de categoría -->
        <div class="finanzas-cat-chips" id="finanzas-quick-cat-chips">
          ${(state.data[scope]?.categories || []).filter(c => c.tipo === type).slice(0, 6).map(c => 
            `<button type="button" class="finanzas-cat-chip ${c.id === (r.categoria_id || "") ? "selected" : ""}" data-select-cat="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</button>`
          ).join("")}
        </div>

        <label>
          <span>Fecha</span>
          <input name="fecha" type="date" required value="${escapeHtml(r.fecha || today())}">
        </label>

        ${scope === "pareja" ? `<label><span>${type === "ingreso" ? "Ingreso de" : "¿Quién pagó?"}</span><select name="miembro_id" required>${memberOptions(r.miembro_id || state.userId)}</select></label>` : ""}

        <label class="finanzas-form-wide">
          <span>Descripción o nota (opcional)</span>
          <input name="descripcion" maxlength="120" value="${escapeHtml(r.descripcion || "")}" placeholder="Ej. Almuerzo, supermercado, gasolina, sueldo...">
        </label>

        <div class="finanzas-form-actions finanzas-form-wide" style="display:flex;gap:.7rem;margin-top:.3rem;">
          <button class="btn-primary" type="submit" style="flex:1;">
            ${editing ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Guardar cambios` : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px;"><path d="M12 5v14M5 12h14"/></svg> Guardar registro`}
          </button>
          ${editing ? `<button class="btn-secondary" type="button" data-finanzas-cancel-edit>Cancelar</button>` : ""}
        </div>
      </form>
    </section>`;
  }

  function categoriesPanel(scope) {
    const cats = state.data[scope].categories;
    return `<details class="finanzas-card finanzas-details">
      <summary><span><span class="finanzas-eyebrow">ORGANIZACIÓN</span><strong>Categorías</strong></span><span class="finanzas-detail-count">${cats.length}</span></summary>
      <form class="finanzas-inline-form" data-category-form data-scope="${scope}">
        <label><span>Nombre de categoría</span><input name="nombre" maxlength="40" required placeholder="Ej. Mascotas"></label>
        <label><span>Tipo</span><select name="tipo"><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option></select></label>
        <button class="btn-secondary" type="submit">Añadir</button>
      </form>
      <div class="finanzas-category-list">${cats.map(c => `<div class="finanzas-category-row"><span class="finanzas-category-dot ${c.tipo}"></span><span>${escapeHtml(c.nombre)}</span><small>${c.tipo === "gasto" ? "Gasto" : "Ingreso"}</small>${c.user_id === state.userId ? `<button type="button" class="finanzas-icon-button" data-delete-category="${escapeHtml(c.id)}" data-scope="${scope}" aria-label="Eliminar ${escapeHtml(c.nombre)}">×</button>` : "<span></span>"}</div>`).join("")}</div>
    </details>`;
  }

  function budgetPanel(scope) {
    const data = state.data[scope];
    const period = `${state.period}-01`;
    const budgets = data.budgets.filter(b => b.periodo === period);
    const expenses = onlyPeriod(data.movements).filter(r => r.tipo === "gasto");
    return `<details class="finanzas-card finanzas-details" open>
      <summary><span><span class="finanzas-eyebrow">PLAN DEL MES</span><strong>Presupuestos</strong></span><span class="finanzas-detail-count">${budgets.length}</span></summary>
      <form class="finanzas-inline-form" data-budget-form data-scope="${scope}">
        <label><span>Categoría</span><select name="categoria_id" required>${data.categories.filter(c => c.tipo === "gasto").map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</option>`).join("")}</select></label>
        <label><span>Límite para ${escapeHtml(state.period)}</span><input name="limite" type="number" min="0.01" step="0.01" required placeholder="0,00"></label>
        <button class="btn-secondary" type="submit">Guardar límite</button>
      </form>
      <div class="finanzas-budget-list">${budgets.length ? budgets.map(b => {
        const cat = data.categories.find(c => c.id === b.categoria_id);
        const spent = expenses.filter(r => r.categoria_id === b.categoria_id).reduce((s, r) => s + Number(r.monto), 0);
        const pct = Math.min(100, b.limite ? spent / Number(b.limite) * 100 : 0);
        return `<div class="finanzas-budget-item"><div class="finanzas-budget-meta"><strong>${escapeHtml(cat?.nombre || "Todas las categorías")}</strong><span>${money(spent)} / ${money(b.limite)}</span></div><div class="finanzas-progress"><span style="width:${pct}%" class="${pct >= 100 ? "over" : ""}"></span></div>${b.user_id === state.userId ? `<button type="button" class="finanzas-text-button" data-delete-budget="${escapeHtml(b.id)}" data-scope="${scope}">Eliminar límite</button>` : ""}</div>`;
      }).join("") : `<p class="finanzas-empty">Aún no hay presupuestos para este mes.</p>`}</div>
    </details>`;
  }

  function goalsPanel(scope) {
    const data = state.data[scope];
    const currOptions = sel => CURRENCIES.map(c => `<option value="${c}" ${c === sel ? "selected" : ""}>${c}</option>`).join("");
    return `<section class="finanzas-card">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">${scope === "pareja" ? "PLANES EN COMÚN" : "TUS PLANES"}</span><h2>Metas de ahorro</h2></div></div>
      <form class="finanzas-inline-form finanzas-goal-form" data-goal-form data-scope="${scope}">
        <label><span>Nombre de la meta</span><input name="nombre" maxlength="60" required placeholder="Ej. Viaje de verano"></label>
        <label><span>Objetivo</span><input name="objetivo" type="number" min="0.01" step="0.01" required placeholder="0,00"></label>
        <label><span>Moneda</span><select name="moneda">${currOptions(state.currency)}</select></label>
        <label><span>Fecha objetivo</span><input name="fecha_objetivo" type="date"></label>
        <button class="btn-secondary" type="submit">Crear meta</button>
      </form>
      <div class="finanzas-goals">${data.goals.length ? data.goals.map(goal => {
        const metaCurr = goal.moneda || state.currency;
        const saved = data.contributions.filter(c => c.meta_id === goal.id).reduce((s, c) => s + Number(c.monto), 0);
        const pct = Math.min(100, saved / Number(goal.objetivo) * 100);
        return `<article class="finanzas-goal">
          <div class="finanzas-goal-top">
            <div>
              <strong>${escapeHtml(goal.nombre)} <span class="finanzas-goal-currency">${escapeHtml(metaCurr)}</span></strong>
              <small>${goal.fecha_objetivo ? `Meta para ${escapeHtml(goal.fecha_objetivo)}` : "Sin fecha límite"}</small>
            </div>
            ${goal.user_id === state.userId ? `<button type="button" class="finanzas-icon-button" data-delete-goal="${escapeHtml(goal.id)}" data-scope="${scope}" aria-label="Eliminar meta ${escapeHtml(goal.nombre)}">×</button>` : ""}
          </div>
          <div class="finanzas-goal-total"><strong>${money(saved, metaCurr)}</strong><span>de ${money(goal.objetivo, metaCurr)}</span></div>
          <div class="finanzas-progress"><span style="width:${pct}%"></span></div>
          <form class="finanzas-contribution-form" data-goal-id="${escapeHtml(goal.id)}" data-scope="${scope}">
            <input name="monto" type="number" min="0.01" step="0.01" aria-label="Aportación a ${escapeHtml(goal.nombre)}" placeholder="Aportar en ${escapeHtml(metaCurr)}" required>
            <button type="submit">Sumar ahorro</button>
          </form>
        </article>`;
      }).join("") : `<p class="finanzas-empty">Crea una meta y convierte el ahorro en un plan concreto.</p>`}</div>
    </section>`;
  }

  /* ---------- Inventario, Materia Prima y Cálculo de Ganancias ---------- */
  function getInventoryStorageKey(scope) {
    const sId = scope === "pareja" ? (state.groupId || "grupo") : (state.userId || "user");
    return `sunad_finanzas_inventario_${sId}`;
  }
  function loadInventory(scope) {
    try {
      const raw = localStorage.getItem(getInventoryStorageKey(scope));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
  function saveInventory(scope, items) {
    try {
      localStorage.setItem(getInventoryStorageKey(scope), JSON.stringify(items));
    } catch {}
  }

  function inventoryPanel(scope) {
    const items = loadInventory(scope);
    const totalStock = items.reduce((s, i) => s + (Number(i.stock) || 0), 0);
    const totalValorVenta = items.reduce((s, i) => s + (Number(i.stock) || 0) * (Number(i.precioVenta) || 0), 0);
    const totalCostoMateria = items.reduce((s, i) => s + (Number(i.stock) || 0) * (Number(i.costoMateria) || 0), 0);
    const gananciaPotencial = totalValorVenta - totalCostoMateria;

    return `<section class="finanzas-card">
      <div class="finanzas-card-heading">
        <div>
          <span class="finanzas-eyebrow">CONTROL DE PRODUCTOS Y MATERIA PRIMA</span>
          <h2>Inventario y Ganancias Netas</h2>
        </div>
        <span class="finanzas-detail-count">${items.length} productos</span>
      </div>

      <div class="finanzas-metrics" style="margin-bottom:1.2rem;">
        <div class="finanzas-metric">
          <span>Unidades en Stock</span>
          <strong>${totalStock} u.</strong>
          <small>Disponibles para venta</small>
        </div>
        <div class="finanzas-metric expense">
          <span>Costo Materia Prima</span>
          <strong>${money(totalCostoMateria)}</strong>
          <small>Inversión en insumos</small>
        </div>
        <div class="finanzas-metric income">
          <span>Ganancia Neta Potencial</span>
          <strong>${money(gananciaPotencial)}</strong>
          <small>Margen bruto acumulado</small>
        </div>
      </div>

      <details class="finanzas-details" style="margin-bottom:1.2rem;">
        <summary><span><span class="finanzas-eyebrow">NUEVO PRODUCTO</span><strong>Añadir artículo al inventario</strong></span></summary>
        <form class="finanzas-inline-form" data-inventory-add-form data-scope="${scope}" style="margin-top:.8rem;">
          <label><span>Producto</span><input name="nombre" required placeholder="Ej: Pastel de chocolate, Camisa..." maxlength="60"></label>
          <label><span>Stock inicial</span><input name="stock" type="number" min="0" step="1" required placeholder="Cantidad"></label>
          <label><span>Precio de Venta</span><input name="precioVenta" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
          <label><span>Costo Materia Prima</span><input name="costoMateria" type="number" min="0" step="0.01" required placeholder="0.00"></label>
          <button class="btn-primary" type="submit" style="grid-column:1/-1;">Guardar en inventario</button>
        </form>
      </details>

      <div class="finanzas-inventory-grid">
        ${items.length ? items.map(it => {
          const pVenta = Number(it.precioVenta) || 0;
          const cMateria = Number(it.costoMateria) || 0;
          const gananciaUnitaria = pVenta - cMateria;
          const margenPct = pVenta > 0 ? Math.round((gananciaUnitaria / pVenta) * 100) : 0;
          const stock = Number(it.stock) || 0;

          return `<article class="finanzas-inventory-card">
            <div class="finanzas-inventory-header">
              <div>
                <strong>${escapeHtml(it.nombre)}</strong>
                <small style="display:block;opacity:.65;font-size:.72rem;">ID: ${escapeHtml(it.id)}</small>
              </div>
              <span class="finanzas-inventory-stock ${stock <= 2 ? "low" : ""}">${stock} en stock</span>
            </div>
            
            <div class="finanzas-inventory-metrics">
              <div class="finanzas-inventory-metric-item">
                <small>Venta</small>
                <strong>${money(pVenta)}</strong>
              </div>
              <div class="finanzas-inventory-metric-item">
                <small>Materia Prima</small>
                <strong style="color:#ff9991;">${money(cMateria)}</strong>
              </div>
              <div class="finanzas-inventory-metric-item">
                <small>Margen</small>
                <strong style="color:#f7d27c;">${margenPct}%</strong>
              </div>
            </div>

            <div class="finanzas-inventory-profit">
              <span>Ganancia neta por unidad:</span>
              <strong>+${money(gananciaUnitaria)}</strong>
            </div>

            <div class="finanzas-inventory-actions">
              <button type="button" class="btn-primary" data-inventory-sell="${escapeHtml(it.id)}" data-scope="${scope}">
                Registrar Venta
              </button>
              <button type="button" class="btn-secondary" data-inventory-delete="${escapeHtml(it.id)}" data-scope="${scope}" style="max-width:42px;" title="Eliminar">
                ×
              </button>
            </div>
          </article>`;
        }).join("") : `<div class="finanzas-empty finanzas-empty-large" style="grid-column:1/-1;">
          <strong>Sin productos en inventario</strong>
          <span>Añade productos arriba con su precio de venta y costo de materia prima para calcular tus márgenes y ganancias netas al instante.</span>
        </div>`}
      </div>
    </section>`;
  }

  function splitTransactions(rows) {
    const incomes = rows.filter(r => r.tipo === "ingreso");
    const expenses = rows.filter(r => r.tipo === "gasto");
    return {
      income: incomes.reduce((s, r) => s + Number(r.monto), 0),
      expense: expenses.reduce((s, r) => s + Number(r.monto), 0),
      incomes, expenses
    };
  }

  function movementsList(scope, rows) {
    const data = state.data[scope];
    if (!rows.length) return `<div class="finanzas-empty finanzas-empty-large"><strong>Este mes empieza limpio</strong><span>Añade tu primer movimiento para ver cómo evoluciona.</span></div>`;
    return `<div class="finanzas-movements">${rows.map(r => {
      const cat = data.categories.find(c => c.id === r.categoria_id);
      const actions = r.user_id === state.userId ? `<div class="finanzas-movement-actions"><button type="button" class="finanzas-text-button" data-edit-movement="${escapeHtml(r.id)}" data-scope="${scope}">Editar</button><button type="button" class="finanzas-text-button danger" data-delete-movement="${escapeHtml(r.id)}" data-scope="${scope}">Eliminar</button></div>` : "";
      return `<article class="finanzas-movement"><div class="finanzas-movement-symbol ${r.tipo}">${r.tipo === "ingreso" ? "+" : "−"}</div><div class="finanzas-movement-main"><strong>${escapeHtml(r.descripcion || cat?.nombre || (r.tipo === "ingreso" ? "Ingreso" : "Gasto"))}</strong><small>${escapeHtml(cat?.nombre || "Sin categoría")} · ${escapeHtml(r.fecha)}${scope === "pareja" ? ` · ${escapeHtml(getName(r.miembro_id))}` : ""}</small></div><strong class="finanzas-movement-amount ${r.tipo}">${r.tipo === "ingreso" ? "+" : "−"}${money(r.monto)}</strong>${actions}</article>`;
    }).join("")}</div>`;
  }

  function settlementCards(rows) {
    const { incomes, expenses } = splitTransactions(rows);
    const incomeByMember = new Map(state.members.map(m => [m.id, 0]));
    const paidByMember = new Map(state.members.map(m => [m.id, 0]));
    incomes.forEach(r => incomeByMember.set(r.miembro_id, (incomeByMember.get(r.miembro_id) || 0) + Number(r.monto)));
    expenses.forEach(r => paidByMember.set(r.miembro_id, (paidByMember.get(r.miembro_id) || 0) + Number(r.monto)));
    const incomeTotal = [...incomeByMember.values()].reduce((s, v) => s + v, 0);
    const expenseTotal = expenses.reduce((s, r) => s + Number(r.monto), 0);
    const share = new Map();
    state.members.forEach(m => {
      const w = incomeTotal > 0 ? incomeByMember.get(m.id) / incomeTotal : 1 / state.members.length;
      share.set(m.id, (paidByMember.get(m.id) || 0) - expenseTotal * w);
    });
    const creditors = [...share.entries()].filter(([, a]) => a > 0.01).map(([id, a]) => ({ id, amount: a }));
    const debtors = [...share.entries()].filter(([, a]) => a < -0.01).map(([id, a]) => ({ id, amount: -a }));
    const settlements = [];
    debtors.forEach(d => creditors.forEach(c => {
      const amt = Math.min(d.amount, c.amount);
      if (amt > 0.01) {
        settlements.push(`${escapeHtml(getName(d.id))} aporta ${money(amt)} a ${escapeHtml(getName(c.id))}`);
        d.amount -= amt; c.amount -= amt;
      }
    }));
    return `<section class="finanzas-card finanzas-settlement">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">REPARTO PROPORCIONAL</span><h2>Balance entre miembros</h2></div></div>
      <p>La parte de cada persona se calcula según sus ingresos registrados este mes${incomeTotal ? "." : "; como todavía no hay ingresos, se divide a partes iguales."}</p>
      <div class="finanzas-member-balances">${state.members.map(m => {
        const bal = share.get(m.id) || 0;
        return `<div class="finanzas-member-balance"><span class="finanzas-avatar">${escapeHtml(m.name.slice(0, 1).toUpperCase())}</span><span><strong>${escapeHtml(m.name)}${m.id === state.userId ? " (tú)" : ""}</strong><small>Ingresos ${money(incomeByMember.get(m.id) || 0)} · Pagó ${money(paidByMember.get(m.id) || 0)}</small></span><b class="${bal >= 0 ? "positive" : "negative"}">${bal >= 0 ? "+" : "−"}${money(Math.abs(bal))}</b></div>`;
      }).join("")}</div>
      <div class="finanzas-settlement-note"><strong>${settlements.length ? "Para equilibrar este mes" : "Todo equilibrado"}</strong>${settlements.length ? `<ul>${settlements.map(s => `<li>${s}</li>`).join("")}</ul>` : "<span>No hay pagos pendientes entre miembros.</span>"}</div>
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
    const editing = state.editingId ? data.movements.find(r => r.id === state.editingId) : null;

    if (isCouple && state.members.length < 2) {
      ui.panel.innerHTML = `<div class="finanzas-empty finanzas-empty-large"><strong>Aún no hay más integrantes</strong><span>Invita a la otra persona a tu grupo desde el menú de perfil → Amigos y grupo para activar los gastos compartidos.</span></div>`;
      return;
    }
    const metrics = `<div class="finanzas-metrics">
      ${metricCard("Ingresos del mes", totals.income, "income", "Lo que entró")}
      ${metricCard("Gastos del mes", totals.expense, "expense", "Lo que gastaste")}
      ${metricCard("Disponible", balance, balance >= 0 ? "balance-positive" : "balance-negative", balance >= 0 ? "¡Vas con saldo positivo!" : "Atención: gastos mayores a ingresos")}
    </div>`;

    const svgCard = `<svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align:-3px;margin-left:5px;display:inline-block;" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
    const svgCouple = `<svg viewBox="0 0 24 24" width="20" height="20" style="vertical-align:-3px;margin-left:5px;display:inline-block;" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
    const svgPlus = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
    const svgLightbulb = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>`;
    const svgSparkles = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`;

    const heroQuick = `<div class="finanzas-hero-quick">
      <div class="finanzas-hero-text">
        <h2>${isCouple ? `Finanzas en Pareja ${svgCouple}` : `Tu resumen financiero ${svgCard}`}</h2>
        <p>${rows.length ? `Llevas <strong>${rows.length} movimientos</strong> registrados en ${escapeHtml(state.period)}.` : "Aún no has registrado movimientos este mes. ¡Anota el primero en un clic!"}</p>
      </div>
      <div class="finanzas-hero-actions">
        <button type="button" class="btn-primary finanzas-btn-big-add" data-open-quick-add>
          ${svgPlus} Registrar movimiento
        </button>
      </div>
    </div>`;

    const recentMovementsCard = `<section class="finanzas-card">
      <div class="finanzas-card-heading">
        <div>
          <span class="finanzas-eyebrow">MOVIMIENTOS RECIENTES</span>
          <h2>Últimos registros de ${escapeHtml(state.period)}</h2>
        </div>
        <button type="button" class="finanzas-text-button" data-nav-to="movimientos">Ver todos (${rows.length}) →</button>
      </div>
      ${movementsList(scope, rows.slice(0, 5))}
    </section>`;

    const sections = {
      resumen: `${heroQuick}${metrics}${isCouple ? settlementCards(rows) : ""}${recentMovementsCard}`,
      movimientos: `${movementForm(scope, editing)}<section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">ACTIVIDAD DEL PERÍODO</span><h2>Movimientos</h2></div><span class="finanzas-detail-count">${rows.length}</span></div>${movementsList(scope, rows)}</section>`,
      presupuestos: `${budgetPanel(scope)}`,
      metas: `${goalsPanel(scope)}`,
      categorias: `${categoriesPanel(scope)}`,
      inventario: `${inventoryPanel(scope)}`
    };
    ui.panel.innerHTML = sections[state.section] || sections.resumen;
    bindDashboardEvents(scope);
  }

  async function refreshData() {
    showError("");
    await Promise.all([loadScope("personal"), loadScope("pareja")]);
    render();
  }

  async function saveMovement(form, scope) {
    const vals = new FormData(form);
    const amount = Number(vals.get("monto"));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Escribe un importe mayor que cero.");
    const row = {
      user_id: state.userId,
      grupo_id: scope === "pareja" ? state.groupId : null,
      miembro_id: scope === "pareja" ? String(vals.get("miembro_id") || state.userId) : state.userId,
      categoria_id: String(vals.get("categoria_id") || "") || null,
      tipo: String(vals.get("tipo")),
      monto: amount,
      fecha: String(vals.get("fecha")),
      descripcion: String(vals.get("descripcion") || "").trim()
    };
    const r = state.editingId
      ? await window._supabase.from("finanzas_movimientos").update(row).eq("id", state.editingId).eq("user_id", state.userId)
      : await window._supabase.from("finanzas_movimientos").insert(row);
    if (r.error) throw r.error;
    state.editingId = null;
    await refreshData();
  }

  async function handleForm(form, callback) {
    try { await callback(); }
    catch (err) {
      console.error("Finanzas:", err);
      showError(`No se pudo guardar: ${err?.message || "error desconocido"}`);
    }
  }

  function bindDashboardEvents(scope) {
    const txForm = $("#finanzas-movimiento-form", ui.panel);
    
    // Conmutador interactivo Gasto / Ingreso
    $$("[data-set-type]", txForm || ui.panel).forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.setType;
        const hiddenType = $('input[name="tipo"]', txForm);
        if (hiddenType) hiddenType.value = type;
        $$("[data-set-type]", txForm).forEach(b => b.classList.toggle("active", b === btn));
        const catSel = $('select[name="categoria_id"]', txForm);
        if (catSel) catSel.innerHTML = categoryOptions(scope, type);
        const quickChips = $("#finanzas-quick-cat-chips", txForm);
        if (quickChips) {
          quickChips.innerHTML = (state.data[scope]?.categories || []).filter(c => c.tipo === type).slice(0, 6).map(c => 
            `<button type="button" class="finanzas-cat-chip" data-select-cat="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</button>`
          ).join("");
          bindCategoryChips();
        }
      });
    });

    // Selección rápida de categoría con un toque
    const bindCategoryChips = () => {
      $$("[data-select-cat]", txForm).forEach(chip => {
        chip.addEventListener("click", () => {
          const catId = chip.dataset.selectCat;
          const catSel = $('select[name="categoria_id"]', txForm);
          if (catSel) catSel.value = catId;
          $$("[data-select-cat]", txForm).forEach(c => c.classList.toggle("selected", c === chip));
        });
      });
    };
    bindCategoryChips();

    // Chips de montos rápidos (+5, +10, +20, etc.)
    $$("[data-quick-amount]", txForm || ui.panel).forEach(btn => {
      btn.addEventListener("click", () => {
        const inputMonto = $("#finanzas-input-monto", txForm);
        if (!inputMonto) return;
        const add = Number(btn.dataset.quickAmount) || 0;
        const actual = Number(inputMonto.value) || 0;
        inputMonto.value = (actual + add).toFixed(2);
        inputMonto.focus();
      });
    });

    txForm?.addEventListener("change", e => {
      if (e.target.name === "tipo") {
        const catSel = $('select[name="categoria_id"]', txForm);
        catSel.innerHTML = categoryOptions(scope, e.target.value);
        const quickChips = $("#finanzas-quick-cat-chips", txForm);
        if (quickChips) {
          quickChips.innerHTML = (state.data[scope]?.categories || []).filter(c => c.tipo === e.target.value).slice(0, 6).map(c => 
            `<button type="button" class="finanzas-cat-chip" data-select-cat="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</button>`
          ).join("");
          bindCategoryChips();
        }
      } else if (e.target.name === "categoria_id") {
        $$("[data-select-cat]", txForm).forEach(c => c.classList.toggle("selected", c.dataset.selectCat === e.target.value));
      }
    });
    txForm?.addEventListener("submit", e => { e.preventDefault(); handleForm(txForm, () => saveMovement(txForm, scope)); });
    $("[data-finanzas-cancel-edit]", ui.panel)?.addEventListener("click", () => { state.editingId = null; render(); });

    $$("[data-edit-movement]", ui.panel).forEach(b => b.addEventListener("click", () => {
      state.scope = b.dataset.scope;
      state.editingId = b.dataset.editMovement;
      state.section = "movimientos";
      render();
      $("#finanzas-movimiento-form", ui.panel)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    $$("[data-delete-movement]", ui.panel).forEach(b => b.addEventListener("click", () => {
      handleForm(null, async () => {
        const r = await window._supabase.from("finanzas_movimientos").delete().eq("id", b.dataset.deleteMovement).eq("user_id", state.userId);
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-category-form]", ui.panel).forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      handleForm(f, async () => {
        const vals = new FormData(f);
        const r = await window._supabase.from("finanzas_categorias").insert({
          user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null,
          nombre: String(vals.get("nombre")).trim(),
          tipo: String(vals.get("tipo"))
        });
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-delete-category]", ui.panel).forEach(b => b.addEventListener("click", () => {
      handleForm(null, async () => {
        const r = await window._supabase.from("finanzas_categorias").delete().eq("id", b.dataset.deleteCategory).eq("user_id", state.userId);
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-budget-form]", ui.panel).forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      handleForm(f, async () => {
        const vals = new FormData(f);
        const amount = Number(vals.get("limite"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("El límite debe ser mayor que cero.");
        const args = rowScope(scope);
        let ex = window._supabase.from("finanzas_presupuestos").select("id").eq("periodo", `${state.period}-01`).eq("categoria_id", String(vals.get("categoria_id")));
        ex = args.grupo_id ? ex.eq("grupo_id", args.grupo_id) : ex.eq("user_id", state.userId).is("grupo_id", null);
        const found = await checked(ex.limit(1));
        const r = found.length
          ? await window._supabase.from("finanzas_presupuestos").update({ limite: amount }).eq("id", found[0].id).eq("user_id", state.userId)
          : await window._supabase.from("finanzas_presupuestos").insert({
              user_id: state.userId, grupo_id: scope === "pareja" ? state.groupId : null,
              categoria_id: String(vals.get("categoria_id")), periodo: `${state.period}-01`, limite: amount
            });
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-delete-budget]", ui.panel).forEach(b => b.addEventListener("click", () => {
      handleForm(null, async () => {
        const r = await window._supabase.from("finanzas_presupuestos").delete().eq("id", b.dataset.deleteBudget).eq("user_id", state.userId);
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-goal-form]", ui.panel).forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      handleForm(f, async () => {
        const vals = new FormData(f);
        const amount = Number(vals.get("objetivo"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("El objetivo debe ser mayor que cero.");
        const r = await window._supabase.from("finanzas_metas").insert({
          user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null,
          nombre: String(vals.get("nombre")).trim(),
          objetivo: amount,
          moneda: String(vals.get("moneda") || state.currency),
          fecha_objetivo: String(vals.get("fecha_objetivo") || "") || null
        });
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-goal-id]", ui.panel).forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      handleForm(f, async () => {
        const amount = Number(new FormData(f).get("monto"));
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("La aportación debe ser mayor que cero.");
        const r = await window._supabase.from("finanzas_aportes").insert({
          meta_id: f.dataset.goalId, user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null, monto: amount
        });
        if (r.error) throw r.error;
        await refreshData();
      });
    }));
    $$("[data-delete-goal]", ui.panel).forEach(b => b.addEventListener("click", () => {
      handleForm(null, async () => {
        const r = await window._supabase.from("finanzas_metas").delete().eq("id", b.dataset.deleteGoal).eq("user_id", state.userId);
        if (r.error) throw r.error;
        await refreshData();
      });
    }));

    // Eventos de Inventario y Ventas
    $$("[data-inventory-add-form]", ui.panel).forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      handleForm(f, async () => {
        const vals = new FormData(f);
        const nombre = String(vals.get("nombre")).trim();
        const stock = Math.max(0, parseInt(vals.get("stock")) || 0);
        const precioVenta = Math.max(0, parseFloat(vals.get("precioVenta")) || 0);
        const costoMateria = Math.max(0, parseFloat(vals.get("costoMateria")) || 0);
        if (!nombre) throw new Error("Escribe el nombre del producto.");

        const items = loadInventory(scope);
        items.unshift({
          id: "prod_" + Date.now(),
          nombre,
          stock,
          precioVenta,
          costoMateria,
          ventasTotales: 0,
          gananciaAcumulada: 0,
          fecha: today()
        });
        saveInventory(scope, items);
        render();
      });
    }));

    $$("[data-inventory-delete]", ui.panel).forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.inventoryDelete;
      const items = loadInventory(scope).filter(i => i.id !== id);
      saveInventory(scope, items);
      render();
    }));

    $$("[data-inventory-sell]", ui.panel).forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.inventorySell;
      const items = loadInventory(scope);
      const prod = items.find(i => i.id === id);
      if (!prod) return;
      if (prod.stock <= 0) {
        showError(`No queda stock disponible de "${prod.nombre}".`);
        return;
      }
      handleForm(null, async () => {
        prod.stock -= 1;
        prod.ventasTotales = (prod.ventasTotales || 0) + 1;
        const ganancia = (Number(prod.precioVenta) || 0) - (Number(prod.costoMateria) || 0);
        prod.gananciaAcumulada = (prod.gananciaAcumulada || 0) + ganancia;
        saveInventory(scope, items);

        // Registrar automáticamente la venta en Finanzas (Ingreso)
        const catsFiltradas = state.data[scope].categories.filter(c => c.tipo === "ingreso");
        const catId = catsFiltradas[0]?.id || null;
        await window._supabase.from("finanzas_movimientos").insert({
          user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null,
          miembro_id: state.userId,
          categoria_id: catId,
          tipo: "ingreso",
          monto: Number(prod.precioVenta) || 0,
          fecha: today(),
          descripcion: `Venta 1x ${prod.nombre} (Materia prima: ${money(prod.costoMateria)} | Ganancia neta: ${money(ganancia)})`
        });
        await refreshData();
      });
    }));

    // Navegación rápida desde botones amigables
    $("[data-open-quick-add]", ui.panel)?.addEventListener("click", () => {
      state.section = "movimientos";
      render();
      $("#finanzas-input-monto", ui.panel)?.focus();
    });

    $$("[data-nav-to]", ui.panel).forEach(btn => {
      btn.addEventListener("click", () => {
        state.section = btn.dataset.navTo;
        render();
      });
    });
  }

  /* ---------- Reportes ---------- */
  function renderReports() {
    const scope = state.scope, data = state.data[scope];
    if (!data) { ui.panel.replaceChildren(); return; }
    const rows = onlyPeriod(data.movements);
    const totals = splitTransactions(rows);
    const [year, month] = state.period.split("-").map(Number);
    const monthly = [];
    for (let off = 5; off >= 0; off--) {
      const d = new Date(year, month - 1 - off, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const match = data.movements.filter(r => reportPeriod(r.fecha) === key);
      const sums = splitTransactions(match);
      const locale = window.SunPreferences?.getLanguage?.() || "es";
      monthly.push({
        key,
        label: new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale, { month: "short" }).format(d),
        income: sums.income, expense: sums.expense
      });
    }
    const chartMax = Math.max(1, ...monthly.flatMap(i => [i.income, i.expense]));
    const bars = monthly.map(i => `<div class="finanzas-chart-month"><div class="finanzas-bars"><span class="income" style="height:${Math.max(3, i.income / chartMax * 100)}%" title="Ingresos ${money(i.income)}"></span><span class="expense" style="height:${Math.max(3, i.expense / chartMax * 100)}%" title="Gastos ${money(i.expense)}"></span></div><small>${escapeHtml(i.label)}</small></div>`).join("");

    const byCat = data.categories.filter(c => c.tipo === "gasto").map(c => ({
      name: c.nombre,
      amount: rows.filter(r => r.tipo === "gasto" && r.categoria_id === c.id).reduce((s, r) => s + Number(r.monto), 0)
    })).filter(i => i.amount > 0).sort((a, b) => b.amount - a.amount);
    const catTotal = byCat.reduce((s, i) => s + i.amount, 0);
    const colors = ["#ed9b48", "#5f9d75", "#8c78c6", "#d66f6f", "#5f9cb6", "#c7a34d"];
    let acc = 0;
    const gradient = byCat.length
      ? `conic-gradient(${byCat.map((i, idx) => {
          const s = acc;
          acc += i.amount / catTotal * 100;
          return `${colors[idx % colors.length]} ${s}% ${acc}%`;
        }).join(",")})`
      : "conic-gradient(#e8e6df 0 100%)";

    ui.panel.innerHTML = `<div class="finanzas-report-top"><div><span class="finanzas-eyebrow">VISTA GENERAL</span><h2>Reportes</h2></div></div>
      <div class="finanzas-metrics">${metricCard("Ingresos", totals.income, "income")}${metricCard("Gastos", totals.expense, "expense")}${metricCard("Balance", totals.income - totals.expense, totals.income >= totals.expense ? "balance-positive" : "balance-negative")}</div>
      <div class="finanzas-report-grid">
        <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">ÚLTIMOS SEIS MESES</span><h2>Ingresos y gastos</h2></div></div><div class="finanzas-chart-legend"><span><i class="income"></i>Ingresos</span><span><i class="expense"></i>Gastos</span></div><div class="finanzas-chart">${bars}</div></section>
        <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">PERÍODO ACTUAL</span><h2>Gastos por categoría</h2></div></div><div class="finanzas-donut-wrap"><div class="finanzas-donut" style="background:${gradient}"><span>${money(catTotal)}</span></div><div class="finanzas-legend">${byCat.length ? byCat.map((i, idx) => `<div><i style="background:${colors[idx % colors.length]}"></i><span>${escapeHtml(i.name)}</span><strong>${money(i.amount)}</strong></div>`).join("") : `<p class="finanzas-empty">Aún no hay gastos categorizados.</p>`}</div></div></section>
      </div>
      ${scope === "pareja" && state.members.length > 1 ? settlementCards(rows) : ""}
      <section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">DETALLE</span><h2>Movimientos del período</h2></div></div>${movementsList(scope, rows)}</section>`;
    bindDashboardEvents(scope);
  }

  /* ---------- Eventos globales ---------- */
  function bindEvents() {
    $$("[data-finanzas-section]").forEach(b => b.addEventListener("click", () => {
      state.section = b.dataset.finanzasSection;
      state.editingId = null;
      render();
    }));
    $$("[data-finanzas-scope]").forEach(b => b.addEventListener("click", () => {
      state.scope = b.dataset.finanzasScope;
      render();
    }));
    ui.period.addEventListener("change", () => {
      if (!/^\d{4}-\d{2}$/.test(ui.period.value)) return;
      state.period = ui.period.value;
      handleForm(null, refreshData);
    });
    // 🔧 FIX: comprobación de null antes de leer settings
    ui.currency.addEventListener("change", () => handleForm(null, async () => {
      const value = ui.currency.value;
      if (!/^(EUR|USD|MXN|ARS|COP|CLP|PEN|VES)$/.test(value)) throw new Error("Selecciona una moneda válida.");
      const scope = activeScope();
      const settings = state.data?.[scope]?.settings;
      if (!settings) throw new Error("Espera a que se carguen tus finanzas.");
      const r = await window._supabase.from("finanzas_ajustes").update({ moneda: value }).eq("id", settings.id);
      if (r.error) throw r.error;
      settings.moneda = value;
      state.currency = value;
      render();
    }));
    ui.reload.addEventListener("click", () => handleForm(null, refreshData));
    ui.reminderForm.addEventListener("submit", saveReminderPreferences);
    ui.priceAlertToggle.addEventListener("change", () => savePriceAlertPreference(ui.priceAlertToggle.checked));
    ui.loginButton.addEventListener("click", () => $("#btn-open-login")?.click());

    window._supabase?.auth.onAuthStateChange((_e, session) => {
      if (session) {
        if (!state.userId || state.userId === session.user.id) return;
        authGeneration++;
      } else {
        authGeneration++;
      }
      state.loading = false;
      state.userId = null; state.groupId = null; state.members = [];
      state.data = { personal: null, pareja: null };
      state.reminders = null; state.priceAlertPreferenceLoaded = false;
      state.quoteRequest++;
      state.quote = null; state.quoteHistory = []; state.quoteCurrency = null;
      if (state.quoteTimer) clearInterval(state.quoteTimer);
      state.quoteTimer = null; state.editingId = null;
      ui.panel.replaceChildren();
      ui.app.hidden = true; ui.login.hidden = false;
      showError("");
    });
    window.addEventListener("sunad:language-change", () => {
      if (state.data.personal) {
        render();
        if (state.quote) renderQuote(state.quote, state.quoteHistory, null);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    window.addEventListener("sunad:group-ready", () => initialize());
    window.addEventListener("sunad:group-error", e => {
      ui.login.hidden = true; ui.app.hidden = false;
      showError(`No se pudo preparar el grupo para Finanzas: ${e.detail?.message || "error desconocido"}`);
    });
    window._supabase?.auth.getSession().then(({ data: { session }, error }) => {
      if (error) throw error;
      if (!session) { ui.login.hidden = false; ui.app.hidden = true; }
      else if (window._getGrupoActivo?.()?.id) initialize();
      else { ui.login.hidden = true; showError("Preparando tu espacio de Finanzas…"); }
    }).catch(err => {
      console.error("Finanzas:", err);
      showError(`No se pudo comprobar la sesión: ${err?.message || "error desconocido"}`);
    });
  }, { once: true });
})();