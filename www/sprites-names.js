/* ============================================================
   SPRITE-NAMES.JS — Nombres coherentes para el sprite sheet
   Basado en Admurin's Armory (itch.io)
   Formato: "col,row": { id, nombre, rar, icono, desc, stats, consumible?, habilidades? }
   Tipos:  atk · def · hp · key · util
   Rarezas: comun · raro · epico · legendario · mitico · tornasol
   ============================================================ */
(function () {
    "use strict";

    window.SPRITE_NAMES = {

        // --- MAPEO GENERADO (🎒 Ítems Actuales del Juego (97 ítems)) ---
        "0,0": { id: "alabarda", nombre: "Alabarda", rar: "comun", icono: "espada", desc: "Item de aventura: Alabarda", stats: { atk: 1 } },
        "1,0": { id: "amuleto-sol", nombre: "Amuleto Sol", rar: "comun", icono: "espada", desc: "Item de aventura: Amuleto Sol", stats: { atk: 1 } },
        "2,0": { id: "anillo-esmeralda", nombre: "Anillo Esmeralda", rar: "comun", icono: "espada", desc: "Item de aventura: Anillo Esmeralda", stats: { atk: 1 } },
        "3,0": { id: "anillo-poder", nombre: "Anillo Poder", rar: "comun", icono: "espada", desc: "Item de aventura: Anillo Poder", stats: { atk: 1 } },
        "4,0": { id: "anillo-zafiro", nombre: "Anillo Zafiro", rar: "comun", icono: "espada", desc: "Item de aventura: Anillo Zafiro", stats: { atk: 1 } },
        "5,0": { id: "arco-elfico", nombre: "Arco Elfico", rar: "comun", icono: "espada", desc: "Item de aventura: Arco Elfico", stats: { atk: 1 } },
        "6,0": { id: "arco-madera", nombre: "Arco Madera", rar: "comun", icono: "espada", desc: "Item de aventura: Arco Madera", stats: { atk: 1 } },
        "7,0": { id: "baculo-fuego", nombre: "Baculo Fuego", rar: "comun", icono: "espada", desc: "Item de aventura: Baculo Fuego", stats: { atk: 1 } },
        "8,0": { id: "baculo-infinito", nombre: "Baculo Infinito", rar: "comun", icono: "espada", desc: "Item de aventura: Baculo Infinito", stats: { atk: 1 } },
        "9,0": { id: "baculo-rayo", nombre: "Baculo Rayo", rar: "comun", icono: "espada", desc: "Item de aventura: Baculo Rayo", stats: { atk: 1 } },
        "0,1": { id: "ballesta", nombre: "Ballesta", rar: "comun", icono: "espada", desc: "Item de aventura: Ballesta", stats: { atk: 1 } },
        "1,1": { id: "baston", nombre: "Baston", rar: "comun", icono: "espada", desc: "Item de aventura: Baston", stats: { atk: 1 } },
        "2,1": { id: "baya-solar", nombre: "Baya Solar", rar: "comun", icono: "espada", desc: "Item de aventura: Baya Solar", stats: { atk: 1 } },
        "3,1": { id: "botas-aladas", nombre: "Botas Aladas", rar: "comun", icono: "espada", desc: "Item de aventura: Botas Aladas", stats: { atk: 1 } },
        "4,1": { id: "brazalete-oro", nombre: "Brazalete Oro", rar: "comun", icono: "espada", desc: "Item de aventura: Brazalete Oro", stats: { atk: 1 } },
        "5,1": { id: "caliz-estelar", nombre: "Caliz Estelar", rar: "comun", icono: "espada", desc: "Item de aventura: Caliz Estelar", stats: { atk: 1 } },
        "6,1": { id: "capa-sombras", nombre: "Capa Sombras", rar: "comun", icono: "espada", desc: "Item de aventura: Capa Sombras", stats: { atk: 1 } },
        "7,1": { id: "casco-hierro", nombre: "Casco Hierro", rar: "comun", icono: "espada", desc: "Item de aventura: Casco Hierro", stats: { atk: 1 } },
        "8,1": { id: "cetro-solar", nombre: "Cetro Solar", rar: "comun", icono: "espada", desc: "Item de aventura: Cetro Solar", stats: { atk: 1 } },
        "9,1": { id: "cimitarra", nombre: "Cimitarra", rar: "comun", icono: "espada", desc: "Item de aventura: Cimitarra", stats: { atk: 1 } },
        "0,2": { id: "collar-diente", nombre: "Collar Diente", rar: "comun", icono: "espada", desc: "Item de aventura: Collar Diente", stats: { atk: 1 } },
        "1,2": { id: "coraza-placas", nombre: "Coraza Placas", rar: "comun", icono: "espada", desc: "Item de aventura: Coraza Placas", stats: { atk: 1 } },
        "2,2": { id: "corona-oro", nombre: "Corona Oro", rar: "comun", icono: "espada", desc: "Item de aventura: Corona Oro", stats: { atk: 1 } },
        "3,2": { id: "corona-plata", nombre: "Corona Plata", rar: "comun", icono: "espada", desc: "Item de aventura: Corona Plata", stats: { atk: 1 } },
        "4,2": { id: "cristal-hielo", nombre: "Cristal Hielo", rar: "comun", icono: "espada", desc: "Item de aventura: Cristal Hielo", stats: { atk: 1 } },
        "5,2": { id: "daga", nombre: "Daga", rar: "comun", icono: "espada", desc: "Item de aventura: Daga", stats: { atk: 1 } },
        "6,2": { id: "daga-asesino", nombre: "Daga Asesino", rar: "comun", icono: "espada", desc: "Item de aventura: Daga Asesino", stats: { atk: 1 } },
        "7,2": { id: "daga-cristal", nombre: "Daga Cristal", rar: "comun", icono: "espada", desc: "Item de aventura: Daga Cristal", stats: { atk: 1 } },
        "8,2": { id: "diamante-estrella", nombre: "Diamante Estrella", rar: "comun", icono: "espada", desc: "Item de aventura: Diamante Estrella", stats: { atk: 1 } },
        "9,2": { id: "elixir-dragon", nombre: "Elixir Dragon", rar: "comun", icono: "espada", desc: "Item de aventura: Elixir Dragon", stats: { atk: 1 } },
        "0,3": { id: "escudo-alba", nombre: "Escudo Alba", rar: "comun", icono: "espada", desc: "Item de aventura: Escudo Alba", stats: { atk: 1 } },
        "1,3": { id: "escudo-dragon", nombre: "Escudo Dragon", rar: "comun", icono: "espada", desc: "Item de aventura: Escudo Dragon", stats: { atk: 1 } },
        "2,3": { id: "escudo-hierro", nombre: "Escudo Hierro", rar: "comun", icono: "espada", desc: "Item de aventura: Escudo Hierro", stats: { atk: 1 } },
        "3,3": { id: "escudo-madera", nombre: "Escudo Madera", rar: "comun", icono: "espada", desc: "Item de aventura: Escudo Madera", stats: { atk: 1 } },
        "4,3": { id: "escudo-torre", nombre: "Escudo Torre", rar: "comun", icono: "espada", desc: "Item de aventura: Escudo Torre", stats: { atk: 1 } },
        "5,3": { id: "esmeralda-lagrima", nombre: "Esmeralda Lagrima", rar: "comun", icono: "espada", desc: "Item de aventura: Esmeralda Lagrima", stats: { atk: 1 } },
        "6,3": { id: "espada", nombre: "Espada", rar: "comun", icono: "espada", desc: "Item de aventura: Espada", stats: { atk: 1 } },
        "7,3": { id: "espada-fuego", nombre: "Espada Fuego", rar: "comun", icono: "espada", desc: "Item de aventura: Espada Fuego", stats: { atk: 1 } },
        "8,3": { id: "espada-hielo", nombre: "Espada Hielo", rar: "comun", icono: "espada", desc: "Item de aventura: Espada Hielo", stats: { atk: 1 } },
        "9,3": { id: "espada-legend", nombre: "Espada Legend", rar: "comun", icono: "espada", desc: "Item de aventura: Espada Legend", stats: { atk: 1 } },
        "0,4": { id: "espada-ropera", nombre: "Espada Ropera", rar: "comun", icono: "espada", desc: "Item de aventura: Espada Ropera", stats: { atk: 1 } },
        "1,4": { id: "flecha-dorada", nombre: "Flecha Dorada", rar: "comun", icono: "espada", desc: "Item de aventura: Flecha Dorada", stats: { atk: 1 } },
        "2,4": { id: "flor-roja", nombre: "Flor Roja", rar: "comun", icono: "espada", desc: "Item de aventura: Flor Roja", stats: { atk: 1 } },
        "3,4": { id: "frasco-vacio", nombre: "Frasco Vacio", rar: "comun", icono: "espada", desc: "Item de aventura: Frasco Vacio", stats: { atk: 1 } },
        "4,4": { id: "garrote-puas", nombre: "Garrote Puas", rar: "comun", icono: "espada", desc: "Item de aventura: Garrote Puas", stats: { atk: 1 } },
        "5,4": { id: "gema-azul", nombre: "Gema Azul", rar: "comun", icono: "espada", desc: "Item de aventura: Gema Azul", stats: { atk: 1 } },
        "6,4": { id: "gema-dorada", nombre: "Gema Dorada", rar: "comun", icono: "espada", desc: "Item de aventura: Gema Dorada", stats: { atk: 1 } },
        "7,4": { id: "gema-morada", nombre: "Gema Morada", rar: "comun", icono: "espada", desc: "Item de aventura: Gema Morada", stats: { atk: 1 } },
        "8,4": { id: "gema-roja", nombre: "Gema Roja", rar: "comun", icono: "espada", desc: "Item de aventura: Gema Roja", stats: { atk: 1 } },
        "9,4": { id: "gema-verde", nombre: "Gema Verde", rar: "comun", icono: "espada", desc: "Item de aventura: Gema Verde", stats: { atk: 1 } },
        "0,5": { id: "guadaña", nombre: "Guadaña", rar: "comun", icono: "espada", desc: "Item de aventura: Guadaña", stats: { atk: 1 } },
        "1,5": { id: "guantelete", nombre: "Guantelete", rar: "comun", icono: "espada", desc: "Item de aventura: Guantelete", stats: { atk: 1 } },
        "2,5": { id: "hacha", nombre: "Hacha", rar: "comun", icono: "espada", desc: "Item de aventura: Hacha", stats: { atk: 1 } },
        "3,5": { id: "hacha-guerra", nombre: "Hacha Guerra", rar: "comun", icono: "espada", desc: "Item de aventura: Hacha Guerra", stats: { atk: 1 } },
        "4,5": { id: "hoja-verde", nombre: "Hoja Verde", rar: "comun", icono: "espada", desc: "Item de aventura: Hoja Verde", stats: { atk: 1 } },
        "5,5": { id: "hongo", nombre: "Hongo", rar: "comun", icono: "espada", desc: "Item de aventura: Hongo", stats: { atk: 1 } },
        "6,5": { id: "hongo-dorado", nombre: "Hongo Dorado", rar: "comun", icono: "espada", desc: "Item de aventura: Hongo Dorado", stats: { atk: 1 } },
        "7,5": { id: "katana", nombre: "Katana", rar: "comun", icono: "espada", desc: "Item de aventura: Katana", stats: { atk: 1 } },
        "8,5": { id: "lagrima-hada", nombre: "Lagrima Hada", rar: "comun", icono: "espada", desc: "Item de aventura: Lagrima Hada", stats: { atk: 1 } },
        "9,5": { id: "lanza-acero", nombre: "Lanza Acero", rar: "comun", icono: "espada", desc: "Item de aventura: Lanza Acero", stats: { atk: 1 } },
        "0,6": { id: "libro-azul", nombre: "Libro Azul", rar: "comun", icono: "espada", desc: "Item de aventura: Libro Azul", stats: { atk: 1 } },
        "1,6": { id: "libro-dorado", nombre: "Libro Dorado", rar: "comun", icono: "espada", desc: "Item de aventura: Libro Dorado", stats: { atk: 1 } },
        "2,6": { id: "libro-morado", nombre: "Libro Morado", rar: "comun", icono: "espada", desc: "Item de aventura: Libro Morado", stats: { atk: 1 } },
        "3,6": { id: "libro-rojo", nombre: "Libro Rojo", rar: "comun", icono: "espada", desc: "Item de aventura: Libro Rojo", stats: { atk: 1 } },
        "4,6": { id: "libro-verde", nombre: "Libro Verde", rar: "comun", icono: "espada", desc: "Item de aventura: Libro Verde", stats: { atk: 1 } },
        "5,6": { id: "llave-antigua", nombre: "Llave Antigua", rar: "comun", icono: "espada", desc: "Item de aventura: Llave Antigua", stats: { atk: 1 } },
        "6,6": { id: "llave-dorada", nombre: "Llave Dorada", rar: "comun", icono: "espada", desc: "Item de aventura: Llave Dorada", stats: { atk: 1 } },
        "7,6": { id: "loto-eter", nombre: "Loto Eter", rar: "comun", icono: "espada", desc: "Item de aventura: Loto Eter", stats: { atk: 1 } },
        "8,6": { id: "mandoble-divino", nombre: "Mandoble Divino", rar: "comun", icono: "espada", desc: "Item de aventura: Mandoble Divino", stats: { atk: 1 } },
        "9,6": { id: "mapa-antiguo", nombre: "Mapa Antiguo", rar: "comun", icono: "espada", desc: "Item de aventura: Mapa Antiguo", stats: { atk: 1 } },
        "0,7": { id: "martillo-hierro", nombre: "Martillo Hierro", rar: "comun", icono: "espada", desc: "Item de aventura: Martillo Hierro", stats: { atk: 1 } },
        "1,7": { id: "martillo-trueno", nombre: "Martillo Trueno", rar: "comun", icono: "espada", desc: "Item de aventura: Martillo Trueno", stats: { atk: 1 } },
        "2,7": { id: "moneda-oro", nombre: "Moneda Oro", rar: "comun", icono: "espada", desc: "Item de aventura: Moneda Oro", stats: { atk: 1 } },
        "3,7": { id: "obsidiana-viva", nombre: "Obsidiana Viva", rar: "comun", icono: "espada", desc: "Item de aventura: Obsidiana Viva", stats: { atk: 1 } },
        "4,7": { id: "ojo-horus", nombre: "Ojo Horus", rar: "comun", icono: "espada", desc: "Item de aventura: Ojo Horus", stats: { atk: 1 } },
        "5,7": { id: "orbe-creacion", nombre: "Orbe Creacion", rar: "comun", icono: "espada", desc: "Item de aventura: Orbe Creacion", stats: { atk: 1 } },
        "6,7": { id: "orquidea-hielo", nombre: "Orquidea Hielo", rar: "comun", icono: "espada", desc: "Item de aventura: Orquidea Hielo", stats: { atk: 1 } },
        "7,7": { id: "pendientes-estrella", nombre: "Pendientes Estrella", rar: "comun", icono: "espada", desc: "Item de aventura: Pendientes Estrella", stats: { atk: 1 } },
        "8,7": { id: "pergamino-escudo", nombre: "Pergamino Escudo", rar: "comun", icono: "espada", desc: "Item de aventura: Pergamino Escudo", stats: { atk: 1 } },
        "9,7": { id: "pergamino-fuego", nombre: "Pergamino Fuego", rar: "comun", icono: "espada", desc: "Item de aventura: Pergamino Fuego", stats: { atk: 1 } },
        "0,8": { id: "pergamino-rayo", nombre: "Pergamino Rayo", rar: "comun", icono: "espada", desc: "Item de aventura: Pergamino Rayo", stats: { atk: 1 } },
        "1,8": { id: "perla-mar", nombre: "Perla Mar", rar: "comun", icono: "espada", desc: "Item de aventura: Perla Mar", stats: { atk: 1 } },
        "2,8": { id: "pocion-azul", nombre: "Pocion Azul", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Azul", stats: { atk: 1 } },
        "3,8": { id: "pocion-blanca", nombre: "Pocion Blanca", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Blanca", stats: { atk: 1 } },
        "4,8": { id: "pocion-dorada", nombre: "Pocion Dorada", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Dorada", stats: { atk: 1 } },
        "5,8": { id: "pocion-morada", nombre: "Pocion Morada", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Morada", stats: { atk: 1 } },
        "6,8": { id: "pocion-naranja", nombre: "Pocion Naranja", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Naranja", stats: { atk: 1 } },
        "7,8": { id: "pocion-roja", nombre: "Pocion Roja", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Roja", stats: { atk: 1 } },
        "8,8": { id: "pocion-verde", nombre: "Pocion Verde", rar: "comun", icono: "espada", desc: "Item de aventura: Pocion Verde", stats: { atk: 1 } },
        "9,8": { id: "raiz-mandinga", nombre: "Raiz Mandinga", rar: "comun", icono: "espada", desc: "Item de aventura: Raiz Mandinga", stats: { atk: 1 } },
        "0,9": { id: "reliquia", nombre: "Reliquia", rar: "comun", icono: "espada", desc: "Item de aventura: Reliquia", stats: { atk: 1 } },
        "1,9": { id: "runa-ancestral", nombre: "Runa Ancestral", rar: "comun", icono: "espada", desc: "Item de aventura: Runa Ancestral", stats: { atk: 1 } },
        "2,9": { id: "saco-monedas", nombre: "Saco Monedas", rar: "comun", icono: "espada", desc: "Item de aventura: Saco Monedas", stats: { atk: 1 } },
        "3,9": { id: "semilla-vida", nombre: "Semilla Vida", rar: "comun", icono: "espada", desc: "Item de aventura: Semilla Vida", stats: { atk: 1 } },
        "4,9": { id: "tallo-espina", nombre: "Tallo Espina", rar: "comun", icono: "espada", desc: "Item de aventura: Tallo Espina", stats: { atk: 1 } },
        "5,9": { id: "tridente", nombre: "Tridente", rar: "comun", icono: "espada", desc: "Item de aventura: Tridente", stats: { atk: 1 } },
        "6,9": { id: "vara-cristal", nombre: "Vara Cristal", rar: "comun", icono: "espada", desc: "Item de aventura: Vara Cristal", stats: { atk: 1 } },

    };

    /* ============================================
       Helper: obtener info de un sprite
       ============================================ */
    window.getSpriteInfo = function (col, row) {
        return window.SPRITE_NAMES[`${col},${row}`] || null;
    };

    /* ============================================
       Helper: obtener nombre legible
       ============================================ */
    window.getSpriteName = function (col, row) {
        const info = window.getSpriteInfo(col, row);
        return info ? info.nombre : `Objeto [${col},${row}]`;
    };

    console.log("✅ sprite-names.js cargado ·", Object.keys(window.SPRITE_NAMES).length, "objetos nombrados");
})();