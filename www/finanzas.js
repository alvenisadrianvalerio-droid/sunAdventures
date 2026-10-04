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
  const quoteHistoryKey = c => `sunadventures_fx_history_v2_${c}`;
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
    ui.quoteValues.innerHTML = rows.join("");
    ui.quoteChart.innerHTML = sparkline(history, code) || `<span class="finanzas-quote-chart-empty">El gráfico se formará con las próximas cotizaciones.</span>`;
    const time = new Intl.DateTimeFormat(undefined, { hour:"2-digit", minute:"2-digit" }).format(new Date(q.fetchedAt));
    ui.quoteUpdated.textContent = quoteText(copy.checked, { time });
    ui.quoteStatus.textContent = code === "VES"
      ? quoteText(copy.vesStatus, { date: q.usd.asOf })
      : quoteText(copy.referenceStatus, { date: q.usd.asOf });
  }
  async function refreshCurrencyQuote() {
    if (!state.userId || !state.currency || !window._supabase) return;
    const req = ++state.quoteRequest, currency = state.currency;
    if (!state.quote || state.quote.currency !== currency) ui.quoteUpdated.textContent = "Consultando cotización…";
    try {
      const { data, error } = await window._supabase.functions.invoke("currency-quotes", { body: { currency } });
      if (error) throw error;
      if (req !== state.quoteRequest || currency !== state.currency) return;
      if (!data?.usd || !Number.isFinite(Number(data.usd.value))) throw new Error(quoteCopy().incomplete);
      const sample = saveQuoteSample(data);
      state.quote = data; state.quoteHistory = sample.history;
      renderQuote(data, sample.history, sample.previous);
    } catch (err) {
      if (req !== state.quoteRequest) return;
      console.error("Cotización:", err);
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
      state.quoteTimer = setInterval(refreshCurrencyQuote, 60000);
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
    return `<section class="finanzas-card">
      <div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">${editing ? "EDITAR MOVIMIENTO" : "NUEVO MOVIMIENTO"}</span><h2>${editing ? "Actualiza el registro" : "Anota un ingreso o gasto"}</h2></div></div>
      <form class="finanzas-form" id="finanzas-movimiento-form" data-scope="${scope}">
        <label><span>Tipo</span><select name="tipo"><option value="gasto" ${type === "gasto" ? "selected" : ""}>Gasto</option><option value="ingreso" ${type === "ingreso" ? "selected" : ""}>Ingreso</option></select></label>
        <label><span>Importe</span><input name="monto" type="number" min="0.01" step="0.01" required value="${editing ? escapeHtml(r.monto) : ""}" placeholder="0,00"></label>
        <label><span>Categoría</span><select name="categoria_id">${categoryOptions(scope, type, r.categoria_id || "")}</select></label>
        <label><span>Fecha</span><input name="fecha" type="date" required value="${escapeHtml(r.fecha || today())}"></label>
        ${scope === "pareja" ? `<label><span>${type === "ingreso" ? "Ingreso de" : "Pagado por"}</span><select name="miembro_id" required>${memberOptions(r.miembro_id || state.userId)}</select></label>` : ""}
        <label class="finanzas-form-wide"><span>Descripción</span><input name="descripcion" maxlength="120" value="${escapeHtml(r.descripcion || "")}" placeholder="Ej. Compra semanal"></label>
        <div class="finanzas-form-actions"><button class="btn-primary" type="submit">${editing ? "Guardar cambios" : "Añadir movimiento"}</button>${editing ? `<button class="btn-secondary" type="button" data-finanzas-cancel-edit>Cancelar</button>` : ""}</div>
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
    const metrics = `<div class="finanzas-metrics">${metricCard("Ingresos", totals.income, "income")}${metricCard("Gastos", totals.expense, "expense")}${metricCard("Disponible", balance, balance >= 0 ? "balance-positive" : "balance-negative", "Ingresos menos gastos")}</div>`;
    const sections = {
      resumen: `${metrics}${isCouple ? settlementCards(rows) : ""}<section class="finanzas-card finanzas-summary-card"><span class="finanzas-eyebrow">ACCESO RÁPIDO</span><h2>Gestiona tus finanzas</h2><p>Usa los botones de arriba para abrir movimientos, presupuestos, metas, categorías, reportes, cotizaciones o recordatorios.</p></section>`,
      movimientos: `${movementForm(scope, editing)}<section class="finanzas-card"><div class="finanzas-card-heading"><div><span class="finanzas-eyebrow">ACTIVIDAD DEL PERÍODO</span><h2>Movimientos</h2></div><span class="finanzas-detail-count">${rows.length}</span></div>${movementsList(scope, rows)}</section>`,
      presupuestos: budgetPanel(scope),
      metas: goalsPanel(scope),
      categorias: categoriesPanel(scope)
    };
    ui.panel.innerHTML = sections[state.section] || sections.resumen;
    if (["movimientos", "presupuestos", "metas", "categorias"].includes(state.section)) bindDashboardEvents(scope);
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
    txForm?.addEventListener("change", e => {
      if (e.target.name === "tipo") {
        const catSel = $('select[name="categoria_id"]', txForm);
        catSel.innerHTML = categoryOptions(scope, e.target.value);
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
    window.addEventListener("sunadventures:group-error", e => {
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