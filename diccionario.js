/* ============================================================
   DICCIONARIO MULTILINGÜE — SunAdventures
   Búsqueda y definición de palabras en español, japonés (日本語),
   coreano (한국어), inglés, francés, alemán, chino y más.
   Fuentes: Wikcionario multilingüe + English Wiktionary + Wikipedia
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("diccionario")) {
  window._extraVistas.push("diccionario");
}

(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const cacheDiccionario = new Map();

  const NOMBRES_IDIOMAS_MAP = {
    "japanese": "Japonés (日本語)",
    "korean": "Coreano (한국어)",
    "chinese": "Chino (中文)",
    "english": "Inglés",
    "french": "Francés",
    "german": "Alemán",
    "italian": "Italiano",
    "portuguese": "Portugués",
    "latin": "Latín",
    "russian": "Ruso",
    "arabic": "Árabe",
    "okinawan": "Okinawense",
    "spanish": "Español"
  };

  const IDIOMA_A_CODIGO = {
    "japonés (日本語)": "ja",
    "japanese": "ja",
    "coreano (한국어)": "ko",
    "korean": "ko",
    "chino (中文)": "zh-CN",
    "chinese": "zh-CN",
    "inglés": "en",
    "english": "en",
    "francés": "fr",
    "french": "fr",
    "alemán": "de",
    "german": "de",
    "italiano": "it",
    "italian": "it",
    "portugués": "pt",
    "portuguese": "pt",
    "ruso": "ru",
    "russian": "ru",
    "okinawense": "ja",
    "okinawan": "ja",
    "español": "es",
    "spanish": "es"
  };

  const cacheTraduccion = new Map();

  async function traducirTexto(txt) {
    if (!txt || typeof txt !== "string") return txt;
    const limpio = txt.trim();
    if (!limpio || limpio.length < 2) return txt;
    if (cacheTraduccion.has(limpio)) return cacheTraduccion.get(limpio);

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(limpio)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const traducido = (data[0] || []).map(s => s[0]).join("").trim();
        if (traducido) {
          cacheTraduccion.set(limpio, traducido);
          return traducido;
        }
      }
    } catch (e) {
      console.warn("[Diccionario] Error en traducción al español:", e);
    }
    return limpio;
  }

  // Historial en localStorage
  function obtenerHistorial() {
    try {
      return JSON.parse(localStorage.getItem("sa_diccionario_historial") || "[]");
    } catch { return []; }
  }

  function guardarEnHistorial(palabra) {
    if (!palabra) return;
    try {
      let h = obtenerHistorial().filter(p => p.toLowerCase() !== palabra.toLowerCase());
      h.unshift(palabra);
      if (h.length > 20) h = h.slice(0, 20);
      localStorage.setItem("sa_diccionario_historial", JSON.stringify(h));
      renderHistorial();
    } catch {}
  }

  function borrarHistorial() {
    localStorage.removeItem("sa_diccionario_historial");
    renderHistorial();
  }

  // Detección de caracteres CJK (Japonés, Coreano, Chino)
  function detectarScript(texto) {
    if (/[\uac00-\ud7af\u1100-\u11ff]/.test(texto)) return "ko"; // Coreano Hangul
    if (/[\u3040-\u30ff]/.test(texto)) return "ja";              // Japonés Kana
    if (/[\u4e00-\u9faf]/.test(texto)) return "cjk";             // Kanji / Hanja / Hanzi
    return "lat";
  }

  // Parsear extract de Wikcionario en español
  function parsearWikcionarioEs(raw, palabra) {
    if (!raw) return null;

    const lines = raw.split(/\r?\n/).map(l => l.trim());
    const idiomas = [];
    let seccionActual = null;

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l) continue;

      const matchIdioma = l.match(/^==\s*([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)\s*==$/i);
      if (matchIdioma) {
        const nombreIdioma = matchIdioma[1].trim();
        if (!/^(Referencias|Enlaces|Véase|Notas|Bibliografía)/i.test(nombreIdioma)) {
          seccionActual = {
            idioma: nombreIdioma,
            lectura: "",
            etimologia: "",
            categoria: "",
            definiciones: []
          };
          idiomas.push(seccionActual);
          continue;
        } else {
          seccionActual = null;
        }
      }

      if (!seccionActual) continue;

      if (/^===?\s*Etimolog/i.test(l)) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] && !lines[j].startsWith("=")) {
            seccionActual.etimologia = lines[j];
            i = j;
            break;
          }
          if (lines[j].startsWith("=")) break;
        }
        continue;
      }

      if (/^===?\s*(Sustantivo|Adjetivo|Verbo|Adverbio|Interjecci|Locuci|Forma|Pronombre|Preposici|Conjunci)/i.test(l)) {
        if (!seccionActual.categoria) {
          seccionActual.categoria = l.replace(/=/g, "").trim();
        }
        continue;
      }

      const matchNum = l.match(/^(\d+)\s*(.*)/);
      if (matchNum) {
        const num = matchNum[1];
        const disciplina = matchNum[2].trim();
        let texto = "";
        let j = i + 1;
        while (j < lines.length) {
          const next = lines[j];
          if (next.startsWith("=") || /^\d+(\s|$)/.test(next)) break;
          if (next && !/^(Sinónimo|Antónimo|Ámbito|Uso|Ejemplo|Relacionado|Traducciones)/i.test(next) && !next.startsWith("Wikipedia") && !next.startsWith("Wikiquote")) {
            texto += (texto ? " " : "") + next;
          }
          j++;
        }
        i = j - 1;
        if (texto) {
          seccionActual.definiciones.push({ num, disciplina, texto });
        }
      }
    }

    const conDefs = idiomas.filter(idm => idm.definiciones && idm.definiciones.length > 0);
    if (!conDefs.length) return null;

    return {
      palabra,
      secciones: conDefs,
      fuente: "Wikcionario (Español)"
    };
  }

  // Parsear extract de English Wiktionary (ideal para Japonés, Coreano, etc.)
  function parsearEnWiktionary(raw, palabra) {
    if (!raw) return null;
    const lines = raw.split(/\r?\n/).map(l => l.trim());
    const idiomas = [];
    let seccionActual = null;
    let categoriaActual = "";

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l) continue;

      const matchIdioma = l.match(/^==\s*([A-Za-z\s]+)\s*==$/);
      if (matchIdioma) {
        const nombreEn = matchIdioma[1].trim();
        if (!/^(References|See also|Further reading|Bibliography|External links)/i.test(nombreEn)) {
          const nombreEs = NOMBRES_IDIOMAS_MAP[nombreEn.toLowerCase()] || nombreEn;
          seccionActual = {
            idioma: nombreEs,
            idiomaRaw: nombreEn,
            lectura: "",
            etimologia: "",
            categoria: "",
            definiciones: []
          };
          categoriaActual = "";
          idiomas.push(seccionActual);
          continue;
        } else {
          seccionActual = null;
        }
      }

      if (!seccionActual) continue;

      // Pronunciación / Lectura
      if (/^===?\s*Pronunciation/i.test(l)) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] && !lines[j].startsWith("=")) {
            if (!seccionActual.lectura) seccionActual.lectura = lines[j];
          }
          if (lines[j].startsWith("=")) { i = j - 1; break; }
        }
        continue;
      }

      // Etimología
      if (/^===?\s*Etymology/i.test(l)) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] && !lines[j].startsWith("=")) {
            seccionActual.etimologia = lines[j];
            i = j;
            break;
          }
          if (lines[j].startsWith("=")) break;
        }
        continue;
      }

      // Categoría gramatical
      if (/^===?\s*(Noun|Verb|Adjective|Adverb|Proper noun|Interjection|Phrase|Prefix|Suffix|Counter)/i.test(l)) {
        categoriaActual = l.replace(/=/g, "").trim();
        if (!seccionActual.categoria) seccionActual.categoria = categoriaActual;
        continue;
      }

      // Definiciones
      if (categoriaActual && !l.startsWith("=")) {
        // Formatos de lectura tipo: 野(や)菜(さい) • (yasai) o 野菜 • (yachae) (hangeul 야채)
        if (l.includes("•") && (l.includes("(") || l.includes(")"))) {
          if (!seccionActual.lectura) seccionActual.lectura = l;
          continue;
        }

        // Si la línea es exactamente la palabra buscada o la palabra con kanji/furigana sin definición
        const lineaLimpia = l.replace(/\([^)]*\)/g, "").replace(/•/g, "").trim();
        if (lineaLimpia === palabra.trim() || l === palabra.trim()) {
          continue;
        }

        if (l.length >= 2) {
          seccionActual.definiciones.push({
            num: String(seccionActual.definiciones.length + 1),
            disciplina: categoriaActual,
            texto: l
          });
        }
      }
    }

    const conDefs = idiomas.filter(idm => idm.definiciones && idm.definiciones.length > 0);
    if (!conDefs.length) return null;

    // Detectar texto óptimo para audio en cada sección
    conDefs.forEach(sec => {
      sec.audioTexto = palabra;
      if (sec.lectura) {
        const kana = sec.lectura.match(/[\u3040-\u30ff]+/);
        if (kana && kana[0]) {
          sec.audioTexto = kana[0];
        } else {
          const hangul = sec.lectura.match(/[\uac00-\ud7af]+/);
          if (hangul && hangul[0]) {
            sec.audioTexto = hangul[0];
          }
        }
      }
    });

    return {
      palabra,
      secciones: conDefs,
      fuente: "Wiktionary Internacional"
    };
  }

  // Consulta asíncrona universal
  async function consultarDefinicion(palabra) {
    const q = palabra.trim();
    const qKey = q.toLowerCase();
    if (cacheDiccionario.has(qKey)) return cacheDiccionario.get(qKey);

    const script = detectarScript(q);

    // Si es japonés o coreano (o CJK), consultar primero en English Wiktionary
    if (script === "ja" || script === "ko" || script === "cjk") {
      try {
        const urlEn = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(q)}&format=json&origin=*`;
        const resEn = await fetch(urlEn);
        if (resEn.ok) {
          const dataEn = await resEn.json();
          const pageEn = Object.values(dataEn?.query?.pages || {})[0];
          if (pageEn && pageEn.missing === undefined && pageEn.extract) {
            const parsed = parsearEnWiktionary(pageEn.extract, q);
            if (parsed && parsed.secciones && parsed.secciones.length > 0) {
              cacheDiccionario.set(qKey, parsed);
              return parsed;
            }
          }
        }
      } catch (e) {
        console.warn("[Diccionario] Error consultando término asiático:", e);
      }
    }

    // 1. Wikcionario en español
    try {
      const urlWikt = `https://es.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(q)}&format=json&origin=*`;
      const resW = await fetch(urlWikt);
      if (resW.ok) {
        const dataW = await resW.json();
        const pageW = Object.values(dataW?.query?.pages || {})[0];
        if (pageW && pageW.missing === undefined && pageW.extract) {
          const parsed = parsearWikcionarioEs(pageW.extract, q);
          if (parsed && parsed.secciones && parsed.secciones.length > 0) {
            cacheDiccionario.set(qKey, parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("[Diccionario] Error en es.wiktionary:", e);
    }

    // 2. English Wiktionary (como respaldo global completo)
    try {
      const urlEnWikt = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(q)}&format=json&origin=*`;
      const resEn = await fetch(urlEnWikt);
      if (resEn.ok) {
        const dataEn = await resEn.json();
        const pageEn = Object.values(dataEn?.query?.pages || {})[0];
        if (pageEn && pageEn.missing === undefined && pageEn.extract) {
          const parsedEn = parsearEnWiktionary(pageEn.extract, q);
          if (parsedEn && parsedEn.secciones && parsedEn.secciones.length > 0) {
            cacheDiccionario.set(qKey, parsedEn);
            return parsedEn;
          }
        }
      }
    } catch (e) {
      console.warn("[Diccionario] Error en en.wiktionary:", e);
    }

    // 3. Wikipedia en español (resumen enciclopédico de respaldo)
    try {
      const urlWiki = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
      const resWiki = await fetch(urlWiki);
      if (resWiki.ok) {
        const dataWiki = await resWiki.json();
        if (dataWiki && dataWiki.extract && dataWiki.type !== "disambiguation") {
          const resultado = {
            palabra: dataWiki.title || q,
            secciones: [{
              idioma: "Español",
              categoria: dataWiki.description || "Concepto / Enciclopedia",
              etimologia: "",
              definiciones: [{ num: "1", disciplina: "", texto: dataWiki.extract.trim() }]
            }],
            fuente: "Wikipedia en español"
          };
          cacheDiccionario.set(qKey, resultado);
          return resultado;
        }
      }
    } catch (e) {
      console.warn("[Diccionario] Error en Wikipedia:", e);
    }

    return null;
  }

  // Renderizar historial
  function renderHistorial() {
    const cont = $("diccionario-historial-chips");
    if (!cont) return;
    const h = obtenerHistorial();
    if (!h.length) {
      cont.innerHTML = `<span class="dic-historial-vacio">Sin búsquedas recientes</span>`;
      return;
    }
    cont.innerHTML = h.map(p => `
      <button type="button" class="dic-chip" data-dic-buscar="${p}">${p}</button>
    `).join("");
  }

  let audioPlayerActual = null;

  // Reproducir pronunciación por voz inteligente según idioma
  function pronunciar(texto, idiomaTexto = "Español", btnElement = null) {
    if (!texto) return;

    // Feedback visual en el botón
    if (btnElement) {
      document.querySelectorAll(".dic-btn-audio, .dic-btn-audio-mini").forEach(b => b.classList.remove("playing"));
      btnElement.classList.add("playing");
      setTimeout(() => btnElement.classList.remove("playing"), 2200);
    }

    const idmLower = (idiomaTexto || "").toLowerCase().trim();
    let codigoLang = IDIOMA_A_CODIGO[idmLower];
    if (!codigoLang) {
      if (idmLower.includes("japon") || idmLower.includes("japan") || idmLower.includes("日本語")) codigoLang = "ja";
      else if (idmLower.includes("corean") || idmLower.includes("korean") || idmLower.includes("한국어")) codigoLang = "ko";
      else if (idmLower.includes("chin") || idmLower.includes("chinese") || idmLower.includes("中文")) codigoLang = "zh-CN";
      else if (idmLower.includes("ingl") || idmLower.includes("engl")) codigoLang = "en";
      else if (idmLower.includes("franc")) codigoLang = "fr";
      else if (idmLower.includes("alem") || idmLower.includes("german")) codigoLang = "de";
      else if (idmLower.includes("ital")) codigoLang = "it";
      else if (idmLower.includes("portug")) codigoLang = "pt";
      else codigoLang = "es";
    }

    // 1. Intento primario con Web Audio TTS de Google (alta fidelidad nativa en pronunciación asiática y occidental)
    try {
      if (audioPlayerActual) {
        audioPlayerActual.pause();
        audioPlayerActual = null;
      }
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=${codigoLang}&client=tw-ob`;
      const audio = new Audio(ttsUrl);
      audioPlayerActual = audio;
      audio.onended = () => {
        if (btnElement) btnElement.classList.remove("playing");
      };
      audio.onerror = () => {
        reproducirWebSpeech(texto, codigoLang, btnElement);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          reproducirWebSpeech(texto, codigoLang, btnElement);
        });
      }
      return;
    } catch {
      reproducirWebSpeech(texto, codigoLang, btnElement);
    }
  }

  function reproducirWebSpeech(texto, codigoLang, btnElement) {
    if (!window.speechSynthesis) {
      if (btnElement) btnElement.classList.remove("playing");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(texto);
      const mapBCP47 = {
        ja: "ja-JP",
        ko: "ko-KR",
        "zh-CN": "zh-CN",
        en: "en-US",
        fr: "fr-FR",
        de: "de-DE",
        it: "it-IT",
        pt: "pt-PT",
        es: "es-ES"
      };
      utter.lang = mapBCP47[codigoLang] || "es-ES";
      utter.rate = 0.9;
      utter.onend = () => {
        if (btnElement) btnElement.classList.remove("playing");
      };
      utter.onerror = () => {
        if (btnElement) btnElement.classList.remove("playing");
      };
      window.speechSynthesis.speak(utter);
    } catch {
      if (btnElement) btnElement.classList.remove("playing");
    }
  }

  // UI: Realizar búsqueda
  async function buscar(palabra) {
    const q = (palabra || "").trim();
    if (!q) return;

    const input = $("diccionario-input");
    if (input) input.value = q;

    const cont = $("diccionario-resultado");
    if (!cont) return;

    cont.innerHTML = `
      <div class="dic-loading">
        <div class="dic-spinner"></div>
        <p>Consultando definiciones de <strong>«${q}»</strong>...</p>
      </div>
    `;

    try {
      const def = await consultarDefinicion(q);
      if (!def || !def.secciones || !def.secciones.length) {
        cont.innerHTML = `
          <div class="dic-empty">
            <div class="dic-empty-icon">📖</div>
            <h3>No encontramos «${q}»</h3>
            <p>Verifica que la palabra o caracteres estén bien escritos.</p>
          </div>
        `;
        return;
      }

      guardarEnHistorial(def.palabra);

      // Traducir definiciones y etimologías al español si vienen de fuente internacional o de otro idioma
      for (const sec of def.secciones) {
        const esEspanol = (sec.idioma || "").toLowerCase().includes("español");
        if (!esEspanol) {
          // Traducir etimología si existe
          if (sec.etimologia && !sec.etimologiaEs) {
            sec.etimologiaEs = await traducirTexto(sec.etimologia);
          }
          // Traducir definiciones
          for (const d of sec.definiciones) {
            if (d.texto && !d.textoEs) {
              const trad = await traducirTexto(d.texto);
              d.textoEs = trad;
              d.esTraducido = (trad !== d.texto);
            }
          }
        }
      }

      cont.innerHTML = `
        <div class="dic-card-def">
          <header class="dic-def-header">
            <div>
              <div class="dic-def-palabra-row">
                <h2 class="dic-def-palabra">${def.palabra}</h2>
                <button type="button" class="dic-btn-audio" id="dic-btn-pronunciar" title="Escuchar pronunciación" aria-label="Escuchar pronunciación">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
              </div>
              <span class="dic-def-count-idiomas">${def.secciones.length} idioma${def.secciones.length > 1 ? "s" : ""} registrado${def.secciones.length > 1 ? "s" : ""}</span>
            </div>
            <span class="dic-def-fuente">${def.fuente}</span>
          </header>

          <div class="dic-idiomas-bloques">
            ${def.secciones.map((sec, idx) => `
              <div class="dic-idioma-bloque">
                <div class="dic-idioma-tag-row">
                  <span class="dic-idioma-tag">🌍 ${sec.idioma}</span>
                  ${sec.categoria ? `<span class="dic-def-categoria">${sec.categoria}</span>` : ""}
                  <button type="button" class="dic-btn-audio-mini" data-pronunciar-sec="${idx}" title="Escuchar en ${sec.idioma}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </button>
                </div>

                ${sec.lectura ? `
                  <div class="dic-def-lectura">
                    <strong>Lectura / Pronunciación:</strong> <span>${sec.lectura}</span>
                  </div>
                ` : ""}

                ${sec.etimologia ? `
                  <div class="dic-def-etimologia">
                    <strong>Etimología:</strong> ${sec.etimologiaEs || sec.etimologia}
                  </div>
                ` : ""}

                <div class="dic-def-lista">
                  ${sec.definiciones.map(d => `
                    <div class="dic-def-item">
                      <span class="dic-def-num">${d.num}</span>
                      <div class="dic-def-body">
                        ${d.disciplina ? `<span class="dic-def-disciplina">${d.disciplina}</span>` : ""}
                        <p class="dic-def-texto">${d.textoEs || d.texto}</p>
                        ${d.esTraducido ? `<p class="dic-def-orig"><span class="dic-badge-traducido">Traducido</span> <span>Original: "${d.texto}"</span></p>` : ""}
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      // Pronunciar con el primer idioma disponible o con la lectura específica
      const btnPrincipal = $("dic-btn-pronunciar");
      btnPrincipal?.addEventListener("click", () => {
        const sec0 = def.secciones[0];
        const audioTexto = sec0?.audioTexto || def.palabra;
        pronunciar(audioTexto, sec0?.idioma || "Español", btnPrincipal);
      });

      // Pronunciar según sección de idioma
      cont.querySelectorAll("[data-pronunciar-sec]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.pronunciarSec) || 0;
          const sec = def.secciones[idx];
          if (sec) {
            const audioTexto = sec.audioTexto || def.palabra;
            pronunciar(audioTexto, sec.idioma, btn);
          }
        });
      });

    } catch (err) {
      cont.innerHTML = `
        <div class="dic-empty">
          <div class="dic-empty-icon">⚠️</div>
          <h3>Error de consulta</h3>
          <p>No se pudo consultar el diccionario. Revisa tu conexión a internet.</p>
        </div>
      `;
    }
  }

  // Inicializar eventos
  function initDiccionario() {
    const form = $("diccionario-form");
    const input = $("diccionario-input");

    form?.addEventListener("submit", e => {
      e.preventDefault();
      const val = input?.value.trim();
      if (val) buscar(val);
    });

    document.addEventListener("click", e => {
      const chip = e.target.closest("[data-dic-buscar]");
      if (chip) {
        e.preventDefault();
        const palabra = chip.dataset.dicBuscar;
        if (palabra) buscar(palabra);
        return;
      }

      if (e.target.closest("#diccionario-borrar-historial")) {
        e.preventDefault();
        borrarHistorial();
        return;
      }
    });

    renderHistorial();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiccionario);
  } else {
    initDiccionario();
  }

  window.SunDiccionario = { buscar, consultarDefinicion };
})();
