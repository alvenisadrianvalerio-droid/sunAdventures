/* ============================================================
   RECETARIO MÁGICO — SunAdventures
   Búsqueda de recetas internacionales (TheMealDB)
   con traducción automática al español (título, categoría,
   ingredientes y paso a paso) y vista interactiva.
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("recetas")) {
  window._extraVistas.push("recetas");
}

(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const cacheRecetas = new Map();
  const cacheTraduccion = new Map();

  // Diccionario básico de categorías en español (limpio sin emojis)
  const CATEGORIAS_ES = {
    "Beef": "Carne de Res",
    "Chicken": "Pollo",
    "Dessert": "Postres",
    "Pasta": "Pastas",
    "Pork": "Cerdo",
    "Seafood": "Mariscos",
    "Side": "Guarniciones",
    "Starter": "Entradas",
    "Vegan": "Vegano",
    "Vegetarian": "Vegetariano",
    "Breakfast": "Desayunos",
    "Miscellaneous": "Variados",
    "Lamb": "Cordero",
    "Goat": "Chivo"
  };

  // Caché de SVGs para evitar recalcular strings
  const SVG_ICONS = {
    chicken: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 13a4.5 4.5 0 0 0-4.5-4.5 4.5 4.5 0 0 0-4.5 4.5c0 2 1.5 3.5 3.5 4l-4 4a1.5 1.5 0 0 0 2 2l4-4c.5 2 2 3.5 4 3.5a4.5 4.5 0 0 0 4.5-4.5 4.5 4.5 0 0 0-5-5z"/></svg>`,
    pasta: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13h18c0 4-3.5 8-9 8s-9-4-9-8z"/><path d="M12 5v5M8 6c0 2.5 1 4 1 4M16 6c0 2.5-1 4-1 4"/></svg>`,
    meat: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5c0 3 2 6 6 7l2 3h2l2-3c4-1 6-4 6-7z"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/></svg>`,
    seafood: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12c4-6 12-6 16 0-4 6-12 6-16 0z"/><circle cx="16" cy="12" r="1" fill="currentColor"/><path d="M2 10l2 2-2 2M20 12l2-2v4l-2-2z"/></svg>`,
    dessert: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18v-6l-9-4-9 4v6z"/><path d="M3 14c3 0 3 2 6 2s3-2 6-2 3 2 6 2"/><circle cx="12" cy="7" r="2" fill="currentColor"/></svg>`,
    veg: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21a9 9 0 0 0 9-9c0-5-4-9-9-9S3 7 3 12a9 9 0 0 0 9 9z"/><path d="M12 3v18M3 12c4.5-1 9 1 18 0"/></svg>`,
    breakfast: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="14" rx="9" ry="6"/><ellipse cx="12" cy="10" rx="7.5" ry="4.5"/><ellipse cx="12" cy="7" rx="6" ry="3"/></svg>`,
    generic: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`
  };

  function getCategoriaIcon(cat) {
    const c = (cat || "").toLowerCase();
    if (c.includes("chicken") || c.includes("pollo")) return SVG_ICONS.chicken;
    if (c.includes("pasta")) return SVG_ICONS.pasta;
    if (c.includes("beef") || c.includes("carne") || c.includes("pork") || c.includes("lamb")) return SVG_ICONS.meat;
    if (c.includes("seafood") || c.includes("marisco")) return SVG_ICONS.seafood;
    if (c.includes("dessert") || c.includes("postre")) return SVG_ICONS.dessert;
    if (c.includes("veg")) return SVG_ICONS.veg;
    if (c.includes("breakfast") || c.includes("desayuno")) return SVG_ICONS.breakfast;
    return SVG_ICONS.generic;
  }

  // Traducción eficiente con caché persistente y manejo de timeouts
  async function traducir(txt, sl = "auto", tl = "es") {
    if (!txt || typeof txt !== "string") return txt;
    const limpio = txt.trim();
    if (!limpio || limpio.length < 2) return txt;
    const cacheKey = `${sl}_${tl}_${limpio}`;
    if (cacheTraduccion.has(cacheKey)) return cacheTraduccion.get(cacheKey);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(limpio)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const traducido = (data[0] || []).map(s => s[0]).join("").trim();
        if (traducido) {
          cacheTraduccion.set(cacheKey, traducido);
          return traducido;
        }
      }
    } catch (e) {
      // Si falla o da timeout, retornamos el texto original sin bloquear la interfaz
    }
    return limpio;
  }

  // Estado de recetas activas para paginación progresiva optimizada
  let listaRecetasActiva = [];
  let paginaRecetas = 1;
  const TAM_PAGINA = 12; // Tamaño óptimo para evitar sobrecarga del DOM en gama baja
  let busquedaIdActual = 0;

  function actualizarBarraRecetas(totalVisible, totalGeneral, origen = "") {
    const contador = $("recetas-contador");
    const paginacion = $("recetas-paginacion");
    const btnMasText = $("recetas-btn-mas-text");

    if (contador) {
      if (!totalGeneral) {
        contador.innerHTML = `Sin resultados`;
      } else {
        const textoOrigen = origen ? ` de <strong>${origen}</strong>` : "";
        contador.innerHTML = `Mostrando <strong>${totalVisible}</strong> de <strong>${totalGeneral}</strong> recetas${textoOrigen}`;
      }
    }

    if (paginacion) {
      if (totalVisible < totalGeneral) {
        paginacion.classList.remove("hidden");
        if (btnMasText) {
          const restantes = totalGeneral - totalVisible;
          const siguientes = Math.min(TAM_PAGINA, restantes);
          btnMasText.textContent = `Cargar más recetas (${siguientes} más de ${restantes})`;
        }
      } else {
        paginacion.classList.add("hidden");
      }
    }
  }

  // Buscar recetas con caché
  async function buscarRecetas(query) {
    const q = (query || "").trim();
    if (!q) return [];

    let qEn = q;
    try {
      qEn = await traducir(q, "es", "en");
    } catch {}

    const cacheKey = `multisearch_${qEn.toLowerCase()}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const qClean = qEn.toLowerCase();
      const [resNombre, resIngrediente, resCategoria] = await Promise.all([
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(qClean)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(qClean.replace(/\s+/g, "_"))}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(qClean)}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
      ]);

      const mapa = new Map();
      (resNombre.meals || []).forEach(m => mapa.set(m.idMeal, m));
      (resIngrediente.meals || []).forEach(m => {
        if (!mapa.has(m.idMeal)) mapa.set(m.idMeal, m);
      });
      (resCategoria.meals || []).forEach(m => {
        if (!mapa.has(m.idMeal)) mapa.set(m.idMeal, { ...m, strCategory: m.strCategory || qClean });
      });

      const meals = Array.from(mapa.values());
      cacheRecetas.set(cacheKey, meals);
      return meals;
    } catch (e) {
      console.warn("[Recetas] Error en búsqueda:", e);
    }
    return [];
  }

  // Filtrar por categoría
  async function buscarPorCategoria(cat) {
    const cacheKey = `cat_${cat}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const meals = (data.meals || []).map(m => ({ ...m, strCategory: cat }));
        cacheRecetas.set(cacheKey, meals);
        return meals;
      }
    } catch (e) {
      console.warn("[Recetas] Error por categoría:", e);
    }
    return [];
  }

  // Receta aleatoria
  async function recetaAleatoria() {
    try {
      const url = "https://www.themealdb.com/api/json/v1/1/random.php";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.meals?.[0] || null;
      }
    } catch (e) {
      console.warn("[Recetas] Error en receta aleatoria:", e);
    }
    return null;
  }

  // Obtener detalle completo de receta por ID
  async function obtenerDetalle(idMeal) {
    const cacheKey = `detail_${idMeal}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const meal = data.meals?.[0] || null;
        if (meal) {
          cacheRecetas.set(cacheKey, meal);
          return meal;
        }
      }
    } catch (e) {
      console.warn("[Recetas] Error en detalle:", e);
    }
    return null;
  }

  // Extraer lista de ingredientes con cantidades
  function extraerIngredientes(meal) {
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ings.push({
          nombre: ing.trim(),
          medida: (measure || "").trim()
        });
      }
    }
    return ings;
  }

  // Dividir instrucciones en pasos limpios
  function dividirEnPasos(instrucciones) {
    if (!instrucciones) return [];
    const partes = instrucciones
      .split(/\r?\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (partes.length >= 2) {
      return partes.map(p => p.replace(/^(step\s*\d+[:.]?|\d+[\.\)-]\s*)/i, "").trim());
    }

    const porPuntos = instrucciones.split(/\.\s+(?=[A-ZÁÉÍÓÚ])/).map(p => p.trim()).filter(p => p.length > 10);
    return porPuntos.length ? porPuntos : [instrucciones];
  }

  // Plantilla HTML de tarjeta optimizada con dimensiones explícitas y decode async sin alterar calidad
  function generarTarjetaHTML(m) {
    const imgUrl = m.strMealThumb || "";
    return `
      <article class="receta-card" data-ver-receta="${m.idMeal}">
        <div class="receta-img-wrap">
          <img class="receta-img" data-src="${imgUrl}" alt="${m.strMeal}" width="360" height="200" decoding="async" fetchpriority="low">
          ${m.strCategory ? `
            <span class="receta-tag-categoria">
              ${getCategoriaIcon(m.strCategory)}
              <span>${CATEGORIAS_ES[m.strCategory] || m.strCategory}</span>
            </span>` : ""}
          ${m.strArea ? `
            <span class="receta-tag-area">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>${m.strArea}</span>
            </span>` : ""}
        </div>
        <div class="receta-body">
          <h3 class="receta-titulo" data-traducir-titulo="${m.idMeal}">${m.strMeal}</h3>
          <p class="receta-titulo-orig">Original: ${m.strMeal}</p>
          <div class="receta-meta-preview">
            <span class="receta-meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/>
              </svg>
              <span>Receta del mundo</span>
            </span>
            <span class="receta-meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Paso a paso</span>
            </span>
          </div>
          <button type="button" class="receta-btn-ver" data-ver-receta="${m.idMeal}" aria-label="Ver preparación de ${m.strMeal}">
            <span>Ver Preparación Paso a Paso</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  // Renderizar recetas optimizado para evitar jank en gama baja
  function renderRecetas(meals, contId = "recetas-grid", origen = "") {
    const grid = $(contId);
    if (!grid) return;

    busquedaIdActual++;
    const currentRun = busquedaIdActual;

    listaRecetasActiva = meals || [];
    paginaRecetas = 1;

    if (!listaRecetasActiva.length) {
      grid.innerHTML = `
        <div class="receta-vacio">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;" aria-hidden="true">🍳</div>
          <h3>No encontramos recetas</h3>
          <p>Prueba buscando con otro ingrediente o plato (ej. pasta, pollo, chocolate, carne, pizza, arroz).</p>
        </div>
      `;
      actualizarBarraRecetas(0, 0, origen);
      return;
    }

    const primerLote = listaRecetasActiva.slice(0, TAM_PAGINA);
    
    // Batch DOM update con template fragment
    const template = document.createElement("template");
    template.innerHTML = primerLote.map(m => generarTarjetaHTML(m)).join("");
    
    // Vaciamos e insertamos en un solo reflow
    grid.innerHTML = "";
    grid.appendChild(template.content);

    actualizarBarraRecetas(primerLote.length, listaRecetasActiva.length, origen);

    // Conectar observador de imágenes de ultra alto rendimiento
    activarLazyLoadingImagenes(grid);

    // Traducir los títulos en segundo plano escalonadamente (non-blocking)
    traducirTitulosEscalonado(grid, primerLote, currentRun);
  }

  // Cargar más recetas en la grilla sin congelar el hilo principal
  function cargarMasRecetas(contId = "recetas-grid") {
    const grid = $(contId);
    if (!grid || !listaRecetasActiva.length) return;

    const inicio = paginaRecetas * TAM_PAGINA;
    const siguienteLote = listaRecetasActiva.slice(inicio, inicio + TAM_PAGINA);
    if (!siguienteLote.length) return;

    paginaRecetas++;
    const currentRun = busquedaIdActual;

    const template = document.createElement("template");
    template.innerHTML = siguienteLote.map(m => generarTarjetaHTML(m)).join("");
    
    requestAnimationFrame(() => {
      grid.appendChild(template.content);
      const totalVisible = Math.min(listaRecetasActiva.length, paginaRecetas * TAM_PAGINA);
      actualizarBarraRecetas(totalVisible, listaRecetasActiva.length);
      activarLazyLoadingImagenes(grid);
      traducirTitulosEscalonado(grid, siguienteLote, currentRun);
    });
  }

  // Traducción escalonada que no satura la red ni bloquea la CPU de teléfonos de gama baja
  function traducirTitulosEscalonado(contenedor, lote, runId) {
    let index = 0;
    function procesarSiguiente() {
      if (runId !== busquedaIdActual || index >= lote.length) return;
      const m = lote[index++];
      const el = contenedor.querySelector(`[data-traducir-titulo="${m.idMeal}"]`);
      if (el) {
        traducir(m.strMeal, "en", "es").then(tr => {
          if (runId === busquedaIdActual && tr && tr !== m.strMeal) {
            el.textContent = tr;
          }
        });
      }
      // Damos 60ms de respiro entre traducciones para mantener 60 FPS estables
      if (index < lote.length) {
        setTimeout(procesarSiguiente, 60);
      }
    }
    setTimeout(procesarSiguiente, 40);
  }

  // Observador de intersección optimizado con decode() asíncrono y desvinculación inmediata
  let imgObserver = null;
  function activarLazyLoadingImagenes(contenedor) {
    const imagenes = contenedor.querySelectorAll("img.receta-img[data-src]");

    if (!("IntersectionObserver" in window)) {
      // Fallback
      imagenes.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add("cargada");
      });
      return;
    }

    if (!imgObserver) {
      imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.removeAttribute("data-src");
              observer.unobserve(img);

              // Asignar src de alta resolución sin alterar nada de la URL ni compresión
              img.src = src;

              // decodificación asíncrona fuera del hilo de renderizado
              if ("decode" in img) {
                img.decode().then(() => {
                  requestAnimationFrame(() => {
                    img.classList.add("cargada");
                    const wrap = img.closest(".receta-img-wrap");
                    if (wrap) wrap.classList.add("loaded");
                  });
                }).catch(() => {
                  // Fallback normal si decode arroja error menor
                  img.classList.add("cargada");
                  const wrap = img.closest(".receta-img-wrap");
                  if (wrap) wrap.classList.add("loaded");
                });
              } else {
                img.onload = () => {
                  img.classList.add("cargada");
                  const wrap = img.closest(".receta-img-wrap");
                  if (wrap) wrap.classList.add("loaded");
                };
              }
            }
          }
        });
      }, {
        rootMargin: "150px 0px", // Precarga inteligente justo antes del scroll
        threshold: 0.01
      });
    }

    imagenes.forEach(img => imgObserver.observe(img));
  }

  // Abrir modal con detalle completo de receta
  async function abrirModalReceta(idMeal) {
    const modal = $("receta-modal");
    const modalBody = $("receta-modal-body");
    if (!modal || !modalBody) return;

    modal.classList.remove("hidden");
    document.body.classList.add("receta-modal-abierto");

    modalBody.innerHTML = `
      <div class="receta-loading" style="padding: 4rem 1rem;">
        <div class="receta-spinner"></div>
        <p>Cocinando y traduciendo los detalles de la receta...</p>
      </div>
    `;

    const meal = await obtenerDetalle(idMeal);
    if (!meal) {
      modalBody.innerHTML = `<p style="text-align:center; padding: 2rem;">No se pudo cargar la receta.</p>`;
      return;
    }

    const ingredientes = extraerIngredientes(meal);

    // Traducir en paralelo
    const [tituloEs, instruccionesEs, areaEs] = await Promise.all([
      traducir(meal.strMeal, "en", "es"),
      traducir(meal.strInstructions, "en", "es"),
      traducir(meal.strArea || "", "en", "es")
    ]);

    // Traducir ingredientes
    const ingsTraducidos = await Promise.all(
      ingredientes.map(async ing => {
        const nombreEs = await traducir(ing.nombre, "en", "es");
        const medidaEs = ing.medida ? await traducir(ing.medida, "en", "es") : "";
        return { ...ing, nombreEs, medidaEs };
      })
    );

    const pasos = dividirEnPasos(instruccionesEs);

    modalBody.innerHTML = `
      <div class="receta-detalle-head">
        <img class="receta-detalle-img" src="${meal.strMealThumb}" alt="${tituloEs}" width="190" height="190" decoding="async">
        <div class="receta-detalle-info">
          <h2 class="receta-detalle-title">${tituloEs}</h2>
          ${tituloEs !== meal.strMeal ? `<p class="receta-detalle-orig">Nombre original: ${meal.strMeal}</p>` : ""}
          <div class="receta-detalle-tags">
            ${meal.strCategory ? `
              <span class="receta-tag-pill cat">
                ${getCategoriaIcon(meal.strCategory)}
                <span>${CATEGORIAS_ES[meal.strCategory] || meal.strCategory}</span>
              </span>` : ""}
            ${meal.strArea ? `
              <span class="receta-tag-pill area">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Cocina ${areaEs || meal.strArea}</span>
              </span>` : ""}
            <span class="receta-tag-pill cat">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true">
                <path d="M9 3h6v4l3 6a6 6 0 0 1-6 6 6 6 0 0 1-6-6l3-6V3z"/>
              </svg>
              <span>${ingsTraducidos.length} ingredientes</span>
            </span>
          </div>
        </div>
      </div>

      <div class="receta-seccion-header">
        <h3 class="receta-seccion-titulo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M3 13h18c0 4-3.5 8-9 8s-9-4-9-8z"/>
            <path d="M12 5v5M8 6c0 2.5 1 4 1 4M16 6c0 2.5-1 4-1 4"/>
          </svg>
          <span>Ingredientes Requeridos (${ingsTraducidos.length})</span>
        </h3>
        <small style="color: rgba(255,255,255,0.65); font-size: 0.78rem;">Toca un ingrediente para tacharlo</small>
      </div>
      <div class="receta-ingredientes-grid">
        ${ingsTraducidos.map((ing, i) => `
          <button type="button" class="receta-ing-item" data-toggle-ing="${i}" aria-pressed="false">
            <span class="receta-ing-check">✓</span>
            <div class="receta-ing-textos">
              <strong>${ing.medidaEs ? `${ing.medidaEs} de ` : ""}${ing.nombreEs}</strong>
              ${ing.nombreEs !== ing.nombre ? `<span class="receta-ing-orig">(${ing.medida ? `${ing.medida} ` : ""}${ing.nombre})</span>` : ""}
            </div>
          </button>
        `).join("")}
      </div>

      <div class="receta-seccion-header" style="margin-top: 1.8rem;">
        <h3 class="receta-seccion-titulo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Preparación Paso a Paso (${pasos.length} pasos)</span>
        </h3>
      </div>
      <div class="receta-pasos-lista">
        ${pasos.map((paso, idx) => `
          <div class="receta-paso-card">
            <span class="receta-paso-num">${idx + 1}</span>
            <div class="receta-paso-texto">${paso}</div>
          </div>
        `).join("")}
      </div>

      <div class="receta-acciones-footer">
        ${meal.strYoutube ? `
          <a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer" class="receta-btn-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            <span>Ver video en YouTube</span>
          </a>
        ` : ""}
        ${meal.strSource ? `
          <a href="${meal.strSource}" target="_blank" rel="noopener noreferrer" class="receta-btn-link receta-btn-link-secundario">
            <span>Fuente original de la receta ↗</span>
          </a>
        ` : ""}
      </div>
    `;

    // Interacción con los ingredientes (toggle interactivo)
    modalBody.querySelectorAll("[data-toggle-ing]").forEach(item => {
      item.addEventListener("click", () => {
        const isMarcado = item.classList.toggle("marcado");
        item.setAttribute("aria-pressed", isMarcado ? "true" : "false");
      });
    });
  }

  function cerrarModalReceta() {
    const modal = $("receta-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("receta-modal-abierto");
    }
  }

  // Inicialización de la vista
  async function initRecetas() {
    const form = $("recetas-form");
    const input = $("recetas-input");
    const grid = $("recetas-grid");
    const btnSorpresa = $("recetas-btn-sorpresa");
    const btnMas = $("recetas-btn-mas");

    btnMas?.addEventListener("click", () => {
      cargarMasRecetas();
    });

    // Carga inicial destacada
    const IDS_INICIALES_DESTACADOS = ["52850", "52765", "52818"];
    let iniciales = await buscarPorCategoria("Chicken");
    if (iniciales && iniciales.length) {
      const top3 = [];
      const resto = [];
      iniciales.forEach(m => {
        if (IDS_INICIALES_DESTACADOS.includes(m.idMeal)) {
          top3.push(m);
        } else {
          resto.push(m);
        }
      });
      top3.sort((a, b) => IDS_INICIALES_DESTACADOS.indexOf(a.idMeal) - IDS_INICIALES_DESTACADOS.indexOf(b.idMeal));
      iniciales = [...top3, ...resto];
    }
    renderRecetas(iniciales, "recetas-grid", "Pollo");

    // Formulario de búsqueda con debounce
    let debounceTimer = null;
    form?.addEventListener("submit", async e => {
      e.preventDefault();
      const val = input?.value.trim();
      if (!val) return;
      document.querySelectorAll("[data-cat-chip]").forEach(c => c.classList.remove("active"));
      if (grid) {
        grid.innerHTML = `
          <div class="receta-loading">
            <div class="receta-spinner"></div>
            <p>Buscando deliciosas recetas de <strong>«${val}»</strong>...</p>
          </div>
        `;
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const resultados = await buscarRecetas(val);
        renderRecetas(resultados, "recetas-grid", `«${val}»`);
      }, 150);
    });

    // Botón Sorpresa / Receta Aleatoria
    btnSorpresa?.addEventListener("click", async () => {
      if (grid) {
        grid.innerHTML = `
          <div class="receta-loading">
            <div class="receta-spinner"></div>
            <p>Eligiendo una receta mágica del mundo...</p>
          </div>
        `;
      }
      const random = await recetaAleatoria();
      if (random) {
        renderRecetas([random], "recetas-grid", "Receta Sorpresa");
        abrirModalReceta(random.idMeal);
      }
    });

    // Categorías rápidas
    document.querySelectorAll("[data-cat-chip]").forEach(chip => {
      chip.addEventListener("click", async () => {
        document.querySelectorAll("[data-cat-chip]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.dataset.catChip;
        const nombreCat = chip.textContent.trim();
        if (grid) {
          grid.innerHTML = `
            <div class="receta-loading">
              <div class="receta-spinner"></div>
              <p>Cargando recetas de categoría <strong>${nombreCat}</strong>...</p>
            </div>
          `;
        }
        const meals = await buscarPorCategoria(cat);
        renderRecetas(meals, "recetas-grid", nombreCat);
      });
    });

    // Delegación de clics eficiente en contenedor
    document.addEventListener("click", e => {
      const card = e.target.closest("[data-ver-receta]");
      if (card) {
        e.preventDefault();
        const idMeal = card.dataset.verReceta;
        if (idMeal) abrirModalReceta(idMeal);
        return;
      }

      if (e.target.closest("#receta-modal-cerrar") || (e.target.classList && e.target.classList.contains("receta-modal"))) {
        cerrarModalReceta();
        return;
      }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") cerrarModalReceta();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRecetas);
  } else {
    initRecetas();
  }

  window.SunRecetas = { buscarRecetas, recetaAleatoria, abrirModalReceta };
})();
