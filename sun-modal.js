/* ============================================================
   SUN-MODAL.JS — Modales custom del juego
   Reemplaza window.confirm() y window.alert()
   ============================================================ */
(function () {
  if (window.SunModal) return;
  const CSS = `
    .sun-modal-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(8,10,16,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);padding:1.2rem;opacity:0;transition:opacity .28s ease}
    .sun-modal-overlay.active{display:flex;opacity:1}
    .sun-modal-card{position:relative;width:min(440px,94vw);padding:2.2rem 1.8rem 1.6rem;border-radius:26px;background:linear-gradient(145deg,rgba(26,29,38,.92),rgba(14,16,22,.96));border:1px solid rgba(255,217,61,.3);box-shadow:0 35px 90px rgba(0,0,0,.8),0 0 50px rgba(255,217,61,.1),inset 0 1px 0 rgba(255,255,255,.12);color:#f0f4fc;font-family:inherit;transform:scale(.92) translateY(12px);opacity:0;transition:transform .32s cubic-bezier(.16,1,.3,1),opacity .28s ease;overflow:hidden}
    .sun-modal-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,transparent,#ffd93d,#ffae3d,transparent);opacity:.85}
    .sun-modal-overlay.active .sun-modal-card{transform:scale(1) translateY(0);opacity:1}
    .sun-modal-card.danger{border-color:rgba(255,84,112,.45);box-shadow:0 35px 90px rgba(0,0,0,.8),0 0 50px rgba(255,84,112,.2),inset 0 1px 0 rgba(255,255,255,.12)}
    .sun-modal-card.danger::before{background:linear-gradient(90deg,transparent,#ff5470,#c41e3a,transparent)}
    .sun-modal-card.warning{border-color:rgba(255,174,61,.45);box-shadow:0 35px 90px rgba(0,0,0,.8),0 0 50px rgba(255,174,61,.18),inset 0 1px 0 rgba(255,255,255,.12)}
    .sun-modal-card.warning::before{background:linear-gradient(90deg,transparent,#ffae3d,#ffd93d,transparent)}
    .sun-modal-card.success{border-color:rgba(77,212,142,.45);box-shadow:0 35px 90px rgba(0,0,0,.8),0 0 50px rgba(77,212,142,.2),inset 0 1px 0 rgba(255,255,255,.12)}
    .sun-modal-card.success::before{background:linear-gradient(90deg,transparent,#4dd48e,#2bb874,transparent)}
    .sun-modal-icon{width:68px;height:68px;margin:0 auto 1.2rem;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(255,217,61,.25),rgba(255,217,61,.04));border:2px solid rgba(255,217,61,.45);box-shadow:0 8px 25px rgba(255,217,61,.25);font-size:2.1rem;animation:sunModalPulse 2.2s ease-in-out infinite;color:#ffd93d}
    .sun-modal-icon svg{width:36px;height:36px;display:block;color:inherit}
    @keyframes sunModalPulse{0%,100%{transform:scale(1);box-shadow:0 8px 25px rgba(255,217,61,.25)}50%{transform:scale(1.07);box-shadow:0 12px 35px rgba(255,217,61,.45)}}
    .sun-modal-card.danger .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(255,84,112,.3),rgba(255,84,112,.05));border-color:rgba(255,84,112,.55);box-shadow:0 8px 25px rgba(255,84,112,.3);color:#ff7a9c}
    .sun-modal-card.warning .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(255,174,61,.3),rgba(255,174,61,.05));border-color:rgba(255,174,61,.55);box-shadow:0 8px 25px rgba(255,174,61,.3)}
    .sun-modal-card.success .sun-modal-icon{background:radial-gradient(circle at 35% 35%,rgba(77,212,142,.3),rgba(77,212,142,.05));border-color:rgba(77,212,142,.55);box-shadow:0 8px 25px rgba(77,212,142,.3)}
    .sun-modal-title{font-size:1.32rem;font-weight:900;text-align:center;color:#ffd93d;margin:0 0 .65rem;letter-spacing:-.015em;text-shadow:0 2px 10px rgba(255,217,61,.25)}
    .sun-modal-card.danger .sun-modal-title{color:#ff7a9c;text-shadow:0 2px 10px rgba(255,122,156,.25)}
    .sun-modal-card.warning .sun-modal-title{color:#ffae3d;text-shadow:0 2px 10px rgba(255,174,61,.25)}
    .sun-modal-card.success .sun-modal-title{color:#4dd48e;text-shadow:0 2px 10px rgba(77,212,142,.25)}
    .sun-modal-msg{font-size:.96rem;text-align:center;color:rgba(235,240,250,.9);line-height:1.65;margin:0 0 1.6rem}
    .sun-modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:.8rem}
    .sun-modal-actions.single{grid-template-columns:1fr}
    .sun-modal-btn{padding:.85rem 1.2rem;border-radius:14px;border:none;font-family:inherit;font-size:.95rem;font-weight:800;cursor:pointer;transition:transform .18s cubic-bezier(.16,1,.3,1),box-shadow .2s ease,filter .2s ease;letter-spacing:.01em}
    .sun-modal-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
    .sun-modal-btn:active{transform:translateY(0) scale(.98)}
    .sun-modal-btn.primary{background:linear-gradient(135deg,#ffd93d,#ffae3d);color:#1e1509;box-shadow:0 6px 20px rgba(255,217,61,.35)}
    .sun-modal-btn.primary:hover{box-shadow:0 10px 28px rgba(255,217,61,.55)}
    .sun-modal-btn.secondary{background:rgba(255,255,255,.07);color:#e2e8f5;border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px)}
    .sun-modal-btn.secondary:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.24)}
    .sun-modal-btn.danger{background:linear-gradient(135deg,#ff5470,#c41e3a);color:#fff;box-shadow:0 6px 20px rgba(255,84,112,.35)}
    .sun-modal-btn.danger:hover{box-shadow:0 10px 28px rgba(255,84,112,.6)}
    body.light .sun-modal-card{background:linear-gradient(160deg,#fffdf7,#fff6e0);color:#322416;border-color:rgba(212,148,30,.35);box-shadow:0 35px 90px rgba(0,0,0,.18),0 0 40px rgba(255,217,61,.2)}
    body.light .sun-modal-title{color:#b36e14;text-shadow:none}
    body.light .sun-modal-msg{color:rgba(50,36,22,.88)}
    body.light .sun-modal-btn.secondary{background:rgba(0,0,0,.05);color:#322416;border-color:rgba(0,0,0,.15)}
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