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

  function renderNotas() {
    try {
      if (!notasGrid) return;
      notasGrid.innerHTML = "";
      if (notas.length === 0) { notasEmpty?.classList.remove("hidden"); return; }
      notasEmpty?.classList.add("hidden");
      const frag = document.createDocumentFragment();
      notas.forEach(n => frag.appendChild(crearNotaPolaroid(n)));
      notasGrid.appendChild(frag);
    } catch (err) { console.warn("renderNotas:", err); }
  }

  function crearNotaPolaroid(nota) {
    try {
      const article = document.createElement("article");
      article.className = "nota color-" + (nota.color || "amarillo");
      fullscreenInteractivo(article);
      const btnDel = crearBtn("nota-delete", SVG.trash, "Eliminar nota", e => { e.stopPropagation(); eliminarNota(nota.id); });
      const btnFull = crearBtn("nota-fullscreen", SVG.expand, "Pantalla completa", e => { e.preventDefault(); e.stopPropagation(); if (document.fullscreenElement === article) { cerrarFullscreen(); return; } activarFullscreen(article, btnFull); });
      const btnEdit = crearBtn("nota-edit", SVG.edit, "Editar nota", e => { e.preventDefault(); e.stopPropagation(); abrirNotaModal(nota); });
      article.append(btnDel, btnFull, btnEdit);
      if (nota.titulo) { const h3 = document.createElement("h3"); h3.className = "nota-titulo"; h3.textContent = nota.titulo; article.appendChild(h3); }
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
          const nueva = await añadirNotaTabla(titulo, contenido, colorFinal);
          notas.unshift({ id: nueva.id, titulo: nueva.titulo, contenido: nueva.contenido, color: nueva.color, created_at: nueva.created_at });
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
