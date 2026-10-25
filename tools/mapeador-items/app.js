/* ============================================================
   MAPEADOR DE ÍTEMS · SunAdventures
   App independiente: abre index.html con doble clic (no necesita servidor).
   - El trabajo se autoguarda en el navegador (localStorage) por sprite sheet.
   - "Exportar JSON" permite pasar el trabajo entre miembros del equipo.
   - "Descargar sprites-names.js" genera el archivo listo para el juego.
   ============================================================ */
(() => {
    "use strict";
    const $ = id => document.getElementById(id);

    /* ---------------- Configuración ---------------- */
    const SHEETS = [
        { id: "items-actuales", label: "🎒 Ítems Actuales del Juego (97 ítems)", src: "sprites/items-actuales-sheet.png", cols: 10, rows: 10, baselineKey: "ITEMS_ACTUALES_NAMES" },
        { id: "loot-2", label: "⚔️ Loot 2 · Pool activo", src: "sprites/loot-2.png", cols: 8, rows: 9, baseline: true },
        { id: "loot-1", label: "🛡️ Loot 1 · Armería", src: "sprites/loot-1.png", cols: 8, rows: 9 },
        { id: "admurin", label: "👑 Tienda Admurin", src: "sprites/admurin-items.png", cols: 30, rows: 110 },
    ];

    const RAREZAS = [
        { v: "comun", label: "⚪ Común" },
        { v: "raro", label: "🔵 Raro" },
        { v: "epico", label: "🟣 Épico" },
        { v: "legendario", label: "🟡 Legendario" },
        { v: "mitico", label: "🌸 Mítico" },
        { v: "tornasol", label: "🌈 Tornasol" },
    ];

    // peso = valor orientativo por punto, usado solo para la "puntuación de poder"
    const STATS = [
        { v: "atk", label: "⚔️ Ataque", peso: 3 },
        { v: "def", label: "🛡️ Defensa", peso: 2.5 },
        { v: "hp", label: "❤️ Vida", peso: .4 },
        { v: "crit", label: "🎯 Crítico %", peso: 2 },
        { v: "esq", label: "💨 Esquivar %", peso: 2 },
        { v: "vel", label: "⚡ Velocidad", peso: 2 },
        { v: "lifesteal", label: "🩸 Robo de vida %", peso: 3 },
        { v: "thorns", label: "🌵 Espinas", peso: 1.5 },
        { v: "regen", label: "💚 Regeneración/turno", peso: 1.5 },
        { v: "xp", label: "✨ XP extra %", peso: .5 },
        { v: "oro", label: "💰 Oro extra %", peso: .5 },
        { v: "suerte", label: "🍀 Suerte", peso: 1 },
        { v: "fuego", label: "🔥 Daño fuego", peso: 2 },
        { v: "hielo", label: "❄️ Daño hielo", peso: 2 },
        { v: "rayo", label: "⚡ Daño rayo", peso: 2 },
        { v: "veneno", label: "☠️ Daño veneno", peso: 2 },
        { v: "sangrado", label: "🩸 Sangrado", peso: 2 },
    ];

    const HAB_TIPOS = [
        { v: "daño", label: "Daño directo" },
        { v: "daño_indirecto", label: "Daño por turno" },
        { v: "boost", label: "Buff propio" },
        { v: "debuff", label: "Debuff rival" },
        { v: "soporte", label: "Curación/soporte" },
        { v: "invocacion", label: "Invocación" },
        { v: "defensa", label: "Defensa/escudo" },
        { v: "control", label: "Control" },
        { v: "pasiva", label: "Pasiva" },
        { v: "ultimate", label: "Ultimate" },
    ];

    const STORE_KEY = "sunad_mapeador_v1";

    /* ---------------- Estado ---------------- */
    let store = loadStore();          // { [sheetId]: { cols, rows, items: { "c,r": item } } }
    let sheetCfg = SHEETS[0];
    let zoom = 1;
    let sel = null;                   // { c, r }
    let dirty = false;
    const rarFilter = new Set(RAREZAS.map(r => r.v));

    const sheet = $("sheet"), stage = $("sheet-stage"), overlay = $("overlay");

    function loadStore() {
        try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
    }
    function saveStore() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { toast("⚠️ No se pudo autoguardar: " + e.message); }
    }
    function state() {
        if (!store[sheetCfg.id]) {
            store[sheetCfg.id] = { cols: sheetCfg.cols, rows: sheetCfg.rows, items: {} };
            if (sheetCfg.baselineKey && window[sheetCfg.baselineKey]) {
                store[sheetCfg.id].items = normalizeMap(window[sheetCfg.baselineKey]);
            } else if (sheetCfg.baseline && window.SPRITE_NAMES) {
                store[sheetCfg.id].items = normalizeMap(window.SPRITE_NAMES);
            }
        }
        return store[sheetCfg.id];
    }
    function normalizeMap(map) {
        const out = {};
        Object.entries(map || {}).forEach(([k, v]) => {
            if (!/^\d+,\d+$/.test(k) || !v) return;
            out[k] = {
                ...(v.id ? { id: String(v.id) } : {}),
                nombre: v.nombre || `Objeto ${k}`,
                rar: v.rar || "comun",
                icono: v.icono || "espada",
                desc: v.desc || "",
                consumible: !!v.consumible,
                stats: { ...(v.stats || {}) },
                habilidades: Array.isArray(v.habilidades) ? v.habilidades.map(h => ({ nombre: h.nombre || "Habilidad", tipo: h.tipo || "daño", val: Number(h.val) || 0, desc: h.desc || "" })) : [],
            };
        });
        return out;
    }

    /* ---------------- Utilidades ---------------- */
    let toastT;
    function toast(msg) {
        const t = $("toast");
        t.textContent = msg; t.classList.add("show");
        clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
    }
    const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const key = (c, r) => `${c},${r}`;
    function spriteBg(el, c, r) {
        const { cols, rows } = state();
        el.style.backgroundImage = `url("${sheetCfg.src}")`;
        el.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
        el.style.backgroundPosition = `${cols > 1 ? c / (cols - 1) * 100 : 0}% ${rows > 1 ? r / (rows - 1) * 100 : 0}%`;
    }
    function power(stats) {
        return Math.round(Object.entries(stats).reduce((s, [k, v]) => s + (STATS.find(x => x.v === k)?.peso ?? 1) * v, 0));
    }
    const NATIVE = !!window.Capacitor?.isNativePlatform?.();
    async function download(name, text, type) {
        if (NATIVE) {
            // En la APK: escribir en caché y abrir el menú "Compartir" de Android
            const { Filesystem, Share } = window.Capacitor.Plugins;
            try {
                const res = await Filesystem.writeFile({ path: name, data: text, directory: "CACHE", encoding: "utf8" });
                await Share.share({ title: name, text: `Mapeo de ítems · ${name}`, files: [res.uri], dialogTitle: "Enviar archivo" });
            } catch (err) {
                if (!/cancel/i.test(err?.message || "")) toast("❌ No se pudo compartir: " + (err?.message || err));
            }
            return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([text], { type }));
        a.download = name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }

    /* ---------------- Sheet ---------------- */
    function initSheets() {
        $("sheet-select").innerHTML = SHEETS.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
        $("sheet-select").addEventListener("change", e => {
            if (dirty && !confirm("Tienes cambios sin guardar en el ítem actual. ¿Continuar?")) { e.target.value = sheetCfg.id; return; }
            selectSheet(e.target.value);
        });
    }
    function selectSheet(id) {
        sheetCfg = SHEETS.find(s => s.id === id) || SHEETS[0];
        $("sheet-select").value = sheetCfg.id;
        sel = null; dirty = false;
        const st = state();
        $("cols").value = st.cols; $("rows").value = st.rows;
        sheet.src = sheetCfg.src;
        clearForm();
        renderAll();
    }
    sheet.addEventListener("load", () => zoomFit());
    sheet.addEventListener("error", () => toast("❌ No se encontró " + sheetCfg.src));

    function setZoom(z) {
        zoom = Math.min(8, Math.max(.1, z));
        sheet.style.width = sheet.naturalWidth * zoom + "px";
        sheet.style.height = sheet.naturalHeight * zoom + "px";
        $("zoom-val").textContent = Math.round(zoom * 100) + "%";
        renderGrid();
    }
    function zoomFit() {
        if (!sheet.naturalWidth) return;
        const w = $("sheet-wrap").clientWidth - 30;
        setZoom(Math.min(4, w / sheet.naturalWidth));
    }
    $("zoom-in").onclick = () => setZoom(zoom * 1.25);
    $("zoom-out").onclick = () => setZoom(zoom / 1.25);
    $("zoom-fit").onclick = zoomFit;
    $("sheet-wrap").addEventListener("wheel", e => {
        if (!e.ctrlKey) return;
        e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
    }, { passive: false });

    ["cols", "rows"].forEach(id => $(id).addEventListener("change", () => {
        const st = state();
        st.cols = Math.max(1, parseInt($("cols").value) || st.cols);
        st.rows = Math.max(1, parseInt($("rows").value) || st.rows);
        saveStore(); renderAll();
    }));
    $("show-grid").onchange = e => overlay.classList.toggle("no-grid", !e.target.checked);
    $("show-marks").onchange = e => overlay.classList.toggle("no-marks", !e.target.checked);

    function cellSize() {
        const { cols, rows } = state();
        return { cw: sheet.clientWidth / cols, ch: sheet.clientHeight / rows };
    }
    function placeBox(el, c, r) {
        const { cw, ch } = cellSize();
        Object.assign(el.style, { display: "block", left: c * cw + "px", top: r * ch + "px", width: cw + "px", height: ch + "px" });
    }
    function renderGrid() {
        const { cols, rows, items } = state();
        const { cw, ch } = cellSize();
        const w = sheet.clientWidth, h = sheet.clientHeight;
        let html = "";
        if (cw >= 4 && ch >= 4) {
            for (let c = 1; c < cols; c++) html += `<div class="gl" style="left:${c * cw}px;top:0;width:1px;height:${h}px"></div>`;
            for (let r = 1; r < rows; r++) html += `<div class="gl" style="top:${r * ch}px;left:0;height:1px;width:${w}px"></div>`;
        }
        Object.entries(items).forEach(([k, it]) => {
            const [c, r] = k.split(",").map(Number);
            if (c >= cols || r >= rows) return;
            html += `<div class="mk rar-${esc(it.rar)}" style="left:${c * cw}px;top:${r * ch}px;width:${cw}px;height:${ch}px"></div>`;
        });
        overlay.innerHTML = html;
        if (sel) placeBox($("sel-box"), sel.c, sel.r); else $("sel-box").style.display = "none";
    }

    function cellFromEvent(e) {
        const rect = sheet.getBoundingClientRect();
        const { cols, rows } = state();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
        return { c: Math.floor(x / rect.width * cols), r: Math.floor(y / rect.height * rows) };
    }
    stage.addEventListener("mousemove", e => {
        const cell = cellFromEvent(e);
        if (cell) placeBox($("hover-box"), cell.c, cell.r); else $("hover-box").style.display = "none";
    });
    stage.addEventListener("mouseleave", () => $("hover-box").style.display = "none");
    stage.addEventListener("click", e => { const cell = cellFromEvent(e); if (cell) select(cell.c, cell.r); });

    function select(c, r, scroll) {
        if (dirty && sel && (sel.c !== c || sel.r !== r)) {
            if (!confirm("Tienes cambios sin guardar en este ítem. ¿Descartarlos?")) return;
        }
        sel = { c, r }; dirty = false;
        const it = state().items[key(c, r)];
        if (it) fillForm(it); else { clearForm(); $("f-nombre").focus(); }
        placeBox($("sel-box"), c, r);
        if (scroll) $("sel-box").scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        renderPreview(); renderList();
    }

    /* ---------------- Formulario ---------------- */
    $("f-rar").innerHTML = RAREZAS.map(r => `<option value="${r.v}">${r.label}</option>`).join("");

    function statRow(k = "atk", v = 1) {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<select class="input s-key">${STATS.map(s => `<option value="${s.v}"${s.v === k ? " selected" : ""}>${s.label}</option>`).join("")}</select>
            <input type="number" class="input s-val" value="${esc(v)}" step="1">
            <button type="button" class="del" title="Quitar">×</button>`;
        // stat desconocido: lo añadimos para no perderlo
        if (!STATS.some(s => s.v === k)) row.querySelector(".s-key").insertAdjacentHTML("beforeend", `<option value="${esc(k)}" selected>${esc(k)}</option>`);
        row.querySelector(".del").onclick = () => { row.remove(); onEdit(); };
        $("stats-list").appendChild(row);
    }
    function habRow(h = {}) {
        const box = document.createElement("div");
        box.className = "hab";
        box.innerHTML = `<div class="row">
                <input class="input h-nombre" placeholder="Nombre de la habilidad" value="${esc(h.nombre || "")}">
                <select class="input h-tipo">${HAB_TIPOS.map(t => `<option value="${t.v}"${t.v === h.tipo ? " selected" : ""}>${t.label}</option>`).join("")}</select>
                <button type="button" class="del" title="Quitar">×</button>
            </div>
            <div class="row2">
                <input type="number" class="input h-val" step="0.1" placeholder="Valor" value="${esc(h.val ?? 0)}">
                <input class="input h-desc" placeholder="Descripción corta" value="${esc(h.desc || "")}">
            </div>`;
        if (h.tipo && !HAB_TIPOS.some(t => t.v === h.tipo)) box.querySelector(".h-tipo").insertAdjacentHTML("beforeend", `<option value="${esc(h.tipo)}" selected>${esc(h.tipo)}</option>`);
        box.querySelector(".del").onclick = () => { box.remove(); onEdit(); };
        $("habs-list").appendChild(box);
    }
    $("stats-add").onclick = () => { statRow(); onEdit(); };
    $("habs-add").onclick = () => { habRow(); onEdit(); };

    function readForm() {
        const stats = {};
        $("stats-list").querySelectorAll(".row").forEach(r => {
            const k = r.querySelector(".s-key").value, v = parseFloat(r.querySelector(".s-val").value);
            if (k && Number.isFinite(v) && v !== 0) stats[k] = (stats[k] || 0) + v;
        });
        const habilidades = [];
        $("habs-list").querySelectorAll(".hab").forEach(b => {
            const nombre = b.querySelector(".h-nombre").value.trim(), desc = b.querySelector(".h-desc").value.trim();
            if (!nombre && !desc) return;
            habilidades.push({ nombre: nombre || "Habilidad", tipo: b.querySelector(".h-tipo").value, val: parseFloat(b.querySelector(".h-val").value) || 0, desc });
        });
        const rar = $("f-rar").value, id = $("f-id").value.trim().replace(/\s+/g, "-");
        return {
            ...(id ? { id } : {}),
            nombre: $("f-nombre").value.trim() || `Objeto ${sel.c},${sel.r}`,
            rar,
            icono: $("f-icono").value.trim() || "espada",
            desc: $("f-desc").value.trim() || `Un objeto ${rar}.`,
            consumible: $("f-consumible").value === "si",
            stats, habilidades,
        };
    }
    function fillForm(it) {
        $("f-nombre").value = it.nombre || "";
        $("f-id").value = it.id || "";
        $("f-rar").value = it.rar || "comun";
        $("f-icono").value = it.icono || "espada";
        $("f-desc").value = it.desc || "";
        $("f-consumible").value = it.consumible ? "si" : "no";
        $("stats-list").innerHTML = ""; $("habs-list").innerHTML = "";
        Object.entries(it.stats || {}).forEach(([k, v]) => statRow(k, v));
        (it.habilidades || []).forEach(habRow);
        updatePower();
    }
    function clearForm() {
        $("item-form").reset();
        $("f-icono").value = "espada";
        $("stats-list").innerHTML = ""; $("habs-list").innerHTML = "";
        statRow("atk", 1);
        updatePower();
    }
    function updatePower() {
        const stats = {};
        $("stats-list").querySelectorAll(".row").forEach(r => {
            const v = parseFloat(r.querySelector(".s-val").value);
            if (Number.isFinite(v)) stats[r.querySelector(".s-key").value] = (stats[r.querySelector(".s-key").value] || 0) + v;
        });
        $("power").textContent = "Poder " + power(stats);
        const rar = $("f-rar").value;
        $("preview").style.borderColor = `var(--r-${rar})`;
        $("preview").style.boxShadow = `0 0 24px color-mix(in srgb, var(--r-${rar}) 45%, transparent)`;
    }
    function onEdit() { if (sel) dirty = true; updatePower(); }
    $("item-form").addEventListener("input", onEdit);
    $("item-form").addEventListener("change", onEdit);

    $("item-form").addEventListener("submit", e => {
        e.preventDefault();
        if (!sel) return toast("⚠️ Selecciona primero un sprite");
        const it = readForm();
        state().items[key(sel.c, sel.r)] = it;
        dirty = false; saveStore(); renderAll();
        toast(`✅ "${it.nombre}" guardado en [${sel.c}, ${sel.r}]`);
    });
    $("btn-delete").onclick = () => {
        if (!sel) return;
        const k = key(sel.c, sel.r), it = state().items[k];
        if (!it) { clearForm(); dirty = false; return; }
        if (!confirm(`¿Quitar "${it.nombre}" de [${k}]?`)) return;
        delete state().items[k];
        dirty = false; saveStore(); clearForm(); renderAll();
        toast("🗑️ Ítem eliminado");
    };

    /* ---------------- Render ---------------- */
    function renderPreview() {
        if (!sel) {
            $("coords").textContent = "— , —"; $("status").textContent = "Haz clic en un sprite";
            $("preview").style.backgroundImage = ""; return;
        }
        spriteBg($("preview"), sel.c, sel.r);
        $("coords").textContent = `${sel.c} , ${sel.r}`;
        const it = state().items[key(sel.c, sel.r)];
        $("status").textContent = it ? `📍 Mapeado · ${it.nombre}` : "✨ Celda libre · nuevo ítem";
    }

    function renderFilters() {
        $("rar-filters").innerHTML = RAREZAS.map(r => `<button type="button" data-r="${r.v}" class="rar-${r.v}${rarFilter.has(r.v) ? " on" : ""}">${r.label}</button>`).join("");
        $("rar-filters").querySelectorAll("button").forEach(b => b.onclick = () => {
            rarFilter.has(b.dataset.r) ? rarFilter.delete(b.dataset.r) : rarFilter.add(b.dataset.r);
            renderFilters(); renderList();
        });
    }

    function renderList() {
        const { items, cols, rows } = state();
        const q = $("search").value.trim().toLowerCase();
        const entries = Object.entries(items)
            .map(([k, it]) => ({ k, it, c: +k.split(",")[0], r: +k.split(",")[1] }))
            .sort((a, b) => a.r - b.r || a.c - b.c);
        const shown = entries.filter(({ k, it }) => rarFilter.has(it.rar) &&
            (!q || [it.nombre, it.id, k, it.desc, ...Object.keys(it.stats || {}), ...(it.habilidades || []).map(h => h.nombre)].join(" ").toLowerCase().includes(q)));

        $("item-count").textContent = entries.length;
        const pct = Math.min(100, entries.length / (cols * rows) * 100);
        $("progress-bar").style.width = pct + "%";
        $("progress-text").textContent = `${entries.length} / ${cols * rows} celdas mapeadas`;

        const ul = $("item-list");
        if (!shown.length) { ul.innerHTML = `<li class="empty">${entries.length ? "Sin resultados" : "Aún no hay ítems.<br>Haz clic en un sprite para empezar."}</li>`; return; }
        ul.innerHTML = shown.map(({ k, it, c, r }) => `<li data-c="${c}" data-r="${r}" class="${sel && sel.c === c && sel.r === r ? "active" : ""}">
                <span class="thumb rar-${esc(it.rar)}" data-c="${c}" data-r="${r}"></span>
                <span class="meta"><span class="name">${esc(it.nombre)}</span><span class="sub">[${k}] · P${power(it.stats || {})}${it.consumible ? " · 🧪" : ""}${it.habilidades?.length ? " · ✨" + it.habilidades.length : ""}</span></span>
            </li>`).join("");
        ul.querySelectorAll(".thumb").forEach(t => spriteBg(t, +t.dataset.c, +t.dataset.r));
        ul.querySelectorAll("li[data-c]").forEach(li => li.onclick = () => select(+li.dataset.c, +li.dataset.r, true));
    }
    $("search").addEventListener("input", renderList);

    function renderAll() { renderGrid(); renderList(); renderPreview(); $("output").value = buildMapCode(); }

    /* ---------------- Exportación ---------------- */
    const q = s => JSON.stringify(String(s));
    function itemLine(k, i) {
        const p = [];
        if (i.id) p.push(`id: ${q(i.id)}`);
        p.push(`nombre: ${q(i.nombre)}`, `rar: ${q(i.rar)}`);
        if (i.icono) p.push(`icono: ${q(i.icono)}`);
        if (i.desc) p.push(`desc: ${q(i.desc)}`);
        if (i.consumible) p.push("consumible: true");
        const st = Object.entries(i.stats || {});
        if (st.length) p.push(`stats: { ${st.map(([a, b]) => `${/^[a-z_]\w*$/i.test(a) ? a : q(a)}: ${b}`).join(", ")} }`);
        if (i.habilidades?.length) p.push(`habilidades: [${i.habilidades.map(h => `{ nombre: ${q(h.nombre)}, tipo: ${q(h.tipo)}, val: ${Number(h.val) || 0}${h.desc ? `, desc: ${q(h.desc)}` : ""} }`).join(", ")}]`);
        return `        "${k}": { ${p.join(", ")} },`;
    }
    function buildMapCode() {
        const lines = Object.entries(state().items)
            .sort(([a], [b]) => { const [ac, ar] = a.split(",").map(Number), [bc, br] = b.split(",").map(Number); return ar - br || ac - bc; })
            .map(([k, i]) => itemLine(k, i));
        return `    window.SPRITE_NAMES = {\n\n        // --- MAPEO GENERADO (${sheetCfg.label}) ---\n${lines.join("\n")}\n\n    };`;
    }
    function buildFullFile() {
        return `/* ============================================================
   SPRITE-NAMES.JS — Nombres coherentes para el sprite sheet
   Basado en Admurin's Armory (itch.io)
   Formato: "col,row": { nombre, rar, icono, desc, consumible?, stats?, habilidades? }
   Rarezas: comun · raro · epico · legendario · mitico · tornasol
   Generado con el Mapeador de Ítems (${new Date().toLocaleString("es")})
   ============================================================ */
(function () {
    "use strict";

${buildMapCode()}

    /* ============================================
       Helper: obtener info de un sprite
       ============================================ */
    window.getSpriteInfo = function (col, row) {
        return window.SPRITE_NAMES[\`\${col},\${row}\`] || null;
    };

    /* ============================================
       Helper: obtener nombre legible
       ============================================ */
    window.getSpriteName = function (col, row) {
        const info = window.getSpriteInfo(col, row);
        return info ? info.nombre : \`Objeto [\${col},\${row}]\`;
    };

    console.log("✅ sprite-names.js cargado ·", Object.keys(window.SPRITE_NAMES).length, "objetos nombrados");
})();
`;
    }

    $("btn-copy").onclick = e => {
        e.preventDefault();
        navigator.clipboard.writeText($("output").value).then(() => toast("📋 Código copiado"), () => { $("output").select(); document.execCommand("copy"); toast("📋 Código copiado"); });
    };
    $("btn-download-js").onclick = () => {
        if (!Object.keys(state().items).length) return toast("⚠️ No hay ítems que exportar");
        download("sprites-names.js", buildFullFile(), "text/javascript");
        toast("⬇️ sprites-names.js descargado · reemplázalo en el proyecto");
    };
    $("btn-export-json").onclick = () => {
        const st = state();
        const data = { app: "sunad-mapeador", version: 1, sheet: sheetCfg.id, cols: st.cols, rows: st.rows, exported: new Date().toISOString(), items: st.items };
        download(`mapeo-${sheetCfg.id}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
        toast("💾 JSON exportado · compártelo con el equipo");
    };

    /* ---------------- Importación ---------------- */
    $("btn-import").onclick = () => $("file-input").click();
    $("file-input").addEventListener("change", async e => {
        const file = e.target.files[0]; e.target.value = "";
        if (!file) return;
        try {
            const text = await file.text();
            let items, cfg = null;
            if (file.name.endsWith(".json")) {
                const data = JSON.parse(text);
                items = normalizeMap(data.items || data);
                if (data.sheet && SHEETS.some(s => s.id === data.sheet)) cfg = data;
            } else {
                const fakeWin = {};
                new Function("window", "console", text)(fakeWin, { log() { }, warn() { }, error() { } });
                items = normalizeMap(fakeWin.SPRITE_NAMES);
            }
            const n = Object.keys(items).length;
            if (!n) return toast("⚠️ El archivo no contiene ítems");
            if (cfg && cfg.sheet !== sheetCfg.id) selectSheet(cfg.sheet);
            const st = state();
            const merge = Object.keys(st.items).length && confirm(`Se encontraron ${n} ítems.\n\nAceptar = COMBINAR con el mapeo actual\nCancelar = REEMPLAZAR el mapeo actual`);
            st.items = merge ? { ...st.items, ...items } : items;
            if (cfg?.cols) { st.cols = cfg.cols; st.rows = cfg.rows; $("cols").value = st.cols; $("rows").value = st.rows; }
            sel = null; dirty = false; clearForm();
            saveStore(); renderAll();
            toast(`📂 ${n} ítems importados`);
        } catch (err) {
            console.error(err);
            toast("❌ No se pudo leer el archivo: " + err.message);
        }
    });

    /* ---------------- Teclado ---------------- */
    document.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); $("item-form").requestSubmit(); return; }
        const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
        if (typing) { if (e.key === "Escape") document.activeElement.blur(); return; }
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (d) {
            e.preventDefault();
            const { cols, rows } = state();
            const c = sel ? Math.min(cols - 1, Math.max(0, sel.c + d[0])) : 0;
            const r = sel ? Math.min(rows - 1, Math.max(0, sel.r + d[1])) : 0;
            select(c, r, true);
        } else if (e.key === "Delete" && sel) $("btn-delete").click();
    });
    window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
    window.addEventListener("resize", () => renderGrid());

    /* ---------------- Init ---------------- */
    initSheets();
    renderFilters();
    selectSheet(SHEETS[0].id);
})();
