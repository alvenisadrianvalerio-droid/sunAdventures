/* ============================================================
   SUN-MODAL.JS — Modales custom del juego
   Reemplaza window.confirm() y window.alert()
   ============================================================ */
(function () {
  if (window.SunModal) return;
  const CSS = `
    .sun-modal-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:1rem;opacity:0;transition:opacity .25s}
    .sun-modal-overlay.active{display:flex;opacity:1}
    .sun-modal-card{position:relative;width:min(430px,94vw);padding:1.6rem 1.5rem 1.2rem;border-radius:20px;background:linear-gradient(180deg,#12141c,#0b0c12);border:2px solid rgba(255,217,61,.35);box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,217,61,.1) inset;color:aliceblue;font-family:inherit;transform:scale(.9);opacity:0;transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s}
    .sun-modal-overlay.active .sun-modal-card{transform:scale(1);opacity:1}
    .sun-modal-card.danger{border-color:rgba(255,84,112,.55);box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 40px rgba(255,84,112,.25),0 0 0 1px rgba(255,84,112,.15) inset}
    .sun-modal-card.warning{border-color:rgba(255,174,61,.55)}
    .sun-modal-card.success{border-color:rgba(77,212,142,.55)}
    .sun-modal-icon{width:60px;height:60px;margin:0 auto .9rem;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,217,61,.3),rgba(255,217,61,.05));border:2px solid rgba(255,217,61,.45);font-size:1.8rem;animation:sunModalPulse 1.6s ease-in-out infinite}
    @keyframes sunModalPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
    .sun-modal-card.danger .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(255,84,112,.35),rgba(255,84,112,.05));border-color:rgba(255,84,112,.55)}
    .sun-modal-card.warning .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(255,174,61,.35),rgba(255,174,61,.05));border-color:rgba(255,174,61,.55)}
    .sun-modal-card.success .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(77,212,142,.35),rgba(77,212,142,.05));border-color:rgba(77,212,142,.55)}
    .sun-modal-title{font-size:1.18rem;font-weight:900;text-align:center;color:#ffd93d;margin:0 0 .55rem;letter-spacing:-.01em}
    .sun-modal-card.danger .sun-modal-title{color:#ff7a9c}
    .sun-modal-card.warning .sun-modal-title{color:#ffae3d}
    .sun-modal-card.success .sun-modal-title{color:#4dd48e}
    .sun-modal-msg{font-size:.93rem;text-align:center;opacity:.88;line-height:1.55;margin:0 0 1.5rem}
    .sun-modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
    .sun-modal-actions.single{grid-template-columns:1fr}
    .sun-modal-btn{padding:.78rem 1rem;border-radius:12px;border:none;font-family:inherit;font-size:.92rem;font-weight:900;cursor:pointer;transition:transform .15s,box-shadow .2s,background .2s;letter-spacing:.01em}
    .sun-modal-btn:hover{transform:translateY(-2px)}
    .sun-modal-btn:active{transform:translateY(0) scale(.98)}
    .sun-modal-btn.primary{background:linear-gradient(135deg,#ffd93d,#ffae3d);color:#2b2118;box-shadow:0 4px 14px rgba(255,217,61,.4)}
    .sun-modal-btn.primary:hover{box-shadow:0 8px 24px rgba(255,217,61,.6)}
    .sun-modal-btn.secondary{background:rgba(255,255,255,.06);color:aliceblue;border:1px solid rgba(255,255,255,.15)}
    .sun-modal-btn.secondary:hover{background:rgba(255,255,255,.12)}
    .sun-modal-btn.danger{background:linear-gradient(135deg,#ff5470,#c41e3a);color:#fff;box-shadow:0 4px 14px rgba(255,84,112,.4)}
    .sun-modal-btn.danger:hover{box-shadow:0 8px 24px rgba(255,84,112,.7)}
    body.light .sun-modal-card{background:linear-gradient(180deg,#fffdf7,#fff8eb);color:#3d2c1e;border-color:rgba(212,148,30,.4)}
    body.light .sun-modal-title{color:#b57320}
    body.light .sun-modal-msg{opacity:.85}
    body.light .sun-modal-btn.secondary{background:rgba(0,0,0,.04);color:#3d2c1e;border-color:rgba(0,0,0,.12)}
  `;
  const style = document.createElement('style');
  style.id = 'sun-modal-styles';
  style.textContent = CSS;
  document.head.appendChild(style);

  let currentOverlay = null;

  function crear({ title, message, icon, confirmText, cancelText, variant, single }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'sun-modal-overlay';
      const vClass = variant ? ` ${variant}` : '';
      overlay.innerHTML = `
        <div class="sun-modal-card${vClass}" role="dialog" aria-modal="true">
          <div class="sun-modal-icon">${icon || (variant === 'danger' ? '⚠️' : variant === 'success' ? '✅' : '💬')}</div>
          <h3 class="sun-modal-title">${title || 'Confirmar'}</h3>
          ${message ? `<p class="sun-modal-msg">${message}</p>` : ''}
          <div class="sun-modal-actions ${single ? 'single' : ''}">
            ${!single ? `<button type="button" class="sun-modal-btn secondary" data-accion="cancelar">${cancelText || 'Cancelar'}</button>` : ''}
            <button type="button" class="sun-modal-btn ${variant === 'danger' ? 'danger' : 'primary'}" data-accion="aceptar">${confirmText || 'Aceptar'}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('active'));

      const cerrar = (val) => {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.remove(); if (currentOverlay === overlay) currentOverlay = null; resolve(val); }, 250);
        document.removeEventListener('keydown', esc);
      };
      const esc = (e) => { if (e.key === 'Escape') cerrar(false); };
      document.addEventListener('keydown', esc);

      overlay.querySelectorAll('[data-accion]').forEach(b => {
        b.addEventListener('click', () => cerrar(b.dataset.accion === 'aceptar'));
      });
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(false); });
      // Enter confirma
      const enterHandler = (e) => { if (e.key === 'Enter') { document.removeEventListener('keydown', enterHandler); cerrar(true); } };
      document.addEventListener('keydown', enterHandler);

      currentOverlay = overlay;
    });
  }

  window.SunModal = {
    confirm: (opts) => crear({ ...opts, single: false }),
    alert:   (opts) => crear({ ...opts, single: true, confirmText: opts.confirmText || 'Vale' }),
    close:   () => { if (currentOverlay) { currentOverlay.classList.remove('active'); setTimeout(() => currentOverlay?.remove(), 250); currentOverlay = null; } }
  };
  console.log('✅ sun-modal.js listo');
})();