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

  // Función de hash MD5 para resolver URLs directas de audios de Wikimedia Commons
  function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
      var lX4 = (lX & 0x40000000), lY4 = (lY & 0x40000000);
      var lX8 = (lX & 0x80000000), lY8 = (lY & 0x80000000);
      var lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      } else return (lResult ^ lX8 ^ lY8);
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function convertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }
    function wordToHex(lValue) {
      var WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = '0' + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }
    function utf8Encode(string) {
      string = string.replace(/\r\n/g, '\n');
      var utftext = '';
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) utftext += String.fromCharCode(c);
        else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = utf8Encode(string);
    x = convertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
      AA = a; BB = b; CC = c; DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
      a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  function getCommonsAudioUrl(fileName) {
    if (!fileName) return null;
    const clean = fileName.replace(/^File:/i, "").trim().replace(/ /g, "_");
    const h = md5(clean);
    return `https://upload.wikimedia.org/wikipedia/commons/${h[0]}/${h.substring(0, 2)}/${encodeURIComponent(clean)}`;
  }

  function extraerAudiosDeWikitext(wt) {
    const mapa = {};
    if (!wt) return mapa;
    const secciones = wt.split(/^==\s*([^=\n]+)\s*==/gm);
    for (let i = 1; i < secciones.length; i += 2) {
      const nombreIdioma = secciones[i].trim().toLowerCase();
      const bloque = secciones[i + 1] || "";
      const encontrados = [];
      let m;
      const r1 = /\{\{audio\|[^|]+\|([^|}]+)/gi;
      while ((m = r1.exec(bloque)) !== null) {
        const f = m[1].trim();
        if (f && !encontrados.includes(f)) encontrados.push(f);
      }
      const r2 = /<audio:([^<>|]+?\.(?:ogg|wav|mp3|oga|flac))/gi;
      while ((m = r2.exec(bloque)) !== null) {
        const f = m[1].trim();
        if (f && !encontrados.includes(f)) encontrados.push(f);
      }
      const r3 = /(?:audio\d*|2audio\d*)=([^|}\n]+?\.(?:ogg|wav|mp3|oga|flac))/gi;
      while ((m = r3.exec(bloque)) !== null) {
        const f = m[1].trim();
        if (f && !encontrados.includes(f)) encontrados.push(f);
      }
      if (encontrados.length) {
        mapa[nombreIdioma] = encontrados;
      }
    }
    return mapa;
  }

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

  // Conversión de Rōmaji a Hiragana para búsqueda en japonés
  const ROMAJI_TO_HIRAGANA = {
    'kya':'きゃ','kyu':'きゅ','kyo':'きょ',
    'sha':'しゃ','shu':'しゅ','sho':'しょ',
    'cha':'ちゃ','chu':'ちゅ','cho':'ちょ',
    'nya':'にゃ','nyu':'にゅ','nyo':'にょ',
    'hya':'ひゃ','hyu':'ひゅ','hyo':'ひょ',
    'mya':'みゃ','myu':'みゅ','myo':'みょ',
    'rya':'りゃ','ryu':'りゅ','ryo':'りょ',
    'gya':'ぎゃ','gyu':'ぎゅ','gyo':'ぎょ',
    'ja':'じゃ','ju':'じゅ','jo':'じょ',
    'jya':'じゃ','jyu':'じゅ','jyo':'じょ',
    'bya':'びゃ','byu':'びゅ','byo':'びょ',
    'pya':'ぴゃ','pyu':'ぴゅ','pyo':'ぴょ',
    'shi':'し','chi':'ち','tsu':'つ','fu':'ふ',
    'ka':'か','ki':'き','ku':'く','ke':'け','ko':'こ',
    'sa':'さ','si':'し','su':'す','se':'せ','so':'そ',
    'ta':'た','ti':'ち','tu':'つ','te':'て','to':'と',
    'na':'な','ni':'に','nu':'ぬ','ne':'ね','no':'の',
    'ha':'は','hi':'ひ','hu':'ふ','he':'へ','ho':'ほ',
    'ma':'ま','mi':'み','mu':'む','me':'め','mo':'も',
    'ya':'や','yu':'ゆ','yo':'よ',
    'ra':'ら','ri':'り','ru':'る','re':'れ','ro':'ろ',
    'wa':'わ','wo':'を',
    'ga':'が','gi':'ぎ','gu':'ぐ','ge':'げ','go':'ご',
    'za':'ざ','ji':'じ','zu':'ず','ze':'ぜ','zo':'ぞ',
    'da':'だ','di':'ぢ','du':'づ','de':'で','do':'ど',
    'ba':'ば','bi':'び','bu':'ぶ','be':'べ','bo':'ぼ',
    'pa':'ぱ','pi':'ぴ','pu':'ぷ','pe':'ぺ','po':'ぽ',
    'a':'あ','i':'い','u':'う','e':'え','o':'お','n':'ん'
  };

  function romajiAHiragana(texto) {
    if (!texto) return '';
    let str = texto.toLowerCase()
      .replace(/ō/g, 'ou').replace(/ū/g, 'uu').replace(/ā/g, 'aa').replace(/ē/g, 'ee').replace(/ī/g, 'ii')
      .replace(/o\u0304/g, 'ou').replace(/u\u0304/g, 'uu').replace(/a\u0304/g, 'aa').replace(/e\u0304/g, 'ee').replace(/i\u0304/g, 'ii');
    
    let res = '';
    let i = 0;
    while (i < str.length) {
      if (i + 1 < str.length && str[i] === str[i+1] && 'bcdfghjklmpqrstvwxyz'.includes(str[i]) && str[i] !== 'n') {
        res += 'っ';
        i++;
        continue;
      }
      const c3 = str.slice(i, i + 3);
      if (ROMAJI_TO_HIRAGANA[c3]) {
        res += ROMAJI_TO_HIRAGANA[c3];
        i += 3;
        continue;
      }
      const c2 = str.slice(i, i + 2);
      if (ROMAJI_TO_HIRAGANA[c2]) {
        res += ROMAJI_TO_HIRAGANA[c2];
        i += 2;
        continue;
      }
      const c1 = str.slice(i, i + 1);
      if (ROMAJI_TO_HIRAGANA[c1]) {
        if (c1 === 'n' && i + 1 < str.length && 'aiueoy'.includes(str[i+1])) {
          res += c1;
        } else {
          res += ROMAJI_TO_HIRAGANA[c1];
        }
        i += 1;
        continue;
      }
      res += str[i];
      i++;
    }
    return res;
  }

  function generarCandidatosJapones(q) {
    const norm = (q || '').trim().toLowerCase();
    const hira1 = romajiAHiragana(norm);
    const set = new Set();
    if (hira1 && hira1 !== norm) set.add(hira1);
    if (norm.endsWith('o') && !norm.endsWith('ou')) {
      const hO = romajiAHiragana(norm + 'u');
      if (hO && hO !== norm) set.add(hO);
    }
    if (norm.endsWith('u') && !norm.endsWith('uu')) {
      const hU = romajiAHiragana(norm + 'u');
      if (hU && hU !== norm) set.add(hU);
    }
    if (hira1.endsWith('わ')) set.add(hira1.slice(0, -1) + 'は');
    if (hira1.endsWith('は')) set.add(hira1.slice(0, -1) + 'わ');
    return Array.from(set).filter(c => c && c !== norm);
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
  function parsearEnWiktionary(raw, palabra, audiosWikitext = {}) {
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
      if (/^={3,5}\s*Pronunciation/i.test(l)) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] && !lines[j].startsWith("=")) {
            if (!seccionActual.lectura) seccionActual.lectura = lines[j];
          }
          if (lines[j].startsWith("=")) { i = j - 1; break; }
        }
        continue;
      }

      // Etimología
      if (/^={3,5}\s*Etymology/i.test(l)) {
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
      if (/^={3,5}\s*(Noun|Verb|Adjective|Adverb|Proper noun|Interjection|Phrase|Prefix|Suffix|Counter)/i.test(l)) {
        categoriaActual = l.replace(/=/g, "").trim();
        if (!seccionActual.categoria) seccionActual.categoria = categoriaActual;
        continue;
      }

      // Subsecciones que terminan el bloque de definiciones
      if (/^={3,5}\s*(Usage notes|Derived terms|Idioms|Descendants|References|Etymology|Readings|Compounds|Alternative forms|Conjugation|Synonyms|Antonyms|Related terms)/i.test(l)) {
        categoriaActual = "";
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

    // Detectar texto óptimo para audio en cada sección y adjuntar URL de Wikimedia Commons si existe
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

      // Vincular audio nativo de Wikimedia Commons si está disponible en audiosWikitext
      const rawKey = (sec.idiomaRaw || sec.idioma || "").toLowerCase().trim();
      const archivos = audiosWikitext[rawKey] || audiosWikitext[sec.idioma?.toLowerCase()] || [];
      if (archivos.length > 0) {
        sec.audioFile = archivos[0];
        sec.audioUrl = getCommonsAudioUrl(archivos[0]);
      }
    });

    return {
      palabra,
      secciones: conDefs,
      fuente: "Wiktionary Internacional"
    };
  }

  // Resolver términos en rōmaji a su definición japonesa
  async function resolverRomajiJapones(q) {
    const candidatos = generarCandidatosJapones(q);
    if (!candidatos.length) return null;

    const titulos = [q, ...candidatos];
    const urlEn = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts|revisions&rvprop=content&rvslots=main&explaintext=1&titles=${encodeURIComponent(titulos.join('|'))}&format=json&origin=*`;
    const res = await fetch(urlEn);
    if (!res.ok) return null;

    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {});

    // 1. Revisar si alguna página de candidatos ya contiene sección japonesa con definiciones
    let combinedAudios = {};
    pages.forEach(p => {
      const wt = p?.revisions?.[0]?.slots?.main?.["*"] || "";
      const aud = extraerAudiosDeWikitext(wt);
      Object.assign(combinedAudios, aud);
    });

    for (const p of pages) {
      if (p.missing !== undefined || !p.extract) continue;
      const parsed = parsearEnWiktionary(p.extract, p.title, combinedAudios);
      if (parsed) {
        const secJa = parsed.secciones.find(s => (s.idiomaRaw || "").toLowerCase() === "japanese" || s.idioma.includes("Japonés"));
        if (secJa && secJa.definiciones && secJa.definiciones.length > 0) {
          // Si el título es kana/kanji, agregar subtítulo de rōmaji
          if (!secJa.lectura) secJa.lectura = `${p.title} (${q})`;
          parsed.palabra = `${p.title} (${q})`;
          return parsed;
        }
      }
    }

    // 2. Extraer destinos de {{ja-see|...}} o Rōmaji transcription
    const targetWords = [];
    pages.forEach(p => {
      if (p.missing !== undefined) return;
      const wt = p?.revisions?.[0]?.slots?.main?.["*"] || "";
      const seeMatch = wt.match(/\{\{ja-see(?:-kango)?\|([^}|]+)/i);
      if (seeMatch) {
        let t = seeMatch[1].trim();
        if (t.startsWith("term=")) t = t.replace("term=", "").trim();
        if (t && !targetWords.includes(t)) targetWords.push(t);
      }
      const romMatch = wt.match(/Rōmaji transcription of\s+(?:\[\[)?([^\],\n|]+)/i);
      if (romMatch) {
        let t = romMatch[1].trim();
        if (t && !targetWords.includes(t)) targetWords.push(t);
      }
    });

    if (targetWords.length > 0) {
      const urlTargets = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts|revisions&rvprop=content&rvslots=main&explaintext=1&titles=${encodeURIComponent(targetWords.join('|'))}&format=json&origin=*`;
      const resTargets = await fetch(urlTargets);
      if (resTargets.ok) {
        const dataTargets = await resTargets.json();
        const pagesTargets = Object.values(dataTargets?.query?.pages || {});
        let targetAudios = { ...combinedAudios };
        pagesTargets.forEach(pt => {
          const wt = pt?.revisions?.[0]?.slots?.main?.["*"] || "";
          const aud = extraerAudiosDeWikitext(wt);
          Object.assign(targetAudios, aud);
        });

        for (const pt of pagesTargets) {
          if (pt.missing !== undefined || !pt.extract) continue;
          const parsed = parsearEnWiktionary(pt.extract, pt.title, targetAudios);
          if (parsed) {
            const secJa = parsed.secciones.find(s => (s.idiomaRaw || "").toLowerCase() === "japanese" || s.idioma.includes("Japonés"));
            if (secJa && secJa.definiciones && secJa.definiciones.length > 0) {
              if (!secJa.lectura) secJa.lectura = `${pt.title} (${q})`;
              parsed.palabra = `${pt.title} (${q})`;
              return parsed;
            }
          }
        }
      }
    }

    return null;
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
        const urlEn = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts|revisions&rvprop=content&rvslots=main&explaintext=1&titles=${encodeURIComponent(q)}&format=json&origin=*`;
        const resEn = await fetch(urlEn);
        if (resEn.ok) {
          const dataEn = await resEn.json();
          const pageEn = Object.values(dataEn?.query?.pages || {})[0];
          if (pageEn && pageEn.missing === undefined && pageEn.extract) {
            const wikitextEn = pageEn?.revisions?.[0]?.slots?.main?.["*"] || "";
            const audiosWikitext = extraerAudiosDeWikitext(wikitextEn);
            const parsed = parsearEnWiktionary(pageEn.extract, q, audiosWikitext);
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

    // Si el término está en alfabeto latino pero coincide con vocablos o fonética en Rōmaji japonés
    if (script === "lat") {
      try {
        const resRomaji = await resolverRomajiJapones(q);
        if (resRomaji && resRomaji.secciones && resRomaji.secciones.length > 0) {
          cacheDiccionario.set(qKey, resRomaji);
          return resRomaji;
        }
      } catch (e) {
        console.warn("[Diccionario] Error resolviendo rōmaji:", e);
      }
    }

    // 1. Wikcionario en español
    try {
      const urlWikt = `https://es.wiktionary.org/w/api.php?action=query&prop=extracts|revisions&rvprop=content&rvslots=main&explaintext=1&titles=${encodeURIComponent(q)}&format=json&origin=*`;
      const resW = await fetch(urlWikt);
      if (resW.ok) {
        const dataW = await resW.json();
        const pageW = Object.values(dataW?.query?.pages || {})[0];
        if (pageW && pageW.missing === undefined && pageW.extract) {
          const wikitextW = pageW?.revisions?.[0]?.slots?.main?.["*"] || "";
          const audiosWikitextEs = extraerAudiosDeWikitext(wikitextW);
          const parsed = parsearWikcionarioEs(pageW.extract, q);
          if (parsed && parsed.secciones && parsed.secciones.length > 0) {
            parsed.secciones.forEach(sec => {
              const rawKey = (sec.idioma || "").toLowerCase().trim();
              const archivos = audiosWikitextEs[rawKey] || [];
              if (archivos.length > 0) {
                sec.audioFile = archivos[0];
                sec.audioUrl = getCommonsAudioUrl(archivos[0]);
              }
            });
            cacheDiccionario.set(qKey, parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("[Diccionario] Error en es.wiktionary:", e);
    }

    // 2. English Wiktionary (como respaldo global completo con audio nativo y fallback si hay minúsculas)
    try {
      const titlesParam = q.toLowerCase() !== q ? `${encodeURIComponent(q)}|${encodeURIComponent(q.toLowerCase())}` : encodeURIComponent(q);
      const urlEnWikt = `https://en.wiktionary.org/w/api.php?action=query&prop=extracts|revisions&rvprop=content&rvslots=main&explaintext=1&titles=${titlesParam}&format=json&origin=*`;
      const resEn = await fetch(urlEnWikt);
      if (resEn.ok) {
        const dataEn = await resEn.json();
        const pagesEn = Object.values(dataEn?.query?.pages || {});
        // Priorizar la página exacta, o la versión en minúsculas si la exacta no tiene definiciones
        let pageEn = pagesEn.find(p => p.missing === undefined && p.extract);
        if (pageEn && pageEn.extract) {
          // Reunir audios de todas las páginas devueltas (por ejemplo Pomme y pomme)
          let combinedAudios = {};
          pagesEn.forEach(p => {
            const wt = p?.revisions?.[0]?.slots?.main?.["*"] || "";
            const aud = extraerAudiosDeWikitext(wt);
            Object.assign(combinedAudios, aud);
          });
          const parsedEn = parsearEnWiktionary(pageEn.extract, q, combinedAudios);
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

  // Reproducir pronunciación por voz inteligente según idioma y audios nativos
  function pronunciar(texto, idiomaTexto = "Español", btnElement = null, audioUrlDirecta = null) {
    if (!texto && !audioUrlDirecta) return;

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

    if (audioPlayerActual) {
      try { audioPlayerActual.pause(); } catch {}
      audioPlayerActual = null;
    }

    const playAudioUrl = (url, onFail) => {
      try {
        const audio = new Audio(url);
        audioPlayerActual = audio;
        audio.onended = () => {
          if (btnElement) btnElement.classList.remove("playing");
        };
        audio.onerror = () => {
          if (typeof onFail === "function") onFail();
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (typeof onFail === "function") onFail();
          });
        }
      } catch {
        if (typeof onFail === "function") onFail();
      }
    };

    // 1. Si existe audio nativo registrado de Wikimedia/Wiktionary, reproducirlo prioritariamente
    if (audioUrlDirecta) {
      playAudioUrl(audioUrlDirecta, () => {
        intentarTTSGoogle(texto, codigoLang, btnElement);
      });
      return;
    }

    // 2. Si no hay audio directo, intentar con TTS Google y fallback a WebSpeech
    intentarTTSGoogle(texto, codigoLang, btnElement);
  }

  function intentarTTSGoogle(texto, codigoLang, btnElement) {
    if (!texto) {
      if (btnElement) btnElement.classList.remove("playing");
      return;
    }
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=${codigoLang}&client=tw-ob`;
    try {
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
      // En móvil, a veces speechSynthesis se pausa o bloquea si no se reanuda
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
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
      const langTarget = mapBCP47[codigoLang] || "es-ES";
      utter.lang = langTarget;
      utter.rate = 0.9;

      // Seleccionar voz si está disponible
      const voces = window.speechSynthesis.getVoices();
      if (voces && voces.length > 0) {
        const vozAdecuada = voces.find(v => v.lang === langTarget || v.lang.startsWith(codigoLang));
        if (vozAdecuada) utter.voice = vozAdecuada;
      }

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
        pronunciar(audioTexto, sec0?.idioma || "Español", btnPrincipal, sec0?.audioUrl);
      });

      // Pronunciar según sección de idioma
      cont.querySelectorAll("[data-pronunciar-sec]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.pronunciarSec) || 0;
          const sec = def.secciones[idx];
          if (sec) {
            const audioTexto = sec.audioTexto || def.palabra;
            pronunciar(audioTexto, sec.idioma, btn, sec.audioUrl);
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

  const STORAGE_KEY_LEXICO = () => {
    const gid = window._getGrupoActivo?.()?.id || localStorage.getItem("grupo_activo");
    const uid = window._getUserIdSafe?.() || window._sunUserId || localStorage.getItem("sunad_uid") || "local";
    return gid ? `sunad_lexico_pareja_${gid}` : `sunad_lexico_pareja_${uid}`;
  };

  const PALABRAS_DEL_DIA = [
    { palabra: "木漏れ日 (Komorebi)", idioma: "Japonés", significado: "La luz del sol que se filtra entre las hojas de los árboles." },
    { palabra: "사랑 (Sarang)", idioma: "Coreano", significado: "Amor profundo y sincero que une a dos personas." },
    { palabra: "Saudade", idioma: "Portugués", significado: "Nostalgia tierna y afectuosa por alguien o un momento amado." },
    { palabra: "縁 (En)", idioma: "Japonés", significado: "El hilo o vínculo misterioso del destino que conecta a dos almas." },
    { palabra: "Inefable", idioma: "Español", significado: "Algo tan maravilloso o intenso que no puede explicarse con palabras." },
    { palabra: "Serendipia", idioma: "Español", significado: "Hallazgo afortunado e inesperado que ocurre cuando buscas otra cosa." },
    { palabra: "정 (Jeong)", idioma: "Coreano", significado: "Cariño profundo, apego y calidez que crece con el tiempo compartido." }
  ];

  function cargarLexicoPareja() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEXICO());
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function guardarLexicoPareja(lista, emitirSync = true) {
    try {
      localStorage.setItem(STORAGE_KEY_LEXICO(), JSON.stringify(lista));
      if (emitirSync) {
        window.dispatchEvent(new CustomEvent("sunad:lexico-sync", { detail: { lista } }));
      }
    } catch {}
  }

  function otorgarRecompensaPalabraDia() {
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const uid = window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local";
      const k = `sa_dic_palabra_dia_${uid}`;
      if (localStorage.getItem(k) === hoy) return false;
      localStorage.setItem(k, hoy);
      if (typeof window._getMonedas === "function" && typeof window._setMonedas === "function") {
        window._setMonedas(window._getMonedas() + 20);
      }
      window._sumarExperienciaGlobal?.(15, "Palabra del Día aprendida en el Diccionario");
      return true;
    } catch { return false; }
  }

  function inyectarPanelLexicoYPalabraDia() {
    const container = document.querySelector("#diccionario .diccionario-container");
    if (!container || $("dic-palabra-dia-banner")) return;

    const idxDia = new Date().getDate() % PALABRAS_DEL_DIA.length;
    const pDia = PALABRAS_DEL_DIA[idxDia];
    const uid = window._getUserIdSafe?.() || localStorage.getItem("sunad_uid") || "local";
    const hoy = new Date().toISOString().slice(0, 10);
    const yaReclamado = localStorage.getItem(`sa_dic_palabra_dia_${uid}`) === hoy;

    const banner = document.createElement("div");
    banner.id = "dic-palabra-dia-banner";
    banner.style.cssText = "background:linear-gradient(135deg,rgba(255,217,61,0.12),rgba(244,114,182,0.12));border:1px solid rgba(255,217,61,0.3);border-radius:18px;padding:1rem 1.2rem;margin-bottom:1.2rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;";
    banner.innerHTML = `
      <div style="flex:1;min-width:220px;">
        <div style="display:inline-flex;align-items:center;gap:6px;font-size:0.74rem;font-weight:700;color:#ffd93d;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">
          <img src="img/dashboard/card-diccionario.svg" alt="" width="18" height="18">
          <span>Palabra del Día · ${pDia.idioma}</span>
        </div>
        <h3 style="margin:0 0 4px;font-size:1.1rem;color:#fff;">${pDia.palabra}</h3>
        <p style="margin:0;font-size:0.86rem;opacity:0.85;">${pDia.significado}</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button type="button" id="btn-dic-explorar-dia" class="btn-secondary" style="padding:0.45rem 0.9rem;font-size:0.8rem;border-color:rgba(255,217,61,0.45);color:#ffd93d;">
          ${yaReclamado ? "🔍 Consultar palabra" : "✨ Aprender (+20 🪙 · +15 XP)"}
        </button>
      </div>
    `;

    const tabsNav = document.createElement("div");
    tabsNav.style.cssText = "display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap;";
    tabsNav.innerHTML = `
      <button type="button" id="tab-dic-consulta" class="btn-primary" style="padding:0.45rem 1rem;font-size:0.82rem;border-radius:999px;">🌍 Diccionario Multilingüe</button>
      <button type="button" id="tab-dic-lexico" class="btn-secondary" style="padding:0.45rem 1rem;font-size:0.82rem;border-radius:999px;border-color:rgba(244,114,182,0.45);color:#fbcfe8;">💕 Nuestro Léxico de Pareja</button>
    `;

    const lexicoPanel = document.createElement("section");
    lexicoPanel.id = "dic-lexico-panel";
    lexicoPanel.style.cssText = "display:none;background:rgba(255,255,255,0.04);border:1px solid rgba(244,114,182,0.28);border-radius:18px;padding:1.2rem;margin-bottom:1.2rem;";
    lexicoPanel.innerHTML = `
      <div style="margin-bottom:1rem;">
        <h3 style="margin:0 0 4px;color:#fbcfe8;font-size:1.05rem;">💕 Nuestro Propio Diccionario</h3>
        <p style="margin:0;font-size:0.84rem;opacity:0.8;">Guarda sus apodos, bromas internas, frases favoritas o palabras que hayan descubierto juntos (sincronizado con tu pareja).</p>
      </div>
      <form id="dic-lexico-form" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:1rem;">
        <input type="text" id="lexico-palabra" maxlength="45" required placeholder="Palabra, apodo o frase..." style="padding:0.55rem 0.8rem;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(0,0,0,0.25);color:#fff;">
        <input type="text" id="lexico-significado" maxlength="160" required placeholder="¿Qué significa para nosotros?" style="padding:0.55rem 0.8rem;border-radius:12px;border:1px solid rgba(255,255,255,0.16);background:rgba(0,0,0,0.25);color:#fff;">
        <button type="submit" class="btn-primary" style="padding:0.55rem 1rem;border-radius:12px;">+ Guardar palabra (+15 Amor XP)</button>
      </form>
      <div id="dic-lexico-lista" style="display:grid;gap:8px;"></div>
    `;

    const searchBox = container.querySelector(".diccionario-search-box");
    const histBox = container.querySelector(".diccionario-historial");
    const resBox = $("diccionario-resultado");

    if (searchBox) {
      container.insertBefore(banner, searchBox);
      container.insertBefore(tabsNav, searchBox);
      container.insertBefore(lexicoPanel, searchBox);
    }

    const renderListaLexico = () => {
      const listaEl = $("dic-lexico-lista");
      if (!listaEl) return;
      const items = cargarLexicoPareja();
      if (!items.length) {
        listaEl.innerHTML = `<p style="font-size:0.84rem;opacity:0.7;text-align:center;padding:1rem 0;">Aún no han guardado palabras en su léxico de pareja. ¡Añade la primera arriba!</p>`;
        return;
      }
      listaEl.innerHTML = items.map(it => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0.75rem 1rem;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);">
          <div>
            <strong style="color:#ffd93d;font-size:0.95rem;">«${it.palabra}»</strong>
            <span style="font-size:0.74rem;opacity:0.65;margin-left:6px;">por ${it.autor || "Nosotros"}</span>
            <p style="margin:3px 0 0;font-size:0.85rem;opacity:0.9;">${it.significado}</p>
          </div>
          <button type="button" data-del-lexico="${it.id}" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:1.1rem;" title="Eliminar">×</button>
        </div>
      `).join("");
      listaEl.querySelectorAll("[data-del-lexico]").forEach(b => {
        b.addEventListener("click", () => {
          const nueva = cargarLexicoPareja().filter(x => String(x.id) !== String(b.dataset.delLexico));
          guardarLexicoPareja(nueva, true);
          renderListaLexico();
        });
      });
    };

    renderListaLexico();

    $("btn-dic-explorar-dia")?.addEventListener("click", (ev) => {
      const terminoLimpio = pDia.palabra.split(" (")[0].trim();
      const gano = otorgarRecompensaPalabraDia();
      if (gano) {
        ev.currentTarget.textContent = "✓ Recompensa obtenida (+20 🪙)";
        try { window._snd?.("victoria") || window._snd?.("pop"); } catch {}
      }
      buscar(terminoLimpio);
    });

    $("tab-dic-consulta")?.addEventListener("click", () => {
      lexicoPanel.style.display = "none";
      if (searchBox) searchBox.style.display = "";
      if (histBox) histBox.style.display = "";
      if (resBox) resBox.style.display = "";
    });

    $("tab-dic-lexico")?.addEventListener("click", () => {
      lexicoPanel.style.display = "block";
      if (searchBox) searchBox.style.display = "none";
      if (histBox) histBox.style.display = "none";
      if (resBox) resBox.style.display = "none";
      renderListaLexico();
    });

    $("dic-lexico-form")?.addEventListener("submit", e => {
      e.preventDefault();
      const pal = $("lexico-palabra")?.value.trim();
      const sig = $("lexico-significado")?.value.trim();
      if (!pal || !sig) return;
      const actual = cargarLexicoPareja();
      actual.unshift({
        id: "lex_" + Date.now(),
        palabra: pal,
        significado: sig,
        autor: localStorage.getItem("sunad_username") || "Nosotros",
        fecha: new Date().toISOString().slice(0, 10)
      });
      guardarLexicoPareja(actual.slice(0, 100), true);
      $("lexico-palabra").value = "";
      $("lexico-significado").value = "";
      renderListaLexico();
      try { window._sumarAmorPareja?.(15, `Palabra añadida a Nuestro Léxico: ${pal}`); } catch {}
      try { window._snd?.("pop"); } catch {}
    });

    window._renderListaLexicoPareja = renderListaLexico;
  }

  // Inicializar eventos
  function initDiccionario() {
    inyectarPanelLexicoYPalabraDia();
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

  window.SunDiccionario = {
    buscar,
    consultarDefinicion,
    sincronizarLexicoRemoto: listaRemota => {
      if (!Array.isArray(listaRemota)) return;
      guardarLexicoPareja(listaRemota, false);
      window._renderListaLexicoPareja?.();
    }
  };
})();
