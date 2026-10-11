/* ============================================================
   PLAYER-EXTRAS v3 — Minimalista de verdad
   Solo: botón cola + panel + ecualizador + atajos de teclado
   Sin badges, sin contadores flotantes, sin ruido.
   ============================================================ */
(function () {
  "use strict";

  const $ = id => document.getElementById(String(id).replace(/^#/, ""));
  const qs = (s, r = document) => r.querySelector(s);

  const playerBar = $("player-bar");
  if (!playerBar) return;

  /* ============================================================
     1) BOTÓN COLA — discreto, al final de .player-controls
     ============================================================ */
  function inyectarBotonCola() {
    const controls = qs(".player-controls", playerBar);
    if (!controls || controls.querySelector(".player-queue-btn")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "player-queue-toggle";
    btn.className = "player-queue-btn";
    btn.title = "Cola de reproducción";
    btn.setAttribute("aria-label", "Cola de reproducción");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h13M3 12h13M3 18h9"/>
        <path d="M18 8v9M18 8l3-1v9"/>
      </svg>
      <span class="player-queue-count" id="player-queue-count" hidden>0</span>
    `;
    controls.appendChild(btn);

    btn.addEventListener("click", e => {
      e.stopPropagation();
      togglePanel();
    });
  }

  /* ============================================================
     2) PANEL DE COLA
     ============================================================ */
  let panelEl = null;

  function asegurarPanel() {
    if (panelEl && document.body.contains(panelEl)) return panelEl;
    panelEl = document.createElement("div");
    panelEl.id = "player-queue-panel";
    panelEl.className = "player-queue-panel";
    panelEl.setAttribute("role", "dialog");
    document.body.appendChild(panelEl);
    return panelEl;
  }

  function togglePanel() {
    const panel = asegurarPanel();
    if (panel.classList.contains("open")) {
      panel.classList.remove("open");
    } else {
      renderPanel();
      panel.classList.add("open");
    }
  }
  function cerrarPanel() {
    const p = $("player-queue-panel");
    if (p) p.classList.remove("open");
  }

  function obtenerCola() {
    try {
      if (typeof window._playerQueue === "function") return window._playerQueue();
    } catch {}
    return { cola: [], indice: -1 };
  }

  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);

  function renderPanel() {
    const panel = asegurarPanel();
    const { cola, indice } = obtenerCola();

    if (!cola.length) {
      panel.innerHTML = `<div class="player-queue-empty">Cola vacía.<br>Reproduce algo desde una playlist.</div>`;
      return;
    }

    let html = `
      <div class="player-queue-header">
        <strong>Cola</strong>
        <small>${cola.length} ${cola.length === 1 ? "canción" : "canciones"}</small>
      </div>
    `;

    cola.forEach((item, i) => {
      const esActual = i === indice;
      const esSpotify = /open\.spotify\.com/.test(item.url || "");
      const tagCls = esSpotify ? "" : " local";
      html += `
        <button type="button" class="player-queue-item${esActual ? " actual" : ""}" data-index="${i}">
          <span class="player-queue-item-num">${esActual ? "▶" : (i + 1)}</span>
          <span class="player-queue-item-info">
            <span class="player-queue-item-titulo">${escapeHtml(item.titulo || "Sin título")}</span>
            ${item.artista ? `<span class="player-queue-item-artista">${escapeHtml(item.artista)}</span>` : ""}
          </span>
          <span class="player-queue-item-tag${tagCls}">${esSpotify ? "Spotify" : "Local"}</span>
        </button>
      `;
    });

    panel.innerHTML = html;

    panel.querySelectorAll(".player-queue-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        const { cola: c } = obtenerCola();
        const item = c[idx];
        if (!item) return;
        if (typeof window._wpReproducirUrl === "function") {
          window._wpReproducirUrl(item.url);
          cerrarPanel();
        }
      });
    });
  }

  document.addEventListener("click", e => {
    const panel = $("player-queue-panel");
    if (!panel?.classList.contains("open")) return;
    if (panel.contains(e.target)) return;
    if (e.target.closest("#player-queue-toggle")) return;
    cerrarPanel();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarPanel();
  });

  // Actualizar contador sin abrir
  setInterval(() => {
    const cnt = $("player-queue-count");
    if (!cnt) return;
    const { cola } = obtenerCola();
    const n = cola.length;
    if (cnt.textContent !== String(n)) cnt.textContent = n;
    cnt.hidden = n === 0;
    const panel = $("player-queue-panel");
    if (panel?.classList.contains("open")) renderPanel();
  }, 1200);

  /* ============================================================
     3) ECUALIZADOR — 3 barritas sobre el cover
     ============================================================ */
  function inyectarEcualizador() {
    const cover = qs(".player-cover", playerBar);
    if (!cover || cover.querySelector(".player-cover-eq")) return;
    const eq = document.createElement("div");
    eq.className = "player-cover-eq";
    eq.setAttribute("aria-hidden", "true");
    eq.innerHTML = "<span></span><span></span><span></span><span></span><span></span>";
    cover.appendChild(eq);
  }

  /* ============================================================
     4) ATAJOS DE TECLADO
     ============================================================ */
  const KBD_HINT_KEY = "sa_player_kbd_hint_shown_v3";
  let toastEl = null;

  function mostrarToast() {
    if (localStorage.getItem(KBD_HINT_KEY) === "1") return;
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "player-shortcut-toast";
      toastEl.innerHTML = `
        <kbd>Espacio</kbd> play · <kbd>←</kbd><kbd>→</kbd> canción · <kbd>M</kbd> silencio · <kbd>Q</kbd> cola
      `;
      document.body.appendChild(toastEl);
    }
    requestAnimationFrame(() => toastEl.classList.add("visible"));
    setTimeout(() => {
      toastEl.classList.remove("visible");
      localStorage.setItem(KBD_HINT_KEY, "1");
    }, 5000);
  }

  const playerVisible = () =>
    playerBar.classList.contains("visible") &&
    playerBar.getAttribute("aria-hidden") !== "true";
  const inputActivo = () => {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  };
  const modalAbierto = () => !!qs(".modal.active, .minijuego-overlay.active");
  const clickEn = id => { const b = $(id); if (b && !b.disabled) b.click(); };

  document.addEventListener("keydown", e => {
    if (!playerVisible() || inputActivo() || modalAbierto()) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case " ": case "k": e.preventDefault(); clickEn("player-play"); break;
      case "ArrowRight":
        if (e.shiftKey) { const a = $("global-audio"); if (a && isFinite(a.duration)) a.currentTime = Math.min(a.duration, a.currentTime + 10); }
        else { e.preventDefault(); clickEn("player-next"); }
        break;
      case "ArrowLeft":
        if (e.shiftKey) { const a = $("global-audio"); if (a && isFinite(a.duration)) a.currentTime = Math.max(0, a.currentTime - 10); }
        else { e.preventDefault(); clickEn("player-prev"); }
        break;
      case "n": case "N": e.preventDefault(); clickEn("player-next"); break;
      case "p": case "P": e.preventDefault(); clickEn("player-prev"); break;
      case "m": case "M": e.preventDefault(); clickEn("player-volume-btn"); break;
      case "q": case "Q": e.preventDefault(); togglePanel(); break;
    }
  });

  /* ============================================================
     5) INIT
     ============================================================ */
  function init() {
    inyectarBotonCola();
    inyectarEcualizador();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 400));
  } else {
    setTimeout(init, 400);
  }

  new MutationObserver(() => {
    if (!qs(".player-cover-eq", playerBar)) inyectarEcualizador();
    if (!qs(".player-queue-btn", playerBar)) inyectarBotonCola();
  }).observe(playerBar, { childList: true, subtree: true });

  const obs = new MutationObserver(() => {
    if (playerBar.classList.contains("visible")) setTimeout(mostrarToast, 1500);
  });
  obs.observe(playerBar, { attributes: true, attributeFilter: ["class"] });

  console.log("✅ player-extras.js v3 — minimalista");
})();