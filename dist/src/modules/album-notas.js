/* ============================================================
   MÓDULO: NOTAS (album-notas.js)
   ============================================================ */
(function() {
  const {
    supabase,
    $,
    SVG,
    fmtFechaNota,
    confirmar,
    alertar,
    crearBtn,
    activarFullscreen,
    cerrarFullscreen,
    fullscreenInteractivo
  } = window.AlbumApp;

  let notas = [];
  let notaEditando = null;
  let colorSeleccionado = "amarillo";

  const notasGrid = $("notas-grid");
  const notasEmpty = $("notas-empty");
  const btnAddNota = $("btn-add-nota");
  const notaModal = $("nota-modal");
  const notaForm = $("nota-form");
  const notaModalTitle = $("nota-modal-title");
  const notaTitulo = $("nota-titulo");
  const notaContenido = $("nota-contenido");
  const notaPreview = $("nota-preview");
  const notaTituloCampo = notaTitulo?.closest(".form-field");
  const notaColorCampo = document.querySelector("#nota-form .color-picker")?.closest(".form-field");
  const notaSubmitBtn = notaForm?.querySelector('button[type="submit"]');

  async function cargarNotas() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { notas = []; return; }
      const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo() || await window.AlbumApp.modules.grupo?.asegurarGrupoActivo();
      const uid = session.user.id;
      let query = supabase.from("notas")
        .select("id,titulo,contenido,color,created_at,grupo_id,user_id")
        .order("created_at", { ascending: false });
      
      if (grupoActivo?.id) {
        let conds = [`grupo_id.eq.${grupoActivo.id}`, `user_id.eq.${uid}`];
        const pareja = window.ParejaSistema?.getPareja?.();
        if (pareja?.id && pareja.id !== uid) {
          conds.push(`user_id.eq.${pareja.id}`);
        } else {
          try {
            const rawPareja = localStorage.getItem(`sunad_pareja_${uid}`);
            if (rawPareja) {
              const parsed = JSON.parse(rawPareja);
              if (parsed?.id && parsed.id !== uid) conds.push(`user_id.eq.${parsed.id}`);
            }
          } catch {}
        }
        query = query.or(conds.join(","));
      } else {
        query = query.eq("user_id", uid);
      }
      
      const { data, error } = await query;
      if (error) { console.warn("cargarNotas error:", error); notas = []; return; }
      notas = (data || []).map(n => ({ id: n.id, titulo: n.titulo, contenido: n.contenido, color: n.color || "amarillo", created_at: n.created_at, grupo_id: n.grupo_id, user_id: n.user_id }));
    } catch (err) { console.warn("cargarNotas:", err); notas = []; }
  }

  const añadirNotaTabla = async (titulo, contenido, color) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión");
    const grupoActivo = window.AlbumApp.modules.grupo?.getGrupoActivo();
    const { data, error } = await supabase.from("notas").insert({ user_id: session.user.id, grupo_id: grupoActivo?.id, titulo: titulo || null, contenido, color: color || "amarillo" }).select().single();
    if (error) throw error;
    return data;
  };
  const eliminarNotaTabla = async id => { const { error } = await supabase.from("notas").delete().eq("id", id); if (error) throw error; };
  const actualizarNotaTabla = async (id, titulo, contenido, color) => { const { data, error } = await supabase.from("notas").update({ titulo: titulo || null, contenido, color: color || "amarillo" }).select().single(); if (error) throw error; return data; };

  const PREFIJO_LACRE = "[LACRE] ";
  const STORAGE_FIJADAS = () => `sa_notas_fijadas_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;
  const STORAGE_ABIERTAS = () => `sa_notas_lacres_abiertos_${window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local"}`;

  let filtroNotaCat = "todas";
  let busquedaNotaTxt = "";

  function getNotasFijadas() {
    try { return JSON.parse(localStorage.getItem(STORAGE_FIJADAS()) || "{}"); } catch { return {}; }
  }
  function toggleNotaFijada(id) {
    try {
      const f = getNotasFijadas();
      if (f[id]) delete f[id]; else f[id] = true;
      localStorage.setItem(STORAGE_FIJADAS(), JSON.stringify(f));
      renderNotas();
    } catch {}
  }
  function getLacresAbiertos() {
    try { return JSON.parse(localStorage.getItem(STORAGE_ABIERTAS()) || "{}"); } catch { return {}; }
  }
  function marcarLacreAbierto(id) {
    try {
      const a = getLacresAbiertos();
      if (!a[id]) {
        a[id] = true;
        localStorage.setItem(STORAGE_ABIERTAS(), JSON.stringify(a));
        window._sumarAmorPareja?.(20, "Carta secreta con sello de lacre abierta");
        window.ParejaSistema?.lluviaCorazones?.(16);
        try { window._snd?.("victoria") || window._snd?.("pop"); } catch {}
      }
    } catch {}
  }

  function inyectarControlesNotas() {
    if (!notasGrid) return;
    const sec = notasGrid.parentElement;
    if (!sec || $("notas-toolbar-filtros")) return;

    const bar = document.createElement("div");
    bar.id = "notas-toolbar-filtros";
    bar.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:0 auto 1.2rem;max-width:1100px;padding:0.7rem 1rem;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);";
    bar.innerHTML = `
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <button type="button" class="btn-secondary nota-chip-filtro active" data-nota-cat="todas" style="padding:0.35rem 0.8rem;font-size:0.78rem;border-radius:999px;">✨ Todas</button>
        <button type="button" class="btn-secondary nota-chip-filtro" data-nota-cat="lacre" style="padding:0.35rem 0.8rem;font-size:0.78rem;border-radius:999px;border-color:rgba(244,63,94,0.45);color:#fda4af;">💌 Cartas Lacradas</button>
        <button type="button" class="btn-secondary nota-chip-filtro" data-nota-cat="fijadas" style="padding:0.35rem 0.8rem;font-size:0.78rem;border-radius:999px;border-color:rgba(255,217,61,0.45);color:#ffd93d;">📌 Fijadas</button>
        <button type="button" class="btn-secondary nota-chip-filtro" data-nota-cat="listas" style="padding:0.35rem 0.8rem;font-size:0.78rem;border-radius:999px;">☑️ Listas</button>
      </div>
      <div style="flex:1;min-width:190px;max-width:300px;">
        <input type="search" id="notas-buscador-input" placeholder="🔍 Buscar en nuestras notas..." style="width:100%;padding:0.42rem 0.8rem;border-radius:999px;border:1px solid rgba(255,255,255,0.16);background:rgba(0,0,0,0.28);color:#fff;font-size:0.82rem;">
      </div>
    `;
    sec.insertBefore(bar, notasGrid);

    bar.querySelectorAll("[data-nota-cat]").forEach(btn => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll("[data-nota-cat]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filtroNotaCat = btn.dataset.notaCat || "todas";
        renderNotas();
      });
    });

    $("notas-buscador-input")?.addEventListener("input", e => {
      busquedaNotaTxt = (e.target.value || "").trim().toLowerCase();
      renderNotas();
    });

    // Añadir checkbox de "Sellar con lacre" en el modal de notas si no existe
    if (notaForm && !$("nota-check-lacre")) {
      const fieldsCol = notaForm.querySelector(".nota-editor-fields") || notaForm;
      const wrapLacre = document.createElement("label");
      wrapLacre.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;border-radius:12px;background:rgba(244,63,94,0.12);border:1px solid rgba(244,63,94,0.35);cursor:pointer;font-size:0.82rem;color:#fecdd3;";
      wrapLacre.innerHTML = `
        <input type="checkbox" id="nota-check-lacre" style="accent-color:#f43f5e;width:16px;height:16px;">
        <span>💌 <strong>Sellar con Lacre Real</strong> (Tu pareja romperá el sello para leerla y ganará +20 Amor XP)</span>
      `;
      fieldsCol.appendChild(wrapLacre);
    }
  }

  function renderNotas() {
    try {
      if (!notasGrid) return;
      inyectarControlesNotas();
      notasGrid.innerHTML = "";
      if (notas.length === 0) { notasEmpty?.classList.remove("hidden"); return; }
      notasEmpty?.classList.add("hidden");

      const fijadas = getNotasFijadas();
      let filtradas = notas.filter(n => {
        const esLacre = (n.titulo || "").startsWith(PREFIJO_LACRE);
        const esFijada = Boolean(fijadas[n.id]);
        const esLista = (n.contenido || "").includes("\n");
        if (filtroNotaCat === "lacre" && !esLacre) return false;
        if (filtroNotaCat === "fijadas" && !esFijada) return false;
        if (filtroNotaCat === "listas" && !esLista) return false;
        if (busquedaNotaTxt) {
          const t = `${n.titulo || ""} ${n.contenido || ""}`.toLowerCase();
          if (!t.includes(busquedaNotaTxt)) return false;
        }
        return true;
      });

      filtradas.sort((a, b) => (fijadas[b.id] ? 1 : 0) - (fijadas[a.id] ? 1 : 0));

      const frag = document.createDocumentFragment();
      filtradas.forEach(n => frag.appendChild(crearNotaPolaroid(n)));
      notasGrid.appendChild(frag);
    } catch (err) { console.warn("renderNotas:", err); }
  }

  const SVG_SELLO_LACRE = `<svg viewBox="0 0 160 160" width="66" height="66" style="filter:drop-shadow(0 4px 10px rgba(225,29,72,0.5));"><circle cx="80" cy="80" r="56" fill="#be123c"/><circle cx="80" cy="80" r="44" fill="#e11d48" stroke="#fda4af" stroke-width="2.5" stroke-dasharray="6 4"/><path d="M80 108 C80 108 50 86 50 66 C50 54 60 46 70 46 C75 46 78 49 80 53 C82 49 85 46 90 46 C100 46 110 54 110 66 C110 86 80 108 80 108 Z" fill="#ffd93d"/></svg>`;

  function crearNotaPolaroid(nota) {
    try {
      const article = document.createElement("article");
      article.className = "nota color-" + (nota.color || "amarillo");
      fullscreenInteractivo(article);

      const fijadas = getNotasFijadas();
      const estaFijada = Boolean(fijadas[nota.id]);
      const esLacre = (nota.titulo || "").startsWith(PREFIJO_LACRE);
      const tituloLimpio = esLacre ? (nota.titulo || "").slice(PREFIJO_LACRE.length) : (nota.titulo || "");
      const abiertos = getLacresAbiertos();
      const lacreCerrado = esLacre && !abiertos[nota.id];

      const btnDel = crearBtn("nota-delete", SVG.trash, "Eliminar nota", e => { e.stopPropagation(); eliminarNota(nota.id); });
      const btnFull = crearBtn("nota-fullscreen", SVG.expand, "Pantalla completa", e => { e.preventDefault(); e.stopPropagation(); if (document.fullscreenElement === article) { cerrarFullscreen(); return; } activarFullscreen(article, btnFull); });
      const btnEdit = crearBtn("nota-edit", SVG.edit, "Editar nota", e => { e.preventDefault(); e.stopPropagation(); abrirNotaModal(nota); });
      const btnPin = document.createElement("button");
      btnPin.type = "button";
      btnPin.className = "nota-pin-btn";
      btnPin.title = estaFijada ? "Desfijar nota" : "Fijar arriba";
      btnPin.style.cssText = `position:absolute;top:8px;left:40px;z-index:4;border:none;border-radius:50%;width:26px;height:26px;cursor:pointer;background:${estaFijada ? "rgba(255,217,61,0.95)" : "rgba(0,0,0,0.28)"};color:${estaFijada ? "#2b2118" : "#fff"};display:inline-flex;align-items:center;justify-content:center;transition:transform 0.2s, background 0.2s;box-shadow:0 2px 6px rgba(0,0,0,0.25);`;
      btnPin.innerHTML = estaFijada ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22L12 23L13 22V16H18V14L16 12Z"/></svg>` : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11V22L12 23L13 22V16H18V14L16 12Z"/></svg>`;
      btnPin.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); toggleNotaFijada(nota.id); });

      article.append(btnDel, btnFull, btnEdit, btnPin);

      if (lacreCerrado) {
        const selloWrap = document.createElement("div");
        selloWrap.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1.4rem 0.8rem;cursor:pointer;user-select:none;";
        selloWrap.innerHTML = `
          ${SVG_SELLO_LACRE}
          <strong style="margin-top:8px;font-size:0.95rem;color:#881337;">${tituloLimpio || "Carta Secreta Lacrada"}</strong>
          <span style="margin-top:4px;font-size:0.76rem;background:rgba(190,18,60,0.15);color:#9f1239;padding:3px 10px;border-radius:999px;font-weight:700;">💌 Toca para romper el sello (+20 Amor XP)</span>
        `;
        selloWrap.addEventListener("click", e => {
          e.stopPropagation();
          marcarLacreAbierto(nota.id);
          renderNotas();
        });
        article.appendChild(selloWrap);
        return article;
      }

      if (tituloLimpio) {
        const h3 = document.createElement("h3");
        h3.className = "nota-titulo";
        h3.textContent = (esLacre ? "💌 " : "") + tituloLimpio;
        article.appendChild(h3);
      }
      const wrap = document.createElement("div"); wrap.className = "nota-contenido-wrap";
      const lineas = (nota.contenido || "").split(/\r?\n/);
      if (lineas.length === 0 || (lineas.length === 1 && lineas[0].trim() === "")) { const p = document.createElement("p"); p.className = "nota-contenido"; p.textContent = nota.contenido || ""; wrap.appendChild(p); }
      else { lineas.forEach(linea => { const row = document.createElement("div"); row.className = "nota-linea"; const cb = document.createElement("input"); cb.type = "checkbox"; cb.className = "nota-check"; cb.setAttribute("aria-label", "Marcar línea"); const txt = document.createElement("span"); txt.className = "nota-texto"; txt.textContent = linea.trim() || " "; cb.addEventListener("change", () => txt.classList.toggle("tachada", cb.checked)); row.append(cb, txt); wrap.appendChild(row); }); }
      article.appendChild(wrap);
      if (nota.created_at) { const f = document.createElement("span"); f.className = "nota-fecha"; f.textContent = fmtFechaNota(nota.created_at); article.appendChild(f); }
      return article;
    } catch (err) { console.warn("crearNotaPolaroid:", err); return document.createElement("div"); }
  }

  async function abrirNotaModal(notaParaEditar = null) {
    try {
      if (!notaModal) return;
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        await cerrarFullscreen();
        await new Promise(r => setTimeout(r, 60));
      }
      notaEditando = notaParaEditar;
      notaModal.classList.add("active"); notaModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
      notaForm?.reset();
      colorSeleccionado = notaParaEditar?.color || "amarillo";
      if (notaParaEditar) { if (notaTitulo) notaTitulo.value = notaParaEditar.titulo || ""; if (notaContenido) notaContenido.value = notaParaEditar.contenido || ""; }
      if (notaTituloCampo) notaTituloCampo.hidden = Boolean(notaParaEditar);
      if (notaColorCampo) notaColorCampo.hidden = Boolean(notaParaEditar);
      if (notaModalTitle) notaModalTitle.textContent = notaParaEditar ? "Editar texto" : "Nueva notita";
      document.querySelectorAll(".color-option").forEach(opt => opt.classList.toggle("activo", opt.dataset.color === colorSeleccionado));
      if (notaSubmitBtn) { notaSubmitBtn.disabled = false; notaSubmitBtn.textContent = notaParaEditar ? "Actualizar texto" : "Guardar notita"; }
      actualizarVistaPreviaNota();
      setTimeout(() => notaTitulo?.focus(), 100);
    } catch (err) { console.warn("abrirNotaModal:", err); }
  }

  function actualizarVistaPreviaNota() {
    try {
      if (!notaPreview) return;
      notaPreview.className = `nota-preview color-${colorSeleccionado}`;
      notaPreview.innerHTML = "";
      const t = document.createElement("strong"); t.textContent = notaTitulo?.value.trim() || "Sin título";
      const c = document.createElement("span"); c.textContent = notaContenido?.value.trim() || "Escribe algo para ver la vista previa...";
      notaPreview.append(t, c); notaPreview.hidden = false;
    } catch (err) { console.warn("actualizarVistaPreviaNota:", err); }
  }

  function cerrarNotaModal() {
    try {
      if (!notaModal) return;
      notaModal.classList.remove("active"); notaModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
      notaEditando = null;
      if (notaTituloCampo) notaTituloCampo.hidden = false;
      if (notaColorCampo) notaColorCampo.hidden = false;
      if (notaModalTitle) notaModalTitle.textContent = "Nueva notita";
    } catch (err) { console.warn("cerrarNotaModal:", err); }
  }

  async function eliminarNota(id) {
    try {
      const ok = await confirmar({ title: "¿Eliminar esta notita?", message: "Perderás este texto para siempre.", variant: "danger", icon: "📝", confirmText: "Sí, borrar", cancelText: "Mantener" });
      if (!ok) return;
      await eliminarNotaTabla(id);
      notas = notas.filter(n => n.id !== id);
      renderNotas();
      window.dispatchEvent(new Event("sunad:progress"));
    } catch (err) { alertar({ title: "Error", message: "No se pudo eliminar: " + (err.message || err), variant: "danger" }); }
  }

  btnAddNota?.addEventListener("click", () => abrirNotaModal());
  notaModal?.querySelectorAll("[data-close-nota-modal]").forEach(el => el.addEventListener("click", cerrarNotaModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && notaModal?.classList.contains("active")) cerrarNotaModal(); });
  document.querySelectorAll(".color-option").forEach(opt => opt.addEventListener("click", () => {
    document.querySelectorAll(".color-option").forEach(o => o.classList.remove("activo"));
    opt.classList.add("activo");
    colorSeleccionado = opt.dataset.color;
    actualizarVistaPreviaNota();
  }));

  notaForm?.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const titulo = notaTitulo?.value.trim() || "", contenido = notaContenido?.value.trim() || "";
      if (!contenido) return alertar({ title: "Nota vacía", message: "Escribe algo en la notita.", icon: "✏️" });
      if (notaSubmitBtn) { notaSubmitBtn.disabled = true; notaSubmitBtn.textContent = "Guardando..."; }
      try {
        if (notaEditando) {
          const act = await actualizarNotaTabla(notaEditando.id, notaEditando.titulo, contenido, notaEditando.color);
          const idx = notas.findIndex(n => n.id === notaEditando.id);
          if (idx !== -1) notas[idx] = { id: act.id, titulo: act.titulo, contenido: act.contenido, color: act.color, created_at: act.created_at };
        } else {
          const colorFinal = colorSeleccionado || document.querySelector(".color-option.activo")?.dataset.color || "amarillo";
          const esLacreCheck = Boolean($("nota-check-lacre")?.checked);
          const tituloFinal = esLacreCheck ? `${PREFIJO_LACRE}${titulo || "Carta secreta"}` : titulo;
          const nueva = await añadirNotaTabla(tituloFinal, contenido, colorFinal);
          notas.unshift({ id: nueva.id, titulo: nueva.titulo, contenido: nueva.contenido, color: nueva.color, created_at: nueva.created_at });
          if ($("nota-check-lacre")) $("nota-check-lacre").checked = false;
        }
        cerrarNotaModal(); renderNotas(); window.dispatchEvent(new Event("sunad:progress"));
      } catch (err) { alertar({ title: "No se pudo guardar", message: err.message || String(err), variant: "danger" }); if (notaSubmitBtn) { notaSubmitBtn.disabled = false; notaSubmitBtn.textContent = notaEditando ? "Actualizar texto" : "Guardar notita"; } }
    } catch (err) { console.warn("nota submit:", err); }
  });

  window.addEventListener("sunad:notas-recargar", () => { cargarNotas().then(renderNotas); });

  window.AlbumApp.modules.notas = {
    cargarNotas,
    renderNotas,
    abrirNotaModal,
    cerrarNotaModal,
    getNotas: () => notas,
    setNotas: n => { notas = n; }
  };
})();
